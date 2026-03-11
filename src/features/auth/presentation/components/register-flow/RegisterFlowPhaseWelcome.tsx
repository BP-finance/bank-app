/**
 * Tela inicial de boas-vindas com seleção de tipo de conta.
 * Layout compacto: título e subtítulo centralizados, opções PF/PJ lado a lado.
 */

import { FadeInUp } from "@/src/shared/components/animations/FadeInUp";
import { COLORS } from "@/src/theme/colors";
import { RADIUS } from "@/src/theme/radius";
import { SPACING } from "@/src/theme/spacing";
import { TYPOGRAPHY } from "@/src/theme/typography";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { PersonType } from "../../../types";

type Props = {
  onSelectType: (type: PersonType) => void;
  onGoToLogin: () => void;
};

export function RegisterFlowPhaseWelcome({ onSelectType, onGoToLogin }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <FadeInUp delay={360} distance={8}>
          <Text style={styles.title}>BP Finance</Text>
          <Text style={styles.subtitle}>Frase de boas-vindas</Text>
        </FadeInUp>

        <FadeInUp delay={660} distance={8}>
          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => onSelectType("PF")}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrap}>
                <Ionicons name="person" size={38} color={COLORS.primary} />
              </View>
              <Text style={styles.optionLabel}>Pessoa Física</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.option}
              onPress={() => onSelectType("PJ")}
              activeOpacity={0.8}
            >
              <View style={styles.iconWrap}>
                <Ionicons name="business" size={38} color={COLORS.primary} />
              </View>
              <Text style={styles.optionLabel}>Pessoa Jurídica</Text>
            </TouchableOpacity>
          </View>
        </FadeInUp>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem conta? </Text>
          <TouchableOpacity onPress={onGoToLogin}>
            <Text style={styles.footerLink}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
    // justifyContent: "",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.darkcolor,
    textAlign: "center",
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.xxl,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    gap: SPACING.xl,
  },
  option: {
    alignItems: "center",
    minWidth: 100,
  },
  iconWrap: {
    width: 78,
    height: 78,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.sm,
  },
  optionLabel: {
    ...TYPOGRAPHY.subtitle_3,
    color: COLORS.darkcolor,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: SPACING.xxxl,
  },
  footerText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
  },
  footerLink: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: "600",
  },
});
