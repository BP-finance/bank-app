# CURSOR SKILL

# Arquitetura do Módulo AUTH

Este documento define o contexto, arquitetura e regras obrigatórias do módulo AUTH do aplicativo bancário.

O módulo AUTH é responsável pela identidade e sessão do usuário.

Ele é considerado a base de autenticação do sistema.

Este documento também define como o agente deve gerar código relacionado ao AUTH.

Todas as implementações devem respeitar este documento.

---

# Objetivo do Módulo AUTH

O módulo AUTH é responsável por:

- cadastro de usuário PF
- cadastro de usuário PJ
- login
- recuperação de senha
- logout
- gerenciamento de sessão
- bootstrap de sessão
- hidratação da sessão via /auth/me
- controle de navegação baseado no onboardingStatus

O módulo AUTH mantém o estado de autenticação global da aplicação.

---

# Escopo do AUTH

O AUTH cuida apenas de identidade e sessão.

Ele NÃO deve implementar:

- PIN transacional
- biometria
- autorização de operações financeiras
- validação de transferências

Essas funcionalidades pertencem ao módulo SECURITY.

---

# Relação entre módulos

Dependências permitidas:

AUTH → módulo base

SECURITY → depende de AUTH

PIX → depende de AUTH

TRANSFERS → depende de AUTH e SECURITY

PAYMENTS → depende de AUTH e SECURITY

Nenhum módulo deve alterar a lógica interna do AUTH.

---

# Arquitetura em Camadas

O projeto segue arquitetura em camadas.

Fluxo obrigatório:

screen  
→ hook  
→ service  
→ datasource  
→ mapper  
→ session  
→ store

Nenhuma camada pode pular outra camada.

---

# Responsabilidade das Camadas

screen

Responsável apenas pela interface.

Não deve conter lógica de negócio.

Não deve acessar datasource diretamente.

---

hook

Responsável por orquestrar chamadas da UI.

Hooks chamam services.

Hooks nunca chamam datasource diretamente.

---

service

Contém lógica de negócio.

Services chamam datasources.

Services nunca acessam UI.

---

datasource

Responsável por comunicação externa.

Exemplos:

API  
mock

Datasources nunca devem conter lógica de UI.

---

mapper

Responsável por converter dados de API para domínio.

UI nunca deve consumir dados diretamente da API.

---

session

Responsável por gerenciar sessão do usuário.

Inclui:

- armazenamento de tokens
- restauração de sessão
- limpeza de sessão

---

store

Responsável por manter estado global.

---

# Estrutura do Módulo

auth/

screens  
hooks  
services  
data  
mappers  
session  
store

---

# Data Sources

Existe uma interface principal:

AuthDataSource

Implementações:

backendAuthDataSource  
mockAuthDataSource

A escolha é feita por:

authDataSourceFactory()

Controle por ambiente:

USE_AUTH_MOCKS

Nunca acessar diretamente uma implementação.

---

# Sistema de Mocks

Mocks existem para permitir desenvolvimento sem backend.

Mocks devem:

- respeitar o contrato do datasource
- retornar dados realistas
- simular erros
- simular estados do usuário

Mocks não devem retornar formatos diferentes do backend.

---

# Cenários de Mock

CPF usado para testes:

11111111111 → aprovado  
22222222222 → pendente  
33333333333 → em análise  
44444444444 → documentos pendentes  
55555555555 → rejeitado  
00000000000 → erro

Senha padrão:

123456

---

# Session Manager

O módulo AUTH possui um sessionManager responsável por:

- salvar tokens
- recuperar tokens
- restaurar sessão
- limpar sessão

O sessionManager é o único local que manipula sessão.

---

# Token Storage

Tokens devem ser armazenados em storage seguro.

Preferencialmente:

SecureStore  
Keychain

Tokens nunca devem ser armazenados em AsyncStorage.

---

# Bootstrap de Sessão

Fluxo ao abrir o aplicativo:

1 verificar tokens salvos  
2 restaurar sessão  
3 chamar /auth/me  
4 validar usuário  
5 decidir rota

Se sessão inválida:

- limpar tokens
- redirecionar para login

---

# Padronização de Erros

Erros devem ser padronizados.

Exemplo:

AuthErrorCode

INVALID_CREDENTIALS  
ACCOUNT_BLOCKED  
ACCOUNT_PENDING  
DOCUMENTS_REQUIRED  
SESSION_EXPIRED  
NETWORK_ERROR  
UNKNOWN_ERROR

A UI nunca deve depender diretamente da resposta da API.

---

# HTTP Client

A aplicação deve possuir cliente HTTP centralizado.

Responsabilidades:

- baseURL
- headers padrão
- Authorization automático
- interceptors
- tratamento de erro

O cliente HTTP deve suportar refresh token no futuro.

---

# Regras para o Agente

Antes de modificar o módulo AUTH o agente deve:

1 analisar impacto da mudança  
2 verificar se já existe funcionalidade equivalente  
3 evitar duplicação de código  
4 preservar arquitetura em camadas

---

# Proibições

O agente NÃO deve:

- acessar datasource diretamente da screen
- implementar lógica de negócio em screen
- ignorar hooks ou services
- alterar contratos de datasource sem necessidade
- quebrar compatibilidade com mocks

---

# Regras para novos módulos

Novos módulos devem seguir a mesma arquitetura.

Estrutura padrão:

module/

screens  
hooks  
services  
data  
mappers  
store

AUTH deve ser usado como referência.

---

# Comportamento Esperado do Agente

O agente deve:

- respeitar arquitetura
- manter compatibilidade com mocks
- preservar contratos existentes
- evitar refatorações desnecessárias

AUTH é considerado a fundação do sistema de autenticação do aplicativo bancário.
