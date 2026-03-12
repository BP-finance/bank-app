# CURSOR SKILL
# AUTH Register Step Form v2

Este agente pode modificar **apenas o fluxo de cadastro dentro do módulo AUTH**, com foco em:

- consolidar o fluxo novo de cadastro
- resumir o cadastro **PF para 4 etapas**
- preparar o fluxo **PJ** para evoluir com a mesma base
- preservar a arquitetura existente do projeto
- não impactar partes estáveis do AUTH fora do cadastro

---

# Escopo permitido

Este agente pode atuar apenas em:

- fluxo de cadastro PF
- fluxo de cadastro PJ
- componentes compartilhados do register flow
- configuração dos steps de cadastro
- navegação interna do cadastro
- progresso visual do cadastro
- validações do cadastro
- integração do cadastro com services e data sources existentes
- telas legadas de cadastro, **somente se necessário para consolidar o fluxo novo como fonte principal**

---

# Escopo proibido

Este agente NÃO deve modificar:

- login
- forgot password
- logout
- bootstrap de sessão
- hidratação via `/auth/me`
- regras globais de sessão
- outras features fora de AUTH

Também NÃO deve:

- refatorar o módulo AUTH inteiro
- trocar a arquitetura atual do projeto
- criar nova arquitetura paralela
- duplicar lógica desnecessariamente
- mover regras de negócio para screen
- chamar API/mock diretamente em screen
- chamar API/mock diretamente em hook

---

# Objetivo da refatoração

Transformar o cadastro atual em um fluxo **step-by-step configurável**, com base única para PF e PJ.

## Objetivo imediato

Implementar primeiro o fluxo **PF com 4 etapas**:

1. **Dados pessoais** → nome completo + CPF
2. **Contato** → email + telefone
3. **Segurança** → senha + confirmar senha
4. **Finalização** → aceite de termos

Após isso, manter o fluxo PJ compatível com a mesma estrutura de step form configurável.

---

# Regra principal de arquitetura

Sempre respeitar a arquitetura existente do projeto:

screen → hook → service → data source → api/mock → mapper → store

Regras obrigatórias:

- screen coordena UI e delega comportamento
- hook concentra estado do fluxo, navegação entre steps e validação por etapa
- service continua responsável pela orquestração de cadastro
- data source continua responsável por backend/mock
- mapper/store existentes devem ser reaproveitados

Nunca:

- pular camadas
- colocar regra de negócio em screen
- acoplar UI diretamente ao data source
- espalhar validação crítica em vários lugares sem centralização

---

# Diretriz de produto e UX

O step form **não deve mais ser modelado como 1 etapa = 1 campo**.

A nova regra deve ser:

- **1 etapa = 1 bloco de informação com intenção clara**

Exemplos válidos:

- dados pessoais
- contato
- segurança
- finalização

Evitar:

- uma etapa para nome
- uma etapa para CPF
- uma etapa para email
- uma etapa para telefone
- uma etapa para senha
- uma etapa para confirmar senha

Essa fragmentação excessiva deixa o fluxo longo e piora a experiência.

---

# Fonte de verdade do cadastro

O fluxo novo deve ser a **fonte principal de verdade** do cadastro.

Se existirem telas antigas de PF/PJ coexistindo com o fluxo novo:

- priorizar o fluxo novo
- evitar duplicar regras entre fluxo antigo e novo
- ajustar telas antigas apenas quando necessário para manter compatibilidade temporária
- sempre caminhar para centralizar a regra em um único fluxo reutilizável

---

# Modelagem esperada

Preferir um motor de steps baseado em configuração.

Cada step deve poder declarar:

- `id`
- `title`
- `description` opcional
- `fields` da etapa
- regra de validação da etapa
- comportamento opcional de progresso/exibição

## Regra importante

O layout e o renderer devem suportar **múltiplos campos na mesma etapa**.

A implementação não deve assumir que existe apenas um campo por step.

---

# Fluxo esperado PF

O fluxo PF deve ser reduzido para **4 etapas**:

## Etapa 1 — Dados pessoais

Campos:

- nome completo
- CPF

## Etapa 2 — Contato

Campos:

- email
- telefone

## Etapa 3 — Segurança

Campos:

- senha
- confirmar senha

## Etapa 4 — Finalização

Campos:

- aceite de termos

## Regras de UX para PF

- o usuário só avança se todos os campos obrigatórios da etapa atual estiverem válidos
- mensagens de erro devem aparecer de forma clara por campo e, quando necessário, por etapa
- os títulos das etapas devem ser humanos e orientados à intenção, não apenas ao nome do campo

---

# Fluxo esperado PJ

O fluxo PJ deve continuar existindo, mas preparado para usar a **mesma infraestrutura configurável** do PF.

A quantidade final de etapas do PJ pode continuar maior neste momento, desde que:

- use a mesma base técnica
- use a mesma engine de steps
- concentre diferenças em configuração
- evite duplicação estrutural

Campos típicos do PJ que precisam ser suportados:

- razão social
- nome fantasia, se aplicável no fluxo atual
- CNPJ
- email
- telefone
- nome do representante legal
- CPF do representante
- senha
- confirmar senha
- aceite de termos

---

# Progress bar

O step form deve possuir indicador de progresso baseado no total real de etapas do fluxo ativo.

Requisitos:

- barra linear de progresso
- texto indicando etapa atual
- cálculo correto tanto para PF quanto para PJ
- atualização conforme o step atual

Exemplo:

Passo 2 de 4

O progresso não deve ser calculado com números fixos hardcoded fora da configuração do fluxo.

---

# Regras de UI

A UI nova deve:

- manter consistência com o app atual
- respeitar os componentes e padrões já usados no projeto
- continuar simples e clara
- funcionar bem em telas mobile
- evitar excesso de lógica dentro da screen
- suportar steps com mais de um campo sem gambiarra visual

---

# Regras de validação

Reutilizar sempre que possível as validações já existentes no projeto.

Exemplos:

- CPF
- CNPJ
- email
- telefone
- senha

Nunca recriar validações já implementadas sem necessidade.

## Nova regra de validação

A validação deve existir em 3 níveis quando necessário:

1. **validação de campo**
2. **validação de etapa**
3. **validação final antes do submit**

### Exemplos

- CPF válido é validação de campo
- senha igual à confirmação é validação de etapa
- revisar todos os dados obrigatórios antes do submit é validação final

## Regra obrigatória de submit

No submit final, não validar apenas a última etapa.

Antes de enviar, o fluxo deve garantir que:

- todas as etapas obrigatórias do fluxo ativo estão válidas
- todos os campos necessários foram preenchidos corretamente
- a comparação entre senha e confirmação foi revalidada

---

# Regras de integração

O submit final do cadastro deve continuar usando a base técnica existente do AUTH.

Ou seja:

- reaproveitar services existentes
- reaproveitar data sources existentes
- reaproveitar backend/mock switch existente
- reaproveitar mappers e store quando necessário

A refatoração deve melhorar a experiência do cadastro sem quebrar a integração atual.

---

# Estrutura sugerida

Se necessário, ajustar ou criar elementos como:

- `RegisterFlowScreen`
- `RegisterStepLayout`
- `RegisterStepProgress`
- `RegisterStepField`
- `useRegisterFlow`
- `registerSteps.config`
- validadores por etapa
- helpers de agrupamento de campos por tipo de conta

Mas sempre respeitando a organização real já existente no projeto.

---

# Critérios técnicos importantes

## 1. Configuração acima de duplicação

Diferenças entre PF e PJ devem ficar principalmente em:

- definição dos steps
- campos por step
- validações por step
- labels e textos específicos

## 2. Hook central sem excesso de switch rígido

Evitar concentrar toda a lógica em um grande `switch(step.id)` difícil de manter.

Preferir uma estrutura em que a configuração do step ajude a orientar:

- renderização
- validação
- navegação
- progressão do fluxo

## 3. Renderer preparado para múltiplos campos

O layout não deve assumir um único input por etapa.

## 4. Submit robusto

O cadastro precisa continuar seguro mesmo se o usuário voltar etapas, editar dados ou se o fluxo evoluir no futuro.

---

# Prioridades

Ordem de prioridade:

1. não quebrar o módulo AUTH
2. consolidar o fluxo novo de cadastro como base principal
3. resumir o PF para 4 etapas
4. manter arquitetura existente
5. reduzir duplicação entre PF e PJ
6. deixar a engine de step form escalável para evolução futura do PJ
7. preservar integração com backend real e mocks

---

# Instrução final para execução

Quando receber uma tarefa relacionada ao cadastro:

- alterar apenas o necessário dentro de AUTH
- preservar login, sessão e hidratação atuais
- usar o AUTH atual como base técnica
- implementar o cadastro em step form configurável
- tratar PF como prioridade imediata com **4 etapas**
- preparar o PJ para seguir a mesma estrutura
- evitar regressões no fluxo de submit
- manter o código pronto para backend real e mocks

---

# Resultado esperado

Ao final desta refatoração, o projeto deve ter:

- um fluxo de cadastro novo mais enxuto para PF
- suporte real a etapas com múltiplos campos
- validação mais robusta por etapa e no submit
- progressão visual correta
- menor acoplamento entre UI e regra de cadastro
- uma base pronta para reorganizar o PJ depois com menos retrabalho
