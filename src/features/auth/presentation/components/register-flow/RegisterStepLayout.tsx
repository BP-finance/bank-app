/**
 * Layout do step form: progress bar + campos da etapa atual + botões.
 * Suporta múltiplos campos por etapa.
 * Campos entram com animação FadeInLeft + stagger.
 */

import { FadeInLeft } from "@/src/shared/components/animations";
import { COLORS } from "@/src/theme/colors";
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

const STAGGER_DELAY = 80;

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
          currentStepIndex={currentStepIndex}
          steps={stepConfig}
        />

        <FadeInLeft key={`title-${currentStepIndex}`} delay={0} distance={16}>
          <Text style={styles.title}>
            {isLastStep ? "Revise e finalize" : currentStep?.title}
          </Text>
        </FadeInLeft>

        {currentStep?.description && (
          <FadeInLeft key={`desc-${currentStepIndex}`} delay={STAGGER_DELAY} distance={16}>
            <Text style={styles.description}>{currentStep.description}</Text>
          </FadeInLeft>
        )}

        {submitError && (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{submitError}</Text>
          </View>
        )}

        <View style={styles.fieldsContainer}>
          {currentStep?.fields.map((field, fieldIndex) => {
            const baseDelay = currentStep.description 
              ? STAGGER_DELAY * 2 
              : STAGGER_DELAY;
            const fieldDelay = baseDelay + (fieldIndex * STAGGER_DELAY);

            return (
              <FadeInLeft
                key={`${currentStepIndex}-${field.id}`}
                delay={fieldDelay}
                distance={16}
              >
                <RegisterStepField
                  field={field}
                  value={formValues[field.id]}
                  error={fieldErrors[field.id]}
                  onChange={(v) => onSetFieldValue(field.id, v)}
                />
              </FadeInLeft>
            );
          })}
        </View>

        <FadeInLeft
          key={`actions-${currentStepIndex}`}
          delay={STAGGER_DELAY * (2 + (currentStep?.fields.length ?? 0))}
          distance={16}
        >
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
        </FadeInLeft>

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
    backgroundColor: COLORS.background_white,
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
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.darkcolor,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: "600",
  },
});
