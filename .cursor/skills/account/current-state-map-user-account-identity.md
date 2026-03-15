# current-state-map-user-account-identity.md

## Objetivo
Mapear o estado atual do projeto em relação à ambiguidade entre `userId` e `accountId`, usando o código como fonte principal de verdade.

Este documento é de **contexto técnico** para apoiar a Task 0.2.

---

## Resumo executivo
O projeto já possui um domínio legítimo de operações **account-scoped** em SECURITY e Pix. O problema atual não é o uso de `accountId` em si, e sim a ausência de um owner explícito de **conta atual**.

Hoje, o app tem:

- uma modelagem clara de usuário autenticado em AUTH
- uma modelagem clara de segurança transacional por `accountId` em SECURITY
- uso funcional de `accountId` em Pix
- mas ainda não tem um owner explícito para `currentAccount`

Por causa disso, alguns entrypoints derivam `accountId` assim:

- `session?.user?.id ?? ""`

Essa equivalência implícita precisa ser removida antes da integração real com a Idez.

---

## Mapa do AUTH relevante para a Task 0.2

### Arquivos observados
- `src/features/auth/types/auth-session.types.ts`
- `src/features/auth/api/auth.api.types.ts`
- `src/features/auth/mappers/session.mapper.ts`
- `src/features/auth/store/useAuthStore.ts`

### Leitura técnica
AUTH modela hoje a sessão autenticada em torno de `user`, não de `account`.

#### `AuthenticatedUser`
Campos observados:
- `id`
- `nome`
- `email`
- `documento`
- `tipoConta`
- `onboardingStatus`

#### `AuthSession`
Campos observados:
- `accessToken`
- `refreshToken`
- `user`
- `expiresAt`

### Conclusão
No código atual, `session.user.id` é semanticamente **identificador do usuário autenticado**, não contrato explícito de conta atual.

---

## Mapa de SECURITY relevante para a Task 0.2

### Arquivos observados
- `src/features/security/types/security-setup.types.ts`
- `src/features/security/types/security-validate-pin.types.ts`
- `src/features/security/types/security-challenge.types.ts`
- `src/features/security/services/requestTransactionalChallenge.ts`
- `src/features/security/infra/pinStorage/pinStorageGateway.ts`

### Leitura técnica
SECURITY já usa corretamente `accountId` como chave de contexto da credencial transacional.

Exemplos de responsabilidades account-scoped:
- persistir material de PIN por conta
- hidratar store de segurança por conta
- validar PIN para uma conta específica
- abrir challenge para uma conta específica

### Conclusão
SECURITY está arquiteturalmente correta no uso de `accountId`.

A ambiguidade está na **origem do valor** nos callers, não no domínio de SECURITY.

---

## Mapa de Pix relevante para a Task 0.2

### Arquivos observados
- `src/features/pix/presentation/screens/ConfirmScreen.tsx`
- `src/features/pix/useCases/sendPixWithSecurityChallengeUseCase.ts`
- `app/(tabs)/cards.tsx`

### Leitura técnica
Pix já aceita `accountId` como entrada do fluxo protegido.

Isso está correto, porque a operação sensível é account-scoped.

O problema atual é que alguns callers constroem `accountId` diretamente a partir da sessão autenticada.

---

## Pontos concretos com ambiguidade hoje

### 1. `app/security/pin-setup.tsx`
Hoje o arquivo deriva:

- `const accountId = session?.user?.id ?? ""`

Depois repassa esse valor para o fluxo oficial de setup de PIN.

### 2. `src/features/pix/presentation/screens/ConfirmScreen.tsx`
Hoje o arquivo deriva:

- `const accountId = session?.user?.id ?? ""`

Depois usa esse valor para chamar `sendPixWithSecurityChallengeUseCase`.

### 3. `app/(tabs)/cards.tsx`
Hoje o arquivo deriva:

- `const accountId = session?.user?.id ?? ""`

Depois usa esse valor no Pix de teste.

### Conclusão sobre os três pontos
Esses arquivos são os alvos mínimos de correção da Task 0.2.

---

## O que a Idez sugere para o futuro modelo

Pelas informações já levantadas do backend alvo, a Idez sugere claramente a coexistência de:

- `Current User`
- `Get Current Account`

Isso reforça que o app precisa sair do modelo implícito atual e passar a ter:

- `currentUser`
- `currentAccount`

como conceitos explícitos.

---

## O que a Task 0.2 não precisa mudar

### Não precisa mudar em AUTH
- estrutura de sessão
- token storage
- refresh
- logout

### Não precisa mudar em SECURITY
- inputs account-scoped
- challenge transacional
- pin storage per account

### Não precisa mudar em Pix
- use case protegido
- contratos que já recebem `accountId`

---

## Lacuna arquitetural identificada

Hoje falta um owner explícito para:

- `currentAccount`

Sem esse owner, o projeto fica preso a estas consequências:

- fallback espalhado em múltiplos lugares
- ambiguidade semântica entre usuário e conta
- migração mais custosa para `Get Current Account`
- risco de decisões erradas em futuras tasks de Conta / Segurança, extrato e limites

---

## Direção recomendada

### `currentUser`
Manter vindo de AUTH.

### `currentAccount`
Introduzir owner explícito novo, preferencialmente:

- `src/features/current-account`

### Fallback temporário
Centralizar a derivação temporária da conta atual a partir da sessão autenticada em um único módulo.

---

## Estado alvo após a Task 0.2

Ao final da task, o projeto deve ter esta leitura possível:

- AUTH → quem é o usuário autenticado
- current-account → qual é a conta atual do app
- SECURITY → protege operações por `accountId`
- Pix → envia operação protegida para um `accountId` resolvido corretamente

---

## Critério de encerramento do mapa

Este mapa deixa claro que a Task 0.2 não é uma refatoração estética.

Ela é um ajuste estrutural necessário para que o projeto deixe de depender de uma equivalência implícita entre:

- `session.user.id`
- `accountId`

antes que isso vaze para a integração real com a Idez.
