/**
 * Barra de progresso do step form.
 * Exibe "Passo X de Y" e barra linear.
 */

import { COLORS } from "@/src/theme/colors";
import { SPACING } from "@/src/theme/spacing";
import { TYPOGRAPHY } from "@/src/theme/typography";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  currentStep: number;
  totalSteps: number;
};

export function RegisterStepProgress({ currentStep, totalSteps }: Props) {
  const progress = totalSteps > 0 ? (currentStep + 1) / totalSteps : 0;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Passo {currentStep + 1} de {totalSteps}
      </Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.xl,
  },
  text: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  track: {
    height: 4,
    backgroundColor: "#E2E8F0",
    borderRadius: 2,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
});
