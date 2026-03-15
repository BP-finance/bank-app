# current-account

Owner explícito de **conta atual** (`currentAccount`). O app obtém o usuário autenticado em AUTH e a conta atual aqui.

- **Fallback atual:** conta derivada da sessão autenticada em um único módulo (mapper interno). Não use `session.user.id` como `accountId` fora deste módulo.
- **Origem futura:** endpoint **Get Current Account** da Idez. Ao integrar, trocar a resolução interna sem alterar a API pública (`useCurrentAccount`, `resolveCurrentAccount`, tipo `CurrentAccount`).

SECURITY e Pix continuam account-scoped; recebem `accountId` via `currentAccount.id` dos consumidores.
