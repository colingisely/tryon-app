/**
 * Virtual Try-On Plugin for Shopify
 * Professional virtual fitting room experience
 * v2.1 - Theme-adaptive, professional UI, result-focused view
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

    // ─── Theme Detection ─────────────────────────────────────────────────────

    function detectThemeStyles() {
        var theme = {
            primaryColor: '#000000',
            primaryTextColor: '#ffffff',
            borderRadius: '6px',
            fontFamily: 'inherit',
            bgColor: '#ffffff',
            textColor: '#000000',
            mutedColor: '#666666',
            borderColor: '#d0d0d0',
        };

        // Try to detect from the "Add to Cart" button
        var addBtn = queryFirst([
            'button[name="add"]',
            'button.product-form__submit',
            'button[data-add-to-cart]',
            'button.add-to-cart',
            'button[type="submit"][form*="product"]',
        ]);

        if (addBtn) {
            var styles = window.getComputedStyle(addBtn);
            var bg = styles.backgroundColor;
            var color = styles.color;
            var radius = styles.borderRadius;
            var font = styles.fontFamily;

            if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
                theme.primaryColor = bg;
            }
            if (color) {
                theme.primaryTextColor = color;
            }
            if (radius) {
                theme.borderRadius = radius;
            }
            if (font) {
                theme.fontFamily = font;
            }
        }

        // Try to detect body/page background and text
        var body = document.body;
        if (body) {
            var bodyStyles = window.getComputedStyle(body);
            if (bodyStyles.backgroundColor && bodyStyles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                theme.bgColor = bodyStyles.backgroundColor;
            }
            if (bodyStyles.color) {
                theme.textColor = bodyStyles.color;
            }
        }

        return theme;
    }

    // Helper: parse color to get rgba components
    function parseColor(color) {
        var temp = document.createElement('div');
        temp.style.color = color;
        document.body.appendChild(temp);
        var computed = window.getComputedStyle(temp).color;
        document.body.removeChild(temp);
        var match = computed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        if (match) {
            return { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
        }
        return { r: 0, g: 0, b: 0 };
    }

    // ─── SVG Icons ────────────────────────────────────────────────────────────

    var ICONS = {
        hanger: '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3c0 1.1.6 2 1.5 2.5L12 8l1.5-.5A3 3 0 0 0 12 2z"/><path d="M2 20h20L12 8 2 20z"/></svg>',
        upload: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
        close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        download: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
        retry: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
        camera: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    };

    // ─── Main Class ───────────────────────────────────────────────────────────

    class VirtualTryOn {
        constructor(config) {
            this.config = config;
            this.productImage = null;
            this.userImage = null;
            this.modal = null;
            this._stylesInjected = false;
            this.theme = null;

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
            this.theme = detectThemeStyles();
            this.injectStyles();
            this.createTryOnButton();
        }

        injectStyles() {
            if (this._stylesInjected) return;
            this._stylesInjected = true;

            var t = this.theme;
            var pc = parseColor(t.primaryColor);
            var primaryRgb = pc.r + ',' + pc.g + ',' + pc.b;

            var style = document.createElement('style');
            style.id = 'vto-styles';
            style.textContent = `
        /* ─── Button (Outline / Secondary) ─── */
        .vto-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          margin-bottom: 10px;
          padding: 12px 16px;
          background: transparent;
          color: ${t.primaryColor};
          border: 1.5px solid ${t.primaryColor};
          border-radius: ${t.borderRadius};
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          font-family: ${t.fontFamily};
          text-align: center;
          letter-spacing: 0.3px;
          transition: all 0.25s ease;
        }
        .vto-button:hover {
          background: rgba(${primaryRgb}, 0.08);
        }
        .vto-button svg {
          flex-shrink: 0;
        }

        /* ─── Overlay ─── */
        .vto-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 999998;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        .vto-overlay.vto-active {
          opacity: 1;
        }
        .vto-overlay.vto-closing {
          opacity: 0;
        }

        /* ─── Modal ─── */
        .vto-modal {
          position: relative;
          background: #fff;
          border-radius: ${t.borderRadius};
          box-shadow: 0 24px 80px rgba(0,0,0,0.18), 0 4px 20px rgba(0,0,0,0.08);
          width: 100%;
          max-width: 440px;
          max-height: 90vh;
          padding: 32px 28px;
          overflow-y: auto;
          font-family: ${t.fontFamily};
          transform: translateY(20px) scale(0.97);
          opacity: 0;
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
        }
        .vto-overlay.vto-active .vto-modal {
          transform: translateY(0) scale(1);
          opacity: 1;
        }
        .vto-overlay.vto-closing .vto-modal {
          transform: translateY(12px) scale(0.98);
          opacity: 0;
        }

        /* ─── Close Button ─── */
        .vto-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          line-height: 1;
          padding: 6px;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }
        .vto-close:hover {
          background: #f0f0f0;
          color: #333;
        }

        /* ─── Header ─── */
        .vto-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 6px;
        }
        .vto-header-icon {
          width: 40px;
          height: 40px;
          border-radius: ${t.borderRadius};
          background: rgba(${primaryRgb}, 0.08);
          color: ${t.primaryColor};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .vto-title {
          margin: 0;
          font-size: 20px;
          font-weight: 700;
          color: #111;
          font-family: ${t.fontFamily};
        }
        .vto-subtitle {
          margin: 0 0 24px;
          font-size: 14px;
          color: #888;
          line-height: 1.5;
        }

        /* ─── Product Thumbnail ─── */
        .vto-product-thumb {
          display: block;
          max-height: 90px;
          border-radius: ${t.borderRadius};
          margin: 0 auto 20px;
          object-fit: contain;
          border: 1px solid #f0f0f0;
        }

        /* ─── Drop Zone ─── */
        .vto-dropzone {
          border: 2px dashed #ddd;
          border-radius: ${t.borderRadius};
          padding: 28px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.25s ease;
          background: #fafafa;
          position: relative;
        }
        .vto-dropzone:hover {
          border-color: rgba(${primaryRgb}, 0.4);
          background: rgba(${primaryRgb}, 0.03);
        }
        .vto-dropzone.vto-drag-over {
          border-color: ${t.primaryColor};
          background: rgba(${primaryRgb}, 0.06);
        }
        .vto-dropzone-icon {
          margin-bottom: 10px;
          display: flex;
          justify-content: center;
          color: #bbb;
        }
        .vto-dropzone:hover .vto-dropzone-icon {
          color: rgba(${primaryRgb}, 0.5);
        }
        .vto-dropzone-text {
          font-size: 14px;
          color: #444;
          margin: 0 0 4px;
          font-weight: 500;
        }
        .vto-dropzone-hint {
          font-size: 12px;
          color: #aaa;
          margin: 0;
        }
        .vto-file-input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        /* ─── Preview ─── */
        .vto-preview-wrap {
          display: none;
          position: relative;
          margin-bottom: 16px;
        }
        .vto-preview-wrap.vto-visible { display: block; }
        .vto-preview-img {
          width: 100%;
          max-height: 280px;
          object-fit: contain;
          border-radius: ${t.borderRadius};
          background: #f8f8f8;
        }
        .vto-preview-remove {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0,0,0,0.5);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          cursor: pointer;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
        }
        .vto-preview-remove:hover {
          background: rgba(0,0,0,0.7);
        }

        /* ─── Generate Button ─── */
        .vto-generate-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          margin-top: 16px;
          padding: 14px;
          background: ${t.primaryColor};
          color: ${t.primaryTextColor};
          border: none;
          border-radius: ${t.borderRadius};
          font-size: 15px;
          font-weight: 600;
          font-family: ${t.fontFamily};
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .vto-generate-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .vto-generate-btn:not(:disabled):hover {
          opacity: 0.85;
        }

        /* ─── Progress ─── */
        .vto-progress-wrap {
          display: none;
          margin-top: 20px;
        }
        .vto-progress-wrap.vto-visible { display: block; }
        .vto-progress-label {
          font-size: 13px;
          color: #888;
          margin-bottom: 10px;
          text-align: center;
        }
        .vto-progress-track {
          height: 3px;
          background: #eee;
          border-radius: 99px;
          overflow: hidden;
        }
        .vto-progress-bar {
          height: 100%;
          width: 0%;
          background: ${t.primaryColor};
          border-radius: 99px;
          transition: width 0.4s ease;
        }

        /* ─── Result ─── */
        .vto-result-wrap {
          display: none;
          margin-top: 20px;
        }
        .vto-result-wrap.vto-visible { display: block; }
        .vto-result-img {
          width: 100%;
          max-height: 460px;
          object-fit: contain;
          border-radius: ${t.borderRadius};
          background: #f8f8f8;
          cursor: pointer;
        }

        /* ─── Fullscreen Lightbox ─── */
        .vto-lightbox {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.92);
          z-index: 999999;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.25s ease;
        }
        .vto-lightbox.vto-active { opacity: 1; }
        .vto-lightbox img {
          max-width: 95vw;
          max-height: 95vh;
          object-fit: contain;
          border-radius: 4px;
        }
        .vto-lightbox-close {
          position: absolute;
          top: 16px;
          right: 16px;
          background: rgba(255,255,255,0.15);
          border: none;
          color: #fff;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s;
          z-index: 1;
        }
        .vto-lightbox-close:hover {
          background: rgba(255,255,255,0.3);
        }
        .vto-result-actions {
          display: flex;
          gap: 10px;
          margin-top: 14px;
        }
        .vto-result-actions button {
          flex: 1;
          padding: 11px;
          border-radius: ${t.borderRadius};
          font-size: 13px;
          font-weight: 600;
          font-family: ${t.fontFamily};
          text-align: center;
          text-decoration: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
        }
        .vto-btn-download {
          background: ${t.primaryColor};
          color: ${t.primaryTextColor};
          border: none;
        }
        .vto-btn-download:hover { opacity: 0.85; }
        .vto-btn-retry {
          background: transparent;
          color: #555;
          border: 1.5px solid #ddd;
        }
        .vto-btn-retry:hover { background: #f5f5f5; }

        /* ─── Error ─── */
        .vto-error {
          display: none;
          margin-top: 16px;
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: ${t.borderRadius};
          font-size: 13px;
          color: #dc2626;
          text-align: center;
        }
        .vto-error.vto-visible { display: block; }

        /* ─── Mobile ─── */
        @media (max-width: 640px) {
          .vto-overlay { padding: 12px; }
          .vto-modal {
            max-width: 100%;
            max-height: 95vh;
            padding: 24px 20px;
          }
          .vto-title { font-size: 18px; }
          .vto-result-img { max-height: 380px; }
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
            btn.innerHTML = ICONS.hanger + ' Provar em Mim';
            btn.setAttribute('aria-label', 'Abrir provador virtual');

            btn.addEventListener('click', this.openModal.bind(this));

            addBtn.parentNode.insertBefore(btn, addBtn);
        }

        findProductImage() {
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
                'media-gallery img',
                '.media-gallery img',
                '[data-media-gallery] img',
                '.product-media-container img',
                'section img[src*="cdn.shopify"]',
                'main img[src*="cdn.shopify"]',
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
            this.productImage = this.findProductImage();
            if (this.productImage) {
                this.createModal();
                return;
            }

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
        <button class="vto-close" aria-label="Fechar">${ICONS.close}</button>
        
        <div class="vto-header">
          <div class="vto-header-icon">${ICONS.hanger}</div>
          <h2 class="vto-title">Provador Virtual</h2>
        </div>
        <p class="vto-subtitle">Envie uma foto sua e veja como esta peça fica em você</p>
        
        <div class="vto-upload-section">
          <img src="${this.productImage}" class="vto-product-thumb" alt="Produto">
          
          <div class="vto-dropzone">
            <div class="vto-dropzone-icon">${ICONS.upload}</div>
            <p class="vto-dropzone-text">Foto de corpo inteiro</p>
            <p class="vto-dropzone-hint">PNG ou JPEG, máx. 10 MB</p>
            <input type="file" class="vto-file-input" accept="image/jpeg,image/png" aria-label="Selecionar foto">
          </div>
        </div>
        
        <div class="vto-preview-wrap">
          <img class="vto-preview-img" alt="Sua foto">
          <button class="vto-preview-remove" aria-label="Remover foto">${ICONS.close}</button>
        </div>
        
        <button class="vto-generate-btn" disabled>${ICONS.camera} Experimentar</button>
        
        <div class="vto-progress-wrap">
          <p class="vto-progress-label">Gerando sua prova virtual...</p>
          <div class="vto-progress-track">
            <div class="vto-progress-bar"></div>
          </div>
        </div>
        
        <div class="vto-result-wrap">
          <img class="vto-result-img" alt="Resultado">
          <div class="vto-result-actions">
            <button class="vto-btn-download">${ICONS.download} Baixar</button>
            <button class="vto-btn-retry">${ICONS.retry} Nova Foto</button>
          </div>
        </div>
        
        <div class="vto-error"></div>
      `;

            overlay.appendChild(modal);
            document.body.appendChild(overlay);
            this.modal = overlay;

            // Trigger animation after DOM insertion
            requestAnimationFrame(function() {
                overlay.classList.add('vto-active');
            });

            // Prevent body scroll
            document.body.style.overflow = 'hidden';

            this.attachModalEvents();
        }

        attachModalEvents() {
            var self = this;
            var modal = this.modal;
            var modalContent = modal.querySelector('.vto-modal');
            var closeBtn = modal.querySelector('.vto-close');
            var dropzone = modal.querySelector('.vto-dropzone');
            var fileInput = modal.querySelector('.vto-file-input');
            var previewWrap = modal.querySelector('.vto-preview-wrap');
            var previewImg = modal.querySelector('.vto-preview-img');
            var removeBtn = modal.querySelector('.vto-preview-remove');
            var generateBtn = modal.querySelector('.vto-generate-btn');
            var retryBtn = modal.querySelector('.vto-btn-retry');

            // Close on X button
            closeBtn.addEventListener('click', function() { self.closeModal(); });

            // Close on overlay click (outside modal)
            modal.addEventListener('click', function (e) {
                if (e.target === modal) {
                    self.closeModal();
                }
            });

            // Close on ESC key
            this._escHandler = function (e) {
                if (e.key === 'Escape') self.closeModal();
            };
            document.addEventListener('keydown', this._escHandler);

            // File input
            fileInput.addEventListener('change', function (e) {
                if (e.target.files && e.target.files[0]) {
                    self.handleFile(e.target.files[0]);
                }
            });

            // Drag & drop
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
                    self.handleFile(e.dataTransfer.files[0]);
                }
            });

            // Remove preview
            removeBtn.addEventListener('click', function () {
                self.userImage = null;
                previewWrap.classList.remove('vto-visible');
                dropzone.style.display = 'block';
                generateBtn.disabled = true;
            });

            // Generate & retry
            generateBtn.addEventListener('click', function() { self.generate(); });
            retryBtn.addEventListener('click', function() { self.reset(); });
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

            generateBtn.disabled = true;
            progressWrap.classList.add('vto-visible');
            this.hideError();

            var progress = 0;
            var interval = setInterval(function () {
                progress += Math.random() * 12;
                if (progress > 90) progress = 90;
                progressBar.style.width = progress + '%';
            }, 600);

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
            var self = this;
            var resultWrap = this.modal.querySelector('.vto-result-wrap');
            var resultImg = this.modal.querySelector('.vto-result-img');
            var downloadBtn = this.modal.querySelector('.vto-btn-download');

            // Hide upload section, preview, subtitle, and generate button
            var uploadSection = this.modal.querySelector('.vto-upload-section');
            var previewWrap = this.modal.querySelector('.vto-preview-wrap');
            var subtitle = this.modal.querySelector('.vto-subtitle');
            var generateBtn = this.modal.querySelector('.vto-generate-btn');
            if (uploadSection) uploadSection.style.display = 'none';
            if (previewWrap) previewWrap.style.display = 'none';
            if (subtitle) subtitle.style.display = 'none';
            if (generateBtn) generateBtn.style.display = 'none';

            resultImg.src = url;
            this._resultUrl = url;
            resultWrap.classList.add('vto-visible');

            // Click on result image to open fullscreen lightbox
            resultImg.addEventListener('click', function() {
                self.openLightbox(url);
            });

            // Download button: real download via fetch + blob
            downloadBtn.addEventListener('click', function(e) {
                e.preventDefault();
                fetch(url)
                    .then(function(res) { return res.blob(); })
                    .then(function(blob) {
                        var a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = 'provador-virtual.png';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(a.href);
                    })
                    .catch(function() {
                        window.open(url, '_blank');
                    });
            });
        }

        openLightbox(url) {
            var self = this;
            var lightbox = document.createElement('div');
            lightbox.className = 'vto-lightbox';
            lightbox.innerHTML = '<button class="vto-lightbox-close" aria-label="Fechar">' + ICONS.close + '</button><img src="' + url + '" alt="Resultado">';
            document.body.appendChild(lightbox);

            requestAnimationFrame(function() {
                lightbox.classList.add('vto-active');
            });

            function closeLightbox() {
                lightbox.classList.remove('vto-active');
                setTimeout(function() {
                    if (lightbox.parentNode) lightbox.remove();
                }, 250);
            }

            // Close on X button
            lightbox.querySelector('.vto-lightbox-close').addEventListener('click', function(e) {
                e.stopPropagation();
                closeLightbox();
            });

            // Close on click anywhere on lightbox background
            lightbox.addEventListener('click', function(e) {
                if (e.target === lightbox) closeLightbox();
            });

            // Close on ESC
            var escHandler = function(e) {
                if (e.key === 'Escape') {
                    closeLightbox();
                    document.removeEventListener('keydown', escHandler);
                }
            };
            document.addEventListener('keydown', escHandler);
        }

        reset() {
            var previewWrap = this.modal.querySelector('.vto-preview-wrap');
            var dropzone = this.modal.querySelector('.vto-dropzone');
            var generateBtn = this.modal.querySelector('.vto-generate-btn');
            var resultWrap = this.modal.querySelector('.vto-result-wrap');
            var uploadSection = this.modal.querySelector('.vto-upload-section');
            var subtitle = this.modal.querySelector('.vto-subtitle');

            this.userImage = null;
            previewWrap.classList.remove('vto-visible');
            previewWrap.style.display = '';
            resultWrap.classList.remove('vto-visible');
            dropzone.style.display = 'block';
            if (uploadSection) uploadSection.style.display = '';
            if (subtitle) subtitle.style.display = '';
            if (generateBtn) {
                generateBtn.style.display = '';
                generateBtn.disabled = true;
            }
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
            if (errorEl) errorEl.classList.remove('vto-visible');
        }

        closeModal() {
            if (!this.modal) return;

            var overlay = this.modal;
            overlay.classList.remove('vto-active');
            overlay.classList.add('vto-closing');

            // Restore body scroll
            document.body.style.overflow = '';

            // Remove ESC listener
            if (this._escHandler) {
                document.removeEventListener('keydown', this._escHandler);
                this._escHandler = null;
            }

            // Wait for animation to finish before removing
            setTimeout(function() {
                if (overlay.parentNode) {
                    overlay.remove();
                }
            }, 300);

            this.modal = null;
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
