import { Router, Request, Response } from "express";
import { storage } from "../storage";
import { randomUUID } from "crypto";

const router = Router();

router.post("/api/auth/apple", async (req: Request, res: Response) => {
  try {
    const { appleUserId, email, fullName, identityToken } = req.body;

    if (!appleUserId) {
      return res.status(400).json({ error: "Apple user ID is required" });
    }

    let user = await storage.getUserByAppleId(appleUserId);

    if (!user) {
      user = await storage.createUser({
        appleUserId,
        email: email || null,
        fullName: fullName || null,
      });
      console.log(`[Auth] New user created: ${user.id}`);
    } else {
      await storage.updateLastLogin(user.id);
      console.log(`[Auth] Existing user logged in: ${user.id}`);
    }

    const sessionToken = randomUUID();
    await storage.updateSessionToken(user.id, sessionToken);

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
      },
      sessionToken,
    });
  } catch (error: any) {
    console.error("[Auth] Apple sign-in error:", error.message);
    return res.status(500).json({ error: "Authentication failed" });
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

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
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

export default router;
