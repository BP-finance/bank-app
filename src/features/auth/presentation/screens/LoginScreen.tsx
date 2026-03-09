/**
 * Tela de login.
 * Usa documento (CPF ou CNPJ) + senha.
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
import { AuthButton } from "../components/AuthButton";
import { AuthInput } from "../components/AuthInput";
import { useLogin } from "../../hooks";
import { loginInitialValues } from "../../schemas";
import { useAuthStore } from "../../store/useAuthStore";
import {
  formatDocumentoDinamico,
  sanitizeDocumento,
  isValidDocumentoLogin,
} from "../../utils";
import { AUTH_MESSAGES } from "../../constants";

export function LoginScreen() {
  const router = useRouter();
  const { login, isSubmitting } = useLogin();
  const error = useAuthStore((s) => s.error);
  const clearError = useAuthStore((s) => s.clearError);

  const [documento, setDocumento] = useState(loginInitialValues.documento);
  const [senha, setSenha] = useState(loginInitialValues.senha);
  const [documentoError, setDocumentoError] = useState<string | undefined>();

  const handleSubmit = async () => {
    clearError();
    setDocumentoError(undefined);
    if (!isValidDocumentoLogin(documento)) {
      setDocumentoError(AUTH_MESSAGES.DOCUMENTO_INVALIDO);
      return;
    }
    try {
      await login({
        documento: sanitizeDocumento(documento),
        senha,
      });
    } catch {
      // erro tratado no store
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
        <Text style={styles.title}>Entrar</Text>
        <Text style={styles.subtitle}>
          Use seu CPF ou CNPJ e senha para acessar
        </Text>

        {error && (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <AuthInput
          label="CPF ou CNPJ"
          value={documento}
          onChangeText={(v) => setDocumento(formatDocumentoDinamico(v))}
          placeholder="000.000.000-00 ou 00.000.000/0000-00"
          keyboardType="numeric"
          error={documentoError}
        />
        <AuthInput
          label="Senha"
          value={senha}
          onChangeText={setSenha}
          placeholder="••••••••"
          secureTextEntry
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
          <TouchableOpacity onPress={() => router.replace("/auth/register" as Href)}>
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
    backgroundColor: COLORS.background_white,
  },
  scroll: {
    flexGrow: 1,
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
