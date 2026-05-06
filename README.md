# PFC


## Como Executar o Projeto

### Pré-requisitos

- Node.js (versão LTS)  
- Git  
- Visual Studio Code  


### Clonar o Repositório

```bash
git clone <URL_DO_REPOSITORIO>
cd <NOME_DO_PROJETO>
```
### Configurar o arquivo `.env`
Crie o arquivo `.env` na pasta `API/` com as variáveis abaixo:

```bash
PORT=
SUPABASE_URL=
SUPABASE_ANON_KEY=
EMAIL_FROM=
FRONTEND_URL=
JWT_SECRET=
BCRYPT_SALT_ROUNDS=
SENDGRID_API_KEY= 
```

Explicação resumida:
- `PORT`: porta do servidor (ex.: `3000`).
- `SUPABASE_URL` / `SUPABASE_ANON_KEY`: conexão com o banco (ou substitua pelas suas configurações de PostgreSQL).
- `EMAIL_FROM`: remetente dos e-mails (verificação / OTP / reset).
- `FRONTEND_URL`: URL do frontend (para redirecionamentos).
- `JWT_SECRET`: chave para assinar tokens JWT (mantenha secreta).
- `BCRYPT_SALT_ROUNDS`: rounds do `bcrypt` (ex.: `10` ou `12`).
- `SENDGRID_API_KEY`: chave para envio de e-mails (opcional; substitua pelo provedor que usar).

### Instalar dependências
No terminal (na raiz do projeto ou em `API/`):
```bash
npm install
npm run dev 
```

### Após iniciar o servidor, acesse no navegador: 
```bash
http://localhost:3000
```
---
## Visão Geral

Este projeto implementa um sistema de autenticação de usuários com foco em segurança e controle de acesso.

O sistema contempla três funcionalidades principais:

- Cadastro de usuários  
- Autenticação com dois fatores (2FA)  
- Redefinição de senha  

O objetivo é garantir que apenas usuários autorizados tenham acesso à aplicação, protegendo dados sensíveis e reduzindo riscos de uso indevido.



## Funcionalidades

### Cadastro de Usuários

- Criação de conta com nome, e-mail e senha  
- Armazenamento seguro de senha utilizando hash (bcrypt)  
- Validações aplicadas:
  - Formato de e-mail  
  - Requisitos mínimos de senha  
  - Prevenção de duplicidade de contas  


### Autenticação com Dois Fatores (2FA)

- Login com e-mail e senha  
- Envio de código OTP (código temporário)  
- Validação obrigatória do código para acesso  


### Reset de Senha

- Envio de link ou token temporário  
- Token com validade e uso único  
- Definição de uma nova senha segura  


## Tecnologias Utilizadas

### Frontend
- React  
- TailwindCSS  

### Backend
- Node.js  
- Express  

### Banco de Dados
- PostgreSQL (via Supabase)  

### Segurança
- bcrypt  
- JWT  
- SendGrid  


## Fluxo do Sistema

O sistema contempla os seguintes fluxos:

- Cadastro seguido de login com 2FA  
- Login com validação em dois fatores  
- Recuperação e redefinição de senha  





