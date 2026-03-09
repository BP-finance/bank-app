/**
 * Base para animações de entrada reutilizáveis.
 * Fade + deslocamento opcional, sem bounce.
 */

import type { StyleProp, ViewStyle } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

export type AnimatedEnterDirection = "up" | "down" | "left" | "right" | null;

export interface AnimatedEnterProps {
  children: React.ReactNode;
  /** Delay em ms antes de iniciar */
  delay?: number;
  /** Duração da animação em ms */
  duration?: number;
  /** Distância do deslocamento em px (ignorado se direction = null) */
  distance?: number;
  /** Direção do deslocamento (null = apenas fade) */
  direction?: AnimatedEnterDirection;
  style?: StyleProp<ViewStyle>;
  onAnimationEnd?: () => void;
  /** Quando true, pula animação e exibe conteúdo final */
  disabled?: boolean;
}

const EASING = Easing.out(Easing.cubic);

export function AnimatedEnter({
  children,
  delay = 0,
  duration = 400,
  distance = 12,
  direction = null,
  style,
  onAnimationEnd,
  disabled = false,
}: AnimatedEnterProps) {
  const opacity = useSharedValue(disabled ? 1 : 0);
  const translateY = useSharedValue(
    direction === "up" ? distance : direction === "down" ? -distance : 0
  );
  const translateX = useSharedValue(
    direction === "left" ? distance : direction === "right" ? -distance : 0
  );

  useEffect(() => {
    if (disabled) return;

    const config = { duration, easing: EASING };
    const finished = onAnimationEnd ? () => runOnJS(onAnimationEnd)() : undefined;

    opacity.value = withDelay(delay, withTiming(1, config, finished));
    translateY.value = withDelay(delay, withTiming(0, config));
    translateX.value = withDelay(delay, withTiming(0, config));
  }, [disabled, delay, duration, direction, onAnimationEnd]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }, { translateX: translateX.value }],
  }));

  if (disabled) {
    return <>{children}</>;
  }

  return <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>;
}
