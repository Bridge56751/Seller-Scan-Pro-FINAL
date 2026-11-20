import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";
import { discardTemporaryPhoto } from "./temporary-photo";
import { ensurePhotoConsent } from "./photo-consent";

export type CameraCaptureResult =
  | { status: "captured"; uri: string }
  | { status: "canceled" }
  | { status: "denied"; canAskAgain: boolean };

/** Opens the OS camera interface, not an embedded camera or barcode scanner. */
export async function captureProductPhoto(): Promise<CameraCaptureResult> {
  if (!await ensurePhotoConsent()) return { status: "canceled" };
  let permission = await ImagePicker.getCameraPermissionsAsync();
  if (!permission.granted && permission.canAskAgain) {
    permission = await ImagePicker.requestCameraPermissionsAsync();
  }
  if (!permission.granted) {
    return { status: "denied", canAskAgain: permission.canAskAgain };
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ["images"],
    cameraType: ImagePicker.CameraType.back,
    allowsEditing: false,
    quality: 0.8,
    exif: false,
    base64: false,
  });
  if (result.canceled) return { status: "canceled" };
  const uri = result.assets?.[0]?.uri;
  if (!uri) throw new Error("The camera did not return a photo. Please try again.");
  return { status: "captured", uri };
}

/** Local re-encoding only, before submitting a user-accepted photo for identification. */
export async function prepareProductPhoto(uri: string): Promise<string> {
  const result = await manipulateAsync(uri, [{ resize: { width: 1200 } }], {
    compress: 0.75, format: SaveFormat.JPEG, base64: true,
  });
  try {
    if (!result.base64 || result.base64.length > 4 * 1024 * 1024) {
      throw new Error("This photo is too large. Please retake it with just the product in view.");
    }
    return result.base64;
  } finally {
    if (result.uri !== uri) discardTemporaryPhoto(result.uri);
  }
}
