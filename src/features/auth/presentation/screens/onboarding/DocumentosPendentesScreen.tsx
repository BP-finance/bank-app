/**
 * Tela exibida quando onboardingStatus = documentos_pendentes.
 * Usuário precisa enviar ou reenviar documentos.
 */

import { COLORS } from "@/src/theme/colors";
import { SPACING } from "@/src/theme/spacing";
import { TYPOGRAPHY } from "@/src/theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AuthButton } from "../../components/AuthButton";

export function DocumentosPendentesScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="document-text-outline" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Documentos pendentes</Text>
        <Text style={styles.message}>
          Para continuar, precisamos que você envie ou complete o envio dos
          documentos necessários. Acesse sua área de usuário ou verifique seu
          e-mail para as instruções.
        </Text>
        <AuthButton
          title="Ir para o login"
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
    backgroundColor: `${COLORS.primary}15`,
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
