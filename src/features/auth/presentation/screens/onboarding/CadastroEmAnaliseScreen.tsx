/**
 * Tela exibida quando onboardingStatus = em_analise.
 * Dados enviados e em análise.
 */

import { COLORS } from "@/src/theme/colors";
import { SPACING } from "@/src/theme/spacing";
import { TYPOGRAPHY } from "@/src/theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { Href, useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { AuthButton } from "../../components/AuthButton";

export function CadastroEmAnaliseScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="search-outline" size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Em análise</Text>
        <Text style={styles.message}>
          Seus dados estão sendo analisados. Você receberá uma notificação assim
          que o processo for concluído. Isso pode levar alguns dias úteis.
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
