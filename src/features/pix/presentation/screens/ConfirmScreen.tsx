/**
 * ------------------------------------------------------------------
 * Screen: PixConfirmScreen
 * ------------------------------------------------------------------
 *
 * Terceira etapa do fluxo.
 *
 * Responsável por:
 * - Exibir resumo da transferência
 * - Solicitar autorização transacional (challenge) antes do envio
 * - Executar envio APENAS após resultado authorized
 * - Tratar denied, blocked, cancelled, not_configured, unavailable
 *
 * Não chama sendPixUseCase diretamente — usa fluxo protegido.
 * ------------------------------------------------------------------
 */

import LoadingOverlay from "@/src/features/account/components/feedback/LoadingOverlay";
import { useCurrentAccount } from "@/src/features/current-account";
import { useSecurityStore } from "@/src/features/security";
import { sendPixWithSecurityChallengeUseCase } from "@/src/features/pix/useCases/sendPixWithSecurityChallengeUseCase";
import { getChallengeResultMessage } from "@/src/features/pix/utils/challengeResultMessages";
import { navigateToPinSetup } from "@/src/features/pix/utils/handleNotConfiguredResult";
import { COLORS } from "@/src/theme/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function PixConfirmScreen() {
  const { to, amount } = useLocalSearchParams<{
    to: string;
    amount: string;
  }>();

  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const { currentAccount } = useCurrentAccount();
  const accountId = currentAccount?.id ?? "";

  const currentChallenge = useSecurityStore((s) => s.currentChallenge);
  const showChallenge = currentChallenge !== null;

  async function handleConfirm() {
    if (!to || !amount || !accountId) {
      Alert.alert("Erro", "Dados incompletos. Faça login novamente.");
      return;
    }

    try {
      setLoading(true);
      const startTime = Date.now();

      const result = await sendPixWithSecurityChallengeUseCase({
        to,
        amount: Number(amount),
        accountId,
      });

      if (result.success) {
        const MIN_LOADING_TIME = 3500;
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < MIN_LOADING_TIME) {
          await new Promise((r) =>
            setTimeout(r, MIN_LOADING_TIME - elapsedTime)
          );
        }
        router.replace("/pix/success");
      } else {
        const message = getChallengeResultMessage(result.challengeResult);
        if (result.challengeResult.status === "cancelled") {
          return;
        }
        if (result.challengeResult.status === "not_configured") {
          navigateToPinSetup(router);
          return;
        }
        Alert.alert("Erro", message);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Erro ao enviar Pix.";
      Alert.alert("Erro", msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirmar Pix</Text>
      <Text>Destinatário: {to}</Text>
      <Text>Valor: R$ {amount}</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={handleConfirm}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Confirmar</Text>
      </TouchableOpacity>

      <LoadingOverlay visible={loading && !showChallenge} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: COLORS.lightcolor },
  title: { fontSize: 22, marginBottom: 20 },
  button: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: COLORS.lightcolor, fontWeight: "bold" },
});
