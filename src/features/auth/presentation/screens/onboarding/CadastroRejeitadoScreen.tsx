/**
 * Tela exibida quando onboardingStatus = rejeitado.
 * Cadastro recusado, orientação de próximos passos.
 */

import { COLORS } from "@/src/theme/colors";
import { SPACING } from "@/src/theme/spacing";
import { TYPOGRAPHY } from "@/src/theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AuthButton } from "../../components/AuthButton";

export function CadastroRejeitadoScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="close-circle-outline" size={48} color="#DC2626" />
        </View>
        <Text style={styles.title}>Cadastro não aprovado</Text>
        <Text style={styles.message}>
          Infelizmente seu cadastro não foi aprovado. Entre em contato com o
          suporte para mais informações ou tente novamente com dados atualizados.
        </Text>
        <AuthButton
          title="Voltar ao login"
          onPress={() => router.replace("/auth/login" as Href)}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background_white,
    padding: SPACING.xl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginBottom: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.darkcolor,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  message: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xxl,
  },
});
