/**
 * Layout do grupo de rotas de autenticação.
 * Mantém rotas isoladas em app/auth/*
 */

import { COLORS } from "@/src/theme/colors";
import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background_white },
        headerTintColor: COLORS.darkcolor,
        headerShadowVisible: false,
        headerBackTitle: "Voltar",
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="register-type" options={{ headerShown: false }} />
      <Stack.Screen
        name="register-pf"
        options={{ title: "Cadastro PF" }}
      />
      <Stack.Screen
        name="register-pj"
        options={{ title: "Cadastro PJ" }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{ title: "Recuperar senha" }}
      />
      <Stack.Screen
        name="onboarding"
        options={{ headerShown: false }}
      />
    </Stack>
  );
}
