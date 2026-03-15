# current-state-map-account-user-settings.md

## Objetivo
Mapear o estado atual das rotas, entrypoints e features relacionadas à futura área mínima de **Conta / Segurança**, usando o código atual como fonte principal de verdade.

Este documento é de **contexto técnico** para apoiar a Task 0.1.

---

## Resumo executivo
O projeto possui hoje **superfícies já expostas ao usuário** para perfil e configurações, mas elas ainda são placeholders. Ao mesmo tempo, existe uma tab chamada `account` que, no código atual, está mais próxima de uma futura área de **Carteira** do que de Conta / Segurança.

Também já existe uma feature `src/features/account`, porém ela **não representa perfil/conta/segurança**. Hoje ela concentra responsabilidades ligadas a saldo mockado, header da home e feedback visual reutilizado por Pix.

Essa combinação cria uma ambiguidade importante que a Task 0.1 precisa encerrar.

---

## Mapa de rotas relevantes

| Rota | Arquivo | Estado atual | Papel atual inferido pelo código | Observações |
|---|---|---|---|---|
| `/user` | `app/user.tsx` | Placeholder | perfil do usuário | possui `LogoutButton`; entrypoint real do header |
| `/settings/settings` | `app/settings/settings.tsx` | Placeholder | configurações | entrypoint real do header |
| `/(tabs)/account` | `app/(tabs)/account.tsx` | Template Expo | tab “Carteira” | não representa Conta / Segurança hoje |
| `/security/pin-setup` | `app/security/pin-setup.tsx` | Funcional | setup oficial de PIN | consome SECURITY e `session.user.id` como `accountId` |
| `/pix/confirm` | `src/features/pix/presentation/screens/ConfirmScreen.tsx` | Funcional | confirmação Pix protegida | challenge via SECURITY; também usa `session.user.id` como `accountId` |

---

## Rotas protegidas no root layout

O arquivo `app/_layout.tsx` trata como protegidas, entre outras, as superfícies:

- `user`
- `settings`
- `security`
- `pix`
- `transactions`
- `(tabs)`

Isso confirma que:

- `/user`
- `/settings/settings`

já são tratadas como áreas autenticadas reais do app, e não apenas ideias futuras.

---

## Entry points visíveis ao usuário

### Header global da área autenticada
Arquivo:

- `components/ui/Header.tsx`

Nele existem duas ações explícitas:

- ícone de usuário → `router.push("/user")`
- ícone de settings → `router.push("/settings/settings")`

### Conclusão
Mesmo sendo placeholders hoje, `/user` e `/settings/settings` já fazem parte do fluxo real de navegação do app.

---

## Estado atual das superfícies

### 1. `app/user.tsx`
Código atual resumido:

- exibe texto “Perfil do Usuário”
- renderiza `LogoutButton`

Leitura técnica:

- é uma superfície autenticada real
- já aponta semanticamente para perfil/conta
- hoje ainda está subimplementada
- é uma candidata natural a virar a área oficial mínima de Conta / Segurança

### 2. `app/settings/settings.tsx`
Código atual resumido:

- exibe texto “Configuraçoes”

Leitura técnica:

- existe como superfície autenticada real
- hoje é apenas placeholder
- ainda não tem ownership claro
- no estado atual, competir com `/user` seria uma má decisão arquitetural

### 3. `app/(tabs)/account.tsx`
Código atual resumido:

- tela de template do Expo
- conteúdo de “Explore” e exemplos do template

Leitura técnica:

- não possui papel real consolidado
- a tab está nomeada como “Carteira” em `app/(tabs)/_layout.tsx`
- semanticamente está mais próxima de wallet/financeiro futuro
- não é a melhor superfície para Conta / Segurança

---

## Mapa da tab bar

Arquivo:

- `app/(tabs)/_layout.tsx`

Ordem atual das tabs:

1. `index` → Home
2. `account` → Carteira
3. `qrcode`
4. `credit` → Crédito
5. `cards` → Cartões

Leituras importantes:

- a tab `account` não está rotulada como perfil, conta ou settings
- o nome visível ao usuário é “Carteira”
- usar essa tab como Conta / Segurança conflitaria com a semântica atual do app

---

## Mapa da feature `src/features/account`

Arquivos observados:

- `src/features/account/components/HomeHeader.tsx`
- `src/features/account/store/useBalanceStore.ts`
- `src/features/account/components/feedback/LoadingOverlay.tsx`

### Responsabilidades reais identificadas

#### `useBalanceStore`
- mantém saldo mockado
- permite `deposit`, `withdraw`, `setBalance`
- é consumido por home e Pix

#### `HomeHeader`
- exibe saldo disponível
- usa `useBalanceStore`
- centraliza atalhos de home como suporte, pagamentos e área Pix

#### `LoadingOverlay`
- componente de feedback visual reutilizado durante fluxo de Pix

### Onde a feature é consumida
- `app/(tabs)/index.tsx`
- `src/features/pix/presentation/screens/PixAmountScreen.tsx`
- `src/features/pix/presentation/screens/ConfirmScreen.tsx`
- `src/features/pix/services/pix.service.ts`
- `src/features/pix/useCases/sendPix.useCase.ts`

### Conclusão
A feature `src/features/account` hoje representa muito mais uma camada local de:

- wallet/saldo
- home financeira
- suporte visual ao Pix

Ela **não** é, no código atual, a base correta para uma área de Conta / Segurança.

---

## Mapa de AUTH relevante para a Task 0.1

Arquivos observados:

- `src/features/auth/index.ts`
- `src/features/auth/store/useAuthStore.ts`
- `src/features/auth/hooks/useLogout.ts`
- `src/features/auth/types/auth-session.types.ts`

### O que AUTH fornece hoje
- sessão autenticada atual
- usuário autenticado atual
- logout oficial
- bootstrap/restore de sessão

### Observação importante
`useLogout()` já encapsula o logout e redireciona para a rota de login.

### Implicação para a nova área
A futura área Conta / Segurança **não deve reimplementar logout**.

---

## Mapa de SECURITY relevante para a Task 0.1

Arquivos observados:

- `src/features/security/index.ts`
- `src/features/security/store/security.store.ts`
- `app/security/pin-setup.tsx`

### O que SECURITY fornece hoje
- store de segurança
- hooks públicos
- request de challenge transacional
- clear de estado de segurança
- rota oficial de setup de PIN
- modal global de challenge montado no root layout

### Observação importante
A feature já possui fronteira pública bem definida e não deve ser contornada.

### Implicação para a nova área
A futura área Conta / Segurança deve consumir **fluxos oficiais** de SECURITY e nunca infra interna.

---

## Ambiguidades e dívidas já visíveis

### 1. `user.id` sendo usado como `accountId`
Arquivos observados:

- `app/security/pin-setup.tsx`
- `src/features/pix/presentation/screens/ConfirmScreen.tsx`

Situação atual:

- `const accountId = session?.user?.id ?? ""`

Leitura técnica:

- isso funciona como aproximação atual
- mas não deve ser tratado como modelagem definitiva de domínio
- a correção pertence à próxima etapa de alinhamento (`user` vs `account`)

### 2. Header com nome hardcoded
Arquivo:

- `app/(tabs)/_layout.tsx`

Situação atual:

- `Header subtitle="Olá, Weslley"`

Leitura técnica:

- a área autenticada ainda não usa read-model real do usuário no header
- isso reforça que perfil/conta ainda não tem superfície consolidada

### 3. Existência de diretório `app/user/` vazio
No estado atual do projeto existe também o diretório:

- `app/user`

sem conteúdo funcional relevante.

Leitura técnica:

- não deve orientar a decisão arquitetural
- a fonte de verdade aqui é a rota `app/user.tsx`

---

## Leitura final do estado atual

A partir do código atual, a leitura mais segura é:

1. `/user` já é o melhor candidato a superfície oficial da nova área
2. `/settings/settings` já existe, mas não deve ganhar ownership separado agora
3. `(tabs)/account` está semanticamente mais próxima de Carteira do que de Conta / Segurança
4. `src/features/account` já tem outro papel e não deve ser o owner da nova área
5. AUTH e SECURITY já fornecem a base necessária para uma área mínima bem encaixada
6. o próximo passo correto é criar uma feature nova com ownership explícito para essa superfície

---

## Conclusão prática para a Task 0.1

A Task 0.1 deve encerrar a ambiguidade atual com a seguinte direção:

- feature nova: `src/features/account-center`
- superfície oficial: `app/user.tsx`
- `/settings/settings`: alias/wrapper fino
- `(tabs)/account`: fora do escopo da área Conta / Segurança
- `src/features/account`: preservada no seu papel atual
