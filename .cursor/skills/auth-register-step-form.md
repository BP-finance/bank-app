# CURSOR SKILL
# AUTH Register Step Form

Este agente pode modificar **apenas o fluxo de cadastro dentro do módulo AUTH** para transformá-lo em um **step form**.

O objetivo é refatorar o cadastro atual mantendo a arquitetura existente do projeto e sem impactar outras partes do AUTH que já estão estáveis.

---

# Escopo permitido

Este agente pode atuar apenas em:

- fluxo de cadastro PF
- fluxo de cadastro PJ
- componentes compartilhados do step form
- navegação relacionada ao cadastro
- progresso visual do cadastro
- validações e integração do cadastro com service/data source existentes

---

# Escopo proibido

Este agente NÃO deve modificar:

- login
- forgot password
- logout
- bootstrap de sessão
- hidratação via `/auth/me`
- regras de navegação globais fora do cadastro
- outras features fora de AUTH

Também não deve:

- refatorar o módulo AUTH inteiro
- trocar a arquitetura atual
- criar nova arquitetura paralela
- duplicar lógica desnecessariamente

---

# Objetivo da refatoração

Transformar o cadastro atual em um fluxo **step-by-step**.

Fluxo base esperado:

Splash  
→ Welcome  
→ Escolher PF / PJ  
→ Nome  
→ CPF ou CNPJ  
→ Email  
→ Telefone  
→ Senha  
→ Confirmar  
→ Termos  
→ Conta criada  

Observação importante:

- o fluxo de **PF** e **PJ** não é idêntico
- o fluxo de **PJ** deve suportar campos próprios como **razão social**
- diferenças entre PF e PJ devem ser tratadas por **configuração de steps**, e não por duplicação excessiva de telas

---

# Regra principal de arquitetura

Sempre respeitar a arquitetura do projeto:

screen → hook → service → data source → api/mock → mapper → store

Nunca pular camadas.

Nunca colocar lógica de negócio diretamente em screen.

Nunca chamar API ou mock diretamente em screen ou hook.

---

# Como usar o AUTH como base

O módulo AUTH atual deve ser usado como referência para:

- arquitetura
- services existentes
- data sources existentes
- mocks existentes
- mappers existentes
- store existente
- validações existentes

O módulo AUTH atual NÃO deve ser usado como limitação de UI.

Ou seja:

- manter base técnica do AUTH
- refatorar a experiência de cadastro para step form

---

# Estratégia recomendada

A implementação deve priorizar:

- um fluxo de cadastro único
- steps configuráveis por tipo de conta
- compartilhamento máximo entre PF e PJ
- componentes reutilizáveis
- validação por etapa
- progress bar baseada na quantidade real de steps

Evitar:

- uma tela gigante para PF
- uma tela gigante para PJ
- duplicação de componentes
- duplicação de regras de validação

---

# Modelagem esperada

Preferir um motor de steps baseado em configuração.

Exemplo conceitual:

- steps de PF
- steps de PJ
- hook central controlando step atual
- renderer reutilizável para cada etapa

PF e PJ devem compartilhar a maior parte da estrutura.

As diferenças devem ficar concentradas em:

- definição dos steps
- campos específicos
- validações específicas

---

# Fluxo esperado PF

Fluxo sugerido para PF:

- escolher tipo PF
- nome completo
- CPF
- email
- telefone
- senha
- confirmar senha
- aceitar termos
- conta criada

---

# Fluxo esperado PJ

Fluxo sugerido para PJ:

- escolher tipo PJ
- razão social
- nome fantasia (se existir no fluxo atual)
- CNPJ
- email
- telefone
- nome do representante legal
- CPF do representante
- senha
- confirmar senha
- aceitar termos
- conta criada

Se algum campo opcional já existir hoje, manter a mesma regra.

---

# Progress bar

O step form deve possuir indicador de progresso.

Preferência:

- barra linear de progresso
- texto indicando etapa atual
- cálculo baseado no total real de etapas do fluxo selecionado

Exemplo:

Passo 3 de 8

A barra de progresso deve funcionar corretamente tanto para PF quanto para PJ.

---

# Regras de UI

A nova UI deve:

- manter consistência visual com o app atual
- respeitar componentes e padrões já usados no projeto
- continuar simples e clara
- funcionar bem em telas mobile
- evitar excesso de lógica dentro da screen

---

# Regras de validação

Reutilizar sempre que possível validações já existentes no projeto.

Exemplos:

- CPF
- CNPJ
- telefone

Funções existentes devem ser reaproveitadas.

Nunca recriar validações já implementadas sem necessidade.

Validação de senha e confirmação deve acontecer no fluxo de step form.

O usuário só deve avançar quando a etapa atual for válida.

---

# Regras de integração

O submit final do cadastro deve continuar usando a base técnica existente do AUTH.

Ou seja:

- reaproveitar service
- reaproveitar data source
- reaproveitar mock/backend switch
- reaproveitar mapper/store quando necessário

A refatoração deve facilitar a evolução futura sem quebrar o cadastro atual.

---

# Estrutura sugerida

Se necessário, criar elementos como:

- RegisterFlowScreen
- RegisterStepLayout
- RegisterStepProgress
- useRegisterFlow
- registerSteps configuration
- componentes de step reutilizáveis

Mas sempre respeitando a organização real já existente no projeto.

---

# Prioridades

Ordem de prioridade:

1. não quebrar o módulo AUTH
2. limitar mudanças ao fluxo de cadastro
3. manter arquitetura existente
4. reduzir duplicação entre PF e PJ
5. criar step form reutilizável e escalável

---

# Instrução final

Quando receber uma tarefa relacionada ao cadastro:

- alterar apenas o necessário dentro de AUTH
- preservar login, sessão e hidratação atuais
- usar AUTH como base técnica
- implementar o cadastro em step form com suporte a PF e PJ
- manter o código preparado para backend real e mocks
