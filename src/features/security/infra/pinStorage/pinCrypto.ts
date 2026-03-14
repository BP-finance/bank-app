/**
 * Derivação e verificação de hash para PIN.
 * NUNCA logar ou persistir o PIN.
 */

import * as Crypto from "expo-crypto";
import type { PinSecurityMaterial } from "./pin-storage.types";
import { PIN_MATERIAL_VERSION } from "./pin-storage.types";

const HASH_ITERATIONS = 10_000;

/**
 * Gera salt aleatório em hex (compatível com RN).
 */
export async function generateSalt(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(32);
  return uint8ArrayToHex(bytes);
}

function uint8ArrayToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Deriva hash do PIN usando salt e iterações.
 * NUNCA persiste ou retorna o PIN.
 */
export async function derivePinHash(pin: string, salt: string): Promise<string> {
  let value = salt + pin;
  for (let i = 0; i < HASH_ITERATIONS; i++) {
    value = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      value
    );
  }
  return value;
}

/**
 * Verifica se o PIN corresponde ao material armazenado.
 * Para uso futuro na validação (TASK 6).
 */
export async function verifyPinAgainstMaterial(
  pin: string,
  material: PinSecurityMaterial
): Promise<boolean> {
  const derived = await derivePinHash(pin, material.salt);
  return secureCompare(derived, material.hash);
}

function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Cria material de segurança a partir do PIN (para setup futuro).
 * NUNCA persiste o PIN.
 */
export async function createPinMaterial(pin: string): Promise<PinSecurityMaterial> {
  const salt = await generateSalt();
  const hash = await derivePinHash(pin, salt);
  return {
    hash,
    salt,
    algorithmVersion: PIN_MATERIAL_VERSION,
    metadata: {
      failedAttempts: 0,
      blockUntil: null,
      createdAt: new Date().toISOString(),
    },
  };
}
