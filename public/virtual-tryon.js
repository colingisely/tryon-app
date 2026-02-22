/**
 * Virtual Try-On Plugin for Shopify
 * Professional virtual fitting room experience
 */
(function () {
    'use strict';

    // ─── Helpers ──────────────────────────────────────────────────────────────

    function fileToBase64(file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function (e) { resolve(e.target.result); };
            reader.onerror = function () { reject(new Error('Falha ao ler o arquivo.')); };
            reader.readAsDataURL(file);
        });
    }

    function queryFirst(selectors, context) {
        context = context || document;
        for (var i = 0; i < selectors.length; i++) {
            var el = context.querySelector(selectors[i]);
            if (el) return el;
        }
        return null;
    }

    // ─── Main Class ───────────────────────────────────────────────────────────

    class VirtualTryOn {
        constructor(config) {
            this.config = config;
            this.productImage = null;
            this.userImage = null;
            this.modal = null;
            this._stylesInjected = false;

            if (this.isProductPage()) {
                this.init();
            }
        }

        isProductPage() {
            if (window.Shopify && window.Shopify.product) return true;
            if (
                window.ShopifyAnalytics &&
                window.ShopifyAnalytics.meta &&
                window.ShopifyAnalytics.meta.page &&
                window.ShopifyAnalytics.meta.page.pageType === 'product'
            ) return true;
            return /\/products\//.test(window.location.pathname);
        }

        init() {
            this.injectStyles();
            this.createTryOnButton();
        }

        injectStyles() {
            if (this._stylesInjected) return;
            this._stylesInjected = true;

            var style = document.createElement('style');
            style.id = 'vto-styles';
            style.textContent = `
        /* Button */
        .vto-button {
          display: block;
          width: 100%;
          margin-bottom: 10px;
          padding: 14px 16px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          text-align: center;
          transition: background 0.2s;
        }
        .vto-button:hover { background: #333; }

        /* Overlay */
        .vto-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.7);
          z-index: 999998;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          animation: fadeIn 0.2s ease;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* Modal */
        .vto-modal {
          position: relative;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          padding: 28px 24px;
          overflow-y: auto;
          animation: slideUp 0.25s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Close button */
        .vto-close {
          position: absolute;
          top: 12px;
          right: 12px;
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
          line-height: 1;
          padding: 4px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          transition: background 0.15s;
        }
        .vto-close:hover { background: #f0f0f0; }

        /* Title */
        .vto-title {
          margin: 0 0 8px;
          font-size: 22px;
          font-weight: 700;
          color: #000;
        }
        .vto-subtitle {
          margin: 0 0 24px;
          font-size: 14px;
          color: #666;
          line-height: 1.5;
        }

        /* Product thumbnail */
        .vto-product-thumb {
          display: block;
          max-height: 100px;
          border-radius: 8px;
          margin: 0 auto 24px;
          object-fit: contain;
        }

        /* Drop Zone */
        .vto-dropzone {
          border: 2px dashed #d0d0d0;
          border-radius: 10px;
          padding: 32px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          background: #fafafa;
          position: relative;
        }
        .vto-dropzone.vto-drag-over {
          border-color: #000;
          background: #f0f0f0;
        }
        .vto-dropzone-icon {
          font-size: 40px;
          margin-bottom: 12px;
          display: block;
          color: #999;
        }
        .vto-dropzone-text {
          font-size: 15px;
          color: #333;
          margin: 0 0 4px;
          font-weight: 500;
        }
        .vto-dropzone-hint {
          font-size: 13px;
          color: #999;
          margin: 0;
        }
        .vto-file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        /* Preview */
        .vto-preview-wrap {
          display: none;
          position: relative;
          margin-bottom: 20px;
        }
        .vto-preview-wrap.vto-visible { display: block; }
        .vto-preview-img {
          width: 100%;
          max-height: 300px;
          object-fit: contain;
          border-radius: 10px;
          background: #f5f5f5;
        }
        .vto-preview-remove {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0,0,0,0.6);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          cursor: pointer;
          font-size: 16px;
        }

        /* Generate button */
        .vto-generate-btn {
          display: block;
          width: 100%;
          margin-top: 20px;
          padding: 15px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .vto-generate-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .vto-generate-btn:not(:disabled):hover { background: #333; }

        /* Progress */
        .vto-progress-wrap {
          display: none;
          margin-top: 20px;
        }
        .vto-progress-wrap.vto-visible { display: block; }
        .vto-progress-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
          text-align: center;
        }
        .vto-progress-track {
          height: 4px;
          background: #e0e0e0;
          border-radius: 99px;
          overflow: hidden;
        }
        .vto-progress-bar {
          height: 100%;
          width: 0%;
          background: #000;
          border-radius: 99px;
          transition: width 0.4s ease;
        }

        /* Result */
        .vto-result-wrap {
          display: none;
          margin-top: 24px;
        }
        .vto-result-wrap.vto-visible { display: block; }
        .vto-result-img {
          width: 100%;
          max-height: 500px;
          object-fit: contain;
          border-radius: 10px;
          background: #f5f5f5;
        }
        .vto-result-actions {
          display: flex;
          gap: 10px;
          margin-top: 16px;
        }
        .vto-result-actions a,
        .vto-result-actions button {
          flex: 1;
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
        }
        .vto-btn-download {
          background: #000;
          color: #fff;
          border: none;
        }
        .vto-btn-retry {
          background: #fff;
          color: #000;
          border: 1px solid #d0d0d0;
        }
        .vto-btn-retry:hover { background: #f5f5f5; }

        /* Error */
        .vto-error {
          display: none;
          margin-top: 16px;
          padding: 12px 16px;
          background: #fff5f5;
          border: 1px solid #ffdddd;
          border-radius: 8px;
          font-size: 13px;
          color: #d00;
          text-align: center;
        }
        .vto-error.vto-visible { display: block; }

        /* Mobile responsive */
        @media (max-width: 640px) {
          .vto-modal {
            max-width: 100%;
            max-height: 95vh;
            padding: 24px 20px;
          }
          .vto-title { font-size: 20px; }
          .vto-result-img { max-height: 400px; }
        }
      `;
            document.head.appendChild(style);
        }

        createTryOnButton() {
            var formSelectors = [
                'form[action*="/cart/add"]',
                'form.product-form',
                'form[data-type="add-to-cart-form"]',
                '#product-form',
                '.product__form',
            ];
            var addBtnSelectors = [
                'button[name="add"]',
                'button.product-form__submit',
                'button[data-add-to-cart]',
                'button.add-to-cart',
                'button[type="submit"]',
            ];

            var form = queryFirst(formSelectors);
            if (!form) return;

            var addBtn = queryFirst(addBtnSelectors, form);
            if (!addBtn) return;

            if (document.querySelector('.vto-button')) return;

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'vto-button';
            btn.textContent = 'Provar em Mim';
            btn.setAttribute('aria-label', 'Abrir provador virtual');

            btn.addEventListener('click', this.openModal.bind(this));

            addBtn.parentNode.insertBefore(btn, addBtn);
        }

        findProductImage() {
            // Strategy 1: Try common CSS selectors (works for most themes)
            var selectors = [
                '.product__media img',
                '.product-single__photo img',
                '.product-image-main img',
                '[data-product-featured-image]',
                '.product__main-photos img',
                'img[data-image-id]',
                '.product-photo-container img',
                '.product__image img',
                'img.product-featured-image',
                '.main-product-image img',
                '.product-gallery img',
                // Horizon theme selectors
                'media-gallery img',
                '.media-gallery img',
                '[data-media-gallery] img',
                '.product-media-container img',
                'section img[src*="cdn.shopify"]',
                'main img[src*="cdn.shopify"]',
                // Generic fallback
                'img[src*="products"]',
                'img[src*="files"]',
            ];

            for (var i = 0; i < selectors.length; i++) {
                var img = document.querySelector(selectors[i]);
                if (img) {
                    var src = img.currentSrc || img.src;
                    if (src && src.indexOf('cdn.shopify') !== -1) {
                        return src.split('?')[0];
                    }
                }
            }

            return null;
        }

        findProductImageFromAPI() {
            // Strategy 2: Use Shopify product JSON API (works for ALL themes)
            var handle = window.location.pathname.split('/products/')[1];
            if (!handle) return Promise.resolve(null);
            handle = handle.split('?')[0].split('#')[0];

            return fetch('/products/' + handle + '.json')
                .then(function(res) { return res.json(); })
                .then(function(data) {
                    if (data.product && data.product.image && data.product.image.src) {
                        return data.product.image.src;
                    }
                    if (data.product && data.product.images && data.product.images.length > 0) {
                        return data.product.images[0].src;
                    }
                    return null;
                })
                .catch(function() { return null; });
        }

        openModal() {
            // First try DOM selectors (instant)
            this.productImage = this.findProductImage();
            if (this.productImage) {
                this.createModal();
                return;
            }

            // Fallback: Use Shopify JSON API (async but works for ALL themes)
            this.findProductImageFromAPI().then(function(url) {
                if (url) {
                    this.productImage = url;
                    this.createModal();
                } else {
                    alert('Não foi possível encontrar a imagem do produto.');
                }
            }.bind(this));
        }

        createModal() {
            var overlay = document.createElement('div');
            overlay.className = 'vto-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');

            var modal = document.createElement('div');
            modal.className = 'vto-modal';

            modal.innerHTML = `
        <button class="vto-close" aria-label="Fechar">×</button>
        <h2 class="vto-title">Provador Virtual</h2>
        <p class="vto-subtitle">Envie sua foto e veja como este produto fica em você</p>
        
        <img src="${this.productImage}" class="vto-product-thumb" alt="Produto">
        
        <div class="vto-dropzone">
          <span class="vto-dropzone-icon">📷</span>
          <p class="vto-dropzone-text">Clique para enviar sua foto</p>
          <p class="vto-dropzone-hint">JPG ou PNG · máx. 10 MB</p>
          <input type="file" class="vto-file-input" accept="image/jpeg,image/png" aria-label="Selecionar foto">
        </div>
        
        <div class="vto-preview-wrap">
          <img class="vto-preview-img" alt="Sua foto">
          <button class="vto-preview-remove" aria-label="Remover foto">×</button>
        </div>
        
        <button class="vto-generate-btn" disabled>Experimentar</button>
        
        <div class="vto-progress-wrap">
          <p class="vto-progress-label">Processando...</p>
          <div class="vto-progress-track">
            <div class="vto-progress-bar"></div>
          </div>
        </div>
        
        <div class="vto-result-wrap">
          <img class="vto-result-img" alt="Resultado">
          <div class="vto-result-actions">
            <a class="vto-btn-download" download="virtual-tryon.jpg">Baixar</a>
            <button class="vto-btn-retry">Tentar Novamente</button>
          </div>
        </div>
        
        <div class="vto-error"></div>
      `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            this.modal = overlay;

            this.attachModalEvents();
        }

        attachModalEvents() {
            var modal = this.modal;
            var closeBtn = modal.querySelector('.vto-close');
            var dropzone = modal.querySelector('.vto-dropzone');
            var fileInput = modal.querySelector('.vto-file-input');
            var previewWrap = modal.querySelector('.vto-preview-wrap');
            var previewImg = modal.querySelector('.vto-preview-img');
            var removeBtn = modal.querySelector('.vto-preview-remove');
            var generateBtn = modal.querySelector('.vto-generate-btn');
            var retryBtn = modal.querySelector('.vto-btn-retry');

            closeBtn.addEventListener('click', this.closeModal.bind(this));
            modal.addEventListener('click', function (e) {
                if (e.target === modal) this.closeModal();
            }.bind(this));

            fileInput.addEventListener('change', function (e) {
                if (e.target.files && e.target.files[0]) {
                    this.handleFile(e.target.files[0]);
                }
            }.bind(this));

            dropzone.addEventListener('dragover', function (e) {
                e.preventDefault();
                dropzone.classList.add('vto-drag-over');
            });

            dropzone.addEventListener('dragleave', function () {
                dropzone.classList.remove('vto-drag-over');
            });

            dropzone.addEventListener('drop', function (e) {
                e.preventDefault();
                dropzone.classList.remove('vto-drag-over');
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    this.handleFile(e.dataTransfer.files[0]);
                }
            }.bind(this));

            removeBtn.addEventListener('click', function () {
                this.userImage = null;
                previewWrap.classList.remove('vto-visible');
                dropzone.style.display = 'block';
                generateBtn.disabled = true;
            }.bind(this));

            generateBtn.addEventListener('click', this.generate.bind(this));
            retryBtn.addEventListener('click', this.reset.bind(this));

            document.addEventListener('keydown', function (e) {
                if (e.key === 'Escape') this.closeModal();
            }.bind(this));
        }

        handleFile(file) {
            if (!file.type.match(/^image\/(jpeg|png)$/)) {
                this.showError('Por favor, envie uma imagem JPG ou PNG.');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                this.showError('Arquivo muito grande. Máximo: 10 MB.');
                return;
            }

            var dropzone = this.modal.querySelector('.vto-dropzone');
            var previewWrap = this.modal.querySelector('.vto-preview-wrap');
            var previewImg = this.modal.querySelector('.vto-preview-img');
            var generateBtn = this.modal.querySelector('.vto-generate-btn');

            fileToBase64(file).then(function (base64) {
                this.userImage = base64;
                previewImg.src = base64;
                dropzone.style.display = 'none';
                previewWrap.classList.add('vto-visible');
                generateBtn.disabled = false;
            }.bind(this)).catch(function (err) {
                this.showError(err.message);
            }.bind(this));
        }

        generate() {
            var generateBtn = this.modal.querySelector('.vto-generate-btn');
            var progressWrap = this.modal.querySelector('.vto-progress-wrap');
            var progressBar = this.modal.querySelector('.vto-progress-bar');
            var resultWrap = this.modal.querySelector('.vto-result-wrap');

            generateBtn.disabled = true;
            progressWrap.classList.add('vto-visible');
            this.hideError();

            var progress = 0;
            var interval = setInterval(function () {
                progress += Math.random() * 15;
                if (progress > 90) progress = 90;
                progressBar.style.width = progress + '%';
            }, 500);

            fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: this.userImage,
                    productImage: this.productImage,
                }),
            })
                .then(function (res) {
                    if (!res.ok) throw new Error('Erro no servidor (' + res.status + ')');
                    return res.json();
                })
                .then(function (data) {
                    clearInterval(interval);
                    progressBar.style.width = '100%';

                    if (data.error) throw new Error(data.error);
                    if (!data.resultUrl) throw new Error('Nenhuma imagem foi gerada');

                    setTimeout(function () {
                        progressWrap.classList.remove('vto-visible');
                        this.showResult(data.resultUrl);
                    }.bind(this), 400);
                }.bind(this))
                .catch(function (err) {
                    clearInterval(interval);
                    progressWrap.classList.remove('vto-visible');
                    generateBtn.disabled = false;
                    this.showError(err.message);
                }.bind(this));
        }

        showResult(url) {
            var resultWrap = this.modal.querySelector('.vto-result-wrap');
            var resultImg = this.modal.querySelector('.vto-result-img');
            var downloadBtn = this.modal.querySelector('.vto-btn-download');

            resultImg.src = url;
            downloadBtn.href = url;
            resultWrap.classList.add('vto-visible');
        }

        reset() {
            var previewWrap = this.modal.querySelector('.vto-preview-wrap');
            var dropzone = this.modal.querySelector('.vto-dropzone');
            var generateBtn = this.modal.querySelector('.vto-generate-btn');
            var resultWrap = this.modal.querySelector('.vto-result-wrap');

            this.userImage = null;
            previewWrap.classList.remove('vto-visible');
            resultWrap.classList.remove('vto-visible');
            dropzone.style.display = 'block';
            generateBtn.disabled = true;
            this.hideError();
        }

        showError(msg) {
            var errorEl = this.modal.querySelector('.vto-error');
            errorEl.textContent = msg;
            errorEl.classList.add('vto-visible');
            setTimeout(function () {
                errorEl.classList.remove('vto-visible');
            }, 6000);
        }

        hideError() {
            var errorEl = this.modal.querySelector('.vto-error');
            errorEl.classList.remove('vto-visible');
        }

        closeModal() {
            if (this.modal) {
                this.modal.remove();
                this.modal = null;
            }
        }
    }

    // ─── Init ─────────────────────────────────────────────────────────────────

    var scriptTag = document.currentScript;
    var config = {
        shop: scriptTag ? scriptTag.dataset.shop : '',
        apiEndpoint: scriptTag ? scriptTag.dataset.apiEndpoint : 'https://tryon-app-tau.vercel.app/api/tryon',
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            new VirtualTryOn(config);
        });
    } else {
        new VirtualTryOn(config);
    }
})();
