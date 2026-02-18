import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { randomUUID } from "crypto";

const router = Router();

const FREE_SCAN_LIMIT = 5;

function getEffectiveFreeScansLeft(userScanCount: number, deviceScanCount: number, isPaid: boolean): number {
  if (isPaid) return 0;
  const effective = Math.max(userScanCount, deviceScanCount);
  return Math.max(0, FREE_SCAN_LIMIT - effective);
}

router.post("/api/auth/apple", async (req: Request, res: Response) => {
  try {
    const { appleUserId, email, fullName, identityToken, deviceId } = req.body;

    if (!appleUserId) {
      return res.status(400).json({ error: "Apple user ID is required" });
    }

    let user = await storage.getUserByAppleId(appleUserId);

    if (!user) {
      user = await storage.createUser({
        appleUserId,
        email: email || null,
        fullName: fullName || null,
      }, false, deviceId || undefined);
      console.log(`[Auth] New Apple user created: ${user.id}, device: ${deviceId || "unknown"}`);
    } else {
      await storage.updateLastLogin(user.id);
      if (deviceId && !user.deviceId) {
        await storage.updateDeviceId(user.id, deviceId);
      }
      console.log(`[Auth] Existing Apple user logged in: ${user.id}`);
    }

    const sessionToken = randomUUID();
    await storage.updateSessionToken(user.id, sessionToken);

    const effectiveDeviceId = deviceId || user.deviceId;
    let deviceScanCount = 0;
    if (effectiveDeviceId) {
      deviceScanCount = await storage.getDeviceScanCount(effectiveDeviceId);
    }

    const effectiveScans = Math.max(user.scanCount ?? 0, deviceScanCount);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isGuest: user.isGuest,
        isPaid: user.isPaid,
        scanCount: effectiveScans,
        freeScansLeft: getEffectiveFreeScansLeft(user.scanCount ?? 0, deviceScanCount, user.isPaid ?? false),
      },
      sessionToken,
    });
  } catch (error: any) {
    console.error("[Auth] Apple sign-in error:", error.message);
    return res.status(500).json({ error: "Authentication failed" });
  }
});

router.post("/api/auth/guest", async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.body || {};

    if (!deviceId) {
      return res.status(400).json({ error: "Device ID is required" });
    }

    const guestId = `guest-${randomUUID()}`;

    const user = await storage.createUser({
      appleUserId: guestId,
      email: null,
      fullName: "Guest",
    }, true, deviceId);

    const sessionToken = randomUUID();
    await storage.updateSessionToken(user.id, sessionToken);

    const deviceScanCount = await storage.getDeviceScanCount(deviceId);
    const effectiveScansUsed = Math.max(user.scanCount ?? 0, deviceScanCount);
    const freeScansLeft = Math.max(0, FREE_SCAN_LIMIT - effectiveScansUsed);

    console.log(`[Auth] Guest user created: ${user.id}, device: ${deviceId}, deviceScans: ${deviceScanCount}`);

    return res.json({
      user: {
        id: user.id,
        email: null,
        fullName: "Guest",
        isGuest: true,
        isPaid: false,
        scanCount: effectiveScansUsed,
        freeScansLeft,
      },
      sessionToken,
    });
  } catch (error: any) {
    console.error("[Auth] Guest sign-in error:", error.message);
    return res.status(500).json({ error: "Guest sign-in failed" });
  }
});

router.get("/api/auth/me", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const token = authHeader.slice(7);
    const user = await storage.getUserBySessionToken(token);

    if (!user) {
      return res.status(401).json({ error: "Invalid session" });
    }

    let deviceScanCount = 0;
    if (user.deviceId) {
      deviceScanCount = await storage.getDeviceScanCount(user.deviceId);
    }

    const effectiveScans = Math.max(user.scanCount ?? 0, deviceScanCount);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        isGuest: user.isGuest,
        isPaid: user.isPaid,
        scanCount: effectiveScans,
        freeScansLeft: getEffectiveFreeScansLeft(user.scanCount ?? 0, deviceScanCount, user.isPaid ?? false),
      },
    });
  } catch (error: any) {
    console.error("[Auth] Session check error:", error.message);
    return res.status(500).json({ error: "Session check failed" });
  }
});

router.post("/api/auth/logout", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const user = await storage.getUserBySessionToken(token);
      if (user) {
        await storage.updateSessionToken(user.id, "");
      }
    }
    return res.json({ success: true });
  } catch (error: any) {
    console.error("[Auth] Logout error:", error.message);
    return res.status(200).json({ success: true });
  }
});

router.post("/api/auth/record-scan", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const token = authHeader.slice(7);
    const user = await storage.getUserBySessionToken(token);

    if (!user) {
      return res.status(401).json({ error: "Invalid session" });
    }

    if (user.isPaid) {
      return res.json({ allowed: true, scanCount: user.scanCount, freeScansLeft: 0, isPaid: true });
    }

    const { deviceId: requestDeviceId } = req.body || {};
    const effectiveDeviceId = requestDeviceId || user.deviceId;

    if (requestDeviceId && !user.deviceId) {
      await storage.updateDeviceId(user.id, requestDeviceId);
    }

    let deviceScanCount = 0;
    if (effectiveDeviceId) {
      deviceScanCount = await storage.getDeviceScanCount(effectiveDeviceId);
    }

    const effectiveCount = Math.max(user.scanCount ?? 0, deviceScanCount);

    if (effectiveCount >= FREE_SCAN_LIMIT) {
      return res.json({ allowed: false, scanCount: effectiveCount, freeScansLeft: 0, isPaid: false });
    }

    const newUserCount = await storage.incrementScanCount(user.id);
    let newDeviceCount = deviceScanCount;
    if (effectiveDeviceId) {
      newDeviceCount = await storage.incrementDeviceScanCount(effectiveDeviceId);
    }

    const newEffective = Math.max(newUserCount, newDeviceCount);
    return res.json({
      allowed: true,
      scanCount: newEffective,
      freeScansLeft: Math.max(0, FREE_SCAN_LIMIT - newEffective),
      isPaid: false,
    });
  } catch (error: any) {
    console.error("[Auth] Record scan error:", error.message);
    return res.status(500).json({ error: "Failed to record scan" });
  }
});

router.delete("/api/auth/delete-account", async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const token = authHeader.slice(7);
    const user = await storage.getUserBySessionToken(token);

    if (!user) {
      return res.status(401).json({ error: "Invalid session" });
    }

    await storage.deleteUser(user.id);
    console.log(`[Auth] User deleted: ${user.id} (device scans preserved)`);

    return res.json({ success: true });
  } catch (error: any) {
    console.error("[Auth] Delete account error:", error.message);
    return res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
