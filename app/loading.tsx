/**
 * Tela de bootstrap do app.
 * Verifica sessão, hidrata via /auth/me e redireciona para a rota correta.
 */

import { useSessionBootstrap } from "@/src/features/auth/hooks/useSessionBootstrap";
import { Href, useRouter } from "expo-router";
import { useEffect } from "react";
import LottieView from "lottie-react-native";
import { StyleSheet, Text, View } from "react-native";

export default function LoadingScreen() {
  const router = useRouter();
  const { isBootstrapping, resolvedRoute } = useSessionBootstrap();

  useEffect(() => {
    if (!isBootstrapping && resolvedRoute) {
      router.replace(resolvedRoute as Href);
    }
  }, [isBootstrapping, resolvedRoute, router]);

  return (
    <View style={styles.container}>
      <LottieView
        source={require("../assets/animations/loading.json")}
        autoPlay
        loop
        style={{ width: 150, height: 150 }}
      />
      <Text>Carregando...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
});
