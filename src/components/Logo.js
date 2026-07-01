import React from "react";
import { Image, StyleSheet, View } from "react-native";

const MARK = require("../../assets/brand/nexia-logo-dark.jpg");

export default function Logo({ size = 48 }) {
  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Image
        source={MARK}
        style={{ width: size, height: size, borderRadius: size * 0.22 }}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center" },
});
