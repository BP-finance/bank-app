/**
 * Layout do step form: progress bar + campos da etapa atual + botões.
 * Suporta múltiplos campos por etapa.
 */

import { SPACING } from "@/src/theme/spacing";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import type { RegisterFlowFieldKey, RegisterFlowFormValues, StepConfig } from "../../../config/registerSteps.config";
import { AuthButton } from "../AuthButton";
import { RegisterStepField } from "./RegisterStepField";
import { RegisterStepProgress } from "./RegisterStepProgress";

type Props = {
  stepConfig: StepConfig[];
  currentStepIndex: number;
  formValues: RegisterFlowFormValues;
  fieldErrors: Partial<Record<RegisterFlowFieldKey, string>>;
  isSubmitting: boolean;
  submitError: string | null;
  canGoPrev: boolean;
  onSetFieldValue: (key: RegisterFlowFieldKey, value: string | boolean) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => Promise<void>;
  onGoToLogin: () => void;
};

export function RegisterStepLayout({
  stepConfig,
  currentStepIndex,
  formValues,
  fieldErrors,
  isSubmitting,
  submitError,
  canGoPrev,
  onSetFieldValue,
  onNext,
  onPrev,
  onSubmit,
  onGoToLogin,
}: Props) {
  const currentStep = stepConfig[currentStepIndex];
  const isLastStep = currentStepIndex === stepConfig.length - 1;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <RegisterStepProgress
          currentStep={currentStepIndex}
          totalSteps={stepConfig.length}
        />

        <Text style={styles.title}>
          {isLastStep ? "Revise e finalize" : currentStep?.title}
        </Text>

        {currentStep?.description && (
          <Text style={styles.description}>{currentStep.description}</Text>
        )}

        {submitError && (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        )}

        <View style={styles.fieldsContainer}>
          {currentStep?.fields.map((field) => (
            <RegisterStepField
              key={field.id}
              field={field}
              value={formValues[field.id]}
              error={fieldErrors[field.id]}
              onChange={(v) => onSetFieldValue(field.id, v)}
            />
          ))}
        </View>

        <View style={styles.actions}>
          {isLastStep ? (
            <AuthButton
              title="Cadastrar"
              onPress={onSubmit}
              loading={isSubmitting}
              style={styles.primaryBtn}
            />
          ) : (
            <AuthButton
              title="Continuar"
              onPress={onNext}
              style={styles.primaryBtn}
            />
          )}
          {canGoPrev && (
            <TouchableOpacity style={styles.backBtn} onPress={onPrev}>
              <Text style={styles.backText}>Voltar</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem conta? </Text>
          <TouchableOpacity onPress={onGoToLogin}>
            <Text style={styles.footerLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scroll: {
    gap: SPACING.lg,
    justifyContent: "center",
    flexGrow: 1,
    padding: SPACING.xl,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xxxl,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#131313",
  },
  description: {
    fontSize: 14,
    color: "#64748B",
    marginTop: -SPACING.sm,
  },
  errorWrap: {
    backgroundColor: "#FEE2E2",
    padding: SPACING.md,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#B91C1C",
  },
  fieldsContainer: {
    gap: SPACING.md,
  },
  actions: {
    flexDirection: "column",
    gap: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.lg,
  },
  backBtn: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  backText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748B",
  },
  primaryBtn: {
    width: "100%",
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.xxl,
  },
  footerText: {
    fontSize: 14,
    color: "#94A3B8",
  },
  footerLink: {
    fontSize: 14,
    color: "#EB0459",
    fontWeight: "600",
  },
});
