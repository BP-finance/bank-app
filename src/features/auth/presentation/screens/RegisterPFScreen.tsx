/**
 * Tela de cadastro de Pessoa Física.
 * Conforme contrato do backend.
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
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AUTH_MESSAGES } from "../../constants";
import { useRegisterPF } from "../../hooks";
import { registerPFInitialValues } from "../../schemas";
import {
  formatCPF,
  formatPhone,
  isValidCPF,
  isValidPhone,
  sanitizeDocumento,
  sanitizePhone,
} from "../../utils";
import { AuthButton } from "../components/AuthButton";
import { AuthInput } from "../components/AuthInput";

export function RegisterPFScreen() {
  const router = useRouter();
  const { register, isSubmitting, error } = useRegisterPF();

  const [values, setValues] = useState(registerPFInitialValues);
  const [fieldErrors, setFieldErrors] = useState<{
    cpf?: string;
    telefone?: string;
  }>({});

  const update = (key: keyof typeof values) => (v: string | boolean) => {
    setValues((prev) => ({ ...prev, [key]: v }));
    if (key === "cpf" || key === "telefone") {
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const errors: typeof fieldErrors = {};
    if (!isValidCPF(values.cpf)) errors.cpf = AUTH_MESSAGES.CPF_INVALIDO;
    if (!isValidPhone(values.telefone)) errors.telefone = AUTH_MESSAGES.TELEFONE_INVALIDO;
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await register({
        nomeCompleto: values.nomeCompleto,
        cpf: sanitizeDocumento(values.cpf),
        email: values.email,
        telefone: sanitizePhone(values.telefone),
        senha: values.senha,
        acceptTerms: values.acceptTerms,
      });
    } catch {
      // erro tratado no hook
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
        <Text style={styles.title}>Cadastro PF</Text>
        <Text style={styles.subtitle}>
          Preencha os dados para criar sua conta
        </Text>

        {error && (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <AuthInput
          label="Nome completo"
          value={values.nomeCompleto}
          onChangeText={update("nomeCompleto")}
          placeholder="Nome e sobrenome"
        />
        <AuthInput
          label="CPF"
          value={values.cpf}
          onChangeText={(v) => update("cpf")(formatCPF(v))}
          placeholder="000.000.000-00"
          keyboardType="numeric"
          error={fieldErrors.cpf}
        />
        <AuthInput
          label="E-mail"
          value={values.email}
          onChangeText={update("email")}
          placeholder="seu@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <AuthInput
          label="Telefone"
          value={values.telefone}
          onChangeText={(v) => update("telefone")(formatPhone(v))}
          placeholder="(00) 00000-0000"
          keyboardType="numeric"
          error={fieldErrors.telefone}
        />
        <AuthInput
          label="Senha"
          value={values.senha}
          onChangeText={update("senha")}
          placeholder="Mínimo 8 caracteres"
          secureTextEntry
        />
        <AuthInput
          label="Confirmar senha"
          value={values.confirmarSenha}
          onChangeText={update("confirmarSenha")}
          placeholder="Repita a senha"
          secureTextEntry
        />

        <View style={styles.row}>
          <Switch
            value={values.acceptTerms}
            onValueChange={update("acceptTerms")}
            trackColor={{ false: "#CBD5E1", true: COLORS.primary }}
            thumbColor="#fff"
          />
          <Text style={styles.termsText}>
            Li e aceito os termos de uso e política de privacidade
          </Text>
        </View>

        <AuthButton
          title="Cadastrar"
          onPress={handleSubmit}
          loading={isSubmitting}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Já tem conta? </Text>
          <TouchableOpacity onPress={() => router.replace("/auth/login" as Href)}>
            <Text style={styles.footerLink}>Entrar</Text>
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
    padding: SPACING.xl,
    paddingTop: SPACING.xxxl,
    paddingBottom: SPACING.xxxl,
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
  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.xl,
    gap: SPACING.sm,
  },
  termsText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: SPACING.xl,
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
