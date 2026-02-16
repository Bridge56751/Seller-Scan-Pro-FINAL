import { StyleSheet, Text, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import type { Alert } from "@/lib/mock-data";
import Colors from "@/constants/colors";

interface AlertBannerProps {
  alerts: Alert[];
}

const ALERT_ICONS: Record<string, { icon: string; family: "feather" | "mci" }> = {
  hazmat: { icon: "alert-triangle", family: "feather" },
  oversized: { icon: "package-variant", family: "mci" },
  ip_complaint: { icon: "shield-alert", family: "mci" },
  gated: { icon: "lock", family: "feather" },
  restricted: { icon: "slash", family: "feather" },
  meltable: { icon: "thermometer", family: "feather" },
  fragile: { icon: "alert-circle", family: "feather" },
};

function AlertItem({ alert }: { alert: Alert }) {
  const iconConfig = ALERT_ICONS[alert.type] || { icon: "alert-circle", family: "feather" };
  const severityColor = alert.severity === "danger" ? Colors.dark.danger : alert.severity === "warning" ? Colors.dark.warning : Colors.dark.accent;
  const severityBg = alert.severity === "danger" ? Colors.dark.dangerDim : alert.severity === "warning" ? Colors.dark.warningDim : Colors.dark.accentDim;

  return (
    <View style={[styles.alertItem, { backgroundColor: severityBg, borderColor: severityColor + "30" }]}>
      {iconConfig.family === "feather" ? (
        <Feather name={iconConfig.icon as any} size={16} color={severityColor} />
      ) : (
        <MaterialCommunityIcons name={iconConfig.icon as any} size={16} color={severityColor} />
      )}
      <Text style={[styles.alertText, { color: severityColor }]}>{alert.message}</Text>
    </View>
  );
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  if (alerts.length === 0) return null;

  return (
    <View style={styles.container}>
      {alerts.map((alert, i) => (
        <AlertItem key={i} alert={alert} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  alertItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  alertText: {
    fontSize: 13,
    fontWeight: "500" as const,
    flex: 1,
  },
});
