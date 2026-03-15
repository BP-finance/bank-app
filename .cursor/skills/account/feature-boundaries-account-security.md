# feature-boundaries-account-security.md

## Objetivo
Definir as fronteiras arquiteturais da futura área mínima de **Conta / Segurança**, para impedir acoplamentos errados durante a implementação.

Este documento é **normativo**.

---

## Escopo da feature alvo
A futura feature `src/features/account-center` deve ser responsável por **orquestrar e apresentar** uma visão mínima de:

- dados básicos do usuário autenticado
- dados básicos da conta atual
- status de segurança transacional do app
- ações mínimas de gestão associadas a essa superfície

No MVP, isso inclui:

- identificação básica do usuário
- identificação básica da conta
- status do PIN transacional
- CTA oficial para configurar PIN
- logout

---

## O que pertence à feature `account-center`

### Responsabilidades permitidas
- montar um read-model/view-model da área Conta / Segurança
- consumir dados públicos de AUTH
- consumir dados públicos de SECURITY
- exibir estados de loading, sucesso, erro e parcial
- delegar navegação para o fluxo oficial de setup de PIN
- disparar logout pelo fluxo oficial de AUTH
- preparar a superfície para integrar `Current User`, `Get Current Account`, `Limits`, `List Settings` e `List Features`

### Responsabilidades futuras aceitáveis
- exibir telefone e email oficiais da conta/usuário
- capability gating baseado em backend
- exibir limites quando o contrato estiver conhecido
- hospedar pontos de entrada futuros para reset de PIN, device reset e 2FA

---

## O que NÃO pertence à feature `account-center`

### Não pertence ao escopo desta feature
- autenticação e gestão de sessão
- storage de token
- validação direta de PIN
- persistência de PIN
- hash, salt ou material sensível
- implementação de challenge transacional
- envio de Pix
- lógica de saldo/carteira local da feature `account`
- política de cleanup de segurança implícita no logout

---

## Fronteiras com AUTH

### AUTH continua dono de
- login
- logout
- restore de sessão
- refresh de sessão
- token storage
- session management
- tipos da sessão autenticada

### `account-center` pode consumir de AUTH
Somente contratos públicos necessários para leitura e ação de sessão, preferencialmente via barrel público:

- `@/src/features/auth`

Exemplos aceitáveis:

- dados da sessão autenticada atual
- ação oficial de logout
- tipos públicos de sessão e usuário autenticado

### `account-center` NÃO deve fazer com AUTH
- reimplementar logout
- acessar storage de token
- chamar infraestrutura interna de sessão sem necessidade
- espalhar leitura profunda de arquivos internos quando houver API pública disponível

---

## Fronteiras com SECURITY

### SECURITY continua dono de
- credencial transacional
- setup e validação de PIN
- persistência do material de PIN
- challenge transacional
- estado operacional da segurança
- cleanup explícito de segurança quando chamado pelo app hospedeiro

### `account-center` pode consumir de SECURITY
Somente contratos públicos e estáveis expostos pela feature:

- barrel público `@/src/features/security`
- status operacional mínimo necessário para exibição
- fluxo oficial de setup de PIN
- ações públicas que façam sentido para a área

### `account-center` NÃO deve fazer com SECURITY
- acessar `infra/pinStorage/*`
- chamar `validatePin` diretamente para criar fluxo paralelo
- ler ou persistir qualquer material sensível
- manipular hash, salt, secret, metadata de PIN
- criar atalho alternativo para setup fora da rota/fluxo oficial
- assumir que o estado interno da store é contrato estável sem uma fachada pública definida

### Regra importante
A nova área deve depender de **challenge/status/credencial configurada** e nunca de detalhes da implementação do PIN.

---

## Fronteiras com PIX

### PIX continua dono de
- fluxo de envio Pix
- coleta de dados da transferência
- confirmação da operação
- integração com challenge transacional para operações sensíveis

### `account-center` NÃO deve
- importar casos de uso de Pix
- acoplar sua UI ao fluxo de envio
- assumir regras de autorização transacional próprias do Pix

---

## Fronteiras com a feature `account` atual

### A feature `src/features/account` hoje já possui outro papel
Ela concentra:

- `useBalanceStore`
- `HomeHeader`
- `LoadingOverlay`

Esse papel está mais próximo de:

- saldo local
- home financeira
- suporte visual para Pix

### Regra obrigatória
`account-center` **não deve** nascer dentro de `src/features/account`.

### Justificativa
Misturar essas responsabilidades criaria acoplamento entre:

- saldo/wallet local
- home
- Pix
- perfil/usuário/segurança

Esse acoplamento é arquiteturalmente indesejado.

---

## Contratos públicos esperados

A implementação da nova área deve se apoiar em **contratos públicos**, não em detalhes internos. No mínimo, o design deve prever:

- leitura do usuário autenticado atual
- leitura do estado mínimo de segurança
- ação oficial de logout
- navegação oficial para setup de PIN
- futura leitura de conta atual e capabilities

Se algum contrato público ainda não existir de forma adequada, a solução correta é:

1. expor uma fachada pública mínima
2. manter a fronteira da feature
3. evitar import interno profundo como solução permanente

---

## Anti-patterns proibidos

Os itens abaixo são proibidos na implementação desta área:

1. Colocar lógica de domínio diretamente em `app/user.tsx`
2. Colocar lógica de domínio diretamente em `app/settings/settings.tsx`
3. Ler `infra` interna de AUTH ou SECURITY sem necessidade justificada
4. Tratar `user.id` como `accountId` por conveniência
5. Duplicar a mesma área em `/user` e `/settings/settings`
6. Mover a área oficial para a aba `(tabs)/account`
7. Reutilizar `src/features/account` como owner da nova superfície
8. Criar “atalho de PIN” fora do fluxo oficial do SECURITY
9. Fazer o logout limpar estado de segurança implicitamente sem decisão explícita do app hospedeiro
10. Inventar payloads reais da Idez para adiantar implementação

---

## Exemplos de consumo correto

### Exemplo correto 1 — rota fina
- `app/user.tsx` importa e renderiza `AccountCenterScreen`
- a screen real vive dentro da feature

### Exemplo correto 2 — settings como alias
- `app/settings/settings.tsx` redireciona para `/user`
- ou renderiza a mesma screen da feature sem lógica duplicada

### Exemplo correto 3 — setup de PIN oficial
- a área exibe status “PIN não configurado”
- o CTA navega para a rota oficial `/security/pin-setup`

### Exemplo correto 4 — logout oficial
- a área usa a ação oficial de logout do AUTH
- não implementa limpeza paralela de sessão

---

## Exemplos de consumo incorreto

### Exemplo incorreto 1
Criar `src/features/account` como owner de perfil/segurança porque o nome parece conveniente.

### Exemplo incorreto 2
Importar `src/features/security/infra/pinStorage/*` para descobrir se o usuário tem PIN.

### Exemplo incorreto 3
Criar em `/settings/settings` uma tela diferente da de `/user`, com outra composição e outras regras.

### Exemplo incorreto 4
Usar `session.user.id` como identificador oficial da conta no novo fluxo sem contrato explícito.

---

## Relação com a Idez

A feature deve nascer preparada para integrar, no futuro, endpoints como:

- Current User
- Get Current Account
- Update Phone v2
- Update Email v2
- Limits
- List Settings
- List Features

Mas essa preparação deve acontecer com as seguintes regras:

- não inventar payloads
- não fixar tipos externos sem contrato real
- isolar mapeamento de backend em camada própria
- manter tipos internos do app independentes do contrato cru da Idez

---

## Critérios de conformidade arquitetural

A implementação estará em conformidade com este documento apenas se:

- a nova área possuir ownership claro em feature própria
- a camada `app/` permanecer fina
- AUTH continuar dono de sessão/logout/tokens
- SECURITY continuar dono do PIN/challenge/persistência de segurança
- PIX continuar dono do fluxo de transferência
- `src/features/account` atual não for contaminada com responsabilidades de perfil/segurança
- não houver duplicidade funcional entre `/user` e `/settings/settings`

---

## Instrução final para o Cursor

Ao tocar qualquer arquivo da nova área, o Cursor deve primeiro verificar estas fronteiras.

Se a solução proposta violar qualquer uma das regras acima, a solução deve ser considerada **arquiteturalmente incorreta**, mesmo que funcione visualmente.
