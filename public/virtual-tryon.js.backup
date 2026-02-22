/**
 * virtual-tryon.js
 * Inject a "Provar em Mim" (Try On Me) button into Shopify product pages.
 *
 * Usage:
 *   <script src="virtual-tryon.js"
 *           data-shop="my-store.myshopify.com"
 *           data-api-endpoint="https://seu-dominio.com/api/tryon"
 *           defer>
 *   </script>
 */
(function () {
    'use strict';

    // ─── Helpers ──────────────────────────────────────────────────────────────

    /** Read a file as a base64 data-URI */
    function fileToBase64(file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function (e) { resolve(e.target.result); };
            reader.onerror = function () { reject(new Error('Falha ao ler o arquivo.')); };
            reader.readAsDataURL(file);
        });
    }

    /** Query helper — returns the first match from an array of CSS selectors */
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
        /**
         * @param {{ shop: string, apiEndpoint: string }} config
         */
        constructor(config) {
            this.config = config;
            this.productImage = null; // URL string
            this.userImage = null; // base64 data-URI
            this.modal = null; // DOM node
            this._stylesInjected = false;

            if (this.isProductPage()) {
                this.init();
            }
        }

        // ── Detection ────────────────────────────────────────────────────────────

        isProductPage() {
            // Shopify sets window.ShopifyAnalytics.meta.page.pageType = 'product'
            // or exposes window.Shopify.product. We also fall back to the URL path.
            if (window.Shopify && window.Shopify.product) return true;
            if (
                window.ShopifyAnalytics &&
                window.ShopifyAnalytics.meta &&
                window.ShopifyAnalytics.meta.page &&
                window.ShopifyAnalytics.meta.page.pageType === 'product'
            ) return true;
            return /\/products\//.test(window.location.pathname);
        }

        // ── Initialisation ───────────────────────────────────────────────────────

        init() {
            this.injectStyles();
            this.createTryOnButton();
        }

        // ── Styles ───────────────────────────────────────────────────────────────

        injectStyles() {
            if (this._stylesInjected) return;
            this._stylesInjected = true;

            var style = document.createElement('style');
            style.id = 'vto-styles';
            style.textContent = `
        /* ── Try-On Button ── */
        .vto-button {
          display: block;
          width: 100%;
          margin-bottom: 10px;
          padding: 13px 16px;
          background: #1a1a1a;
          color: #fff;
          border: 1px solid #333;
          border-radius: 8px;
          cursor: pointer;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.03em;
          text-align: center;
          transition: background 0.2s, transform 0.1s;
          box-sizing: border-box;
        }
        .vto-button:hover  { background: #333; }
        .vto-button:active { transform: scale(0.98); }

        /* ── Overlay ── */
        .vto-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.65);
          z-index: 999998;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          box-sizing: border-box;
          animation: vtoFadeIn 0.2s ease;
        }
        @keyframes vtoFadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* ── Modal ── */
        .vto-modal {
          position: relative;
          background: #fff;
          border-radius: 16px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.3);
          width: 100%;
          max-width: 520px;
          padding: 32px 28px 28px;
          box-sizing: border-box;
          animation: vtoSlideUp 0.25s ease;
          overflow: hidden;
        }
        @keyframes vtoSlideUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Close button ── */
        .vto-close {
          position: absolute;
          top: 14px;
          right: 18px;
          background: none;
          border: none;
          font-size: 22px;
          cursor: pointer;
          color: #555;
          line-height: 1;
          padding: 4px 8px;
          border-radius: 6px;
          transition: background 0.15s;
        }
        .vto-close:hover { background: #f0f0f0; }

        /* ── Title ── */
        .vto-title {
          margin: 0 0 6px;
          font-size: 20px;
          font-weight: 700;
          color: #111;
        }
        .vto-subtitle {
          margin: 0 0 20px;
          font-size: 13px;
          color: #777;
        }

        /* ── Product thumbnail ── */
        .vto-product-thumb {
          display: block;
          max-height: 120px;
          border-radius: 8px;
          margin: 0 auto 20px;
          object-fit: contain;
        }

        /* ── Drop Zone ── */
        .vto-dropzone {
          border: 2px dashed #ccc;
          border-radius: 12px;
          padding: 28px 20px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          background: #fafafa;
          position: relative;
        }
        .vto-dropzone.vto-drag-over {
          border-color: #1a1a1a;
          background: #f0f0f0;
        }
        .vto-dropzone-icon {
          font-size: 36px;
          margin-bottom: 8px;
          display: block;
        }
        .vto-dropzone-text {
          font-size: 14px;
          color: #555;
          margin: 0;
          line-height: 1.5;
        }
        .vto-dropzone-hint {
          font-size: 12px;
          color: #aaa;
          margin: 6px 0 0;
        }
        .vto-file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
          width: 100%;
          height: 100%;
        }

        /* ── Preview ── */
        .vto-preview-wrap {
          display: none;
          position: relative;
          text-align: center;
          margin-bottom: 20px;
        }
        .vto-preview-wrap.vto-visible { display: block; }
        .vto-preview-img {
          width: 100%;
          max-height: 200px;
          object-fit: cover;
          border-radius: 10px;
        }
        .vto-preview-remove {
          position: absolute;
          top: 6px;
          right: 6px;
          background: rgba(0,0,0,0.5);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 26px;
          height: 26px;
          cursor: pointer;
          font-size: 14px;
          line-height: 26px;
          text-align: center;
          padding: 0;
        }

        /* ── Generate button ── */
        .vto-generate-btn {
          display: block;
          width: 100%;
          margin-top: 16px;
          padding: 14px;
          background: linear-gradient(135deg, #1a1a1a 0%, #444 100%);
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          box-sizing: border-box;
        }
        .vto-generate-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .vto-generate-btn:not(:disabled):hover  { opacity: 0.88; }
        .vto-generate-btn:not(:disabled):active { transform: scale(0.98); }

        /* ── Progress ── */
        .vto-progress-wrap {
          display: none;
          margin-top: 16px;
        }
        .vto-progress-wrap.vto-visible { display: block; }
        .vto-progress-label {
          font-size: 13px;
          color: #555;
          margin-bottom: 6px;
          text-align: center;
        }
        .vto-progress-track {
          height: 6px;
          background: #eee;
          border-radius: 99px;
          overflow: hidden;
        }
        .vto-progress-bar {
          height: 100%;
          width: 0%;
          background: linear-gradient(90deg, #1a1a1a, #777);
          border-radius: 99px;
          transition: width 0.4s ease;
        }

        /* ── Result ── */
        .vto-result-wrap {
          display: none;
          margin-top: 20px;
        }
        .vto-result-wrap.vto-visible { display: block; }
        .vto-result-img {
          width: 100%;
          border-radius: 12px;
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }
        .vto-result-actions {
          display: flex;
          gap: 10px;
          margin-top: 12px;
        }
        .vto-result-actions a,
        .vto-result-actions button {
          flex: 1;
          padding: 10px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          box-sizing: border-box;
        }
        .vto-btn-download {
          background: #1a1a1a;
          color: #fff;
          border: none;
        }
        .vto-btn-retry {
          background: none;
          color: #1a1a1a;
          border: 1px solid #ccc;
        }
        .vto-btn-retry:hover { background: #f5f5f5; }

        /* ── Error ── */
        .vto-error {
          display: none;
          margin-top: 14px;
          padding: 12px 16px;
          background: #fff0f0;
          border: 1px solid #fcc;
          border-radius: 8px;
          font-size: 13px;
          color: #c00;
          text-align: center;
        }
        .vto-error.vto-visible { display: block; }
      `;
            document.head.appendChild(style);
        }

        // ── Button Injection ──────────────────────────────────────────────────────

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
            if (!form) {
                console.warn('[VirtualTryOn] Formulário de produto não encontrado.');
                return;
            }

            var addBtn = queryFirst(addBtnSelectors, form);
            if (!addBtn) {
                console.warn('[VirtualTryOn] Botão "Adicionar ao Carrinho" não encontrado.');
                return;
            }

            // Avoid double injection
            if (document.querySelector('.vto-button')) return;

            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'vto-button';
            btn.innerHTML = '👗 Provar em Mim';
            btn.setAttribute('aria-label', 'Abrir virtual try-on');

            btn.addEventListener('click', this.openModal.bind(this));

            addBtn.parentNode.insertBefore(btn, addBtn);
        }

        // ── Product Image ─────────────────────────────────────────────────────────

        getProductImage() {
            var selectors = [
                '.product__media-item--main img',
                '.product--large .product__media-item img',
                '.product-gallery__image img',
                '.product-single__photo img',
                '.product-featured-img',
                '#main-product-image',
                'img.featured-image',
                '.product-image-container img',
                '.product__photo img',
                '[data-product-featured-image]',
                '.product-images img:first-child',
                '.main-product-image img',
                'img[itemprop="image"]',
            ];

            var img = queryFirst(selectors);

            if (img) {
                // Prefer srcset / data-src for high-res image
                var src =
                    img.dataset.src ||
                    img.dataset.lazySrc ||
                    img.currentSrc ||
                    img.src;
                // Resolve protocol-less URLs
                if (src && src.startsWith('//')) src = 'https:' + src;
                return src || null;
            }

            // Fallback: look for first large <img> in the page
            var allImgs = Array.from(document.querySelectorAll('img'));
            for (var i = 0; i < allImgs.length; i++) {
                var el = allImgs[i];
                if (el.naturalWidth > 300 && el.naturalHeight > 300) {
                    var s = el.currentSrc || el.src;
                    if (s && !s.includes('logo') && !s.includes('icon')) return s;
                }
            }

            return null;
        }

        // ── Modal ─────────────────────────────────────────────────────────────────

        openModal() {
            this.productImage = this.getProductImage();

            if (!this.productImage) {
                alert('Não foi possível encontrar a imagem do produto. Tente em outro tema.');
                return;
            }

            // Remove any stale modal
            this._removeModal();

            var overlay = document.createElement('div');
            overlay.className = 'vto-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-label', 'Virtual Try-On');
            overlay.innerHTML = this._modalHTML();

            document.body.appendChild(overlay);
            document.body.style.overflow = 'hidden';
            this.modal = overlay;

            this._bindModalEvents();
        }

        _modalHTML() {
            return `
        <div class="vto-modal">
          <button class="vto-close" aria-label="Fechar">✕</button>
          <h2 class="vto-title">👗 Virtual Try-On</h2>
          <p class="vto-subtitle">Envie sua foto e experimente este look com IA.</p>

          <img class="vto-product-thumb" src="${this.productImage}" alt="Imagem do produto">

          <div class="vto-dropzone" id="vtoDropzone">
            <input class="vto-file-input" type="file" id="vtoFileInput"
                   accept="image/jpeg,image/png,image/webp" aria-label="Selecionar foto">
            <span class="vto-dropzone-icon">📷</span>
            <p class="vto-dropzone-text">Arraste sua foto ou <strong>clique para selecionar</strong></p>
            <p class="vto-dropzone-hint">JPG ou PNG · máx. 10 MB</p>
          </div>

          <div class="vto-preview-wrap" id="vtoPreviewWrap">
            <img class="vto-preview-img" id="vtoPreviewImg" src="" alt="Sua foto">
            <button class="vto-preview-remove" id="vtoPreviewRemove" aria-label="Remover foto">✕</button>
          </div>

          <button class="vto-generate-btn" id="vtoGenerateBtn" disabled>
            ✨ Gerar look com IA
          </button>

          <div class="vto-progress-wrap" id="vtoProgressWrap">
            <p class="vto-progress-label" id="vtoProgressLabel">Processando…</p>
            <div class="vto-progress-track">
              <div class="vto-progress-bar" id="vtoProgressBar"></div>
            </div>
          </div>

          <div class="vto-result-wrap" id="vtoResultWrap">
            <img class="vto-result-img" id="vtoResultImg" src="" alt="Resultado do virtual try-on">
            <div class="vto-result-actions">
              <a class="vto-btn-download" id="vtoDownloadBtn" download="tryon-result.jpg">
                ⬇ Baixar
              </a>
              <button class="vto-btn-retry" id="vtoRetryBtn">↺ Tentar Novamente</button>
            </div>
          </div>

          <div class="vto-error" id="vtoError"></div>
        </div>
      `;
        }

        _bindModalEvents() {
            var self = this;
            var overlay = this.modal;
            var modal = overlay.querySelector('.vto-modal');

            // Close on overlay click (outside modal)
            overlay.addEventListener('click', function (e) {
                if (e.target === overlay) self._removeModal();
            });

            // Close button
            overlay.querySelector('.vto-close').addEventListener('click', function () {
                self._removeModal();
            });

            // ESC key
            this._escHandler = function (e) {
                if (e.key === 'Escape') self._removeModal();
            };
            document.addEventListener('keydown', this._escHandler);

            // File input
            var fileInput = overlay.querySelector('#vtoFileInput');
            fileInput.addEventListener('change', function (e) {
                if (e.target.files && e.target.files[0]) {
                    self.handleFileUpload(e.target.files[0]);
                }
            });

            // Drag & drop
            var dropzone = overlay.querySelector('#vtoDropzone');
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
                var files = e.dataTransfer && e.dataTransfer.files;
                if (files && files[0]) self.handleFileUpload(files[0]);
            });

            // Remove preview
            overlay.querySelector('#vtoPreviewRemove').addEventListener('click', function () {
                self.userImage = null;
                overlay.querySelector('#vtoPreviewWrap').classList.remove('vto-visible');
                overlay.querySelector('#vtoDropzone').style.display = '';
                overlay.querySelector('#vtoGenerateBtn').disabled = true;
                // Reset result / error too
                overlay.querySelector('#vtoResultWrap').classList.remove('vto-visible');
                overlay.querySelector('#vtoError').classList.remove('vto-visible');
            });

            // Generate
            overlay.querySelector('#vtoGenerateBtn').addEventListener('click', function () {
                self.generateLook();
            });

            // Retry
            overlay.querySelector('#vtoRetryBtn').addEventListener('click', function () {
                self.userImage = null;
                overlay.querySelector('#vtoPreviewWrap').classList.remove('vto-visible');
                overlay.querySelector('#vtoDropzone').style.display = '';
                overlay.querySelector('#vtoResultWrap').classList.remove('vto-visible');
                overlay.querySelector('#vtoProgressWrap').classList.remove('vto-visible');
                overlay.querySelector('#vtoError').classList.remove('vto-visible');
                overlay.querySelector('#vtoGenerateBtn').disabled = true;
            });
        }

        _removeModal() {
            if (this.modal) {
                document.body.removeChild(this.modal);
                this.modal = null;
            }
            document.body.style.overflow = '';
            if (this._escHandler) {
                document.removeEventListener('keydown', this._escHandler);
                this._escHandler = null;
            }
            // Clear animated progress if running
            if (this._progressInterval) {
                clearInterval(this._progressInterval);
                this._progressInterval = null;
            }
        }

        // ── File Upload ───────────────────────────────────────────────────────────

        handleFileUpload(file) {
            var self = this;

            // Validate type
            if (!file.type.startsWith('image/')) {
                this.showError('Por favor, selecione um arquivo de imagem (JPG, PNG ou WEBP).');
                return;
            }

            // Validate size (10 MB)
            if (file.size > 10 * 1024 * 1024) {
                this.showError('A imagem deve ter no máximo 10 MB.');
                return;
            }

            fileToBase64(file)
                .then(function (dataUri) {
                    self.userImage = dataUri;

                    var overlay = self.modal;
                    if (!overlay) return;

                    // Show preview
                    overlay.querySelector('#vtoPreviewImg').src = dataUri;
                    overlay.querySelector('#vtoPreviewWrap').classList.add('vto-visible');
                    overlay.querySelector('#vtoDropzone').style.display = 'none';

                    // Enable generate button
                    overlay.querySelector('#vtoGenerateBtn').disabled = false;

                    // Clear stale errors
                    overlay.querySelector('#vtoError').classList.remove('vto-visible');
                })
                .catch(function (err) {
                    self.showError('Falha ao carregar a imagem: ' + err.message);
                });
        }

        // ── Generation ────────────────────────────────────────────────────────────

        generateLook() {
            if (!this.userImage) {
                this.showError('Envie uma foto antes de gerar o look.');
                return;
            }
            if (!this.productImage) {
                this.showError('Imagem do produto não disponível. Feche e abra o painel novamente.');
                return;
            }

            var self = this;
            var overlay = this.modal;

            // Hide result / error, show progress
            overlay.querySelector('#vtoResultWrap').classList.remove('vto-visible');
            overlay.querySelector('#vtoError').classList.remove('vto-visible');
            overlay.querySelector('#vtoGenerateBtn').disabled = true;
            this.showLoading(0);

            // Animate progress bar while waiting
            var progress = 0;
            this._progressInterval = setInterval(function () {
                // Slowly creep up to 85% while waiting for the server
                if (progress < 85) {
                    progress += Math.random() * 4;
                    if (progress > 85) progress = 85;
                    self.showLoading(progress);
                }
            }, 400);

            fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: this.userImage,
                    productImage: this.productImage,
                    shop: this.config.shop,
                }),
            })
                .then(function (res) {
                    if (!res.ok) {
                        return res.json().catch(function () { return {}; }).then(function (data) {
                            throw new Error(data.message || 'Erro do servidor (' + res.status + ').');
                        });
                    }
                    return res.json();
                })
                .then(function (data) {
                    clearInterval(self._progressInterval);
                    self._progressInterval = null;
                    self.showLoading(100);

                    var resultUrl = data.resultUrl || data.result_url || data.image || data.url;

                    if (!resultUrl) {
                        throw new Error('A IA não retornou uma imagem válida.');
                    }

                    setTimeout(function () {
                        overlay.querySelector('#vtoProgressWrap').classList.remove('vto-visible');
                        self.displayResult(resultUrl);
                        overlay.querySelector('#vtoGenerateBtn').disabled = false;
                    }, 500);
                })
                .catch(function (err) {
                    clearInterval(self._progressInterval);
                    self._progressInterval = null;
                    overlay.querySelector('#vtoProgressWrap').classList.remove('vto-visible');
                    overlay.querySelector('#vtoGenerateBtn').disabled = false;
                    self.showError(err.message || 'Ocorreu um erro. Tente novamente.');
                });
        }

        // ── Progress ──────────────────────────────────────────────────────────────

        showLoading(progress) {
            var overlay = this.modal;
            if (!overlay) return;

            var wrap = overlay.querySelector('#vtoProgressWrap');
            var bar = overlay.querySelector('#vtoProgressBar');
            var label = overlay.querySelector('#vtoProgressLabel');

            wrap.classList.add('vto-visible');
            bar.style.width = Math.min(100, progress).toFixed(1) + '%';

            if (progress < 30) label.textContent = 'Analisando a imagem…';
            else if (progress < 60) label.textContent = 'Aplicando o look com IA…';
            else if (progress < 90) label.textContent = 'Finalizando detalhes…';
            else label.textContent = 'Quase pronto…';
        }

        // ── Result ────────────────────────────────────────────────────────────────

        displayResult(imageUrl) {
            var overlay = this.modal;
            if (!overlay) return;

            var resultImg = overlay.querySelector('#vtoResultImg');
            var downloadBtn = overlay.querySelector('#vtoDownloadBtn');
            var resultWrap = overlay.querySelector('#vtoResultWrap');

            resultImg.src = imageUrl;
            resultImg.alt = 'Resultado — Virtual Try-On';
            downloadBtn.href = imageUrl;

            resultWrap.classList.add('vto-visible');
        }

        // ── Error ─────────────────────────────────────────────────────────────────

        showError(message) {
            var overlay = this.modal;
            if (!overlay) {
                console.error('[VirtualTryOn]', message);
                return;
            }

            var errorEl = overlay.querySelector('#vtoError');
            errorEl.textContent = '⚠️ ' + message;
            errorEl.classList.add('vto-visible');

            // Auto-hide after 6 s
            var el = errorEl;
            setTimeout(function () { el.classList.remove('vto-visible'); }, 6000);
        }
    }

    // ─── Bootstrap ────────────────────────────────────────────────────────────

    var scriptTag = document.querySelector('script[src*="virtual-tryon.js"]');
    var shop = scriptTag ? scriptTag.dataset.shop : null;
    var apiEndpoint = scriptTag ? scriptTag.dataset.apiEndpoint : 'https://tryon-app-tau.vercel.app/api/tryon';

    function bootstrap() {
        if (shop) {
            new VirtualTryOn({ shop: shop, apiEndpoint: apiEndpoint });
        } else {
            // Dev-mode fallback: run on any product page even without data-shop
            if (/\/products\//.test(window.location.pathname)) {
                console.info('[VirtualTryOn] Rodando em modo de desenvolvimento (sem data-shop).');
                new VirtualTryOn({ shop: window.location.hostname, apiEndpoint: apiEndpoint });
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();
