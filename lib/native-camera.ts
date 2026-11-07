import * as ImagePicker from "expo-image-picker";

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
