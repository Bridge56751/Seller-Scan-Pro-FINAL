import * as ImagePicker from "expo-image-picker";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

export type CameraCaptureResult =
  | { status: "captured"; uri: string }
  | { status: "canceled" }
  | { status: "denied"; canAskAgain: boolean };

/** Opens the OS camera interface, not an embedded camera or barcode scanner. */
export async function captureProductPhoto(): Promise<CameraCaptureResult> {
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

/** Local re-encoding only; caller must obtain sharing consent before uploading. */
export async function prepareProductPhoto(uri: string): Promise<string> {
  const result = await manipulateAsync(uri, [{ resize: { width: 1200 } }], {
    compress: 0.75, format: SaveFormat.JPEG, base64: true,
  });
  if (!result.base64 || result.base64.length > 4 * 1024 * 1024) {
    throw new Error("This photo is too large. Please retake it with just the product in view.");
  }
  return result.base64;
}
