/**
 * Stepper horizontal animado do register flow.
 * Exibe bolinhas para cada etapa com linha de progresso animada.
 * Mostra label com progresso e título da etapa atual.
 * 
 * Estados visuais:
 * - Concluída: bolinha preenchida (primary)
 * - Atual: bolinha com borda (primary) + fundo branco
 * - Pendente: bolinha com borda cinza + fundo branco
 */

import { FadeIn } from "@/src/shared/components/animations";
import { COLORS } from "@/src/theme/colors";
import { SPACING } from "@/src/theme/spacing";
import { TYPOGRAPHY } from "@/src/theme/typography";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import type { StepConfig } from "../../../config/registerSteps.config";

type Props = {
  currentStepIndex: number;
  steps: StepConfig[];
};

const STEP_SIZE = 24;
const LINE_HEIGHT = 3;
const ANIMATION_DURATION = 350;
const EASING = Easing.out(Easing.cubic);

export function RegisterStepProgress({ currentStepIndex, steps }: Props) {
  const totalSteps = steps.length;
  const currentStepTitle = steps[currentStepIndex]?.title ?? "";
  const progress = useSharedValue(0);

  useEffect(() => {
    const targetProgress = totalSteps > 1 ? currentStepIndex / (totalSteps - 1) : 0;
    progress.value = withTiming(targetProgress, {
      duration: ANIMATION_DURATION,
      easing: EASING,
    });
  }, [currentStepIndex, totalSteps]);

  const lineAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.stepperContainer}>
        <View style={styles.lineContainer}>
          <View style={styles.lineTrack} />
          <Animated.View style={[styles.lineFill, lineAnimatedStyle]} />
        </View>

        <View style={styles.stepsContainer}>
          {Array.from({ length: totalSteps }).map((_, index) => (
            <StepDot
              key={index}
              index={index}
              currentStep={currentStepIndex}
              totalSteps={totalSteps}
            />
          ))}
        </View>
      </View>

      <FadeIn key={`label-${currentStepIndex}`} duration={300}>
        <View style={styles.labelContainer}>
          <Text style={styles.labelProgress}>
            Etapa {currentStepIndex + 1} de {totalSteps}
          </Text>
          <Text style={styles.labelSeparator}> · </Text>
          <Text style={styles.labelTitle}>{currentStepTitle}</Text>
        </View>
      </FadeIn>
    </View>
  );
}

type StepDotProps = {
  index: number;
  currentStep: number;
  totalSteps: number;
};

function StepDot({ index, currentStep, totalSteps }: StepDotProps) {
  const scale = useSharedValue(1);
  const isCompleted = index < currentStep;
  const isCurrent = index === currentStep;

  useEffect(() => {
    if (isCurrent) {
      scale.value = withTiming(1.15, { duration: ANIMATION_DURATION, easing: EASING });
    } else {
      scale.value = withTiming(1, { duration: ANIMATION_DURATION, easing: EASING });
    }
  }, [isCurrent]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const dotStyle = [
    styles.dot,
    isCompleted && styles.dotCompleted,
    isCurrent && styles.dotCurrent,
    !isCompleted && !isCurrent && styles.dotPending,
  ];

  const position = totalSteps > 1 ? (index / (totalSteps - 1)) * 100 : 50;

  return (
    <Animated.View
      style={[
        styles.dotWrapper,
        { left: `${position}%` },
        animatedStyle,
      ]}
    >
      <View style={dotStyle}>
        {isCompleted && <View style={styles.dotInnerCompleted} />}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  stepperContainer: {
    height: STEP_SIZE,
    marginBottom: SPACING.md,
  },
  lineContainer: {
    position: "absolute",
    top: STEP_SIZE / 2 - LINE_HEIGHT / 2,
    left: STEP_SIZE / 2,
    right: STEP_SIZE / 2,
    height: LINE_HEIGHT,
  },
  lineTrack: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "#E2E8F0",
    borderRadius: LINE_HEIGHT / 2,
  },
  lineFill: {
    position: "absolute",
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: LINE_HEIGHT / 2,
  },
  stepsContainer: {
    position: "relative",
    height: STEP_SIZE,
  },
  dotWrapper: {
    position: "absolute",
    marginLeft: -STEP_SIZE / 2,
  },
  dot: {
    width: STEP_SIZE,
    height: STEP_SIZE,
    borderRadius: STEP_SIZE / 2,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  dotCompleted: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  dotCurrent: {
    backgroundColor: COLORS.background_white,
    borderColor: COLORS.primary,
    borderWidth: 3,
  },
  dotPending: {
    backgroundColor: COLORS.background_white,
    borderColor: COLORS.textSecondary,
  },
  dotInnerCompleted: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.background_white,
  },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  labelProgress: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  labelSeparator: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
  },
  labelTitle: {
    ...TYPOGRAPHY.subtitle_3,
    color: COLORS.darkcolor,
  },
});
