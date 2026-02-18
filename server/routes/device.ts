import { Router, Request, Response } from "express";
import { storage } from "../storage";

const router = Router();

const FREE_SCAN_LIMIT = 5;

router.post("/api/device/status", async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.body || {};

    if (!deviceId) {
      return res.status(400).json({ error: "Device ID is required" });
    }

    const scanCount = await storage.getDeviceScanCount(deviceId);
    const freeScansLeft = Math.max(0, FREE_SCAN_LIMIT - scanCount);

    return res.json({
      deviceId,
      isPaid: false,
      scanCount,
      freeScansLeft,
    });
  } catch (error: any) {
    console.error("[Device] Status error:", error.message);
    return res.status(500).json({ error: "Failed to get device status" });
  }
});

router.post("/api/device/record-scan", async (req: Request, res: Response) => {
  try {
    const { deviceId } = req.body || {};

    if (!deviceId) {
      return res.status(400).json({ error: "Device ID is required" });
    }

    const currentCount = await storage.getDeviceScanCount(deviceId);

    if (currentCount >= FREE_SCAN_LIMIT) {
      return res.json({
        allowed: false,
        scanCount: currentCount,
        freeScansLeft: 0,
        isPaid: false,
      });
    }

    const newCount = await storage.incrementDeviceScanCount(deviceId);

    return res.json({
      allowed: true,
      scanCount: newCount,
      freeScansLeft: Math.max(0, FREE_SCAN_LIMIT - newCount),
      isPaid: false,
    });
  } catch (error: any) {
    console.error("[Device] Record scan error:", error.message);
    return res.status(500).json({ error: "Failed to record scan" });
  }
});

export default router;
