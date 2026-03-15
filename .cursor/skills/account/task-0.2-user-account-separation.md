# task-0.2-user-account-separation.md

## Task 0.2
Separar `userId` de `accountId`.

## Objetivo
Remover a ambiguidade atual antes da integração real com Idez, introduzindo um modelo explícito de conta atual e parando de usar `session.user.id` como substituto implícito de `accountId`.

Este documento é **operacional**.

---

## Resultado esperado
Ao final da Task 0.2, o projeto deve ter uma resposta clara para estas perguntas:

1. De onde vem `currentUser`?
2. De onde vem `currentAccount`?
3. Onde o fallback temporário está centralizado?
4. Quais fluxos ainda usam `accountId` como conceito legítimo?
5. Quais pontos do app deixaram de usar `session.user.id` diretamente como `accountId`?

---

## Diagnóstico operacional do código atual

Hoje o projeto apresenta este cenário:

### Origem de usuário autenticado
- `src/features/auth/types/auth-session.types.ts`
- `src/features/auth/store/useAuthStore.ts`

### Pontos com ambiguidade explícita
- `app/security/pin-setup.tsx`
- `src/features/pix/presentation/screens/ConfirmScreen.tsx`
- `app/(tabs)/cards.tsx`

### Pontos que devem continuar account-scoped
- `src/features/security/types/security-setup.types.ts`
- `src/features/security/types/security-validate-pin.types.ts`
- `src/features/security/types/security-challenge.types.ts`
- `src/features/security/services/requestTransactionalChallenge.ts`
- `src/features/pix/useCases/sendPixWithSecurityChallengeUseCase.ts`

---

## Subtasks obrigatórias

### 1. Introduzir modelo explícito de conta atual
Criar um owner explícito para conta atual, preferencialmente em:

- `src/features/current-account`

Entregáveis mínimos aceitáveis:

- barrel público (`index.ts`)
- tipo `CurrentAccount`
- resolver/hook público para obter `currentAccount`
- fallback centralizado baseado na sessão atual

### 2. Parar de usar `session.user.id` como substituto implícito de `accountId`
Substituir os pontos que hoje derivam `accountId` diretamente da sessão.

Alvos mínimos:

- `app/security/pin-setup.tsx`
- `src/features/pix/presentation/screens/ConfirmScreen.tsx`
- `app/(tabs)/cards.tsx`

Esses arquivos devem passar a consumir `currentAccount.id` pelo novo contrato.

### 3. Definir como o app obtém `currentUser`
Manter `currentUser` vindo de AUTH.

A Task 0.2 pode:

- continuar usando `useAuthStore(...).session?.user`
- ou criar um helper/hook público de AUTH mais claro para leitura

Mas não deve:

- duplicar store de usuário
- mover usuário para a nova feature de conta atual

### 4. Definir como o app obtém `currentAccount`
`currentAccount` deve vir exclusivamente do owner novo.

O app deve conseguir distinguir claramente:

- `currentUser`
- `currentAccount`

mesmo que o fallback temporário derive um a partir do outro.

### 5. Documentar o fallback temporário
Registrar no código e/ou README do módulo que:

- a conta atual ainda não vem da Idez real
- o app usa fallback centralizado baseado na sessão
- a equivalência atual não deve ser espalhada
- o módulo está pronto para trocar a origem por `Get Current Account`

---

## Recomendação concreta de implementação

### Estrutura recomendada
```text
src/features/current-account/
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

A implementação pode ser menor que isso, desde que preserve o princípio arquitetural.

### Modelo mínimo sugerido
```ts
export interface CurrentAccount {
  id: string;
  source: "session-fallback" | "backend";
  ownerUserId?: string;
  personType?: "PF" | "PJ";
}
```

### Origem recomendada para o fallback
Derivar `CurrentAccount` a partir da sessão autenticada em **um único módulo**.

---

## O que pode ser alterado nesta task

- adicionar o novo owner de `currentAccount`
- criar tipos, mapper, hook ou service mínimo
- adaptar `app/security/pin-setup.tsx`
- adaptar `src/features/pix/presentation/screens/ConfirmScreen.tsx`
- adaptar `app/(tabs)/cards.tsx`
- adicionar comentários curtos e arquiteturais onde fizer sentido
- adicionar README curto ou documentação do módulo, se necessário
- adicionar testes unitários mínimos do fallback, se o padrão do projeto comportar isso sem expandir demais o escopo

---

## O que não deve ser alterado nesta task

- contratos de SECURITY que já são corretamente `accountId`
- modelagem de challenge transacional
- Pix flow além da origem do `accountId`
- autenticação, logout e token storage
- integração real com Idez
- feature `account-center` além do consumo do novo contrato, se necessário
- feature `account` atual
- tab bar e superfícies definidas na Task 0.1

---

## Arquivos que devem ser inspecionados pelo Cursor

Leitura obrigatória:

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
- `src/features/pix/useCases/sendPixWithSecurityChallengeUseCase.ts`

Leitura recomendada:

- docs da Task 0.1 em `.cursor/skills/account/`
- feature `account-center` aprovada na Task 0.1, quando estiver presente no branch

---

## Entregáveis obrigatórios

1. Owner explícito de `currentAccount` criado
2. API pública mínima exposta
3. Fallback temporário centralizado
4. `app/security/pin-setup.tsx` sem derivar `accountId` direto da sessão
5. `src/features/pix/presentation/screens/ConfirmScreen.tsx` sem derivar `accountId` direto da sessão
6. `app/(tabs)/cards.tsx` sem derivar `accountId` direto da sessão
7. Comentário/documentação registrando que o fallback é temporário

---

## Critério de conclusão

A Task 0.2 só deve ser dada como concluída quando:

- o novo fluxo não depende mais de `session.user.id` como substituto implícito de `accountId`
- o código distingue claramente usuário e conta
- existe um owner explícito para `currentAccount`
- o fallback temporário está centralizado em um único ponto
