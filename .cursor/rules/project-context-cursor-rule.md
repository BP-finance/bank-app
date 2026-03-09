# CURSOR RULE

# Contexto Global do Projeto --- Aplicativo Bancário

Este projeto é um **aplicativo mobile bancário**.

O objetivo é construir um aplicativo financeiro moderno que futuramente
será integrado com a **API da Idez** para fornecer funcionalidades
bancárias reais.

Durante a fase atual de desenvolvimento, **mocks são utilizados para
simular o backend** e permitir validação de fluxos sem dependência de
infraestrutura externa.

------------------------------------------------------------------------

# Stack Tecnológica

O projeto utiliza:

-   Expo
-   React Native
-   TypeScript
-   Expo Router

------------------------------------------------------------------------

# Arquitetura do Projeto

O projeto segue uma arquitetura baseada em **módulos por feature**.

Cada funcionalidade do sistema deve existir dentro de sua própria
feature.

Exemplo:

features/ auth/ security/ pix/ transfers/ payments/

Cada feature deve possuir suas próprias camadas.

Estrutura esperada:

screens\
hooks\
services\
data\
mappers\
store

------------------------------------------------------------------------

# Fluxo de Arquitetura

Toda lógica do sistema deve respeitar o seguinte fluxo:

screen → hook → service → data source → api/mock → mapper → store

Responsabilidades:

Screen\
Responsável apenas pela interface e interação do usuário.

Hook\
Gerencia estado local e orquestra chamadas de services.

Service\
Contém regras de negócio.

DataSource\
Responsável por comunicação com API ou mocks.

API / Mock\
Implementação concreta da fonte de dados.

Mapper\
Transforma dados externos em modelos internos.

Store\
Responsável por manter estado global da aplicação.

------------------------------------------------------------------------

# Backend Futuro

O backend oficial será a **API da Idez**.

Essa API será responsável por funcionalidades bancárias como:

-   criação de contas
-   onboarding
-   KYC (Know Your Customer)
-   PIX
-   transferências
-   pagamentos
-   gestão de contas
-   autenticação financeira

O código do aplicativo deve ser desenvolvido de forma que **substituir
mocks pelo backend real seja simples**.

------------------------------------------------------------------------

# Uso de Mocks

Durante o desenvolvimento atual, dados são simulados utilizando mocks.

Os mocks existem para:

-   permitir desenvolvimento sem backend
-   validar fluxos da aplicação
-   testar navegação
-   simular estados da aplicação

Todas as chamadas de dados devem passar por **Data Sources**, que
permitem alternar entre:

-   backend real
-   mocks

Nunca acessar mocks diretamente na UI.

------------------------------------------------------------------------

# Regras de Desenvolvimento

O agente deve seguir obrigatoriamente as regras abaixo.

------------------------------------------------------------------------

## 1 --- Respeitar a Arquitetura

Nunca pular camadas.

Sempre seguir:

screen → hook → service → data source

------------------------------------------------------------------------

## 2 --- Não Misturar Responsabilidades

Evitar:

-   lógica de negócio na UI
-   chamadas de API em hooks
-   acesso direto à store dentro de screens

------------------------------------------------------------------------

## 3 --- Reutilizar Código Existente

Antes de criar algo novo:

-   verificar se já existe utilitário semelhante
-   verificar se já existe mapper
-   verificar padrões existentes no projeto

------------------------------------------------------------------------

## 4 --- Não Criar Arquiteturas Paralelas

Sempre seguir o padrão já existente no projeto.

Não introduzir novas estruturas sem necessidade.

------------------------------------------------------------------------

## 5 --- Preparação para Backend Real

Mesmo usando mocks, o código deve ser preparado para integração futura
com backend real.

Evitar dependência direta de mocks.

------------------------------------------------------------------------

# Objetivo do Projeto

Construir um aplicativo bancário:

-   modular
-   escalável
-   seguro
-   fácil de manter

O código deve priorizar:

-   organização
-   previsibilidade
-   isolamento de features
-   facilidade de manutenção

------------------------------------------------------------------------

# Comportamento Esperado do Agente

Antes de gerar código o agente deve:

1.  analisar a arquitetura existente
2.  seguir padrões já utilizados
3.  reutilizar utilitários do projeto
4.  evitar modificar código fora do escopo solicitado

Caso exista dúvida sobre implementação:

-   analisar outras features do projeto
-   replicar padrões existentes

A arquitetura do projeto é sempre a **fonte da verdade**.
