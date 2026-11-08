import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";
import { Platform, StyleSheet } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { ScanTriggerProvider, useScanTrigger } from "@/lib/scan-trigger";

function NativeTabLayout() {
  const { requestScan } = useScanTrigger();
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index" listeners={{ tabPress: requestScan }}>
        <NativeTabs.Trigger.Icon sf={{ default: "barcode.viewfinder", selected: "barcode.viewfinder" }} />
        <NativeTabs.Trigger.Label>Scan</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="search">
        <NativeTabs.Trigger.Icon sf={{ default: "magnifyingglass", selected: "magnifyingglass" }} />
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="history">
        <NativeTabs.Trigger.Icon sf={{ default: "clock", selected: "clock.fill" }} />
        <NativeTabs.Trigger.Label>History</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} />
        <NativeTabs.Trigger.Label>Settings</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const { requestScan } = useScanTrigger();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.accent,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors.light.surface,
          borderTopColor: Colors.light.border,
          borderTopWidth: 1,
          height: Platform.OS === "web" ? 84 : 85,
          paddingBottom: Platform.OS === "web" ? 34 : 28,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600" as const,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        listeners={{ tabPress: requestScan }}
        options={{
          title: "Scan",
          tabBarIcon: ({ focused }) => (
            <Feather name="camera" size={22} color={focused ? Colors.light.accent : Colors.light.tabIconDefault} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Search",
          tabBarIcon: ({ focused }) => (
            <Feather name="search" size={22} color={focused ? Colors.light.accent : Colors.light.tabIconDefault} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ focused }) => (
            <Feather name="clock" size={22} color={focused ? Colors.light.accent : Colors.light.tabIconDefault} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused }) => (
            <Feather name="settings" size={22} color={focused ? Colors.light.accent : Colors.light.tabIconDefault} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  return <ScanTriggerProvider>
    {isLiquidGlassAvailable() ? <NativeTabLayout /> : <ClassicTabLayout />}
  </ScanTriggerProvider>;
}
