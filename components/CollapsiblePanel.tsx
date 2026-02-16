import { StyleSheet, Text, View, Pressable } from "react-native";
import { useState } from "react";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Colors from "@/constants/colors";

interface CollapsiblePanelProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: { text: string; color: string; bg: string };
}

export function CollapsiblePanel({ title, icon, children, defaultOpen = true, badge }: CollapsiblePanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => {
          setOpen(!open);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
        style={styles.header}
      >
        <View style={styles.headerLeft}>
          {icon && <Feather name={icon as any} size={15} color={Colors.light.textSecondary} />}
          <Text style={styles.headerTitle}>{title}</Text>
          {badge && (
            <View style={[styles.badge, { backgroundColor: badge.bg }]}>
              <Text style={[styles.badgeText, { color: badge.color }]}>{badge.text}</Text>
            </View>
          )}
        </View>
        <Feather name={open ? "chevron-up" : "chevron-down"} size={18} color={Colors.light.textTertiary} />
      </Pressable>
      {open && <View style={styles.body}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.light.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.light.panelHeader,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "700" as const,
    color: Colors.light.panelHeaderText,
    textTransform: "uppercase" as const,
    letterSpacing: 0.3,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700" as const,
  },
  body: {
    padding: 12,
  },
});
