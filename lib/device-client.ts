import { getDeviceCredentials } from "./device-id";
import { getApiUrl } from "./query-client";
import { fetch } from "expo/fetch";

export type CustomerIdentity = {customerId:string;testCustomerId:string};
export type DeviceStatus = {customerId:string;isPaid:boolean;hasTestScanAccess:boolean;scanCount:number;freeScansLeft:number;
  freePhotoScansLeft:number;freeBarcodeScansLeft:number;billingVerified:boolean;expirationDate:string|null};
let identity: Promise<CustomerIdentity> | undefined;

export async function deviceRequest<T>(path:string):Promise<T> {
  const credentials = await getDeviceCredentials();
  const response = await fetch(new URL(`/api/device/${path}`,getApiUrl()).href,{
    method:"POST", headers:{"X-Device-Id":credentials.deviceId,"X-Device-Key":credentials.key},
    signal:AbortSignal.timeout(20000),
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data) throw new Error(data?.error || "Device verification is unavailable. Please retry.");
  return data as T;
}
export function registerDevice() {
  if (!identity) identity = deviceRequest<CustomerIdentity>("register").catch(error => {identity=undefined;throw error;});
  return identity;
}
export async function getVerifiedStatus(refresh=false) {
  await registerDevice();
  return deviceRequest<DeviceStatus>(`status${refresh ? "?refresh=true" : ""}`);
}
export async function getVerifiedTestStatus() {
  if (!__DEV__) throw new Error("Test verification is not available in this build.");
  await registerDevice();
  return deviceRequest<{customerId:string;hasTestAccess:boolean;testScanApproved:boolean;hasTestScanAccess:boolean;expirationDate:string|null}>("billing-test");
}
