/**
 * Não é segunda área de Conta/Segurança; alias para a superfície oficial /user.
 */
import { Href, Redirect } from "expo-router";

export default function SettingsScreen() {
  return <Redirect href={"/user" as Href} />;
}
