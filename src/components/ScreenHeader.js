import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "../theme/colors";

// Shared app bar for every screen so headers look and behave the same
// everywhere (same height, same generous tap targets), instead of relying
// on react-navigation's native header which renders inconsistently across
// the drawer root vs. nested stacks and gives cramped touch areas.
export default function ScreenHeader({ title, onMenuPress, onBackPress, actions = [] }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 10 }]}>
      <View style={styles.row}>
        <View style={styles.side}>
          {(onMenuPress || onBackPress) && (
            <TouchableOpacity
              onPress={onBackPress || onMenuPress}
              style={styles.iconButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Text style={styles.icon}>{onBackPress ? "←" : "☰"}</Text>
            </TouchableOpacity>
          )}
        </View>

        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        <View style={[styles.side, styles.sideRight]}>
          {actions.map((action, index) => (
            <TouchableOpacity
              key={index}
              onPress={action.onPress}
              style={styles.actionButton}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              {action.icon ? (
                <Text style={[styles.icon, { color: action.color || colors.pink }]}>
                  {action.icon}
                </Text>
              ) : (
                <Text style={[styles.actionLabel, { color: action.color || colors.primary }]}>
                  {action.label}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 56,
    paddingHorizontal: 8,
    paddingBottom: 12,
  },
  side: {
    flexDirection: "row",
    alignItems: "center",
    minWidth: 48,
  },
  sideRight: { justifyContent: "flex-end" },
  title: {
    flex: 1,
    fontSize: 22,
    fontFamily: "BarlowCondensed_700Bold",
    color: colors.textDark,
    textAlign: "left",
    marginLeft: 4,
  },
  iconButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
  },
  icon: { fontSize: 24, color: colors.textDark },
  actionButton: {
    minWidth: 44,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  actionLabel: { fontSize: 15, fontFamily: "Manrope_700Bold" },
});
