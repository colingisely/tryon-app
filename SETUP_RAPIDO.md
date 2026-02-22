# ⚡ SETUP RÁPIDO (5 MINUTOS)

## Passo 1: Instalar dependências

```bash
npm install
```

Aguarde terminar (1-2 minutos).

---

## Passo 2: Obter chave do Gemini

1. Abrir: https://makersuite.google.com/app/apikey
2. Clicar "Create API Key"
3. Copiar a chave (algo como: `AIzaSyD...`)

---

## Passo 3: Criar arquivo .env.local

Na pasta do projeto, criar arquivo chamado `.env.local`:

```env
GOOGLE_API_KEY=COLE_SUA_CHAVE_AQUI
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Substituir `COLE_SUA_CHAVE_AQUI` pela chave que você copiou.

---

## Passo 4: Rodar servidor

```bash
npm run dev
```

Você verá:
```
> tryon-app@0.1.0 dev
> next dev

  ▲ Next.js 15.0.0
  - Local:        http://localhost:3000
```

---

## Passo 5: Abrir no navegador

Digitar na barra de endereço:

```
http://localhost:3000
```

---

## Passo 6: Testar

1. Clique em "Enviar sua foto"
2. Selecione uma selfie sua
3. Aguarde (até 60 segundos)
4. Veja a mágica! ✨

---

## ✅ Pronto!

Seu POC está funcionando!

---

## 🆘 Se algo der errado

### Erro: "Cannot find module '@google/generative-ai'"

```bash
npm install @google/generative-ai
npm run dev
```

### Erro: "GOOGLE_API_KEY is not defined"

Verificar se `.env.local` existe e tem a chave.

### Página branca

Pressionar F12 e ver console para erros.

---

**Dúvidas? Leia `README.md` ou `../LEIA_PRIMEIRO.md`**
