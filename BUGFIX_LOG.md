# Bug Fix Log

## 2026-02-22 - Erro 400 ao clicar em "Experimentar"

### Problema
Quando o usuário clicava no botão "Experimentar" no modal do Virtual Try-On, a API retornava erro 400 (Bad Request).

### Causa Raiz
O plugin JavaScript (`public/virtual-tryon.js`) estava enviando os dados com o campo `userImage`, mas o backend (`app/api/tryon/route.ts`) esperava o campo `image`.

**Código problemático (linha 562):**
```javascript
body: JSON.stringify({
    userImage: this.userImage,  // ❌ Nome errado
    productImage: this.productImage,
})
```

**Backend esperava:**
```typescript
const { image, productImage } = await req.json();
```

### Solução
Alterado o nome do campo de `userImage` para `image` no plugin.

**Código corrigido:**
```javascript
body: JSON.stringify({
    image: this.userImage,  // ✅ Nome correto
    productImage: this.productImage,
})
```

### Commit
- **SHA**: `5816b60`
- **Mensagem**: "Fix: Correct field name from userImage to image in API request"
- **Arquivo alterado**: `public/virtual-tryon.js` (linha 562)

### Validação
- ✅ Deploy bem-sucedido no Vercel
- ✅ API responde corretamente com imagens de teste
- ⏳ Aguardando teste do usuário na loja Shopify

### Lições Aprendidas
1. Sempre verificar a consistência de nomes de campos entre frontend e backend
2. Usar TypeScript no frontend poderia ter detectado esse erro em tempo de desenvolvimento
3. Adicionar testes de integração para validar contratos de API

### Próximos Passos
- [ ] Validar funcionamento completo com foto real na loja Shopify
- [ ] Considerar adicionar validação de schema (ex: Zod) no backend
- [ ] Documentar formato esperado da API em um arquivo separado
