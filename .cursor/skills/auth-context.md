# CURSOR SKILL

# Contexto do Módulo AUTH

Este documento descreve o **contexto e as regras do módulo AUTH** do
aplicativo bancário.

O módulo AUTH é responsável por todo o fluxo de **autenticação, cadastro
e sessão do usuário**.

Ele já está **totalmente implementado e funcionando**.

O agente deve usar este módulo como **referência de arquitetura**, mas
**não deve modificá‑lo sem necessidade**.

------------------------------------------------------------------------

# Responsabilidades do Módulo AUTH

O módulo AUTH é responsável por:

-   cadastro de usuário PF
-   cadastro de usuário PJ
-   login
-   recuperação de senha (forgot password)
-   logout
-   bootstrap de sessão
-   hidratação de sessão via `/auth/me`
-   controle de navegação baseado em `onboardingStatus`

Este módulo controla o estado de autenticação da aplicação.

------------------------------------------------------------------------

# Arquitetura do Módulo

O módulo AUTH segue a arquitetura padrão do projeto baseada em camadas.

Fluxo obrigatório:

screen → hook → service → data source → api/mock → mapper → store

Cada camada possui responsabilidades específicas.

------------------------------------------------------------------------

# Estrutura Esperada

Exemplo simplificado da estrutura:

auth/

screens\
hooks\
services\
data\
mappers\
store

Cada parte do módulo possui responsabilidade clara.

------------------------------------------------------------------------

# Data Sources

Existe uma interface principal chamada:

AuthDataSource

Implementações existentes:

backendAuthDataSource\
mockAuthDataSource

O projeto utiliza uma factory para decidir qual usar.

Factory:

authDataSourceFactory()

Controle de ambiente:

USE_AUTH_MOCKS

Fluxo:

screen\
→ hook\
→ service\
→ dataSourceFactory\
→ backend ou mock

Nunca acessar diretamente uma implementação específica.

Sempre usar a factory.

------------------------------------------------------------------------

# Sistema de Mocks

O módulo AUTH possui cenários de mock para testes.

Cenários disponíveis:

11111111111 → aprovado\
22222222222 → pendente\
33333333333 → em_analise\
44444444444 → documentos_pendentes\
55555555555 → rejeitado\
00000000000 → erro

Senha padrão para testes:

123456

Esses mocks permitem validar diferentes estados do onboarding.

------------------------------------------------------------------------

# Validações Disponíveis

O projeto já possui utilitários para validação e formatação.

Documentos:

sanitizeDocumento\
formatCPF\
formatCNPJ\
isValidCPF\
isValidCNPJ

Telefone:

sanitizePhone\
formatPhone\
isValidPhone

Essas funções devem ser reutilizadas.

Nunca recriar validações existentes.

------------------------------------------------------------------------

# Navegação

A navegação depende do campo:

onboardingStatus

Esse campo define qual fluxo o usuário deve seguir após autenticação.

Exemplo:

-   onboarding incompleto
-   conta em análise
-   conta ativa

A navegação é controlada pelo **Expo Router**.

------------------------------------------------------------------------

# Regras Importantes

O agente deve seguir estas regras.

## 1 --- Não modificar AUTH sem necessidade

O módulo AUTH já está funcional.

Alterações só devem ocorrer se:

-   existir bug
-   for explicitamente solicitado

------------------------------------------------------------------------

## 2 --- Usar AUTH como referência

Ao criar novos módulos (exemplo: SECURITY), o agente deve usar AUTH como
**modelo de arquitetura**.

------------------------------------------------------------------------

## 3 --- Não duplicar lógica

Se uma funcionalidade já existe no AUTH:

-   reutilizar
-   importar
-   compartilhar

Nunca duplicar código.

------------------------------------------------------------------------

# Relação com Outros Módulos

Outros módulos podem depender do estado do AUTH.

Exemplos:

-   SECURITY
-   PIX
-   TRANSFERS
-   PAYMENTS

Esses módulos podem usar:

-   sessão do usuário
-   informações do usuário autenticado
-   estado de autenticação

Mas não devem alterar o funcionamento interno do AUTH.

------------------------------------------------------------------------

# Comportamento Esperado do Agente

Antes de modificar qualquer parte do AUTH:

1.  verificar se a alteração é realmente necessária
2.  analisar impacto na autenticação
3.  garantir que a arquitetura existente seja preservada

O módulo AUTH é considerado **a base do sistema de autenticação do
aplicativo bancário**.
