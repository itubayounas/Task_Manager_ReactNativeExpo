import { useEffect, useRef } from "react";
import { Animated, Text, View, Dimensions } from "react-native";

const { width } = Dimensions.get("screen");

export default function Toast({ visible, message, type = "success", onHide }) {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after 3 seconds
      const timer = setTimeout(() => {
        Animated.parallel([
          Animated.timing(translateY, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => onHide && onHide());
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!visible) return null;

  const colors = {
    success: { bg: "#10b981", icon: "✅" },
    error:   { bg: "#ef4444", icon: "❌" },
    info:    { bg: "#4f46e5", icon: "ℹ️" },
    warning: { bg: "#f59e0b", icon: "⚠️" },
  };

  const { bg, icon } = colors[type] || colors.success;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 55,
        left: 16,
        right: 16,
        zIndex: 9999,
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View style={{
        backgroundColor: bg,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: "row",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 8,
        gap: 10,
      }}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
        <Text style={{
          color: "white",
          fontSize: 14,
          fontWeight: "600",
          flex: 1,
          flexWrap: "wrap",
        }}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}