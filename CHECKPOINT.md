# CHECKPOINT v2.5 - Try-On App
**Data**: 22/02/2026
**Commit**: c2010b3
**Tag**: v2.5

## Estado Atual do Projeto

### Frontend (virtual-tryon.js)
- Plugin JavaScript standalone para Shopify
- Detecta automaticamente tema da loja (cores, bordas, fontes)
- Botão "Provar em Mim" estilo outline (discreto, secundário)
- Modal com animação slide-up, backdrop blur
- Fechamento: X, overlay click, ESC
- Upload drag & drop com preview
- Toggle Rápido/Premium com auto-seleção por preço do produto
- Tela de resultado: foto gerada + botões Baixar/Nova Foto
- Lightbox fullscreen com X e click para fechar
- Textos: "Foto de corpo inteiro" + "PNG ou JPEG, máx. 10 MB"
- Mensagens de progresso adaptativas por modo

### Backend (route.ts)
- Endpoint: /api/tryon
- Detecção de categoria via GPT (tops/bottoms/one-pieces)
- Prompt de styling gerado por IA
- Modo fast: FASHN v1.6 Quality (~15s, 1 crédito)
- Modo premium: Try-On Max (~50s, 4 créditos) com fallback para v1.6
- garment_photo_type: flat-lay (para fotos de produto Shopify)
- Output: PNG (máxima qualidade)

### Infraestrutura
- GitHub: github.com/colingisely/tryon-app
- Vercel: tryon-app-tau.vercel.app
- Shopify: tryonapp-2.myshopify.com (senha: tryonapp)
- Tema: Horizon

### Variáveis de Ambiente (Vercel)
- FASHN_API_KEY: configurada
- OPENAI_API_KEY: configurada

### Script na Shopify (theme.liquid antes de </body>)
```html
<script 
  src="https://tryon-app-tau.vercel.app/virtual-tryon.js"
  data-shop="{{ shop.permanent_domain }}"
  data-api-endpoint="https://tryon-app-tau.vercel.app/api/tryon"
  defer>
</script>
```

### Pendências / Próximos Passos
- Estratégia de custos: modo rápido como padrão, premium para casos especiais
- Ideia: modo premium interno para lojistas gerarem fotos profissionais
- Correções UI pendentes da v2.2 (X do lightbox, esconder header no resultado)
- Melhorar preservação do produto na IA (detalhes, caimento, textura)

### Histórico de Versões
- v1.0: Plugin básico com FASHN.ai
- v2.0: Redesign completo UX/UI + adaptação ao tema
- v2.1: Fix resultado como foco, download, lightbox, textos
- v2.2: Fix lightbox X vs modal X, esconder header no resultado
- v2.3: Detecção de categoria via GPT + flat-lay
- v2.4: Try-On Max premium + loading UX
- v2.5: Toggle Rápido/Premium + auto preço + roteamento inteligente
