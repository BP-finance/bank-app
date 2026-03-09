/**
 * Layout do step form: progress bar + campo atual + botões.
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
import { AuthButton } from "../AuthButton";
import { RegisterStepProgress } from "./RegisterStepProgress";
import { RegisterStepField } from "./RegisterStepField";
import type { StepConfig } from "../../../config/registerSteps.config";
import type { RegisterFlowFieldKey } from "../../../config/registerSteps.config";
import type { RegisterFlowFormValues } from "../../../config/registerSteps.config";

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
          {isLastStep ? "Revise e finalize" : currentStep?.label}
        </Text>

        {submitError && (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        )}

        {currentStep && (
          <RegisterStepField
            step={currentStep}
            value={formValues[currentStep.id]}
            error={fieldErrors[currentStep.id]}
            onChange={(v) => onSetFieldValue(currentStep.id, v)}
          />
        )}

        <View style={styles.actions}>
          {canGoPrev && (
            <TouchableOpacity style={styles.backBtn} onPress={onPrev}>
              <Text style={styles.backText}>Voltar</Text>
            </TouchableOpacity>
          )}
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
  },
  scroll: {
    flexGrow: 1,
    padding: SPACING.xl,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xxxl,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#131313",
    marginBottom: SPACING.lg,
  },
  errorWrap: {
    backgroundColor: "#FEE2E2",
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  errorText: {
    fontSize: 14,
    color: "#B91C1C",
  },
  actions: {
    flexDirection: "row",
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
