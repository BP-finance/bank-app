# task-0.1-feature-surface-definition.md

## Task
Task 0.1 — Definir a feature e a superfície oficial

## Objetivo
Decidir **onde a área mínima de Conta / Segurança vive no app** e qual será sua **superfície oficial**, sem espalhar responsabilidade entre rotas, tabs e features já existentes.

Este documento é **operacional**.

---

## Resultado esperado da task
Ao final da Task 0.1, deve estar decidido e documentado:

1. qual é a feature oficial da área
2. qual é a rota oficial da área
3. qual é o papel de `app/user.tsx`
4. qual é o papel de `app/settings/settings.tsx`
5. qual é o papel de `app/(tabs)/account.tsx`
6. por que a feature `src/features/account` atual não é o owner correto dessa nova superfície

---

## Escopo exato desta task

### Esta task deve
- analisar as rotas atuais relacionadas à área
- analisar a feature `src/features/account` atual
- analisar os pontos de entrada já existentes no header
- produzir uma decisão clara de ownership e superfície oficial
- deixar a base pronta para a próxima task estrutural

### Esta task não deve
- implementar a tela completa de Conta / Segurança
- integrar Idez
- refatorar AUTH
- refatorar SECURITY
- migrar Pix
- resolver `user.id` vs `accountId`
- criar fluxo de reset de PIN
- criar fluxo de 2FA
- transformar a aba `(tabs)/account` em carteira real

---

## Arquivos que obrigatoriamente devem ser lidos

### Rotas e superfícies
- `app/user.tsx`
- `app/settings/settings.tsx`
- `app/(tabs)/account.tsx`
- `app/_layout.tsx`
- `app/(tabs)/_layout.tsx`

### Entry points de navegação
- `components/ui/Header.tsx`

### Feature potencialmente conflitante
- `src/features/account/components/HomeHeader.tsx`
- `src/features/account/store/useBalanceStore.ts`
- `src/features/account/components/feedback/LoadingOverlay.tsx`

### Features que delimitam o problema
- `src/features/auth/index.ts`
- `src/features/security/index.ts`
- `app/security/pin-setup.tsx`
- `src/features/pix/presentation/screens/ConfirmScreen.tsx`

---

## Perguntas que esta task precisa responder

1. A nova área deve nascer dentro da feature `account` atual?
   - resposta esperada: não

2. A rota principal deve ser `/user`, `/settings/settings` ou a tab `account`?
   - resposta esperada: `/user`

3. `/settings/settings` deve se tornar uma segunda área de produto?
   - resposta esperada: não

4. A tab `(tabs)/account` deve virar Conta / Segurança?
   - resposta esperada: não

5. Qual o nome recomendado da nova feature?
   - resposta esperada: `account-center`

---

## Decisão operacional a ser seguida

### Feature oficial
Criar a nova área como feature separada:

- `src/features/account-center`

### Superfície oficial
A rota oficial da área será:

- `app/user.tsx`

### Papel de `/settings/settings`
Deve ser:

- alias
- wrapper fino
- ou redirecionamento para a mesma superfície oficial

Nunca uma segunda implementação concorrente.

### Papel de `(tabs)/account`
Deve permanecer fora desta decisão de ownership. Não deve ser tratado como a superfície oficial de Conta / Segurança.

---

## Entregáveis esperados da task

### Entregável 1 — decisão explícita de ownership
O código e/ou documentação devem deixar explícito que:

- a nova área vive em uma feature nova
- a feature atual `account` não é o owner correto

### Entregável 2 — decisão explícita de rota principal
Deve ficar claro que:

- `/user` é a superfície primária

### Entregável 3 — decisão explícita sobre superfícies secundárias
Deve ficar claro que:

- `/settings/settings` não terá ownership separado
- `(tabs)/account` não é a superfície oficial desta área

### Entregável 4 — preparação para a próxima task
A base deve ficar pronta para, depois, implementar a área mínima sem reabrir a discussão estrutural.

---

## Alterações permitidas nesta task

### Permitido
- criar documentação de decisão
- criar skeleton da nova feature, se isso for necessário para consolidar ownership
- transformar rota em wrapper fino, se isso for indispensável para materializar a decisão
- ajustar imports para refletir a nova organização, desde que sem expandir escopo

### Não permitido
- construir a tela final
- adicionar cards, formulários e seções completas do produto
- integrar endpoints externos
- mexer em regras de PIN
- mexer em stores de AUTH/SECURITY além do estritamente necessário para a decisão estrutural
- criar fluxos paralelos de perfil/settings

---

## Sequência recomendada de execução

1. Ler os arquivos obrigatórios
2. Confirmar no código que `Header` já expõe `/user` e `/settings/settings`
3. Confirmar que a tab `account` ainda é template e sem papel correto para essa área
4. Confirmar que `src/features/account` atual já tem outro ownership
5. Formalizar a decisão: feature nova + `/user` oficial
6. Deixar `/settings/settings` subordinada à mesma superfície
7. Registrar que `(tabs)/account` fica fora do escopo desta área

---

## Saída esperada para revisão humana
Ao concluir a task, a revisão deve conseguir responder claramente:

- onde a área vive
- por que vive ali
- por que não vive na feature `account`
- por que não vive na tab `account`
- por que `/settings/settings` não é uma segunda área independente

Se qualquer uma dessas respostas continuar ambígua, a task não terminou.

---

## Dependências e observações importantes

### Dependência relevante para a task seguinte
Existe hoje uso de `session.user.id` como `accountId` em partes do app.

Essa informação **não deve** ser tomada como modelo definitivo da nova área.
Ela deve ser tratada como dívida conhecida para a Task 0.2.

### Observação de produto
A existência da aba chamada “Carteira” torna ainda mais importante **não** usar `(tabs)/account` como área oficial de perfil/segurança.

---

## Critérios de conclusão
A Task 0.1 só está concluída quando:

- há uma feature oficial definida
- há uma rota oficial definida
- as superfícies secundárias têm papel claro
- não existe duplicidade de ownership
- o próximo passo pode começar sem rediscutir a estrutura base

---

## Instrução final para o Cursor

Execute esta task como uma **task de definição estrutural**, não como uma task de entrega visual.

Se a solução proposta começar a crescer para UI completa, integração com backend ou refactor amplo, a task saiu do escopo.
