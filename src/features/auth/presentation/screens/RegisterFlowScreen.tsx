/**
 * Tela única do fluxo de cadastro step-by-step.
 * Orquestra fases: splash → welcome (com PF/PJ) → steps.
 * Sucesso redireciona via ONBOARDING_STATUS_ROUTES (services).
 */

import { Href, useRouter } from "expo-router";
import { RegisterSplashPhase } from "../components/register-flow";
import { RegisterFlowPhaseWelcome } from "../components/register-flow";
import { RegisterStepLayout } from "../components/register-flow";
import { useRegisterFlow } from "../../hooks/useRegisterFlow";

export function RegisterFlowScreen() {
  const router = useRouter();
  const {
    phase,
    stepConfig,
    currentStepIndex,
    formValues,
    fieldErrors,
    isSubmitting,
    submitError,
    canGoPrev,
    goToWelcome,
    selectPersonType,
    goNextStep,
    goPrevStep,
    setFieldValue,
    submit,
  } = useRegisterFlow();

  const handleGoToLogin = () => {
    router.replace("/auth/login" as Href);
  };

  if (phase === "splash") {
    return <RegisterSplashPhase onComplete={goToWelcome} />;
  }

  if (phase === "welcome") {
    return (
      <RegisterFlowPhaseWelcome
        onSelectType={selectPersonType}
        onGoToLogin={handleGoToLogin}
      />
    );
  }

  if (phase === "steps" && stepConfig) {
    return (
      <RegisterStepLayout
        stepConfig={stepConfig}
        currentStepIndex={currentStepIndex}
        formValues={formValues}
        fieldErrors={fieldErrors}
        isSubmitting={isSubmitting}
        submitError={submitError}
        canGoPrev={canGoPrev}
        onSetFieldValue={setFieldValue}
        onNext={goNextStep}
        onPrev={goPrevStep}
        onSubmit={submit}
        onGoToLogin={handleGoToLogin}
      />
    );
  }

  return null;
}
