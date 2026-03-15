# account-security-surface-decision.md

## Status
Aprovado para a Task 0.1.

## Objetivo
Definir **onde vive** a futura área mínima de **Conta / Segurança** no app, qual será a sua **superfície oficial** e como evitar que a responsabilidade fique espalhada entre rotas e features já existentes.

Este documento é **normativo** para a Task 0.1.

---

## Fonte principal de verdade
A decisão deste documento foi tomada com base no **código atual do projeto**.

Em caso de divergência entre intenção, documentação e implementação, o **código atual** deve ser tratado como fonte principal de verdade.

Arquivos observados na decisão:

- `app/user.tsx`
- `app/settings/settings.tsx`
- `app/(tabs)/account.tsx`
- `app/_layout.tsx`
- `app/(tabs)/_layout.tsx`
- `components/ui/Header.tsx`
- `src/features/account/components/HomeHeader.tsx`
- `src/features/account/store/useBalanceStore.ts`
- `src/features/security/index.ts`
- `src/features/auth/index.ts`
- `app/security/pin-setup.tsx`
- `src/features/pix/presentation/screens/ConfirmScreen.tsx`

---

## Diagnóstico resumido do estado atual

### 1. As superfícies reais hoje estão ambíguas
O app hoje possui três superfícies que podem ser confundidas como “área de conta”:

1. `app/user.tsx`
2. `app/settings/settings.tsx`
3. `app/(tabs)/account.tsx`

Mas elas **não possuem ownership claro**.

### 2. `/user` e `/settings/settings` já são superfícies reais do produto
O componente `components/ui/Header.tsx` já possui navegação direta para:

- `router.push("/user")`
- `router.push("/settings/settings")`

Isso torna essas duas rotas **superfícies oficiais já expostas ao usuário**, mesmo que hoje estejam como placeholder.

### 3. A aba `account` não representa hoje Conta / Segurança
A rota `app/(tabs)/account.tsx` ainda é o template padrão do Expo e está sendo exibida na tab com o título **“Carteira”** em `app/(tabs)/_layout.tsx`.

Logo, do ponto de vista semântico do produto atual, essa aba está mais próxima de:

- carteira
- saldo
- área financeira futura

E **não** da futura área mínima de Conta / Segurança.

### 4. A feature `src/features/account` já existe, mas não é “Conta / Segurança”
A feature `src/features/account` hoje concentra elementos ligados a:

- saldo mockado
- header da home
- loading overlay usado por Pix

Ela já é consumida por:

- `app/(tabs)/index.tsx`
- `src/features/pix/*`

Portanto, **não deve ser reutilizada como owner da nova área Conta / Segurança**, porque isso misturaria:

- saldo/carteira/home
- feedback visual reutilizado pelo Pix
- perfil/conta/segurança

Esse reaproveitamento criaria acoplamento semântico e estrutural desnecessário.

---

## Decisão tomada

### Decisão 1 — criar uma feature nova e explícita
A área mínima de Conta / Segurança deve nascer em **uma feature nova**, separada da feature `src/features/account` já existente.

### Nome recomendado da feature
`src/features/account-center`

Esse nome foi escolhido porque:

- evita colisão semântica com a feature `account` atual
- comunica uma superfície de gestão da conta/usuário
- permite crescer depois para dados de conta, capacidades, limites e segurança
- não força a área a virar “settings completos” desde já

### Decisão 2 — a superfície oficial do MVP será `/user`
A rota oficial da futura área mínima de Conta / Segurança será:

- `app/user.tsx`

Essa rota deve se tornar um **entrypoint fino** que apenas delega para a screen principal da nova feature.

Formato esperado:

- `app/user.tsx` = rota fina
- `src/features/account-center/presentation/screens/AccountCenterScreen.tsx` = screen real

### Decisão 3 — `/settings/settings` não será uma segunda implementação
A rota:

- `app/settings/settings.tsx`

**não deve** virar uma segunda área concorrente de Conta / Segurança.

Na Task 0.1, ela deve ser tratada como uma destas opções válidas:

1. **alias/redirecionamento fino para `/user`**
2. **wrapper fino da mesma feature**, sem duplicar lógica
3. placeholder explícito de “fora do escopo” apenas se houver restrição temporária real

A opção preferida para continuidade arquitetural é:

- **redirecionar ou delegar para a mesma superfície oficial (`/user`)**

### Decisão 4 — a aba `(tabs)/account` não será a superfície oficial de Conta / Segurança
A rota:

- `app/(tabs)/account.tsx`

**não deve** ser escolhida como superfície oficial da área mínima de Conta / Segurança.

Ela deve permanecer fora desse escopo por enquanto, pelos seguintes motivos:

- hoje está semanticamente ligada à aba “Carteira”
- o nome da tab induz leitura de wallet/financeiro, não perfil/segurança
- atualmente ainda é template provisório e não deve receber ownership novo por conveniência
- mover Conta / Segurança para a tab criaria conflito com `/user` e `/settings/settings`

### Decisão 5 — a feature atual `src/features/account` não será ampliada para assumir Conta / Segurança
A feature `src/features/account` deve continuar com o papel atual relacionado a:

- saldo/wallet local
- home header
- feedback visual reaproveitado por Pix

A nova área mínima de Conta / Segurança deve nascer separada, evitando mistura com:

- `useBalanceStore`
- `HomeHeader`
- `LoadingOverlay`

---

## Superfície oficial definida

### Feature oficial
- `src/features/account-center`

### Rota oficial
- `app/user.tsx`

### Rota secundária permitida
- `app/settings/settings.tsx` apenas como alias/wrapper fino da mesma feature

### Superfície explicitamente fora desta decisão
- `app/(tabs)/account.tsx`

---

## Estrutura alvo recomendada

```text
app/
  user.tsx                         -> entrypoint fino da área oficial
  settings/
    settings.tsx                  -> alias/wrapper fino ou redirect

src/features/
  account-center/
    index.ts
    types/
    hooks/
    services/
    store/
    presentation/
      screens/
        AccountCenterScreen.tsx
```

---

## Regras obrigatórias decorrentes da decisão

1. Não criar duas áreas de produto concorrentes para Conta / Segurança.
2. Não reaproveitar `src/features/account` como owner da nova área.
3. Não mover a responsabilidade principal para a aba `(tabs)/account`.
4. Não colocar lógica de domínio direto em `app/user.tsx` ou `app/settings/settings.tsx`.
5. Rotas em `app/` devem ser finas e delegar para a feature.
6. A nova feature deve consumir contratos públicos de outras features, nunca detalhes internos desnecessários.
7. Esta decisão não autoriza implementar “settings completos”. O escopo continua sendo uma área mínima e funcional de Conta / Segurança.

---

## Alternativas consideradas e rejeitadas

### Alternativa rejeitada 1 — reaproveitar `src/features/account`
**Motivo da rejeição:**

- a feature atual já possui outro papel
- é consumida por home e pix
- o nome `account` já está semanticamente comprometido com saldo/carteira
- aumentaria o acoplamento entre wallet local, UI da home, Pix e Conta / Segurança

### Alternativa rejeitada 2 — usar `app/(tabs)/account.tsx` como superfície oficial
**Motivo da rejeição:**

- conflita com o significado atual da tab “Carteira”
- criaria ambiguidade com `/user` e `/settings/settings`
- arrisca empurrar uma decisão de produto errada apenas porque existe uma tab disponível

### Alternativa rejeitada 3 — criar uma feature chamada `settings`
**Motivo da rejeição:**

- o escopo atual ainda não é “configurações completas”
- nome amplo demais para o momento
- pode induzir o Cursor a expandir escopo cedo demais

### Alternativa rejeitada 4 — manter `/user` e `/settings/settings` evoluindo separadamente
**Motivo da rejeição:**

- duplica ownership
- duplica decisões de UX e composição
- favorece divergência futura entre telas que deveriam compartilhar a mesma base

---

## Impactos da decisão

### Impactos positivos
- cria ownership claro da nova área
- reduz duplicidade entre perfil e settings
- preserva a feature `account` atual no papel correto
- prepara o app para crescer com `Current User`, `Get Current Account`, `Limits`, `Settings/Features`
- mantém coerência com arquitetura por feature

### Impactos controlados
- `app/settings/settings.tsx` perde autonomia como área própria no MVP
- a aba `(tabs)/account` continua provisória e precisará de decisão futura específica

---

## Não objetivos desta decisão

Esta Task 0.1 **não** deve:

- implementar a tela completa de Conta / Segurança
- integrar endpoints reais da Idez
- mover Pix para outra feature
- refatorar `src/features/account`
- refatorar AUTH ou SECURITY
- resolver ainda a ambiguidade `user.id` vs `accountId`
- implementar reset de PIN, device reset ou 2FA

---

## Riscos conhecidos a registrar

1. Hoje há uso de `session.user.id` como `accountId` em fluxos como:
   - `app/security/pin-setup.tsx`
   - `src/features/pix/presentation/screens/ConfirmScreen.tsx`

   Isso **não deve** ser propagado para a nova feature.
   A correção pertence principalmente à Task 0.2.

2. A `Header` ainda usa `subtitle="Olá, Weslley"` em `app/(tabs)/_layout.tsx`, ou seja, não consome dados reais do usuário.

3. A existência da tab `account` com título “Carteira” é uma fonte de ambiguidade nominal que deve ser tratada no roadmap, mas não nesta task.

---

## Critérios de aceite da Task 0.1

A Task 0.1 só deve ser considerada concluída se todas as condições abaixo forem verdadeiras:

- existe uma feature oficial definida para a nova área
- existe uma rota oficial definida para a nova área
- ficou explícito que `app/user.tsx` é a superfície primária
- ficou explícito que `app/settings/settings.tsx` não será uma implementação concorrente
- ficou explícito que `app/(tabs)/account.tsx` está fora desta superfície oficial
- ficou explícito que `src/features/account` atual não será o owner dessa nova área
- a decisão está alinhada ao código atual do projeto
- não houve aumento indevido de escopo da task

---

## Instrução final para o Cursor

Ao executar a Task 0.1, o Cursor deve seguir esta decisão como regra:

- **criar uma feature nova (`account-center`)**
- **usar `/user` como superfície oficial**
- **tratar `/settings/settings` como alias/wrapper fino**
- **não usar a aba `(tabs)/account` como área oficial de Conta / Segurança**
- **não reaproveitar a feature `account` atual para esse ownership**
