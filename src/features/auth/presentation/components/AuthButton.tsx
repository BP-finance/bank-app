/**
 * Botão reutilizável para telas de auth
 */

import { COLORS } from "@/src/theme/colors";
import { RADIUS } from "@/src/theme/radius";
import { SPACING } from "@/src/theme/spacing";
import { TYPOGRAPHY } from "@/src/theme/typography";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";

type AuthButtonProps = TouchableOpacityProps & {
  title: string;
  loading?: boolean;
  variant?: "primary" | "outline";
};

export function AuthButton({
  title,
  loading,
  variant = "primary",
  disabled,
  style,
  ...props
}: AuthButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.btn,
        variant === "outline" && styles.btnOutline,
        (disabled || loading) && styles.btnDisabled,
        style,
      ]}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text
          style={[
            styles.btnText,
            variant === "outline" && styles.btnTextOutline,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: RADIUS.xl,
    alignItems: "center",
  },
  btnOutline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnText: {
    ...TYPOGRAPHY.subtitle_2,
    color: "#fff",
  },
  btnTextOutline: {
    color: COLORS.primary,
  },
});
