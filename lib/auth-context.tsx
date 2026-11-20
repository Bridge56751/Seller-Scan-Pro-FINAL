import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { AppState } from "react-native";
import { getDeviceId } from "./device-id";
import { registerDevice, getVerifiedStatus, type DeviceStatus } from "./device-client";
import { configureRevenueCat, restorePurchases as rcRestorePurchases, purchaseSubscription as rcPurchaseSubscription } from "./revenuecat";
import { confirmPurchaseAccess, hasVerifiedScanAccess } from "@/shared/billing-confirmation";

type DeviceState = DeviceStatus & {deviceId:string};
interface AuthContextValue {
  device: DeviceState|null;
  customerId: string|null;
  isLoading:boolean; isReady:boolean; isPaid:boolean; hasTestScanAccess:boolean;
  scanCount:number; freeScansLeft:number; freePhotoScansLeft:number; freeBarcodeScansLeft:number;
  rcReady:boolean; verificationError:string|null;
  refreshDevice:()=>Promise<void>;
  purchasePending:boolean;
  verifyPurchase:()=>Promise<{success:boolean;error?:string}>;
  purchaseSubscription:(expectedProductId?:string)=>Promise<{success:boolean;error?:string}>;
  restorePurchases:()=>Promise<{success:boolean;isPro:boolean;error?:string}>;
}
const AuthContext=createContext<AuthContextValue|null>(null);
export function AuthProvider({children}:{children:ReactNode}) {
  const [device,setDevice]=useState<DeviceState|null>(null);
  const [customerId,setCustomerId]=useState<string|null>(null);
  const [isLoading,setIsLoading]=useState(true);
  const [rcReady,setRcReady]=useState(false);
  const [verificationError,setVerificationError]=useState<string|null>(null);
  const [purchasePending,setPurchasePending]=useState(false);
  const statusVersion=useRef(0);
  const confirmation=useRef<Promise<{success:boolean;error?:string}>|null>(null);
  const refreshDevice=useCallback(async()=>{
    if (confirmation.current) return;
    const version=++statusVersion.current;
    try {
      const identity=await registerDevice();
      setCustomerId(identity.customerId);
      // SDK setup is independent of device status; don't hold the app's loading
      // screen open while the purchase SDK contacts its service.
      void configureRevenueCat().then(setRcReady).catch(() => setRcReady(false));
      const data=await getVerifiedStatus();
      const deviceId=await getDeviceId();
      if (version!==statusVersion.current) return;
      setDevice({...data,deviceId});
      if (hasVerifiedScanAccess(data)) setPurchasePending(false);
      setVerificationError(null);
    } catch(error) {
      if (version!==statusVersion.current) return;
      // Unknown/unverified is not paid. Do not retain a stale paid flag on failure.
      setDevice(null);
      setVerificationError(error instanceof Error ? error.message : "Could not verify this device.");
    } finally {if(version===statusVersion.current)setIsLoading(false);}
  },[]);
  useEffect(()=>{
    void refreshDevice();
    const listener=AppState.addEventListener("change",state=>{if(state==="active")void refreshDevice();});
    const timer=setInterval(()=>{if(AppState.currentState==="active")void refreshDevice();},300000);
    return ()=>{listener.remove();clearInterval(timer);};
  },[refreshDevice]);
  const verifyPurchase=useCallback(()=>{
    if (confirmation.current) return confirmation.current;
    const version=++statusVersion.current;
    const task=(async()=>{
      try {
        const verified=await confirmPurchaseAccess(()=>getVerifiedStatus(true));
        const deviceId=await getDeviceId();
        if(version===statusVersion.current) {
          setDevice({...verified,deviceId});
          setVerificationError(null);
        }
        const success=hasVerifiedScanAccess(verified);
        if(success)setPurchasePending(false);
        return success ? {success:true} : {success:false,error:"Your purchase is still being verified. Tap Check access to retry verification, or Restore purchases. You do not need to buy again."};
      } catch {
        const error="Could not verify purchase access right now. Tap Check access to retry. You do not need to buy again.";
        if(version===statusVersion.current) {
          setDevice(null);
          setVerificationError(error);
        }
        return {success:false,error};
      } finally {
        if(version===statusVersion.current)setIsLoading(false);
        confirmation.current=null;
      }
    })();
    confirmation.current=task;
    return task;
  },[]);
  const purchaseSubscription=useCallback(async(expectedProductId?:string)=>{
    if(purchasePending)return verifyPurchase();
    const purchased=await rcPurchaseSubscription(expectedProductId);
    if(!purchased.success)return purchased;
    setPurchasePending(true);
    return verifyPurchase();
  },[purchasePending,verifyPurchase]);
  const restorePurchases=useCallback(async()=>{
    const restored=await rcRestorePurchases();
    if(!restored.success)return {...restored,isPro:false};
    if(restored.isPro)setPurchasePending(true);
    const result=await verifyPurchase();
    return {...result,isPro:result.success};
  },[verifyPurchase]);
  return <AuthContext.Provider value={{device,customerId,isLoading,isReady:!!device,isPaid:device?.isPaid===true,
    hasTestScanAccess:device?.hasTestScanAccess===true,
    scanCount:device?.scanCount??0,freeScansLeft:device?.freeScansLeft??0,
    freePhotoScansLeft:device?.freePhotoScansLeft??0,freeBarcodeScansLeft:device?.freeBarcodeScansLeft??0,
    rcReady,verificationError,refreshDevice,purchasePending,verifyPurchase,purchaseSubscription,restorePurchases}}>{children}</AuthContext.Provider>;
}
export function useAuth(){
  const context=useContext(AuthContext);
  if(!context)throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
