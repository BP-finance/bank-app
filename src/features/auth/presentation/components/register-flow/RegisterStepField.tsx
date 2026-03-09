/**
 * Campo genérico do step form.
 * Renderiza AuthInput ou Switch conforme fieldType, reutilizando formatters.
 */

import { COLORS } from "@/src/theme/colors";
import { SPACING } from "@/src/theme/spacing";
import { TYPOGRAPHY } from "@/src/theme/typography";
import { StyleSheet, Switch, Text, View } from "react-native";
import { AuthInput } from "../AuthInput";
import { formatCPF, formatCNPJ, formatPhone } from "../../../utils";
import type { StepConfig } from "../../../config/registerSteps.config";

type Props = {
  step: StepConfig;
  value: string | boolean;
  error?: string;
  onChange: (value: string | boolean) => void;
};

export function RegisterStepField({ step, value, error, onChange }: Props) {
  if (step.fieldType === "terms") {
    return (
      <View style={styles.row}>
        <Switch
          value={value === true}
          onValueChange={(v) => onChange(v)}
          trackColor={{ false: "#CBD5E1", true: COLORS.primary }}
          thumbColor="#fff"
        />
        <Text style={styles.termsText}>{step.label}</Text>
      </View>
    );
  }

  const str = typeof value === "string" ? value : "";

  const handleChange = (v: string) => {
    if (step.fieldType === "document" && step.documentVariant) {
      onChange(step.documentVariant === "cpf" ? formatCPF(v) : formatCNPJ(v));
    } else if (step.fieldType === "phone") {
      onChange(formatPhone(v));
    } else {
      onChange(v);
    }
  };

  return (
    <AuthInput
      label={step.label}
      value={str}
      onChangeText={handleChange}
      placeholder={step.placeholder}
      keyboardType={step.fieldType === "document" || step.fieldType === "phone" ? "numeric" : undefined}
      autoCapitalize={step.fieldType === "email" ? "none" : undefined}
      secureTextEntry={step.fieldType === "password"}
      error={error}
    />
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  termsText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    flex: 1,
  },
});
