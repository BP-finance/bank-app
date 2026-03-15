# user-account-identity-decision.md

## Status
Aprovado para a Task 0.2.

## Objetivo
Remover a ambiguidade atual entre **`userId`** e **`accountId`** antes da integração real com a Idez, definindo:

- qual conceito pertence ao domínio de usuário
- qual conceito pertence ao domínio de conta
- onde o app obtém `currentUser`
- onde o app obtém `currentAccount`
- como o fallback temporário funciona enquanto `Get Current Account` ainda não estiver plugado

Este documento é **normativo** para a Task 0.2.

---

## Fonte principal de verdade
Esta decisão foi tomada com base no **código atual do projeto**.

Em caso de divergência entre intenção, documentação e implementação, o **código atual** deve ser tratado como fonte principal de verdade.

Arquivos observados nesta decisão:

- `src/features/auth/types/auth-session.types.ts`
- `src/features/auth/api/auth.api.types.ts`
- `src/features/auth/mappers/session.mapper.ts`
- `src/features/auth/store/useAuthStore.ts`
- `app/security/pin-setup.tsx`
- `src/features/pix/presentation/screens/ConfirmScreen.tsx`
- `app/(tabs)/cards.tsx`
- `src/features/security/types/security-setup.types.ts`
- `src/features/security/types/security-validate-pin.types.ts`
- `src/features/security/types/security-challenge.types.ts`
- `src/features/security/services/requestTransactionalChallenge.ts`
- `src/features/security/infra/pinStorage/pinStorageGateway.ts`

---

## Diagnóstico resumido do estado atual

### 1. O modelo autenticado atual só conhece `user`
O tipo `AuthSession` possui hoje:

- `accessToken`
- `refreshToken`
- `user`
- `expiresAt`

O tipo `AuthenticatedUser` possui hoje:

- `id`
- `nome`
- `email`
- `documento`
- `tipoConta`
- `onboardingStatus`

No contrato atual de AUTH, **não existe `currentAccount` explícito**.

### 2. O app já usa `accountId` em fluxos reais de domínio
`accountId` não é um conceito inventado pela UI. Ele já existe de forma legítima em fluxos de domínio, principalmente em SECURITY e Pix:

- setup de PIN
- validação de PIN
- challenge transacional
- persistência do material de PIN por conta
- envio protegido de Pix

Logo, o problema **não** é a existência de `accountId`.

O problema é que, hoje, em alguns entrypoints do app, ele está sendo derivado assim:

- `session?.user?.id ?? ""`

### 3. Hoje existe um alias implícito e espalhado
No estado atual, pelo menos estes pontos tratam `session.user.id` como substituto implícito de `accountId`:

- `app/security/pin-setup.tsx`
- `src/features/pix/presentation/screens/ConfirmScreen.tsx`
- `app/(tabs)/cards.tsx`

Isso cria uma ambiguidade perigosa para a integração com Idez, porque a própria leitura da API futura indica separação entre:

- `Current User`
- `Get Current Account`

### 4. SECURITY deve continuar account-scoped
A persistência do PIN e os challenges transacionais já são modelados por `accountId`.

Essa decisão deve ser preservada.

A correção da Task 0.2 **não** é trocar SECURITY para `userId`.
A correção é **parar de derivar `accountId` diretamente de `session.user.id` em cada fluxo**.

---

## Decisão tomada

### Decisão 1 — `user` e `account` passam a ser conceitos explícitos e distintos
A partir da Task 0.2, o app deve tratar explicitamente:

- `currentUser` = identidade autenticada do usuário
- `currentAccount` = conta atual em nome da qual operações sensíveis acontecem

Mesmo quando ambos apontarem temporariamente para o mesmo identificador durante o fallback, eles **não devem mais ser tratados como o mesmo conceito**.

### Decisão 2 — `currentUser` continua vindo de AUTH
O dono de `currentUser` continua sendo AUTH.

A origem de `currentUser` permanece:

- `useAuthStore(...).session?.user`

ou um contrato público equivalente de AUTH.

A Task 0.2 **não autoriza** criar uma segunda store de usuário.

### Decisão 3 — `currentAccount` deve ter owner explícito fora de AUTH, SECURITY e account-center
O app deve introduzir um owner explícito para `currentAccount`, separado de:

- AUTH
- SECURITY
- `account-center`
- feature `account` atual

### Owner recomendado
Criar uma feature/módulo mínimo e explícito:

- `src/features/current-account`

Motivos da escolha:

- evita sobrecarregar AUTH com um conceito que ainda não faz parte do contrato real da sessão
- evita fazer `account-center` virar dependência estrutural de Pix/SECURITY
- evita misturar `currentAccount` com a feature `account` atual, que hoje tem semântica de saldo/carteira
- cria um ponto único para integrar `Get Current Account` depois

### Decisão 4 — o fallback temporário deve ser centralizado em um único lugar
Enquanto a Idez não estiver plugada para conta atual, o app pode usar um fallback baseado no usuário autenticado.

Mas esse fallback deve existir **somente dentro do owner de `currentAccount`**.

Exemplo de ideia aceitável:

- `resolveCurrentAccount()`
- `getCurrentAccountFromSessionFallback(session)`
- `useCurrentAccount()`

O importante não é o nome exato.
O importante é que exista **um ponto único** de resolução.

### Decisão 5 — `session.user.id` deixa de ser aceito como `accountId` fora do fallback central
Após a Task 0.2, nenhum fluxo novo ou existente deve fazer diretamente:

- `const accountId = session?.user?.id ?? ""`

em telas, screens, entrypoints ou features consumidoras.

Esse padrão só pode existir, temporariamente, dentro do módulo central de fallback de `currentAccount`.

### Decisão 6 — contratos de domínio que já usam `accountId` permanecem com `accountId`
A Task 0.2 **não deve** renomear tudo para `userId`.

Onde o domínio já fala corretamente em `accountId`, isso deve permanecer assim, por exemplo:

- `PinSetupInput.accountId`
- `ValidatePinInput.accountId`
- `SecurityChallengeRequest.accountId`
- `sendPixWithSecurityChallengeUseCase({ accountId })`

A mudança é na **origem do valor**, não no conceito do domínio.

---

## Modelo mínimo recomendado

### `currentUser`
Origem:

- AUTH

Modelo já existente aceitável:

- `AuthenticatedUser`

### `currentAccount`
Criar um modelo interno mínimo, sem inventar payload de backend.

Campos recomendados para o MVP da Task 0.2:

- `id: string`
- `source: "session-fallback" | "backend"`
- `ownerUserId?: string`
- `personType?: "PF" | "PJ"`

Observações:

- `id` é o único campo estritamente obrigatório para destravar SECURITY/Pix.
- `ownerUserId` é útil para tornar explícita a relação entre usuário e conta durante o fallback.
- `personType` pode ser reaproveitada de `AuthenticatedUser.tipoConta` sem inventar contrato novo.
- Não adicionar agora campos da Idez sem payload real.

---

## Estrutura alvo recomendada

```text
src/features/
  current-account/
    index.ts
    types/
      current-account.types.ts
    services/
      resolveCurrentAccount.ts
    hooks/
      useCurrentAccount.ts
    mappers/
      sessionCurrentAccountFallback.mapper.ts
```

A implementação pode ser ainda mais enxuta, desde que preserve:

- owner explícito
- fallback centralizado
- API pública mínima
- ausência de imports profundos espalhados pelo app

---

## Arquivos que devem deixar de derivar `accountId` diretamente da sessão

No mínimo, a Task 0.2 deve corrigir estes pontos:

- `app/security/pin-setup.tsx`
- `src/features/pix/presentation/screens/ConfirmScreen.tsx`
- `app/(tabs)/cards.tsx`

Esses pontos devem consumir:

- `currentUser`
- `currentAccount`

cada um pelo contrato correto.

---

## Regras obrigatórias decorrentes da decisão

1. `user.id` e `account.id` não podem mais ser tratados como o mesmo conceito no app.
2. AUTH continua dono de `currentUser`.
3. `currentAccount` deve ter owner explícito próprio.
4. O fallback temporário de conta deve ser centralizado em um único módulo.
5. Nenhuma screen/route deve derivar `accountId` diretamente de `session.user.id`.
6. SECURITY continua account-scoped.
7. Pix continua consumindo `accountId`, mas vindo do owner correto.
8. A Task 0.2 não deve inventar payload da Idez.
9. A Task 0.2 não deve mover `currentAccount` para `account-center`.
10. A Task 0.2 não deve reescrever a arquitetura de AUTH.

---

## Alternativas consideradas e rejeitadas

### Alternativa rejeitada 1 — continuar usando `session.user.id` diretamente
**Motivo da rejeição:**

- mantém ambiguidade semântica
- espalha fallback por múltiplos pontos
- dificulta a migração para `Get Current Account`
- aumenta risco de inconsistência futura

### Alternativa rejeitada 2 — adicionar `accountId` fake dentro de `AuthenticatedUser`
**Motivo da rejeição:**

- mistura identidade de usuário com identidade de conta
- empurra para AUTH um conceito que pertence à camada de conta
- pode parecer correto agora, mas congela uma modelagem fraca

### Alternativa rejeitada 3 — colocar `currentAccount` em `account-center`
**Motivo da rejeição:**

- `account-center` é superfície de produto/UI
- Pix e SECURITY passariam a depender de uma feature de apresentação
- introduz acoplamento na direção errada

### Alternativa rejeitada 4 — colocar `currentAccount` dentro de SECURITY
**Motivo da rejeição:**

- SECURITY precisa receber `accountId`, não virar dona da resolução da conta atual
- isso misturaria segurança transacional com contexto de conta

### Alternativa rejeitada 5 — reaproveitar `src/features/account`
**Motivo da rejeição:**

- a feature atual já tem semântica de saldo/carteira/home
- o nome `account` já está comprometido no projeto
- aumentaria ambiguidade em vez de reduzi-la

---

## Não objetivos desta task

A Task 0.2 não deve:

- integrar `Get Current Account` real da Idez
- integrar `Current User` real da Idez
- alterar o contrato de challenge transacional
- refatorar logout
- implementar a tela completa de Conta / Segurança
- resolver limites, settings ou features remotas
- implementar reset de PIN, device reset ou 2FA

---

## Critério final de aprovação

A Task 0.2 só pode ser aprovada quando a revisão puder afirmar com segurança:

- o código distingue claramente `currentUser` de `currentAccount`
- o fallback temporário para conta atual está centralizado
- o novo fluxo não depende mais de `session.user.id` como substituto implícito de `accountId`
