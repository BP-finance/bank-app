# feature-boundaries-user-account-identity.md

## Objetivo
Definir as fronteiras arquiteturais da Task 0.2 para separar corretamente:

- identidade do usuário autenticado
- identidade da conta atual

Este documento é **normativo**.

---

## Domínios que passam a coexistir explicitamente

### Domínio 1 — Usuário autenticado (`currentUser`)
Responsável por representar quem está autenticado na sessão atual.

### Domínio 2 — Conta atual (`currentAccount`)
Responsável por representar em nome de qual conta o app executa operações sensíveis e account-scoped.

A Task 0.2 existe para impedir que esses dois domínios continuem colapsados num único identificador por conveniência.

---

## Ownership obrigatório

### AUTH continua dono de `currentUser`
AUTH continua responsável por:

- sessão autenticada
- `AuthenticatedUser`
- restore de sessão
- refresh
- logout
- infraestrutura de token

AUTH **não** deve virar dono da modelagem completa de `currentAccount` só porque o fallback temporário usa dados da sessão.

### Owner recomendado para `currentAccount`
Criar um owner explícito para conta atual:

- `src/features/current-account`

Responsabilidades desse owner:

- expor o modelo `CurrentAccount`
- resolver a conta atual para consumo do app
- encapsular o fallback temporário baseado na sessão
- ser o ponto natural de encaixe do futuro `Get Current Account`

---

## Dependências permitidas

### `current-account` pode depender de
- contratos públicos de AUTH
- tipos públicos de usuário autenticado
- leitura da sessão atual, quando necessária para o fallback
- mappers próprios para converter sessão em conta atual temporária

### Pix pode depender de
- contratos públicos de `current-account`
- contratos públicos de SECURITY
- contratos públicos de AUTH quando o contexto realmente for `currentUser`

### SECURITY pode depender de
- `accountId` recebido como entrada
- seus próprios contratos internos e públicos

SECURITY **não precisa** depender de `current-account` diretamente se o `accountId` já chegar resolvido do caller.

### `account-center` pode depender de
- AUTH para `currentUser`
- `current-account` para `currentAccount`
- SECURITY para status e fluxos oficiais de segurança

---

## Dependências proibidas

### Proibido em screens, rotas e features consumidoras
Não é permitido continuar espalhando o fallback abaixo:

```ts
const accountId = session?.user?.id ?? "";
```

Esse padrão só pode existir dentro do owner central de `currentAccount`, enquanto o backend real não estiver plugado.

### Proibido para AUTH
AUTH não deve:

- declarar que `AuthenticatedUser.id` é `accountId`
- expor `currentAccount` fake como se fosse parte nativa da sessão
- misturar contrato de usuário com contrato de conta por conveniência

### Proibido para SECURITY
SECURITY não deve:

- resolver `currentAccount` a partir da sessão
- assumir que `userId === accountId`
- virar dona do contexto de conta atual

### Proibido para Pix
Pix não deve:

- buscar `accountId` diretamente em `session.user.id`
- criar lógica própria de fallback de conta
- inferir relação usuário/conta em mais de um lugar

### Proibido para `account-center`
`account-center` não deve:

- virar a fonte estrutural de `currentAccount`
- ser pré-requisito para Pix ou SECURITY
- centralizar regras de identidade de conta que precisam servir o app inteiro

---

## Contratos públicos esperados

A Task 0.2 deve deixar algum contrato público equivalente a:

- `CurrentAccount`
- `resolveCurrentAccount()`
- `useCurrentAccount()`

O nome exato pode variar.

O importante é que:

- a API pública seja explícita
- o resto do app não precise conhecer o fallback interno
- o futuro backend real possa substituir a origem sem quebrar os consumidores

---

## Relação entre `currentUser` e `currentAccount`

### O que é aceitável
Durante o fallback temporário, é aceitável que `currentAccount` seja derivado a partir de dados do usuário autenticado.

### O que é obrigatório
Mesmo nesse cenário, o código deve deixar explícito que:

- a origem é um **fallback**
- a equivalência é **temporária**
- a relação é **derivada**, não conceitual

---

## Anti-patterns proibidos

As soluções abaixo devem ser rejeitadas:

1. adicionar `accountId` em `AuthenticatedUser` sem contrato real
2. continuar fazendo `session.user.id` em cada tela
3. resolver `currentAccount` dentro de SECURITY
4. resolver `currentAccount` dentro de Pix
5. acoplar `currentAccount` à feature `account-center`
6. renomear tudo de `accountId` para `userId`
7. esconder a ambiguidade com comentários sem corrigir a origem do dado
8. inventar payloads da Idez para parecer “future proof”

---

## Sinais de solução correta

A implementação tende a estar correta quando:

- existe um owner explícito para `currentAccount`
- `currentUser` e `currentAccount` têm contratos diferentes
- o fallback fica centralizado em um único módulo
- Pix, Pin setup e outros fluxos recebem `accountId` do owner correto
- o código já fica pronto para trocar `session-fallback` por backend real

---

## Limite de escopo da task

Esta task deve permanecer focada em:

- modelagem explícita
- owner do dado
- centralização do fallback
- correção dos pontos que hoje derivam `accountId` da sessão
- documentação do comportamento temporário

Não faz parte desta task:

- integração Idez real
- reset de PIN
- biometria
- alteração de UI de produto além do necessário para consumo do novo contrato
