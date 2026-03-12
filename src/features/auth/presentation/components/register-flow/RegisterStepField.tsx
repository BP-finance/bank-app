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
import type { FieldConfig } from "../../../config/registerSteps.config";

type Props = {
  field: FieldConfig;
  value: string | boolean;
  error?: string;
  onChange: (value: string | boolean) => void;
};

export function RegisterStepField({ field, value, error, onChange }: Props) {
  if (field.fieldType === "terms") {
    return (
      <View style={styles.row}>
        <Switch
          value={value === true}
          onValueChange={(v) => onChange(v)}
          trackColor={{ false: "#CBD5E1", true: COLORS.primary }}
          thumbColor="#fff"
        />
        <Text style={styles.termsText}>{field.label}</Text>
      </View>
    );
  }

  const str = typeof value === "string" ? value : "";

  const handleChange = (v: string) => {
    if (field.fieldType === "document" && field.documentVariant) {
      onChange(field.documentVariant === "cpf" ? formatCPF(v) : formatCNPJ(v));
    } else if (field.fieldType === "phone") {
      onChange(formatPhone(v));
    } else {
      onChange(v);
    }
  };

  return (
    <AuthInput
      label={field.label}
      value={str}
      onChangeText={handleChange}
      placeholder={field.placeholder}
      keyboardType={field.fieldType === "document" || field.fieldType === "phone" ? "numeric" : undefined}
      autoCapitalize={field.fieldType === "email" ? "none" : undefined}
      secureTextEntry={field.fieldType === "password"}
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
