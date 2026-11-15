import { Router } from "express";
import { authenticateDevice, DeviceError } from "../services/device-customers";
import { scanAllowances } from "../services/scan-rate-limits";
import { verifyRevenueCat } from "../services/verify-revenuecat";

const router = Router();
// Limit registration/verification load; counters still live in the database.
const requests = new Map<string, { start: number; count: number }>();
router.use("/api/device", (req,res,next) => {
  res.setHeader("Cache-Control","no-store");
  const now = Date.now(), key = req.ip || "unknown";
  if (requests.size > 1000) for (const [id,row] of requests) if (now-row.start>60000) requests.delete(id);
  const row = requests.get(key);
  if (row && now-row.start<60000) {
    if (++row.count>60) return res.status(429).json({error:"Too many device checks. Please try again shortly."});
  } else requests.set(key,{start:now,count:1});
  next();
});
router.post("/api/device/register", async (req,res,next) => {
  try {
    const device = await authenticateDevice(req,true);
    res.json({customerId:device.customer_id,testCustomerId:device.test_customer_id});
  } catch(error){next(error);}
});
router.post("/api/device/status", async (req,res,next) => {
  try {
    const device = await authenticateDevice(req);
    const access = await verifyRevenueCat(device.customer_id, false, req.query.refresh === "true");
    const allowance = await scanAllowances(device.customer_id);
    res.json({customerId:device.customer_id,isPaid:access.hasAccess,...allowance,
      freeScansLeft:allowance.freePhotoScansLeft+allowance.freeBarcodeScansLeft,
      billingVerified:true,expirationDate:access.expirationDate});
  } catch(error){next(error);}
});
router.post("/api/device/billing-test", async (req,res,next) => {
  if (process.env.NODE_ENV !== "development") return res.sendStatus(404);
  try {
    const device = await authenticateDevice(req);
    const access = await verifyRevenueCat(device.test_customer_id,true,true);
    res.json({customerId:device.test_customer_id,hasTestAccess:access.hasAccess,expirationDate:access.expirationDate});
  } catch(error){next(error);}
});
router.post("/api/device/record-scan", (_req,res) => {
  // Older clients cannot separately report/authorize scans. The shopping routes
  // are the only authority and reserve usage before any provider calls.
  res.status(410).json({error:"Scan usage is now recorded automatically by the scan service. Please update the app."});
});
router.use("/api/device", (error:unknown,_req:any,res:any,_next:any) => {
  res.status(error instanceof DeviceError ? error.status : 503).json({
    error:error instanceof DeviceError ? error.message : "Device or purchase verification is unavailable. No paid access was granted. Please retry.",
  });
});
export default router;
