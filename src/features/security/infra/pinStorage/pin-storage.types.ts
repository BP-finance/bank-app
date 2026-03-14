/**
 * Tipos do material de segurança persistido do PIN.
 * NUNCA contém PIN em texto puro.
 */

/** Versão do algoritmo para migração futura */
export const PIN_MATERIAL_VERSION = 1;

/**
 * Material persistido da credencial transacional.
 * Persistir apenas isto — nunca PIN bruto.
 */
export interface PinSecurityMaterial {
  /** Hash/derivação do PIN (nunca o PIN em texto) */
  hash: string;
  /** Salt usado na derivação */
  salt: string;
  /** Versão do algoritmo (para migração futura) */
  algorithmVersion: number;
  /** Metadados de controle — persistidos para regra de bloqueio durar após restart */
  metadata: PinSecurityMetadata;
}

/**
 * Metadados de segurança persistidos.
 * failedAttempts e blockUntil garantem que bloqueio sobreviva ao restart do app.
 */
export interface PinSecurityMetadata {
  /** Tentativas inválidas consecutivas */
  failedAttempts: number;
  /** Timestamp ISO até quando o bloqueio está ativo (null se não bloqueado) */
  blockUntil: string | null;
  /** Timestamp ISO de quando o material foi criado */
  createdAt: string;
}
