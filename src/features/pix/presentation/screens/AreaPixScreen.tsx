import { PIX_TYPE_CONFIG } from "@/src/features/pix/constants/pixTypeConfig";
import { PixKey } from "@/src/features/pix/domain/models/PixKey";
import { PixKeyActionsBottomSheet } from "@/src/features/pix/presentation/components/PixKeyActionsBottomSheet";
import { usePixStore } from "@/src/features/pix/store/pix.store";
import { COLORS } from "@/src/theme/colors";
import { RADIUS } from "@/src/theme/radius";
import { SHADOWS } from "@/src/theme/shadows";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ClipboardPixBottomSheet } from "../components/ClipboardPixBottomSheet";
import HeaderPixScreen from "../components/HeaderPixScreen";
import { useClipboardPix } from "../hooks/useClipboardPix";

export default function AreaPixScreen() {
  const [selectedKey, setSelectedKey] = useState<PixKey | null>(null);
  const [clipboardVisible, setClipboardVisible] = useState(false);
  const router = useRouter();
  const pixKeys = usePixStore((state) => state.keys);
  const { pixKey, keyType, clear } = useClipboardPix();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (pixKey && keyType) {
      timer = setTimeout(() => {
        setClipboardVisible(true);
      }, 300);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [pixKey, keyType]);

  function handleCloseClipboard() {
    setClipboardVisible(false);
    clear(); // evita loop infinito
  }
  return (
    <SafeAreaView
      edges={["right", "bottom", "left"]}
      style={{ flex: 1, backgroundColor: "#fff" }}
    >
      <View style={{ flex: 1 }}>
        <HeaderPixScreen />
        <Text
          style={{
            fontSize: 22,
            fontWeight: "bold",
            marginVertical: 25,
            marginHorizontal: 12,
          }}
        >
          Minhas chaves Pix
        </Text>

        <FlatList
          data={pixKeys}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 40 }}>
              Nenhuma chave cadastrada
            </Text>
          }
          renderItem={({ item }) => {
            const config = PIX_TYPE_CONFIG[item.type];

            return (
              <View
                style={{
                  borderWidth: 1,
                  marginHorizontal: 12,
                  paddingHorizontal: 15,
                  paddingVertical: 15,
                  borderRadius: 12,
                  borderColor: "#f5f5f5",
                  backgroundColor: "#fff",
                  marginBottom: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  ...SHADOWS.level2,
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 15,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#eb0459da",
                      padding: 12,
                      borderRadius: 50,
                    }}
                  >
                    <Ionicons name={config.icon} size={24} color="#fff" />
                  </View>

                  <View>
                    <Text
                      style={{ color: COLORS.darkcolor, fontWeight: "600" }}
                    >
                      {config.label}
                    </Text>
                    <Text style={{ color: "#aaa", marginTop: 4 }}>
                      {item.value}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setSelectedKey(item)}>
                  <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color={COLORS.darkcolor}
                  />
                </TouchableOpacity>
              </View>
            );
          }}
        />

        {/* BOTÃO CADASTRAR */}
        <TouchableOpacity
          onPress={() => router.push("/pix/register")}
          style={{
            margin: 15,
            padding: 15,
            borderRadius: RADIUS.xl,
            backgroundColor: COLORS.primary,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold" }}>
            Cadastrar nova chave
          </Text>
        </TouchableOpacity>
        {selectedKey && (
          <PixKeyActionsBottomSheet
            pixKey={selectedKey}
            onClose={() => setSelectedKey(null)}
          />
        )}
        {clipboardVisible && pixKey && keyType && (
          <ClipboardPixBottomSheet
            pixKey={pixKey}
            keyType={keyType}
            onClose={handleCloseClipboard}
            onContinue={() => {
              handleCloseClipboard();
              router.push({
                pathname: "/pix/confirm",
                params: { pixKey },
              });
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}
