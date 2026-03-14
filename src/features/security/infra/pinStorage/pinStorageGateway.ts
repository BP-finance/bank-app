/**
 * Gateway centralizado de leitura/escrita do material de segurança do PIN.
 *
 * PONTO ÚNICO DE ACESSO: toda leitura, escrita e limpeza do material persistido
 * deve passar por este gateway. Nenhum módulo externo deve importar
 * pinSecureStoreAdapter ou pinCrypto diretamente.
 */

import type { PinSecurityMaterial, PinSecurityMetadata } from "./pin-storage.types";
import { pinSecureStoreAdapter } from "./pinSecureStoreAdapter";
import { createPinMaterial } from "./pinCrypto";
import { SecurityErrorCode } from "../../errors";

export type PinStorageResult<T> =
  | { success: true; data: T }
  | { success: false; errorCode: string };

/**
 * Lê o material de segurança do PIN para a conta.
 */
export async function readPinMaterial(
  accountId: string
): Promise<PinStorageResult<PinSecurityMaterial | null>> {
  try {
    const raw = await pinSecureStoreAdapter.getItem(accountId);
    if (raw === null) {
      return { success: true, data: null };
    }
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidMaterial(parsed)) {
      return { success: false, errorCode: SecurityErrorCode.STORAGE_READ_FAILED };
    }
    return { success: true, data: parsed };
  } catch {
    return { success: false, errorCode: SecurityErrorCode.STORAGE_READ_FAILED };
  }
}

/**
 * Persiste o material de segurança do PIN para a conta.
 * NUNCA recebe PIN em texto puro — apenas material já derivado.
 */
export async function writePinMaterial(
  accountId: string,
  material: PinSecurityMaterial
): Promise<PinStorageResult<void>> {
  try {
    const raw = JSON.stringify(material);
    await pinSecureStoreAdapter.setItem(accountId, raw);
    return { success: true, data: undefined };
  } catch {
    return { success: false, errorCode: SecurityErrorCode.STORAGE_WRITE_FAILED };
  }
}

/**
 * Cria e persiste material a partir do PIN (para setup futuro, TASK 5).
 * API interna — o PIN é recebido apenas neste ponto e nunca persistido.
 */
export async function persistPinForAccount(
  accountId: string,
  pin: string
): Promise<PinStorageResult<void>> {
  try {
    const material = await createPinMaterial(pin);
    return writePinMaterial(accountId, material);
  } catch {
    return { success: false, errorCode: SecurityErrorCode.STORAGE_WRITE_FAILED };
  }
}

/**
 * Atualiza metadados (tentativas, bloqueio) do material existente.
 */
export async function updatePinMetadata(
  accountId: string,
  metadata: Partial<PinSecurityMetadata>
): Promise<PinStorageResult<void>> {
  const result = await readPinMaterial(accountId);
  if (!result.success) return result;
  if (result.data === null) {
    return { success: false, errorCode: SecurityErrorCode.PIN_NOT_CONFIGURED };
  }
  const updated: PinSecurityMaterial = {
    ...result.data,
    metadata: { ...result.data.metadata, ...metadata },
  };
  return writePinMaterial(accountId, updated);
}

/**
 * Remove o material de segurança da conta.
 */
export async function clearPinMaterial(accountId: string): Promise<PinStorageResult<void>> {
  try {
    await pinSecureStoreAdapter.removeItem(accountId);
    return { success: true, data: undefined };
  } catch {
    return { success: false, errorCode: SecurityErrorCode.STORAGE_WRITE_FAILED };
  }
}

/**
 * Verifica se existe material persistido para a conta.
 */
export async function hasPinForAccount(accountId: string): Promise<boolean> {
  const result = await readPinMaterial(accountId);
  return result.success && result.data !== null;
}

function isValidMaterial(value: unknown): value is PinSecurityMaterial {
  if (value === null || typeof value !== "object") return false;
  const obj = value as Record<string, unknown>;
  return (
    typeof obj.hash === "string" &&
    typeof obj.salt === "string" &&
    typeof obj.algorithmVersion === "number" &&
    obj.metadata !== null &&
    typeof obj.metadata === "object" &&
    typeof (obj.metadata as PinSecurityMetadata).failedAttempts === "number" &&
    (typeof (obj.metadata as PinSecurityMetadata).blockUntil === "string" ||
      (obj.metadata as PinSecurityMetadata).blockUntil === null)
  );
}
