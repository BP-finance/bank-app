# task-0.2-review-checklist.md

## Objetivo
Validar se a Task 0.2 realmente separou `userId` de `accountId` no código, sem resolver isso apenas por comentário ou renome superficial.

Este documento é **normativo para revisão**.

---

## Checklist de aprovação

### 1. Ownership de `currentUser`
- [ ] `currentUser` continua vindo de AUTH.
- [ ] Não foi criada uma segunda store de usuário.
- [ ] AUTH não passou a declarar implicitamente que `AuthenticatedUser.id` é `accountId`.

### 2. Ownership de `currentAccount`
- [ ] Existe um owner explícito para `currentAccount`.
- [ ] O owner possui API pública mínima.
- [ ] O owner não foi colocado em `account-center`.
- [ ] O owner não foi colocado em SECURITY.
- [ ] O owner não reaproveita a feature `account` atual.

### 3. Modelo explícito
- [ ] Existe um tipo/contrato claro para `CurrentAccount`.
- [ ] `CurrentAccount` é distinto de `AuthenticatedUser`.
- [ ] O contrato não inventa payload da Idez.
- [ ] O contrato é suficiente para o fluxo atual sem exagero estrutural.

### 4. Fallback centralizado
- [ ] Existe um único ponto responsável por derivar `currentAccount` da sessão.
- [ ] A origem do fallback está documentada como temporária.
- [ ] O resto do app não conhece nem replica a lógica do fallback.

### 5. Remoção da ambiguidade nos entrypoints principais
- [ ] `app/security/pin-setup.tsx` deixou de usar `session.user.id` diretamente como `accountId`.
- [ ] `src/features/pix/presentation/screens/ConfirmScreen.tsx` deixou de usar `session.user.id` diretamente como `accountId`.
- [ ] `app/(tabs)/cards.tsx` deixou de usar `session.user.id` diretamente como `accountId`.

### 6. Preservação do domínio account-scoped
- [ ] SECURITY continua usando `accountId` onde o conceito é correto.
- [ ] Pix continua recebendo `accountId` como entrada do fluxo protegido.
- [ ] A implementação não trocou indevidamente `accountId` por `userId` no domínio.

### 7. Relação com AUTH
- [ ] A Task 0.2 não alterou token storage.
- [ ] A Task 0.2 não reescreveu restore/refresh/logout.
- [ ] A sessão continua representando autenticação, não contexto completo de conta.

### 8. Relação com SECURITY
- [ ] SECURITY não passou a resolver conta atual a partir da sessão.
- [ ] A persistência do PIN continua account-scoped.
- [ ] Não houve vazamento de responsabilidade para infra interna de SECURITY.

### 9. Relação com Pix
- [ ] Pix apenas passou a consumir o `accountId` do owner correto.
- [ ] O fluxo de challenge não foi alterado indevidamente.
- [ ] Não houve bypass da orquestração existente.

### 10. Documentação
- [ ] Há comentário ou README registrando o fallback temporário.
- [ ] Está explícito que a futura origem do dado será `Get Current Account` da Idez.
- [ ] A documentação não trata fallback como contrato definitivo.

---

## Perguntas obrigatórias de revisão

Antes de aprovar, responda objetivamente:

1. Onde o app lê `currentUser`?
2. Onde o app lê `currentAccount`?
3. Onde o fallback temporário está centralizado?
4. Quais arquivos deixaram de usar `session.user.id` como `accountId`?
5. O domínio continuou tratando segurança e Pix como `account-scoped`?

Se alguma resposta continuar vaga, a task ainda não está pronta.

---

## Sinais de solução errada

Se qualquer item abaixo acontecer, a implementação deve ser revista:

- continuar usando `session.user.id` diretamente em screens/rotas
- adicionar `accountId` em `AuthenticatedUser` sem contrato real
- criar `currentAccount` dentro de `account-center`
- criar `currentAccount` dentro de SECURITY
- renomear `accountId` para `userId` em fluxos que são claramente account-scoped
- espalhar helpers diferentes de fallback em múltiplos arquivos
- escrever README bonito sem corrigir a origem do dado no código
- inventar campos da Idez para “deixar pronto” sem payload conhecido

---

## Sinais de solução correta

A solução tende a estar correta quando:

- existe uma distinção explícita entre usuário e conta
- existe um único ponto de fallback
- os consumidores recebem `currentAccount.id` em vez de montar `accountId` na mão
- o app fica pronto para substituir o fallback por backend real com impacto local

---

## Critério final de aprovação

A Task 0.2 só deve ser aprovada quando a revisão puder afirmar:

- “o app já distingue claramente `currentUser` de `currentAccount`, e a equivalência temporária entre ambos não está mais espalhada pelo código.”
