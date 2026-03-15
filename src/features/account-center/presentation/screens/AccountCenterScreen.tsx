/**
 * Tela principal da área Conta / Segurança (superfície oficial).
 * Base estrutural; a implementação completa virá em tasks futuras.
 */
import { LogoutButton } from "@/src/components/debug/LogoutButton";
import { StyleSheet, Text, View } from "react-native";

export function AccountCenterScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Perfil do Usuário</Text>
      <LogoutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "600",
  },
});
