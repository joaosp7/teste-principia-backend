# Teste Backend Principia

Este projeto é uma API desenvolvida com NestJS e TypeORM para gerenciar itens. Ele utiliza um banco de dados PostgreSQL, orquestrado via Docker Compose. Este projeto foi desenvolvido como parte de um teste técnico.

##  Primeiros Passos

Siga estas instruções para configurar e executar o projeto em seu ambiente local.

### Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas em sua máquina:
- Node.js (LTS recomendado)
- npm 
- Docker e Docker Compose

### 1) Instalar as Dependências do Projeto

No diretório raiz do projeto, execute:

```bash
npm install
```
### 2) Crie o arquivo env na raiz do projeto

Certifique-se de ter um arquivo .env na raiz do projeto contendo todos os campos demonstrados no arquivo .env.exemple 

Importante: o projeto não ira rodar se os campos obrigatórios da env não estiverem preenchidos corretamente.

### 3) Iniciar o Banco de Dados com Docker Compose
Com o arquivo .env no diretório, execute o seguinte comando no terminal 
```bash
docker compose up -d
```
Garanta que não há nenhuma aplicação utilizando a porta 5432, pois é a porta utilizada pelo banco.
Se precisar verificar pelo terminal que o container esta de pé, execute:
```bash
docker ps
```

### 4) Executar as Migrations do Banco de Dados
Após o banco de dados estar ativo, execute as migrations para criar o esquema e as tabelas necessárias:

```bash
npm run migration:run
```
### 5) Iniciar a Aplicação em Modo de Produção

Ainda em seu terminal, execute o comando:
```bash
npm run start:prod
```

Isso irá transpilar o conteúdo em TS para JS e rodar a aplicação. Ela deve subir na porta 3000 ou outra porta especificada no .env

Um guia da API com as rotas e suas opções podem ser encontradas em sua documentação Swagger. Para isso acesse em seu navegador, com a aplicação de pé:

```
http://localhost:{PORT}/api
```


### 6) (Opcional) Executar os Testes

Afim de executar os testes construidos para a aplicação, rode em seu terminal:

```bash
npm run test
```


