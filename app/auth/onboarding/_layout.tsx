/**
 * Layout do grupo de rotas de onboarding.
 */

import { COLORS } from "@/src/theme/colors";
import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background_white },
        headerTintColor: COLORS.darkcolor,
        headerShadowVisible: false,
        headerBackTitle: "Voltar",
      }}
    >
      <Stack.Screen name="pendente" options={{ title: "Cadastro" }} />
      <Stack.Screen name="em-analise" options={{ title: "Em análise" }} />
      <Stack.Screen name="aprovado" options={{ title: "Aprovado" }} />
      <Stack.Screen name="rejeitado" options={{ title: "Não aprovado" }} />
      <Stack.Screen
        name="documentos-pendentes"
        options={{ title: "Documentos pendentes" }}
      />
    </Stack>
  );
}
