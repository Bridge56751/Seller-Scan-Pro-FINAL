import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { AppState } from "react-native";
import { getDeviceId } from "./device-id";
import { registerDevice, getVerifiedStatus, type DeviceStatus } from "./device-client";
import { configureRevenueCat, restorePurchases as rcRestorePurchases, purchaseSubscription as rcPurchaseSubscription } from "./revenuecat";

type DeviceState = DeviceStatus & {deviceId:string};
interface AuthContextValue {
  device: DeviceState|null;
  customerId: string|null;
  isLoading:boolean; isReady:boolean; isPaid:boolean;
  scanCount:number; freeScansLeft:number; freePhotoScansLeft:number; freeBarcodeScansLeft:number;
  rcReady:boolean; verificationError:string|null;
  refreshDevice:()=>Promise<void>;
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
  const refreshDevice=useCallback(async()=>{
    try {
      const identity=await registerDevice();
      setCustomerId(identity.customerId);
      // SDK setup is independent of device status; don't hold the app's loading
      // screen open while the purchase SDK contacts its service.
      void configureRevenueCat().then(setRcReady).catch(() => setRcReady(false));
      const data=await getVerifiedStatus();
      setDevice({...data,deviceId:await getDeviceId()});
      setVerificationError(null);
    } catch(error) {
      // Unknown/unverified is not paid. Do not retain a stale paid flag on failure.
      setDevice(null);
      setVerificationError(error instanceof Error ? error.message : "Could not verify this device.");
    } finally {setIsLoading(false);}
  },[]);
  useEffect(()=>{
    void refreshDevice();
    const listener=AppState.addEventListener("change",state=>{if(state==="active")void refreshDevice();});
    const timer=setInterval(()=>{if(AppState.currentState==="active")void refreshDevice();},300000);
    return ()=>{listener.remove();clearInterval(timer);};
  },[refreshDevice]);
  const purchaseSubscription=useCallback(async(expectedProductId?:string)=>{
    const purchased=await rcPurchaseSubscription(expectedProductId);
    if(!purchased.success)return purchased;
    try {
      const verified=await getVerifiedStatus(true);
      setDevice({...verified,deviceId:await getDeviceId()});
      setVerificationError(null);
      return verified.isPaid ? {success:true} : {success:false,error:"The purchase has not been verified by RevenueCat yet. Refresh your status or restore purchases."};
    }catch{await refreshDevice();return {success:false,error:"Purchase verification is unavailable. No paid access was granted. Please retry."};}
  },[refreshDevice]);
  const restorePurchases=useCallback(async()=>{
    const restored=await rcRestorePurchases();
    if(!restored.success)return {...restored,isPro:false};
    try {
      const verified=await getVerifiedStatus(true);
      setDevice({...verified,deviceId:await getDeviceId()});
      setVerificationError(null);
      return {success:true,isPro:verified.isPaid};
    }catch{await refreshDevice();return {success:false,isPro:false,error:"Restored purchases could not be verified. Please retry."};}
  },[refreshDevice]);
  return <AuthContext.Provider value={{device,customerId,isLoading,isReady:!!device,isPaid:device?.isPaid===true,
    scanCount:device?.scanCount??0,freeScansLeft:device?.freeScansLeft??0,
    freePhotoScansLeft:device?.freePhotoScansLeft??0,freeBarcodeScansLeft:device?.freeBarcodeScansLeft??0,
    rcReady,verificationError,refreshDevice,purchaseSubscription,restorePurchases}}>{children}</AuthContext.Provider>;
}
export function useAuth(){
  const context=useContext(AuthContext);
  if(!context)throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
