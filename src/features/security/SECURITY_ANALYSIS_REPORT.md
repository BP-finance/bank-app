# Relatório Técnico — Feature SECURITY

**Versão:** 1.1  
**Baseado em:** código real do projeto (inspeção em março 2025)

> Este documento apoia o onboarding e a manutenção da feature SECURITY. Use-o como referência técnica.

---

## 1. Visão geral da feature SECURITY

### 1.1 Objetivo
A feature **SECURITY** é responsável pela **credencial transacional** e pela **autorização de operações sensíveis** no app. Ela implementa:
- Criação e validação de PIN
- Persistência segura (hash + salt)
- Challenge transacional reutilizável
- Políticas de tentativas e bloqueio

### 1.2 Problemas que resolve
- Proteger operações sensíveis (ex.: Pix) com autenticação forte
- Evitar que o PIN seja armazenado ou trafegue em texto puro
- Centralizar a lógica de credencial sem acoplar outras features a detalhes de implementação
- Diferenciar claramente erro técnico de erro de credencial

### 1.3 Escopo
**Pertence ao SECURITY:**
- PIN transacional (setup, validação)
- Challenge transacional
- Persistência segura do material do PIN
- Tentativas inválidas e bloqueio temporário
- Erros e observabilidade do fluxo de segurança

**Não pertence ao SECURITY:**
- Tokens de sessão (AUTH)
- Fluxo de login/logout (AUTH)
- Lógica de negócio do Pix (apenas consome autorização)

### 1.4 Diferenciação em relação ao AUTH
- **AUTH:** login, sessão, tokens, identidade do usuário, rotas públicas/protegidas
- **SECURITY:** credencial transacional (PIN), autorização para operações sensíveis, sem acesso a tokens

**Direção de dependência:** SECURITY pode depender de AUTH (ex.: `accountId` da sessão). AUTH **não** depende de SECURITY.

---

## 2. Estrutura da feature

A organização de pastas define onde encontrar cada responsabilidade:

```
src/features/security/
├── index.ts                 # API pública (porta única para consumo externo)
├── types/                   # Tipos de domínio e contratos
├── constants/               # Constantes v1 (PIN_LENGTH, tentativas, bloqueio)
├── errors/                  # Códigos de erro, categorias, factory
├── services/                # Lógica de negócio
├── hooks/                   # Abstração React (usePinSetup, usePinValidate, useTransactionalChallenge)
├── store/                   # Estado operacional (Zustand)
├── infra/                   # Persistência e crypto
│   └── pinStorage/          # Gateway, crypto, adapter
├── observability/           # Logger seguro
├── presentation/            # Telas e componentes
│   ├── screens/
│   └── components/
└── __tests__/               # Testes de arquitetura e não vazamento
```

### Responsabilidades por pasta

| Pasta | Responsabilidade |
|-------|------------------|
| **types** | `SecurityChallengeRequest`, `SecurityChallengeResult`, `ValidatePinResult`, `SetupPinResult`, tipos de store |
| **constants** | `PIN_LENGTH` (6), `MAX_INVALID_ATTEMPTS` (3), `BLOCK_DURATION_SECONDS` (300) |
| **errors** | `SecurityErrorCode`, `getSecurityErrorDescriptor`, `createSecurityError`, `mapUnknownToSecurityError` |
| **services** | `setupPin`, `validatePin`, `requestTransactionalChallenge`, `resolveTransactionalChallenge`, `cancelTransactionalChallenge`, `hydrateSecurityStore`, `clearSecurityState` |
| **hooks** | `usePinSetup`, `usePinValidate`, `useTransactionalChallenge`, `useSecurity` |
| **store** | Estado operacional: `hasPin`, `isPinValidated`, `failedAttempts`, `isBlocked`, `blockUntil`, `currentChallenge`, `lastErrorCode` |
| **infra** | `pinStorageGateway`, `pinCrypto`, `pinSecureStoreAdapter` — ponto único de acesso à persistência |
| **observability** | `logSecurityEvent` — eventos sem dados sensíveis |
| **presentation** | `PinSetupScreen`, `TransactionalChallengeScreen`, `GlobalTransactionalChallengeModal` |
| **index.ts** | Expõe hooks, serviços públicos, telas e tipos — **não** expõe `validatePin`, `pinStorage`, `pinCrypto` |

---

## 3. Funcionamento do PIN

O fluxo de criação, persistência e validação está abaixo.

### 3.1 Criação
1. Usuário informa PIN (6 dígitos) e confirmação em `PinSetupScreen`
2. `usePinSetup` chama `setupPin` com `{ pin, confirmation, accountId }`
3. `setupPin` valida formato (`/^\d{6}$/`) e confirmação
4. Persiste **somente após** PIN e confirmação iguais
5. `persistPinForAccount` gera salt, deriva hash (SHA256, 10k iterações) e grava via gateway
6. `hydrateSecurityStore` atualiza a store com `hasPin: true`

**Arquivos:** `setupPin.service.ts`, `pinStorageGateway.ts`, `pinCrypto.ts`

### 3.2 Confirmação
- Confirmação é conferida em memória antes de chamar `persistPinForAccount`
- Nada é persistido antes da confirmação

### 3.3 Quando é persistido
- Após confirmação bem-sucedida no setup
- Nunca durante digitação ou antes de confirmar

### 3.4 Onde é persistido
- Via `expo-secure-store` (keystore do dispositivo)
- Chave por conta: `security.pin.material.${accountId}`
- Formato: JSON com `{ hash, salt, algorithmVersion, metadata }`

### 3.5 Como é protegido
- PIN nunca persistido em texto puro
- Hash derivado com salt aleatório e 10.000 iterações SHA256
- Comparação com `secureCompare` (evita timing attacks)
- Adapter usa `expo-secure-store`

### 3.6 Metadados salvos
- `failedAttempts`: tentativas inválidas consecutivas
- `blockUntil`: timestamp ISO do fim do bloqueio (ou `null`)
- `createdAt`: timestamp ISO de criação

### 3.7 Como o sistema sabe se tem PIN
- `hasPinForAccount(accountId)`: lê material via gateway e retorna `true` se `data !== null`
- Usado em `requestTransactionalChallenge` para retornar `not_configured` quando não há material

### 3.8 Validação do PIN digitado
1. `validatePin` recebe `{ pin, accountId }`
2. Valida formato (6 dígitos)
3. Lê material com `readPinMaterial`
4. Verifica bloqueio (`blockUntil > now`)
5. Chama `verifyPinAgainstMaterial`: deriva hash com o salt salvo e compara com `secureCompare`
6. Se válido: atualiza metadados (reseta tentativas e bloqueio), hidrata store, retorna `validated`
7. Se inválido: incrementa `failedAttempts`, aplica bloqueio se atingir 3 tentativas, retorna `invalid` ou `blocked`

### 3.9 Tentativas inválidas
- Máximo: 3 (`MAX_INVALID_ATTEMPTS`)
- Cada falha incrementa `failedAttempts` e persiste
- Ao atingir 3: aplica bloqueio de 5 minutos (`BLOCK_DURATION_SECONDS`)

### 3.10 Bloqueio temporário
- `blockUntil` salvo em metadata (ISO string)
- Bloqueio verificado antes de validar
- Após expirar, limpa `failedAttempts` e `blockUntil` na persistência

### 3.11 Sucesso
- Retorno: `{ status: "validated" }`
- Store: `setIsPinValidated(true)`, `setLastErrorCode(null)`
- Persistência: `failedAttempts: 0`, `blockUntil: null`

### 3.12 Falha
- `invalid`: `{ status: "invalid", errorCode, remainingAttempts }`
- `blocked`: `{ status: "blocked", blockUntil, errorCode }`
- `unavailable` (técnico): `{ status: "unavailable", errorCode }`
- Store recebe `lastErrorCode` para feedback na UI

### 3.13 Cancelamento
- `cancelTransactionalChallenge` resolve com `{ status: "cancelled" }`
- **Não** chama `validatePin` — portanto não incrementa tentativas
- Limpa `currentChallenge` e `lastErrorCode`

---

## 4. Persistência segura

### 4.1 Implementação
- **Gateway:** `pinStorageGateway.ts` — único ponto de acesso
- **Adapter:** `pinSecureStoreAdapter` → `expo-secure-store`
- **Chave:** `security.pin.material.${accountId}`

### 4.2 Formato do material
```ts
{
  hash: string;           // Hash derivado (SHA256, 10k iterações)
  salt: string;           // Salt aleatório em hex
  algorithmVersion: number;  // 1 (para migração futura)
  metadata: {
    failedAttempts: number;
    blockUntil: string | null;
    createdAt: string;
  }
}
```

### 4.3 Uso de hash, salt e metadados
- `createPinMaterial`: gera salt, deriva hash, retorna material
- `verifyPinAgainstMaterial`: usa o mesmo salt para derivar e comparar
- `updatePinMetadata`: atualiza `failedAttempts` e `blockUntil` sem alterar hash/salt

### 4.4 Escopo por accountId
- Cada conta usa chave distinta
- `readPinMaterial`, `writePinMaterial`, `clearPinMaterial` recebem `accountId`

### 4.5 Limpeza e isolamento
- `clearPinMaterial(accountId)` remove material da conta
- Contas diferentes usam chaves diferentes; não há vazamento entre contas

### 4.6 Logout
- O módulo AUTH **não** chama `clearSecurityState` no logout na implementação atual
- `clearSecurityState` é exportado para uso explícito (ex.: troca de conta)

### 4.7 Troca de conta
- Deve-se chamar `clearSecurityState({ accountId: previousAccountId, clearLocalStore: true })`

### 4.8 Reset futuro
- Preparado: `clearSecurityState({ accountId })` remove o material
- Reset de PIN via UI não existe na v1; apenas a API está pronta

### 4.9 Decisões de segurança v1
- PIN nunca em texto puro
- Salt por material
- 10k iterações para derivação
- `secureCompare` para evitar timing attacks
- Material malformado tratado como `STORAGE_DATA_INVALID`

---

## 5. Store da feature SECURITY

### 5.1 Estados
| Estado | Tipo | Descrição |
|--------|------|-----------|
| `hasPin` | boolean | Indica se a conta tem PIN configurado |
| `isPinValidated` | boolean | Indica se o challenge atual foi validado |
| `failedAttempts` | number | Tentativas inválidas (espelho da persistência) |
| `isBlocked` | boolean | Indica bloqueio temporário ativo |
| `blockUntil` | string \| null | Timestamp ISO do fim do bloqueio |
| `currentChallenge` | SecurityChallengeRequest \| null | Challenge em andamento |
| `lastErrorCode` | SecurityErrorCodeType \| null | Último código de erro para UI |

### 5.2 Papel da store
- Estado operacional e de UI
- Não é fonte da verdade do segredo; a persistência é

### 5.3 O que pode guardar
- Metadados derivados: `hasPin`, `failedAttempts`, `blockUntil`, `isBlocked`
- Estado do fluxo: `currentChallenge`, `lastErrorCode`, `isPinValidated`

### 5.4 O que nunca guarda
- PIN em texto
- Hash
- Salt
- Material completo persistido

### 5.5 Hidratação
- `hydrateSecurityStore(accountId)`: lê material via gateway, deriva estado e chama `hydrateFromPersistence`
- Nunca coloca hash/salt na store
- Executada após setup, antes do challenge e durante validação

### 5.6 currentChallenge
- Definido em `requestTransactionalChallenge` ao iniciar o challenge
- Limpo ao resolver ou cancelar
- `GlobalTransactionalChallengeModal` usa para exibir o modal
- `TransactionalChallengeScreen` usa para obter `accountId`

### 5.7 lastErrorCode
- Definido em `validatePin` e `setupPin` em falhas
- Limpo em sucesso ou cancelamento
- Usado pelas telas para exibir mensagens de erro

### 5.8 Relação com a persistência
- A store reflete o estado derivado da persistência
- `hydrateSecurityStore` sincroniza store ↔ persistência
- A store não grava na persistência; apenas os serviços o fazem

---

## 6. Challenge transacional

O challenge é o ponto de entrada para outras features solicitarem autorização.

### 6.1 Conceito na implementação
- Mecanismo reutilizável para autorizar operações sensíveis
- O chamador pede autorização; o SECURITY retorna um resultado tipado
- O chamador não usa `validatePin` nem acessa detalhes de PIN

### 6.2 Contratos públicos
- **Entrada:** `requestTransactionalChallenge(request: SecurityChallengeRequest)`
- **Resolução:** `resolveTransactionalChallenge(pin, accountId)` — chamado pela UI
- **Cancelamento:** `cancelTransactionalChallenge()`
- **Resultado:** `SecurityChallengeResult` (authorized | denied | blocked | not_configured | cancelled | unavailable)

### 6.3 Início
1. Chamador chama `requestTransactionalChallenge({ type, accountId, metadata })`
2. SECURITY verifica `hasPinForAccount`; se não houver PIN, retorna `not_configured` imediatamente
3. Hidrata store e verifica bloqueio; se bloqueado, retorna `blocked`
4. Define `currentChallenge` e retorna Promise que será resolvida ao concluir
5. UI detecta `currentChallenge !== null` e exibe `TransactionalChallengeScreen` (via `GlobalTransactionalChallengeModal`)

### 6.4 Resolução
1. Usuário digita PIN e confirma
2. UI chama `resolveTransactionalChallenge(pin, accountId)`
3. SECURITY chama `validatePin` internamente
4. Mapeia `ValidatePinResult` → `SecurityChallengeResult`
5. Limpa `currentChallenge`, resolve a Promise original e retorna o resultado

### 6.5 Status possíveis
- `authorized`: operação pode prosseguir
- `denied`: PIN incorreto
- `blocked`: bloqueio temporário ativo
- `not_configured`: sem PIN configurado
- `cancelled`: usuário cancelou
- `unavailable`: erro técnico (storage, validação)

### 6.6 Encapsulamento da validação
- `validatePin` não é exportado pela API
- O desafio usa `validatePin` internamente e expõe apenas `SecurityChallengeResult`

### 6.7 Cancelamento
- `cancelTransactionalChallenge()` resolve a Promise com `cancelled`
- Não chama `validatePin`; não incrementa tentativas

### 6.8 Participação da store
- `setCurrentChallenge` ao iniciar, `null` ao resolver/cancelar
- `setLastErrorCode` para feedback de erro na tela de PIN

### 6.9 Por que Pix não depende de PIN
- Pix consome apenas `requestTransactionalChallenge` e `SecurityChallengeResult`
- Não importa `validatePin`, `pinStorage` nem `pinCrypto`
- Evolução futura (biometria, OTP) não exige mudanças no Pix

---

## 7. Integração com Pix

### 7.1 Uso atual
- Pix usa `sendPixWithSecurityChallengeUseCase`
- Este use case chama `requestTransactionalChallenge` antes de enviar

### 7.2 Ponto de entrada do challenge
1. Usuário confirma envio na `ConfirmScreen` ou em `cards.tsx`
2. Chamada a `sendPixWithSecurityChallengeUseCase({ to, amount, accountId })`
3. Use case chama `requestTransactionalChallenge({ type: "PIX_TRANSFER", accountId, metadata })`
4. A Promise só resolve quando o usuário submete PIN ou cancela
5. `GlobalTransactionalChallengeModal` exibe o PIN quando `currentChallenge !== null`

### 7.3 Camada de orquestração
- `sendPixWithSecurityChallengeUseCase` é a camada protegida
- Única chamada a `sendPixUseCase` está dentro desse use case, e só após `authorized`

### 7.4 Como o bypass foi impedido
- `ConfirmScreen` e `cards.tsx` usam `sendPixWithSecurityChallengeUseCase`
- Teste de arquitetura verifica que `sendPixUseCase` só é importado por esse use case (exceto definição e testes)
- Nenhuma tela chama `sendPixUseCase` diretamente

### 7.5 Tratamento por resultado
| Status | Comportamento |
|--------|---------------|
| `authorized` | Executa `sendPixUseCase`, redireciona para sucesso |
| `denied` | Não envia, exibe alerta com mensagem de erro |
| `blocked` | Não envia, exibe alerta |
| `cancelled` | Não envia, fecha fluxo sem alerta |
| `not_configured` | Não envia, chama `navigateToPinSetup(router)` |
| `unavailable` | Não envia, exibe alerta genérico |

### 7.6 Fluxo para setup de PIN
- `handleNotConfiguredResult` → `navigateToPinSetup(router)` → `router.push(PIN_SETUP_ROUTE)`
- Rota: `/security/pin-setup` (`app/security/pin-setup.tsx`)
- Tela: `PinSetupScreen` com `accountId` de `useAuthStore`

### 7.7 Desacoplamento
- Pix depende de `SecurityChallengeResult`, não de detalhes de PIN
- Mensagens vêm de `getChallengeResultMessage` no Pix
- Pix não conhece `validatePin`, hash, salt ou storage

---

## 8. Erros e observabilidade

### 8.1 Códigos de erro
- `PIN_NOT_CONFIGURED`, `PIN_CONFIRMATION_MISMATCH`, `PIN_FORMAT_INVALID`
- `PIN_INVALID`, `PIN_BLOCKED`, `ATTEMPT_LIMIT_REACHED`
- `CHALLENGE_CANCELLED`, `CHALLENGE_NOT_ACTIVE`, `CHALLENGE_RESOLUTION_MISSING`
- `STORAGE_READ_FAILED`, `STORAGE_WRITE_FAILED`, `STORAGE_DATA_INVALID`
- `VALIDATION_EXECUTION_FAILED`, `UNKNOWN_ERROR`

### 8.2 Organização
- `getSecurityErrorDescriptor(code)`: retorna `{ code, category, isCredentialError, isRetryable, messageKey }`
- Categorias: `validation`, `state`, `policy`, `technical`, `flow`

### 8.3 Erro técnico vs credencial
- `isCredentialError: true` para `PIN_INVALID`, `PIN_CONFIRMATION_MISMATCH`, `PIN_FORMAT_INVALID`
- `isCredentialError: false` para `STORAGE_*`, `VALIDATION_EXECUTION_FAILED`, etc.
- `mapUnknownToSecurityError` sempre retorna `UNKNOWN_ERROR`, nunca `PIN_INVALID`

### 8.4 Cancelamento
- Tratado como `flow` (`CHALLENGE_CANCELLED`)
- Não é credencial nem técnico
- Não incrementa tentativas

### 8.5 Mensagens de UI
- `validatePinErrorMessages`: `getValidationErrorMessageFromCode`
- `setupPinErrorMessages`: `getSetupErrorMessage`
- `challengeResultMessages` (Pix): `getChallengeResultMessage(result)`

### 8.6 Observabilidade
- `logSecurityEvent(event, context?, level?)`
- Eventos: `challenge_started`, `challenge_authorized`, `challenge_denied`, `challenge_cancelled`, `pin_setup_success`, `pin_setup_failed`, `validation_invalid`, `storage_read_failed`, etc.

### 8.7 O que pode ser logado
- Código de erro, tipo de operação, tentativas restantes, duração do bloqueio
- `hasConfiguredPin` (boolean)

### 8.8 O que não pode ser logado
- PIN, confirmação, hash, salt, material persistido, payload sensível

---

## 9. Como usar a feature SECURITY

Guia prático para integração no app.

### 9.1 Setup de PIN
- **Componente:** `PinSetupScreen` (recebe `accountId`, `onSuccess`, `onCancel`)
- **Hook:** `usePinSetup()` para encapsular `setupPin`
- **Rota:** `/security/pin-setup` (`app/security/pin-setup.tsx`)
- **Quando:** Após login, ou quando `not_configured` redireciona para setup

### 9.2 Validação de PIN
- **Hook:** `usePinValidate()` — encapsula `validatePin`
- **Quando usar:** Para fluxos que precisam validar PIN fora do challenge (ex.: tela dedicada de validação)
- **Quando NÃO usar:** Para operações sensíveis como Pix — use `requestTransactionalChallenge`

### 9.3 Challenge transacional
- **API pública:** `requestTransactionalChallenge(request)` → Promise<SecurityChallengeResult>
- **Para features (ex.: Pix):**
  1. Chamar `requestTransactionalChallenge` antes da operação sensível
  2. Aguardar a Promise
  3. Se `authorized`, executar a operação
  4. Caso contrário, tratar o status (denied, blocked, etc.) sem executar
- **Nunca:** Importar `validatePin`, `pinStorage` ou `pinCrypto` em features consumidoras

### 9.4 Navegação
- **Setup:** Rota `/security/pin-setup`; `PinSetupScreen` usa `accountId` de `useAuthStore`
- **Challenge:** `GlobalTransactionalChallengeModal` está no root (`app/_layout.tsx`); aparece quando `currentChallenge !== null`
- **Fluxo:** A feature dispara `requestTransactionalChallenge`; o modal é exibido automaticamente; o usuário digita o PIN; a Promise resolve

---

## 10. Fronteiras arquiteturais

- **AUTH não depende de SECURITY:** AUTH gerencia sessão e tokens; nenhum arquivo em `auth` importa SECURITY.
- **SECURITY pode depender de AUTH:** Usa `accountId` da sessão; telas usam `AuthButton` e `AuthInput` (componentes de apresentação).
- **Shared não depende de features:** Nenhum import de `auth`, `security` ou `pix` em `shared`.
- **Pix depende de challenge, não de PIN:** Consome `requestTransactionalChallenge` e `SecurityChallengeResult`; não importa `validatePin` nem infra de PIN.
- **Uso incorreto:** Feature que importa `validatePin` ou `pinStorage` diretamente, ou que chama `sendPixUseCase` sem passar pelo challenge.

---

## 11. Responsabilidades do app hospedeiro

A feature SECURITY expõe `clearSecurityState`, mas **não decide** sozinha quando limpar o estado local ou o material persistido do PIN. Essa decisão pertence ao fluxo do app hospedeiro.

Na implementação atual, o módulo **AUTH não chama** `clearSecurityState` automaticamente no logout. Logo, o app deve chamar explicitamente `clearSecurityState({ accountId, clearLocalStore: true })` no ponto adequado em cenários como:

- **Troca de conta:** ao sair da conta anterior, limpar material e store da conta anterior
- **Logout com política de limpeza:** quando a política exigir remover dados locais de segurança
- **Reset futuro de PIN:** se houver fluxo de reset na UI, usar `clearSecurityState` antes ou como parte do reset

`clearSecurityState` é uma decisão arquitetural explícita: a feature fornece a operação; o hospedeiro escolhe o momento e o contexto de execução.

---

## 12. Decisões de v1 e limitações

### Decisões fechadas
- PIN de 6 dígitos numéricos
- 3 tentativas inválidas; bloqueio de 5 minutos
- Persistência via expo-secure-store
- Challenge reutilizável
- Pix sempre exige challenge
- Sem janela de confiança
- Sem reset de PIN na UI (API preparada)

### Preparado para o futuro
- `algorithmVersion` para migração de algoritmo
- `SecurityChallengeType` inclui `PAYMENT`, `CARD_ACTION`, etc.
- `clearSecurityState` para troca de conta ou reset
- Categorias de erro e observabilidade para evoluir sem quebrar consumidores

### O que ainda não existe
- Biometria
- OTP
- Reset de PIN na UI
- Integração de `clearSecurityState` no logout (feita explicitamente pelo app)
- Integração com vendors de analytics

### Extensões naturais
- Biometria como método alternativo ao PIN
- OTP para operações de alto valor
- Políticas por tipo de operação ou valor

---

## 13. Resumo executivo final

**O que foi construído:**
- Feature SECURITY com setup, validação, persistência segura e challenge transacional
- Integração com Pix protegida contra bypass
- Erros tipados e observabilidade sem vazamento de dados sensíveis
- Testes cobrindo fluxos críticos, integração, arquitetura e não vazamento

**O que está pronto para uso:**
- Setup de PIN via `PinSetupScreen` e rota `/security/pin-setup`
- Challenge transacional via `requestTransactionalChallenge`
- Proteção do envio Pix via `sendPixWithSecurityChallengeUseCase`
- Limpeza de estado via `clearSecurityState` quando necessário

**Como usar:**
- Operações sensíveis: chamar `requestTransactionalChallenge` antes de executar; executar só em `authorized`
- Setup de PIN: navegar para `/security/pin-setup` quando `not_configured`
- Nunca chamar `validatePin`, `sendPixUseCase` ou infra de PIN diretamente de outras features

**Guardrails principais (obrigatórios):**
- **AUTH × SECURITY:** AUTH não depende de SECURITY; a dependência é sempre SECURITY → AUTH.
- **Shared:** Shared não depende de features (auth, security, pix).
- **Pix × credencial:** Pix depende de challenge/autorização (`requestTransactionalChallenge` + `SecurityChallengeResult`), nunca de PIN, `validatePin` ou infra de storage.
- **Store e logs:** nunca expõem PIN, hash ou salt; apenas metadados derivados e códigos de erro.
- **Pix protegido:** `sendPixUseCase` só executa após `authorized`; a orquestração fica em `sendPixWithSecurityChallengeUseCase`.
