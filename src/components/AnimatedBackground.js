import { useEffect, useRef } from "react";
import { View, Animated, Dimensions, Easing, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("screen"); // ✅ "screen" not "window" — covers full display including nav bar

const bubbles = [
  { size: 80,  x: 0.1,  y: 0.05, duration: 4000, delay: 0    },
  { size: 120, x: 0.75, y: 0.08, duration: 5000, delay: 500  },
  { size: 60,  x: 0.5,  y: 0.15, duration: 3500, delay: 1000 },
  { size: 100, x: 0.85, y: 0.35, duration: 4500, delay: 700  },
  { size: 70,  x: 0.05, y: 0.4,  duration: 3800, delay: 300  },
  { size: 90,  x: 0.6,  y: 0.55, duration: 4200, delay: 900  },
  { size: 50,  x: 0.25, y: 0.65, duration: 3200, delay: 200  },
  { size: 110, x: 0.8,  y: 0.7,  duration: 5200, delay: 600  },
  { size: 75,  x: 0.15, y: 0.82, duration: 4100, delay: 400  },
  { size: 95,  x: 0.55, y: 0.88, duration: 4700, delay: 800  },
];

function Bubble({ size, x, y, duration, delay }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.delay(delay),
          Animated.loop(
            Animated.sequence([
              Animated.timing(translateY, {
                toValue: -18,
                duration,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
              Animated.timing(translateY, {
                toValue: 0,
                duration,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
            ])
          ),
        ]),
        Animated.sequence([
          Animated.delay(delay),
          Animated.loop(
            Animated.sequence([
              Animated.timing(scale, {
                toValue: 1.08,
                duration: duration * 1.2,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
              Animated.timing(scale, {
                toValue: 1,
                duration: duration * 1.2,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
            ])
          ),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      style={{
        position: "absolute",
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "rgba(255, 255, 255, 0.15)",
        left: x * width - size / 2,
        top: y * height - size / 2,
        transform: [{ translateY }, { scale }],
      }}
    />
  );
}

export default function AnimatedBackground() {
  return (
    <View style={styles.container}>
      {bubbles.map((bubble, index) => (
        <Bubble key={index} {...bubble} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",  // ✅ sits behind everything
    top: 0,                // ✅ starts from very top
    left: 0,               // ✅ starts from very left
    width,                 // ✅ exact screen width
    height,                // ✅ exact screen height (using "screen" dimensions)
    backgroundColor: "#4f46e5",
    zIndex: -1,            // ✅ always behind all content
  },
});