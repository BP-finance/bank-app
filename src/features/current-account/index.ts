/**
 * Owner da conta atual (currentAccount).
 * currentUser continua em AUTH; conta atual é resolvida aqui.
 * Fallback atual: sessão; origem futura: Get Current Account (Idez).
 */

export type { CurrentAccount } from "./types/current-account.types";
export { resolveCurrentAccount } from "./services/resolveCurrentAccount";
export {
  useCurrentAccount,
  type UseCurrentAccountResult,
} from "./hooks/useCurrentAccount";
