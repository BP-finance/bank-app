# task-0.1-review-checklist.md

## Objetivo
Checklist de revisão da Task 0.1 — Definir a feature e a superfície oficial.

Use este arquivo para validar se a execução respeitou a decisão arquitetural e não expandiu o escopo indevidamente.

---

## Checklist principal

### 1. Ownership da feature
- [ ] Existe uma feature oficial claramente definida para a nova área.
- [ ] A feature oficial definida é separada da `src/features/account` atual.
- [ ] A decisão evita misturar saldo/home/wallet com perfil/segurança.

### 2. Superfície oficial
- [ ] A rota oficial definida para a área é `app/user.tsx`.
- [ ] `app/user.tsx` está tratada como entrypoint fino, não como lugar de lógica de domínio.

### 3. Papel de `/settings/settings`
- [ ] `app/settings/settings.tsx` não foi transformada em uma segunda área concorrente.
- [ ] A rota de settings foi subordinada à mesma superfície oficial.
- [ ] Não há duplicação de composição, lógica ou ownership entre `/user` e `/settings/settings`.

### 4. Papel da tab `account`
- [ ] `app/(tabs)/account.tsx` não foi usada como superfície oficial de Conta / Segurança.
- [ ] Ficou explícito que essa tab permanece fora do escopo desta área.
- [ ] A ambiguidade entre “account” e “Carteira” foi registrada, não ignorada.

### 5. Relação com a feature `account` atual
- [ ] A feature `src/features/account` atual não foi reutilizada como owner da nova área.
- [ ] `useBalanceStore`, `HomeHeader` e `LoadingOverlay` não viraram base de perfil/segurança.

### 6. Relação com AUTH
- [ ] A solução não reimplementa logout.
- [ ] A solução não toca em token storage.
- [ ] A solução respeita AUTH como dono de sessão e autenticação.

### 7. Relação com SECURITY
- [ ] A solução não acessa `infra` interna de SECURITY.
- [ ] A solução não trata PIN diretamente.
- [ ] A solução depende de contratos públicos da feature SECURITY.

### 8. Relação com PIX
- [ ] A solução não acopla Conta / Segurança ao fluxo de Pix.
- [ ] A solução não desloca responsabilidades já existentes do Pix.

### 9. Escopo da task
- [ ] A task permaneceu estrutural.
- [ ] A task não virou implementação completa da tela.
- [ ] A task não integrou backend externo.
- [ ] A task não resolveu problemas fora do escopo, como reset de PIN ou 2FA.

### 10. Preparação para continuidade
- [ ] A base ficou pronta para a próxima task de implementação.
- [ ] A decisão permite crescer para Idez sem reabrir ownership.
- [ ] A solução não depende de payload inventado.

---

## Perguntas de revisão obrigatórias

Antes de aprovar a task, responda objetivamente:

1. Onde a área vive agora?
2. Qual é sua superfície oficial?
3. `/settings/settings` ficou subordinada à superfície oficial ou virou concorrente?
4. A tab `account` foi mantida fora do escopo correto?
5. A feature `account` atual foi preservada no seu papel original?
6. O resultado reduz ambiguidade ou apenas desloca a ambiguidade?

Se qualquer resposta estiver vaga, a task ainda não está pronta.

---

## Sinais de solução errada

Se qualquer item abaixo acontecer, a solução deve ser revista:

- criar a nova área dentro de `src/features/account`
- manter `/user` e `/settings/settings` evoluindo como duas telas independentes
- mover Conta / Segurança para `app/(tabs)/account.tsx`
- deixar `app/user.tsx` com lógica de negócio significativa
- fazer import profundo de internals de SECURITY para descobrir status do PIN
- acoplar a nova área ao saldo mockado ou ao `useBalanceStore`
- assumir `user.id === accountId` como base oficial do novo domínio
- usar nomes genéricos demais sem ownership claro, como `account`, `settings` e `profile` ao mesmo tempo
- crescer escopo da task para “settings completos”

---

## Sinais de solução correta

A solução tende a estar correta quando:

- a área tem um owner claro
- existe uma única superfície oficial
- rotas secundárias apenas delegam para a superfície principal
- a arquitetura por feature foi preservada
- AUTH, SECURITY e PIX continuam com responsabilidades bem separadas
- a próxima task pode começar sem discutir novamente onde a área vive

---

## Critério final de aprovação

A Task 0.1 só deve ser aprovada quando a revisão puder afirmar com segurança:

- “agora existe uma única resposta clara para onde a área mínima de Conta / Segurança vive no app.”
