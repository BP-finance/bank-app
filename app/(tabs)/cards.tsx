import { navigateToPinSetup } from "@/src/features/pix/utils/handleNotConfiguredResult";
import { useCurrentAccount } from "@/src/features/current-account";
import { sendPixWithSecurityChallengeUseCase } from "@/src/features/pix/useCases/sendPixWithSecurityChallengeUseCase";
import { getChallengeResultMessage } from "@/src/features/pix/utils/challengeResultMessages";
import LottieAnimation from "@/src/shared/components/animations/LottieAnimation";
import { COLORS } from "@/src/theme/colors";
import { TYPOGRAPHY } from "@/src/theme/typography";

import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

export default function Cards() {
  const router = useRouter();
  const { currentAccount } = useCurrentAccount();
  const accountId = currentAccount?.id ?? "";

  async function handleConfirm() {
    if (!accountId) {
      Alert.alert("Erro", "Faça login para enviar Pix.");
      return;
    }
    try {
      const result = await sendPixWithSecurityChallengeUseCase({
        to: "Trasferencia Teste",
        amount: 200,
        accountId,
      });
      if (result.success) {
        Alert.alert("Pix", "Enviado com sucesso (teste).");
      } else {
        if (result.challengeResult.status === "not_configured") {
          navigateToPinSetup(router);
          return;
        }
        if (result.challengeResult.status !== "cancelled") {
          const msg = getChallengeResultMessage(result.challengeResult);
          Alert.alert("Erro", msg);
        }
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Erro ao enviar Pix.";
      Alert.alert("Erro", msg);
    }
  }
  return (
    <View style={styles.container}>
      <Text style={TYPOGRAPHY.title}>Em Breve!</Text>

      <LottieAnimation type="card" size={300}></LottieAnimation>
      <TouchableOpacity style={styles.borders} onPress={handleConfirm}>
        <Text>Enviar Pix Teste</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    flex: 1,
    backgroundColor: COLORS.background_white,
  },
  wrapper: {
    flex: 1,
    paddingBottom: 0,
    paddingLeft: 10,
    paddingRight: 10,
  },
  sp: {
    marginTop: 13,
  },
  title: {
    color: "#000",
  },
  borders: {
    padding: 15,
    borderWidth: 1,
  },
});
