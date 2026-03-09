import { FadeIn } from "@/src/shared/components/animations/FadeIn";
import { COLORS } from "@/src/theme/colors";
import { SPACING } from "@/src/theme/spacing";
import { Href, useRouter } from "expo-router";
import { useEffect } from "react";
import { Image, StyleSheet, View } from "react-native";

const SPLASH_DURATION_MS = 1800;

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/welcome" as Href);
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={styles.container}>
      <FadeIn delay={100} duration={500}>
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/images/logo-global.png")}
            style={{ width: 320, height: 320 }}
            resizeMode="contain"
          />
        </View>
      </FadeIn>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    width: 120,
    height: 120,
    marginBottom: SPACING.lg,
    justifyContent: "center",
    alignItems: "center",
  },
});

