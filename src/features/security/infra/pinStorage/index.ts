/**
 * Infraestrutura de persistência segura do PIN.
 * API interna — não expor fora da feature.
 */

export {
  readPinMaterial,
  writePinMaterial,
  persistPinForAccount,
  updatePinMetadata,
  clearPinMaterial,
  hasPinForAccount,
} from "./pinStorageGateway";
export type { PinStorageResult } from "./pinStorageGateway";
export { verifyPinAgainstMaterial } from "./pinCrypto";
export type { PinSecurityMaterial, PinSecurityMetadata } from "./pin-storage.types";
