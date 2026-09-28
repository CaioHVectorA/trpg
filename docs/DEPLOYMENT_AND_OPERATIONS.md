# Plataforma Tormenta RPG — Guia de Deploy, Infraestrutura e Operações

> Manual completo para execução local em ambiente de desenvolvimento, conteinerização via Docker e deploy em produção na Vercel com banco de dados PostgreSQL / Supabase.

---

## ⚙️ 1. Variáveis de Ambiente

As variáveis de ambiente configuram a conexão com o banco de dados e o comportamento da aplicação em produção:

```env
# URL de conexão do Banco de Dados (SQLite Local ou PostgreSQL em Produção)
DATABASE_URL="file:./dev.db"

# URL base da aplicação
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Ambiente de execução (development | production | test)
NODE_ENV="development"
```

---

## 💻 2. Execução Local (SQLite Zero-Friction)

O projeto está configurado por padrão para funcionar de forma instantânea sem necessidade de instalar ou rodar um servidor de banco de dados externo.

### Passo a Passo:

```bash
# 1. Instalar dependências
npm install

# 2. Gerar o cliente Prisma tipado
npm run prisma:generate

# 3. Sincronizar o schema com o banco SQLite local (dev.db)
npm run prisma:push

# 4. Popular o banco com os dados canônicos de Arton (12 entidades)
npm run prisma:seed

# 5. Iniciar o servidor de desenvolvimento
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🚀 3. Deploy em Produção (Vercel + Supabase PostgreSQL)

A transição de SQLite local para PostgreSQL gerenciado no Supabase requer apenas a alteração da string de conexão e do provedor no Prisma.

### Passo 1: Criar o Projeto no Supabase
1. Acesse [Supabase.com](https://supabase.com) e crie um novo projeto.
2. Em **Project Settings -> Database**, copie a `Transaction Connection String` ou `Direct Connection String`.

### Passo 2: Atualizar o Schema do Prisma (`prisma/schema.prisma`)
Altere o bloco `datasource`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Passo 3: Executar Migrações e Seed na Nuvem
```bash
# Defina a URL do Supabase no seu terminal ou arquivo .env
export DATABASE_URL="postgresql://postgres:[SUA-SENHA]@db.[REF].supabase.co:5432/postgres?schema=public"

# Sincronize as tabelas no Supabase
npm run prisma:push

# Popule o banco remoto com a seed de Arton
npm run prisma:seed
```

### Passo 4: Deploy na Vercel
1. Conecte o repositório GitHub na [Vercel](https://vercel.com).
2. Adicione a variável de ambiente `DATABASE_URL` nas configurações do projeto na Vercel.
3. Configure o comando de Build: `npm run prisma:generate && next build`.
4. Clique em **Deploy**.

---

## 🐳 4. Conteinerização com Docker

Para ambientes baseados em containers (AWS ECS, Google Cloud Run, Railway, Render), utilize a configuração multi-stage otimizada abaixo:

### `Dockerfile`:
```dockerfile
# ----- Camada 1: Dependências -----
FROM node:20-alpine AS deps
RUN apk add --no-libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ----- Camada 2: Build -----
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# ----- Camada 3: Runner -----
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

USER nextjs
EXPOSE 3000
ENV PORT=3000

CMD ["node", "server.js"]
```

---

## 🧪 5. Verificação e Testes de Integridade

Antes de qualquer deploy em produção, garanta que a suíte completa de testes e o build estático passem sem erros:

```bash
# Executa a suíte completa de 428+ testes unitários e e2e
npm test

# Valida a compilação do Next.js App Router e checagem de tipos TypeScript
npm run build
```
