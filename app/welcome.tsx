import { AUTH_ROUTES } from "@/src/features/auth/constants/auth-routes.constants";
import { useSessionBootstrap } from "@/src/features/auth/hooks/useSessionBootstrap";
import { AuthButton } from "@/src/features/auth/presentation/components/AuthButton";
import { FadeInLeft } from "@/src/shared/components/animations";
import {
  FadeInUp,
} from "@/src/shared/components/animations/FadeInUp";
import { COLORS } from "@/src/theme/colors";
import { SPACING } from "@/src/theme/spacing";
import { TYPOGRAPHY } from "@/src/theme/typography";
import { Href, useRouter } from "expo-router";
import { useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function WelcomeScreen() {
  const router = useRouter();
  const { isBootstrapping, resolvedRoute } = useSessionBootstrap();

  useEffect(() => {
    if (!isBootstrapping && resolvedRoute && resolvedRoute !== AUTH_ROUTES.LOGIN) {
      router.replace(resolvedRoute as Href);
    }
  }, [isBootstrapping, resolvedRoute, router]);

  if (!isBootstrapping && resolvedRoute && resolvedRoute !== AUTH_ROUTES.LOGIN) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <FadeInLeft delay={630} >
          <Text style={styles.title}>Bem-vindo a BP Finance</Text>
        </FadeInLeft>
        <FadeInLeft delay={660}>
          <Text style={styles.subtitle}>
            Crie sua conta em poucos passos ou entre na sua conta existente.
          </Text>
        </FadeInLeft>

        <FadeInUp delay={860} distance={12}>
          <AuthButton
            title="Entrar"
            onPress={() => router.push("/auth/login" as Href)}
            style={styles.primaryButton}
          />
        </FadeInUp>

        <FadeInUp delay={860}>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.push("/auth/register" as Href)}
          >
            <Text style={styles.secondaryText}>Quero criar minha conta</Text>
          </TouchableOpacity>
        </FadeInUp>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.darkcolor,
    textAlign: "left",
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xxl,
  },
  primaryButton: {
    marginBottom: SPACING.lg,
  },
  secondaryButton: {
    alignItems: "center",
    paddingVertical: SPACING.sm,
  },
  secondaryText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: "600",
  },
});

