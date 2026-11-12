import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";
import { Platform } from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";
import Colors from "@/constants/colors";
import { useCameraAction } from "@/lib/use-camera-action";

export const unstable_settings = { anchor: "history" };

function NativeTabLayout() {
  const requestScan = useCameraAction();
  return (
    <NativeTabs backBehavior="initialRoute">
      {/* Native disabled triggers emit tabPress without selecting their route. */}
      <NativeTabs.Trigger name="index" disabled listeners={{ tabPress: () => { void requestScan(); } }}>
        <NativeTabs.Trigger.Icon sf={{ default: "camera", selected: "camera.fill" }} />
        <NativeTabs.Trigger.Label>Scan</NativeTabs.Trigger.Label>
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
  const requestScan = useCameraAction();
  return (
    <Tabs backBehavior="initialRoute"
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
        listeners={{ tabPress: event => { event.preventDefault(); void requestScan(); } }}
        options={{
          title: "Scan",
          tabBarIcon: ({ focused }) => (
            <Feather name="camera" size={22} color={focused ? Colors.light.accent : Colors.light.tabIconDefault} />
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
  return isLiquidGlassAvailable() ? <NativeTabLayout /> : <ClassicTabLayout />;
}
