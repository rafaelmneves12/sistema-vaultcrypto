# VaultX Portfolio

PROMPT 1 — Design System + Arquitetura Base + Landing Page

Crie o projeto "VaultX" — uma plataforma SaaS premium de gerenciamento de portfólio de criptomoedas (NÃO é uma exchange: não há compra, venda ou transferência de ativos, apenas rastreamento e análise).

STACK TÉCNICA (fixar para todo o projeto):
- React + TypeScript + Vite
- Tailwind CSS
- shadcn/ui para componentes
- Framer Motion para animações e transições
- Recharts para gráficos e visualização de dados
- Lucide React para ícones
- Totalmente responsivo (mobile, tablet, desktop)

ARQUITETURA (fixar para todo o projeto — muito importante):
- Este é um projeto 100% FRONT-END. NÃO crie backend, banco de dados, servidor de autenticação nem integração com nenhum BaaS (Firebase, Supabase, Appwrite, PocketBase, Clerk, Auth0, etc).
- Toda a persistência de dados da aplicação (conta de usuário, sessão de login, portfólio, watchlist, preferências, tema, idioma, notificações) deve ser feita via LocalStorage do navegador.
- A única fonte de dados externa é a CoinCap REST API v3, usada exclusivamente para dados de mercado de criptomoedas (preços, market cap, volume, ranking, supply, histórico).
- Crie um serviço centralizado e reutilizável para a API (ex: src/services/coincap.ts) com:
  - Base URL: https://rest.coincap.io/v3/
  - Autenticação via header: Authorization: Bearer <API_KEY>
  - A API key deve vir de variável de ambiente (.env, ex: VITE_COINCAP_API_KEY), nunca hardcoded direto no código
  - Funções reutilizáveis para: listar ativos, buscar detalhes de um ativo, buscar histórico de preços, buscar ranking/mercado
  - Tratamento de erro e estados de loading padronizados
- Crie também um pequeno módulo utilitário para LocalStorage (ex: src/lib/storage.ts) com funções get/set/remove tipadas, que será reutilizado nos próximos prompts para salvar conta, sessão, portfólio, watchlist e preferências.

DESIGN SYSTEM:
- Tema escuro (dark theme) como padrão, com azul como cor primária da marca
- Inspiração visual: clareza da Stripe, elegância da Linear, polish da Vercel, usabilidade da Coinbase
- Tipografia moderna, hierarquia clara, bom espaçamento (whitespace generoso)
- Micro-animações sutis: hover states, fade-ins ao rolar a página (scroll reveal), transições suaves entre estados
- Componentes com bordas suaves, glassmorphism sutil ou cards com leve elevação (shadow), gradientes discretos em azul
- Crie um arquivo de design tokens (cores, espaçamentos, tipografia) reutilizável em todo o projeto

TAGLINE: "Track. Analyze. Grow."

CONSTRUA A LANDING PAGE com estas seções, nesta ordem:

1. Header fixo com logo "VaultX", navegação (Dashboard, Portfolio, Market, Learn) e botões de "Sign In" / "Get Started"

2. Hero Section:
   - Headline: "Manage Your Crypto Portfolio with Confidence"
   - Subheadline: "Track live cryptocurrency prices, organize your holdings, analyze performance, and learn everything about the crypto market — all in one place."
   - Botões: "Get Started" (primário) e "Explore Dashboard" (secundário)
   - Adicione um elemento visual de destaque (mockup do dashboard, gráfico animado ou ilustração abstrata relacionada a dados financeiros)

3. Features Section (grid de 5 cards com ícone, título e descrição):
   - Live Market Tracking — monitore preços em tempo real
   - Portfolio Analytics — entenda a performance com gráficos interativos
   - Watchlist — salve suas criptomoedas favoritas
   - Educational Hub — aprenda fundamentos de cripto, blockchain e segurança
   - Beautiful Dashboard — interface moderna e responsiva

4. How It Works (4 passos numerados, com ícones e animação sequencial ao entrar na viewport):
   - Passo 1: Crie sua conta
   - Passo 2: Adicione suas criptomoedas
   - Passo 3: Acompanhe preços e performance
   - Passo 4: Aprenda, analise e melhore suas decisões

5. FAQ Preview (accordion com 3-4 perguntas de exemplo sobre gerenciamento de portfólio, segurança e preços)

6. Final CTA:
   - "Ready to organize your crypto investments?"
   - "Create your free account today."
   - Botão "Get Started"

7. Footer completo com colunas: Product (Dashboard, Portfolio, Market, Learn), Company (About, Pricing, Contact), Resources (Help Center, FAQ, Documentation), Legal (Privacy Policy, Terms of Service, Cookie Policy)

Nesta etapa a landing page pode usar dados estáticos de exemplo no mockup visual (ainda não precisa consumir a API real). O importante aqui é deixar a base do serviço de API e do storage prontos para os próximos prompts.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://vaultx-hub.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/cee25b05-7da0-443a-88b4-bbfe5e66277c).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
