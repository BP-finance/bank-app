/**
 * Splash de entrada do fluxo de cadastro.
 * Branding do banco com transição automática para welcome.
 */

import { COLORS } from "@/src/theme/colors";
import { SPACING } from "@/src/theme/spacing";
import { TYPOGRAPHY } from "@/src/theme/typography";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  onComplete: () => void;
};

const SPLASH_DURATION_MS = 1800;

export function RegisterSplashPhase({ onComplete }: Props) {
  useEffect(() => {
    const timer = setTimeout(onComplete, SPLASH_DURATION_MS);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        {/* Logo do banco aqui */}
      </View>
      <Text style={styles.brandName}>Banco</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
    marginBottom: SPACING.lg,
    justifyContent: "center",
    alignItems: "center",
  },
  brandName: {
    ...TYPOGRAPHY.title,
    color: COLORS.background_white,
    fontSize: 28,
  },
});
