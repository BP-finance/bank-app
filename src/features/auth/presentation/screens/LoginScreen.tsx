/**
 * Tela de login.
 * Usa documento (CPF ou CNPJ) + senha.
 *
 * Responsabilidade: apenas UI.
 * Validação e sanitização são feitas pelo hook useLogin.
 */

import { COLORS } from "@/src/theme/colors";
import { SPACING } from "@/src/theme/spacing";
import { TYPOGRAPHY } from "@/src/theme/typography";
import { Href, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useLogin } from "../../hooks";
import { loginInitialValues } from "../../schemas";
import { formatDocumentoDinamico } from "../../utils";
import { AuthButton } from "../components/AuthButton";
import { AuthInput } from "../components/AuthInput";

export function LoginScreen() {
  const router = useRouter();
  const { login, isSubmitting, error, validationErrors, clearErrors } =
    useLogin();

  const [documento, setDocumento] = useState(loginInitialValues.documento);
  const [senha, setSenha] = useState(loginInitialValues.senha);

  const handleSubmit = async () => {
    try {
      await login({ documento, senha });
    } catch {
      // erro já tratado no hook
    }
  };

  const handleDocumentoChange = (value: string) => {
    setDocumento(formatDocumentoDinamico(value));
    if (validationErrors?.documento) {
      clearErrors();
    }
  };

  const handleSenhaChange = (value: string) => {
    setSenha(value);
    if (validationErrors?.senha) {
      clearErrors();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Acesse sua conta</Text>

        {error && (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{error.message}</Text>
          </View>
        )}

        <AuthInput
          value={documento}
          onChangeText={handleDocumentoChange}
          placeholder="Digite seu CPF ou CNPJ"
          keyboardType="numeric"
          error={validationErrors?.documento}
        />
        <Text style={styles.title}>Senha</Text>
        <AuthInput
          value={senha}
          onChangeText={handleSenhaChange}
          placeholder="••••••••"
          secureTextEntry
          error={validationErrors?.senha}
        />

        <TouchableOpacity
          onPress={() => router.push("/auth/forgot-password" as Href)}
          style={styles.forgotLink}
        >
          <Text style={styles.forgotText}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <AuthButton
          title="Entrar"
          onPress={handleSubmit}
          loading={isSubmitting}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Não tem conta? </Text>
          <TouchableOpacity
            onPress={() => router.replace("/auth/register" as Href)}
          >
            <Text style={styles.footerLink}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    justifyContent: "center",
    padding: SPACING.xl,
    paddingTop: SPACING.xxxl,
  },
  title: {
    ...TYPOGRAPHY.title,
    color: COLORS.darkcolor,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xxl,
  },
  errorWrap: {
    backgroundColor: "#FEE2E2",
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color: "#B91C1C",
  },
  forgotLink: {
    alignSelf: "flex-end",
    marginBottom: SPACING.xl,
  },
  forgotText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: "500",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.xxl,
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
