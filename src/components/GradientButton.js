import React from "react";
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { gradients, radii } from "../theme/colors";

export default function GradientButton({
  title,
  onPress,
  disabled,
  loading,
  colors: customColors,
  style,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[styles.touchable, style, disabled && styles.disabled]}
    >
      <LinearGradient
        colors={customColors || gradients.pinkButton}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.text}>{title}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touchable: { borderRadius: radii.md, overflow: "hidden" },
  gradient: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  text: { color: "#fff", fontSize: 16, fontFamily: "Manrope_700Bold" },
  disabled: { opacity: 0.6 },
});
