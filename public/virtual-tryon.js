(function () {
    'use strict';

    function queryFirst(selectors, parent) {
        parent = parent || document;
        if (typeof selectors === 'string') selectors = [selectors];
        for (var i = 0; i < selectors.length; i++) {
            var el = parent.querySelector(selectors[i]);
            if (el) return el;
        }
        return null;
    }

    function fileToBase64(file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function () { resolve(reader.result); };
            reader.onerror = function () { reject(new Error('Erro ao ler arquivo')); };
            reader.readAsDataURL(file);
        });
    }

    var VirtualTryOn = function () {
        this.modal = null;
        this.userImage = null;
        this.productImage = null;
        this._stylesInjected = false;

        if (this.isProductPage()) {
            this.init();
        }
    };

    VirtualTryOn.prototype = {
        isProductPage: function () {
            return /\/products\//.test(window.location.pathname);
        },

        init: function () {
            this.injectStyles();
            this.createTryOnButton();
        },

        injectStyles: function () {
            if (this._stylesInjected) return;
            this._stylesInjected = true;

            var style = document.createElement('style');
            style.id = 'vto-styles';
            style.textContent = `
        /* Button - Rounded to match theme */
        .vto-button {
          display: block;
          width: 100%;
          margin-bottom: 10px;
          padding: 14px 16px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 50px;
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
          z-index: 10;
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

        /* Thumbnails - Small and side by side */
        .vto-thumbnails {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }
        .vto-thumb {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          border: 2px solid #e0e0e0;
        }
        .vto-thumb-label {
          font-size: 11px;
          color: #999;
          text-align: center;
          margin-top: 4px;
        }

        /* Dropzone */
        .vto-dropzone {
          position: relative;
          border: 2px dashed #d0d0d0;
          border-radius: 12px;
          padding: 40px 20px;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s;
          margin-bottom: 16px;
        }
        .vto-dropzone:hover { border-color: #999; background: #fafafa; }
        .vto-dropzone.vto-drag-over { border-color: #000; background: #f5f5f5; }
        .vto-dropzone-icon { font-size: 40px; display: block; margin-bottom: 12px; }
        .vto-dropzone-text { margin: 0 0 4px; font-size: 15px; font-weight: 600; color: #000; }
        .vto-dropzone-hint { margin: 0; font-size: 13px; color: #999; }
        .vto-file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

        /* Preview (hidden by default) */
        .vto-preview-wrap {
          display: none;
          position: relative;
          margin-bottom: 16px;
        }
        .vto-preview-wrap.vto-visible { display: block; }
        .vto-preview-img {
          width: 100%;
          max-height: 300px;
          object-fit: contain;
          border-radius: 12px;
          background: #f5f5f5;
        }
        .vto-preview-remove {
          position: absolute;
          top: 8px;
          right: 8px;
          background: rgba(0,0,0,0.7);
          color: #fff;
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          font-size: 20px;
          cursor: pointer;
          line-height: 1;
          transition: background 0.15s;
        }
        .vto-preview-remove:hover { background: rgba(0,0,0,0.9); }

        /* Generate button - Rounded */
        .vto-generate-btn {
          width: 100%;
          padding: 14px 16px;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .vto-generate-btn:hover:not(:disabled) { background: #333; }
        .vto-generate-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        /* Progress */
        .vto-progress-wrap {
          display: none;
          margin-top: 16px;
        }
        .vto-progress-wrap.vto-visible { display: block; }
        .vto-progress-label {
          margin: 0 0 8px;
          font-size: 14px;
          color: #666;
          text-align: center;
        }
        .vto-progress-track {
          height: 4px;
          background: #e0e0e0;
          border-radius: 2px;
          overflow: hidden;
        }
        .vto-progress-bar {
          height: 100%;
          background: #000;
          width: 0%;
          animation: progress 2s ease-in-out infinite;
        }
        @keyframes progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }

        /* Result - Prominent display */
        .vto-result-wrap {
          display: none;
          margin-top: 20px;
        }
        .vto-result-wrap.vto-visible { display: block; }
        .vto-result-img {
          width: 100%;
          max-height: 500px;
          object-fit: contain;
          border-radius: 12px;
          background: #f5f5f5;
          margin-bottom: 16px;
        }
        .vto-result-actions {
          display: flex;
          gap: 12px;
        }
        .vto-result-actions a,
        .vto-result-actions button {
          flex: 1;
          padding: 12px 16px;
          font-size: 14px;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
          border-radius: 50px;
          cursor: pointer;
          transition: all 0.2s;
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
          .vto-thumb { width: 60px; height: 60px; }
        }
      `;
            document.head.appendChild(style);
        },

        createTryOnButton: function () {
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
        },

        findProductImage: function () {
            var selectors = [
                // Horizon theme
                '.product__media-item img',
                '.product__media img',
                '.product-media-container img',
                // Dawn theme
                '.product__media-wrapper img',
                // Common patterns
                '.product-single__photo img',
                '.product-image-main img',
                '[data-product-featured-image]',
                '.product__main-photos img',
                'img[data-image-id]',
                '.product-photo-container img',
                '.product__image img',
                'img.product-featured-image',
                // Fallbacks
                'img[alt*="product"]',
                '.main-product-image img',
                '.product-gallery img',
                'img[src*="products"]',
                // Last resort: any img in product area
                '[class*="product"] img:not([class*="icon"]):not([class*="logo"])',
            ];

            var img = queryFirst(selectors);
            if (!img) return null;

            var src = img.currentSrc || img.src;
            return src ? src.split('?')[0] : null;
        },

        openModal: function () {
            this.productImage = this.findProductImage();
            if (!this.productImage) {
                alert('Não foi possível encontrar a imagem do produto.');
                return;
            }

            this.createModal();
        },

        createModal: function () {
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
          <div class="vto-thumbnails">
            <div>
              <img src="${this.productImage}" class="vto-thumb" alt="Produto">
              <div class="vto-thumb-label">Produto</div>
            </div>
            <div class="vto-thumb-user-wrap">
              <img class="vto-thumb vto-thumb-user" alt="Você">
              <div class="vto-thumb-label">Você</div>
            </div>
          </div>
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
        },

        attachModalEvents: function () {
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
        },

        handleFile: function (file) {
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
        },

        generate: function () {
            var progressWrap = this.modal.querySelector('.vto-progress-wrap');
            var generateBtn = this.modal.querySelector('.vto-generate-btn');
            var resultWrap = this.modal.querySelector('.vto-result-wrap');

            generateBtn.disabled = true;
            progressWrap.classList.add('vto-visible');
            resultWrap.classList.remove('vto-visible');
            this.hideError();

            var scriptTag = document.querySelector('script[src*="virtual-tryon.js"]');
            var apiEndpoint = scriptTag ? scriptTag.dataset.apiEndpoint : 'https://tryon-app-tau.vercel.app/api/tryon';

            fetch(apiEndpoint, {
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
                    var resultUrl = data.resultUrl || data.result_url || data.image || data.url;
                    if (!resultUrl) throw new Error('Resultado não encontrado na resposta');

                    var resultImg = this.modal.querySelector('.vto-result-img');
                    var downloadBtn = this.modal.querySelector('.vto-btn-download');
                    var thumbUser = this.modal.querySelector('.vto-thumb-user');

                    resultImg.src = resultUrl;
                    downloadBtn.href = resultUrl;
                    thumbUser.src = this.userImage;

                    progressWrap.classList.remove('vto-visible');
                    resultWrap.classList.add('vto-visible');
                }.bind(this))
                .catch(function (err) {
                    progressWrap.classList.remove('vto-visible');
                    generateBtn.disabled = false;
                    this.showError(err.message || 'Erro ao processar. Tente novamente.');
                }.bind(this));
        },

        reset: function () {
            var dropzone = this.modal.querySelector('.vto-dropzone');
            var previewWrap = this.modal.querySelector('.vto-preview-wrap');
            var generateBtn = this.modal.querySelector('.vto-generate-btn');
            var resultWrap = this.modal.querySelector('.vto-result-wrap');

            this.userImage = null;
            dropzone.style.display = 'block';
            previewWrap.classList.remove('vto-visible');
            resultWrap.classList.remove('vto-visible');
            generateBtn.disabled = true;
            this.hideError();
        },

        closeModal: function () {
            if (this.modal) {
                this.modal.remove();
                this.modal = null;
            }
        },

        showError: function (msg) {
            var errorEl = this.modal.querySelector('.vto-error');
            errorEl.textContent = msg;
            errorEl.classList.add('vto-visible');
            setTimeout(function () {
                errorEl.classList.remove('vto-visible');
            }, 6000);
        },

        hideError: function () {
            var errorEl = this.modal.querySelector('.vto-error');
            errorEl.classList.remove('vto-visible');
        },
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            new VirtualTryOn();
        });
    } else {
        new VirtualTryOn();
    }
})();
