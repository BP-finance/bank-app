
# CURSOR EXECUTION PLAN
# AUTH Register Refactor — PF 4 etapas + base escalável para PJ

Use este plano para executar a refatoração do cadastro no módulo AUTH em fases pequenas, seguras e verificáveis.

---

## Objetivo geral

Ajustar o fluxo novo de cadastro para:

- suportar steps com múltiplos campos
- migrar **PF** para **4 etapas**
- fortalecer validação e submit
- consolidar o fluxo novo como base principal
- manter **PJ** compatível com a mesma infraestrutura
- evitar refatoração desnecessária fora do cadastro

---

## Regras obrigatórias

### Escopo permitido

Pode atuar apenas em:

- fluxo de cadastro PF
- fluxo de cadastro PJ
- componentes compartilhados do register flow
- configuração dos steps de cadastro
- validações do cadastro
- navegação interna do cadastro
- progress bar do cadastro
- integração com services e data sources já existentes
- telas legadas de cadastro, apenas se necessário para consolidar o fluxo novo

### Escopo proibido

Não modificar:

- login
- forgot password
- logout
- bootstrap auth
- hidratação de sessão
- regras globais de sessão
- outras features fora de AUTH

Também não deve:

- refatorar o AUTH inteiro
- criar arquitetura paralela
- duplicar lógica sem necessidade
- mover regra de negócio para screen
- chamar API/mock diretamente em screen
- chamar API/mock diretamente em hook

---

## Arquitetura obrigatória

Respeitar a arquitetura já existente:

screen -> hook -> service -> data source -> api/mock -> mapper -> store

Princípios:

- screen coordena UI
- hook concentra estado, navegação e validação do fluxo
- service continua responsável pela orquestração do cadastro
- data source continua responsável pela camada de backend/mock
- reaproveitar validadores, mappers e store já existentes

Nunca:

- pular camadas
- acoplar UI diretamente ao data source
- espalhar validação crítica sem centralização

---

## Decisão de produto

O cadastro **não deve mais seguir a lógica 1 etapa = 1 campo**.

Nova regra:

- **1 etapa = 1 bloco de informação com intenção clara**

### PF desejado

1. **Dados pessoais** → nome completo + CPF  
2. **Contato** → email + telefone  
3. **Segurança** → senha + confirmar senha  
4. **Finalização** → aceite de termos

O PJ deve continuar usando a mesma base técnica, mesmo que ainda tenha mais etapas neste momento.

---

## Estratégia de execução

Executar em fases, sem pular etapas.

Ordem obrigatória:

1. Fase 0 — Diagnóstico e proteção  
2. Fase 1 — Preparar engine para múltiplos campos por step  
3. Fase 2 — Migrar PF para 4 etapas  
4. Fase 3 — Fortalecer validação e submit  
5. Fase 4 — Consolidar fluxo novo como fonte principal  
6. Fase 5 — Adaptar PJ para a mesma base técnica  
7. Fase 6 — Limpeza final

---

# FASE 0 — Diagnóstico e proteção

## Objetivo

Entender com precisão o que hoje depende do fluxo novo e do legado, sem alterar comportamento ainda.

## Tarefas

- mapear os arquivos reais do cadastro
- identificar qual screen/rota é a principal hoje
- identificar quais telas legadas ainda coexistem
- localizar:
  - config de steps
  - hook do fluxo
  - layout do step
  - field renderer
  - progress bar
  - submit PF/PJ
- apontar riscos de regressão antes de editar

## Entregável esperado

- lista curta dos arquivos impactados
- descrição objetiva do fluxo atual PF e PJ
- confirmação de qual arquivo é a fonte real do fluxo novo
- ordem sugerida de alteração com menor risco

## Prompt

Analise apenas o módulo AUTH relacionado ao cadastro.

Objetivo:
- mapear o fluxo novo de register
- identificar telas legadas que coexistem
- localizar os arquivos principais do step form
- apontar quais arquivos realmente precisam ser alterados para suportar PF com 4 etapas

Importante:
- não refatore nada ainda
- não altere login, sessão, forgot password ou bootstrap auth
- não proponha mudanças fora do cadastro

---

# FASE 1 — Preparar engine para múltiplos campos por etapa

## Objetivo

Remover a suposição técnica de que cada step possui apenas um campo.

## Tarefas

- permitir que a configuração de cada step tenha fields[]
- adaptar layout/renderização para exibir vários campos na mesma etapa
- ajustar o hook para não depender de um único input por step
- manter o cálculo de progresso baseado no total real de etapas

## Prompt

Refatore apenas a infraestrutura do register step form no AUTH para suportar múltiplos campos por etapa.

Objetivo técnico:
- deixar de assumir que 1 etapa possui apenas 1 campo
- permitir que a configuração de cada step tenha uma lista de fields
- adaptar layout/renderização para exibir vários campos na mesma etapa

---

# FASE 2 — Migrar PF para 4 etapas

Fluxo PF desejado:

1. Dados pessoais → nome completo + CPF  
2. Contato → email + telefone  
3. Segurança → senha + confirmar senha  
4. Finalização → aceite de termos

## Prompt

Agora aplique a nova engine de steps no fluxo PF do AUTH e reduza o cadastro para 4 etapas.

---

# FASE 3 — Fortalecer validação

Organizar validação em três níveis:

1. campo  
2. etapa  
3. validação final antes do submit

## Prompt

Fortaleça a validação do register flow no AUTH garantindo validação por campo, etapa e validação final antes do submit.

---

# FASE 4 — Consolidar fluxo novo

Objetivo:

Centralizar o cadastro no fluxo novo e reduzir duplicação com telas antigas.

## Prompt

Consolide o fluxo novo de cadastro no AUTH como fonte principal de verdade.

---

# FASE 5 — Adaptar PJ

Objetivo:

Garantir que o fluxo PJ use a mesma infraestrutura configurável do PF.

## Prompt

Adapte o fluxo PJ do AUTH para usar a mesma engine de step form configurável.

---

# FASE 6 — Limpeza final

Objetivo:

Remover código morto e resquícios do modelo antigo.

## Prompt

Faça uma limpeza técnica final no register flow removendo código morto e lógica do modelo antigo.

---

# Checklist final para cada fase

Sempre confirmar:

- o que foi alterado
- o que não foi alterado
- se PF e PJ continuam compilando
- se o submit continua usando services existentes
- se restou algum acoplamento ao modelo antigo
