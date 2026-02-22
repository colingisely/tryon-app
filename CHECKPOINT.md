# CHECKPOINT - v2.0 (22/02/2026)

## Commit: `a6bdf27`

**Status: FUNCIONANDO - Testado e validado**

---

## Arquivos Principais

| Arquivo | Descrição |
|---------|-----------|
| `public/virtual-tryon.js` | Plugin v2.0 - Theme-adaptive, outline button, modal profissional |
| `app/api/tryon/route.ts` | Backend API - FASHN.ai quality mode, segmentation_free |

---

## Configuração do Backend (route.ts)

```json
{
  "model_name": "tryon-v1.6",
  "mode": "quality",
  "category": "auto",
  "segmentation_free": true,
  "garment_photo_type": "auto",
  "output_format": "png",
  "return_base64": false
}
```

---

## Funcionalidades Implementadas

### Plugin (virtual-tryon.js)
- Detecção automática do tema da loja (cores, border-radius, fontes)
- Botão outline/transparente "Provar em Mim" com ícone de cabide
- Modal com backdrop blur, animação slide-up/fade-out
- Ícones SVG (cabide, upload, câmera, download, retry, close)
- Fechamento: botão X, clique no overlay, tecla ESC
- Dropzone com drag & drop e texto amigável
- Preview da foto com botão de remover
- Barra de progresso animada durante geração
- Resultado com botões "Baixar" e "Nova Foto"
- Detecção de imagem: DOM selectors + JSON API fallback
- Responsivo (desktop + mobile)

### Backend (route.ts)
- FASHN.ai v1.6 modo quality (melhor preservação de corpo/mãos/rosto)
- segmentation_free: true (melhor textura de pele)
- Output PNG (máxima qualidade)
- Polling com timeout de 90 tentativas (3 min)
- CORS headers para cross-origin

---

## Deploy

- **Vercel**: https://tryon-app-tau.vercel.app
- **Plugin JS**: https://tryon-app-tau.vercel.app/virtual-tryon.js
- **API Endpoint**: https://tryon-app-tau.vercel.app/api/tryon
- **GitHub**: https://github.com/colingisely/tryon-app

---

## Shopify (theme.liquid)

```html
<!-- Virtual Try-On Plugin -->
<script 
  src="https://tryon-app-tau.vercel.app/virtual-tryon.js"
  data-shop="{{ shop.permanent_domain }}"
  data-api-endpoint="https://tryon-app-tau.vercel.app/api/tryon"
  defer>
</script>
```

Colar antes de `</body>` no `layout/theme.liquid`.

---

## Loja de Teste

- **URL**: https://tryonapp-2.myshopify.com
- **Senha**: tryonapp
- **Tema**: Horizon
- **Produto teste**: Sweter rosa estampa de gato (R$ 199,00)
- **Imagem produto**: `https://cdn.shopify.com/s/files/1/0797/0494/8974/files/sweater.webp?v=1771724060`

---

## Variáveis de Ambiente (Vercel)

- `FASHN_API_KEY`: Configurada no Vercel

---

## Resultado do Teste

- Tempo de resposta: ~10s (quality mode)
- Mãos preservadas corretamente
- Pele com textura natural
- Suéter rosa com estampa de gato aplicado corretamente
- Fundo preservado
