/**
 * Rota do novo fluxo de cadastro step-by-step.
 * Entrada única: splash → welcome → type → steps → onboarding.
 */

import { RegisterFlowScreen } from "@/src/features/auth/presentation/screens/RegisterFlowScreen";

export default function RegisterPage() {
  return <RegisterFlowScreen />;
}
