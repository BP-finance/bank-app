/**
 * Rota de setup de PIN (feature SECURITY).
 * Fluxo oficial de criação de PIN — reutilizado quando operações sensíveis
 * exigem PIN e o usuário ainda não configurou.
 */

import { PinSetupScreen } from "@/src/features/security";
import { useCurrentAccount } from "@/src/features/current-account";
import { useRouter } from "expo-router";

export default function PinSetupPage() {
  const router = useRouter();
  const { currentAccount } = useCurrentAccount();
  const accountId = currentAccount?.id ?? "";

  return (
    <PinSetupScreen
      accountId={accountId}
      onSuccess={() => router.back()}
      onCancel={() => router.back()}
    />
  );
}
