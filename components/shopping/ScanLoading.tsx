import { useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import Colors from "@/constants/colors";

type ScanLoadingProps = {
  stage: "identifying" | "searching";
  isBarcode: boolean;
  imageUri: string | null;
  query: string;
  onCancel: () => void;
};

export default function ScanLoading({ stage, isBarcode, imageUri, query, onCancel }: ScanLoadingProps) {
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const searching = stage === "searching";
  const title = searching ? "Finding store listings" : isBarcode ? "Looking up your barcode" : "Identifying your item";

  return (
    <View style={styles.card}>
      {imageUri && imageUri !== failedUri ? (
        <Image
          source={{ uri: imageUri }}
          resizeMode="contain"
          style={styles.thumbnail}
          accessibilityLabel={isBarcode ? "Possible product match from barcode lookup" : "Your scanned product photo"}
          onError={() => setFailedUri(imageUri)}
        />
      ) : (
        <View style={styles.placeholder} accessible={false}>
          {isBarcode ? <FontAwesome name="barcode" size={36} color={Colors.light.accent} /> : <Feather name="search" size={32} color={Colors.light.accent} />}
        </View>
      )}
      <View style={styles.copy}>
        <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{searching ? "Checking places to buy a possible match." : isBarcode ? "Finding the product linked to this code." : "Looking for possible visual matches."}</Text>
        {searching && !!query && <Text style={styles.query} numberOfLines={2}>{query}</Text>}
      </View>
      <View style={styles.stages}>
        {["Identify item", "Find stores"].map((label, index) => {
          const current = searching ? index === 1 : index === 0;
          const complete = searching && index === 0;
          return (
            <View key={label} style={styles.stage}>
              <View style={styles.stageIcon}>
                {current ? <ActivityIndicator size="small" color={Colors.light.accent} accessibilityRole="progressbar" accessibilityLabel={title} /> : complete ? <Feather name="check" size={18} color={Colors.light.accent} accessible={false} /> : <View style={styles.pending} />}
              </View>
              <Text accessibilityLabel={`${label}, ${current ? "in progress" : complete ? "complete" : "waiting"}`} style={[styles.stageText, current && styles.currentStage]}>{label}</Text>
            </View>
          );
        })}
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Cancel search"
        onPress={onCancel}
        style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
      >
        <Text style={styles.cancelText}>Cancel search</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: Colors.light.surface, borderRadius: 20, borderWidth: 1, borderColor: Colors.light.borderLight, paddingHorizontal: 24, paddingTop: 28, paddingBottom: 12, alignItems: "center", gap: 24 },
  thumbnail: { width: "100%", maxWidth: 260, aspectRatio: 1, borderRadius: 16, backgroundColor: Colors.light.surfaceElevated },
  placeholder: { width: 88, height: 88, borderRadius: 24, backgroundColor: Colors.light.accentDim, justifyContent: "center", alignItems: "center" },
  copy: { alignItems: "center", gap: 8, width: "100%" },
  title: { fontSize: 22, lineHeight: 29, fontWeight: "600", letterSpacing: -0.5, color: Colors.light.text, textAlign: "center" },
  subtitle: { fontSize: 14, lineHeight: 21, color: Colors.light.textSecondary, textAlign: "center" },
  query: { fontSize: 13, lineHeight: 19, color: Colors.light.textSecondary, textAlign: "center", marginTop: 4 },
  stages: { width: "100%", gap: 16, paddingVertical: 20, borderTopWidth: 1, borderTopColor: Colors.light.borderLight },
  stage: { flexDirection: "row", alignItems: "center", gap: 12 },
  stageIcon: { width: 24, height: 24, alignItems: "center", justifyContent: "center" },
  pending: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.light.border },
  stageText: { flex: 1, fontSize: 14, lineHeight: 20, color: Colors.light.textSecondary },
  currentStage: { color: Colors.light.accent, fontWeight: "600" },
  cancel: { minHeight: 48, width: "100%", alignItems: "center", justifyContent: "center", borderRadius: 12, borderWidth: 1, borderColor: Colors.light.border },
  cancelText: { fontSize: 14, fontWeight: "600", color: Colors.light.accent },
  pressed: { opacity: 0.65 },
});
