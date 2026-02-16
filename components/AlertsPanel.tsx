import { StyleSheet, Text, View } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import type { ProductData, Alert } from "@/lib/mock-data";
import { CollapsiblePanel } from "./CollapsiblePanel";
import Colors from "@/constants/colors";

interface AlertsPanelProps {
  product: ProductData;
}

interface AlertRowData {
  label: string;
  status: "green" | "yellow" | "red";
  detail: string;
}

export function AlertsPanel({ product }: AlertsPanelProps) {
  const alertRows: AlertRowData[] = [
    {
      label: "Eligibility",
      status: product.isGated ? "red" : product.isRestricted ? "yellow" : "green",
      detail: product.isGated ? "Approval required" : product.isRestricted ? "Restrictions apply" : "You can sell this product",
    },
    {
      label: "Hazmat",
      status: product.isHazmat ? "red" : "green",
      detail: product.isHazmat ? "Dangerous goods - review required" : "Not hazmat",
    },
    {
      label: "IP Complaints",
      status: product.hasIPComplaints ? "red" : "green",
      detail: product.hasIPComplaints ? "IP complaints reported" : "No IP issues found",
    },
    {
      label: "Oversize",
      status: product.isOversized ? "yellow" : "green",
      detail: product.isOversized ? "Oversized - higher FBA fees" : "Standard size",
    },
    {
      label: "Amazon on Listing",
      status: product.amazonPrice !== null ? "yellow" : "green",
      detail: product.amazonPrice !== null ? "Amazon is selling this product" : "Amazon not on listing",
    },
  ];

  const hasIssues = alertRows.some((r) => r.status !== "green");

  return (
    <CollapsiblePanel
      title="Alerts"
      icon="alert-triangle"
      defaultOpen={hasIssues}
      badge={hasIssues ? { text: alertRows.filter(r => r.status !== "green").length + " ALERT(S)", color: Colors.light.red, bg: Colors.light.redBg } : { text: "ALL CLEAR", color: Colors.light.green, bg: Colors.light.greenBg }}
    >
      {alertRows.map((row, i) => (
        <View key={i} style={[styles.alertRow, i < alertRows.length - 1 && styles.alertRowBorder]}>
          <View style={[styles.statusDot, {
            backgroundColor: row.status === "green" ? Colors.light.green : row.status === "yellow" ? Colors.light.yellow : Colors.light.red,
          }]} />
          <View style={styles.alertContent}>
            <Text style={styles.alertLabel}>{row.label}</Text>
            <Text style={styles.alertDetail}>{row.detail}</Text>
          </View>
        </View>
      ))}
    </CollapsiblePanel>
  );
}

const styles = StyleSheet.create({
  alertRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
  },
  alertRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.borderLight,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  alertContent: {
    flex: 1,
  },
  alertLabel: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.light.text,
  },
  alertDetail: {
    fontSize: 11,
    color: Colors.light.textTertiary,
    marginTop: 1,
  },
});
