import React from "react";
import { StyleSheet, Text, View } from "react-native";

type ValidationBannerProps = {
  message: string | null;
};

const ValidationBanner: React.FC<ValidationBannerProps> = ({ message }) => {
  if (!message) return null;

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff4e5",
    borderColor: "#f6c263",
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  message: {
    color: "#8a5a10",
    fontSize: 13,
    fontWeight: "600",
  },
});

export default ValidationBanner;
