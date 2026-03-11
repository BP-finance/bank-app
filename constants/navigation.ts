import { COLORS } from "@/src/theme/colors";
import { SHADOWS } from "@/src/theme/shadows";

export const DEFAULT_SCREEN_OPTIONS = {
  headerStyle: {
    backgroundColor: COLORS.background ,
  },
  headerTintColor: COLORS.darkcolor,
  headerBackTitle: "",
  ...SHADOWS.level2,
  headerShadowVisible: false, // Opcional: remove a linha divisória no iOS
};