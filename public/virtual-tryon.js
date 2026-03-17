/**
 * virtual-tryon.js
 * Inject a "Provar em Mim" (Try On Me) button into Shopify product pages.
 * v2.4 — Integrated ReflexyAnalytics & Conversion Tracking Modules
 */
(function () {
    'use strict';

    // ─── Reflexy Analytics Module ─────────────────────────────────────────────
    const ReflexyAnalytics = (function () {
        const ENDPOINT = '/api/analytics';
        let _state = {
            sessionId: null,
            productId: null,
            variantId: null,
            sizeLabel: null,
            modalOpenAt: null,
            initiated: false,
        };

        function getSessionId() {
            if (!_state.sessionId) {
                _state.sessionId = sessionStorage.getItem('reflexy_session_id') || 'rxs_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
                sessionStorage.setItem('reflexy_session_id', _state.sessionId);
            }
            return _state.sessionId;
        }

        function send(eventType, productId, sessionId, metadata) {
            const payload = JSON.stringify({
                event_type: eventType,
                product_id: String(productId),
                session_id: String(sessionId),
                metadata: metadata,
            });
            try {
                if (navigator.sendBeacon) {
                    navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'application/json' }));
                } else {
                    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
                }
            } catch (_) {}
        }

        function resolveVariantSize(variantId) {
            const id = String(variantId);
            try {
                const meta = window?.ShopifyAnalytics?.meta?.product;
                if (meta?.variants) {
                    const variant = meta.variants.find(v => String(v.id) === id);
                    if (variant && variant.title !== 'Default Title') {
                        const options = meta.options || [];
                        const sizeIdx = options.findIndex(o => /size|tamanho/i.test(o));
                        const idx = sizeIdx >= 0 ? sizeIdx : 0;
                        return { size_label: variant['option' + (idx + 1)] || variant.title, option_name: options[idx] || 'Size', source: 'shopify_analytics' };
                    }
                }
            } catch (_) {}
            try {
                const el = document.querySelector('[id^="ProductJson"], script[data-product-json]');
                if (el) {
                    const data = JSON.parse(el.textContent);
                    const variant = data?.variants?.find(v => String(v.id) === id);
                    if (variant) {
                        const options = (data.options || []);
                        const sizeIdx = options.findIndex(o => /size|tamanho/i.test(o));
                        const idx = sizeIdx >= 0 ? sizeIdx : 0;
                        return { size_label: variant['option' + (idx + 1)] || variant.title, option_name: options[idx] || 'Size', source: 'product_json_dom' };
                    }
                }
            } catch (_) {}
            try {
                const el = document.querySelector(`select option[value="${id}"], input[type="radio"][value="${id}"]`);
                if (el) {
                    const label = el.dataset.optionValue || el.getAttribute('aria-label') || el.textContent?.trim();
                    if (label) return { size_label: label, option_name: 'size', source: 'native_dom' };
                }
            } catch (_) {}
            return { size_label: `variant:${id}`, option_name: 'unknown', source: 'fallback' };
        }

        function readSelectedVariantId() {
            const select = document.querySelector('select[name="id"], .product-form__input select, [data-variant-id]');
            if (select?.value) return select.value;
            const radio = document.querySelector('input[type="radio"][name="id"]:checked, input[type="radio"][name="options[Size]"]:checked, input[type="radio"][data-index="option1"]:checked');
            if (radio?.value) return radio.value;
            const form = document.querySelector('form[action="/cart/add"]');
            return form?.dataset?.variantId || null;
        }

        function readProductId() {
            const fromAnalytics = window?.ShopifyAnalytics?.meta?.product?.id || window?.meta?.product?.id;
            if (fromAnalytics) return String(fromAnalytics);
            const el = document.querySelector('[data-product-id], form[action="/cart/add"]');
            return el?.dataset?.productId || 'unknown';
        }

        const track = {
            tryonInitiated: function () {
                const sessionId = getSessionId();
                const productId = readProductId();
                const variantId = readSelectedVariantId();
                const { size_label, option_name, source } = variantId ? resolveVariantSize(variantId) : { size_label: null, option_name: null, source: 'no_variant' };

                _state = { sessionId, productId, variantId, sizeLabel: size_label, modalOpenAt: Date.now(), initiated: true };

                send('tryon_initiated', productId, sessionId, { variant_id: variantId, size_label, option_name, size_source: source, page_url: window.location.pathname, referrer: document.referrer || null });
                if (variantId && size_label) {
                    send('size_selected', productId, sessionId, { variant_id: variantId, size_label, option_name, resolve_source: source, triggered_by: 'tryon_button_click' });
                }
            },
            tryonCompleted: function (generationStartedAt) {
                if (!_state.initiated) return;
                const durationMs = Date.now() - generationStartedAt;
                send('tryon_completed', _state.productId, getSessionId(), { variant_id: _state.variantId, size_label: _state.sizeLabel, duration_ms: durationMs, duration_bucket: durationMs < 15000 ? 'fast' : durationMs < 40000 ? 'normal' : 'slow' });
            },
            modalClosed: function (options = {}) {
                const { imageWasShown = true, closedBy = 'unknown' } = options;
                if (!_state.initiated) return;
                const dwellMs = _state.modalOpenAt ? Date.now() - _state.modalOpenAt : null;
                const dwellBucket = dwellMs === null ? 'unknown' : dwellMs < 3000 ? 'glance' : dwellMs < 15000 ? 'engaged' : 'deep_consider';

                send('modal_closed', _state.productId, getSessionId(), { variant_id: _state.variantId, size_label: _state.sizeLabel, dwell_time_ms: dwellMs, dwell_time_bucket: dwellBucket, image_was_shown: imageWasShown, closed_by: closedBy });
                _state = { sessionId: getSessionId(), productId: null, variantId: null, sizeLabel: null, modalOpenAt: null, initiated: false };
            },
        };

        return { track, getSessionId };
    })();

    // ─── Reflexy Conversion Tracking Module ───────────────────────────────────
    const ReflexyConversion = (function () {
        const ENDPOINT = '/api/analytics';

        function send(eventType, productId, sessionId, metadata) {
            const payload = JSON.stringify({ event_type: eventType, product_id: String(productId ?? 'unknown'), session_id: String(sessionId), metadata });
            try {
                if (navigator.sendBeacon) {
                    navigator.sendBeacon(ENDPOINT, new Blob([payload], { type: 'application/json' }));
                } else {
                    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
                }
            } catch (_) {}
        }

        function getSessionId() {
            return sessionStorage.getItem('reflexy_session_id') || 'no_session';
        }

        function parseCartAddBody(body) {
            try {
                if (typeof body === 'string') {
                    try {
                        const parsed = JSON.parse(body);
                        return { variant_id: String(parsed.id ?? parsed.variant_id ?? ''), quantity: Number(parsed.quantity ?? 1), properties: parsed.properties ?? {} };
                    } catch (_) {}
                    const params = new URLSearchParams(body);
                    return { variant_id: params.get('id') ?? params.get('variant_id') ?? '', quantity: Number(params.get('quantity') ?? 1), properties: {} };
                }
                if (body instanceof FormData) {
                    return { variant_id: body.get('id') ?? body.get('variant_id') ?? '', quantity: Number(body.get('quantity') ?? 1), properties: {} };
                }
            } catch (_) {}
            return { variant_id: '', quantity: 1, properties: {} };
        }

        function patchFetch() {
            const _originalFetch = window.fetch;
            window.fetch = async function (input, init = {}) {
                const url = typeof input === 'string' ? input : input?.url ?? '';
                if (/\/cart\/add(\.js)?/.test(url) && (init.method ?? 'GET').toUpperCase() === 'POST') {
                    const response = await _originalFetch.apply(this, arguments);
                    if (response.ok) {
                        try {
                            const data = await response.clone().json();
                            const { variant_id, quantity, properties } = parseCartAddBody(init.body);
                            const productId = String(data.product_id ?? data.variant?.product_id ?? 'unknown');
                            send('add_to_cart', productId, getSessionId(), { variant_id: variant_id || String(data.variant_id ?? data.id ?? ''), quantity, product_title: data.product_title ?? data.title ?? null, variant_title: data.variant_title ?? null, price_cents: data.price ?? null, properties, from_tryon_session: getSessionId() !== 'no_session', source: 'fetch_intercept' });
                        } catch (_) {}
                    }
                    return response;
                }
                return _originalFetch.apply(this, arguments);
            };
        }

        function patchXHR() {
            const _originalOpen = XMLHttpRequest.prototype.open;
            const _originalSend = XMLHttpRequest.prototype.send;
            XMLHttpRequest.prototype.open = function (method, url, ...rest) {
                this._reflexy_url = url;
                this._reflexy_method = method;
                return _originalOpen.apply(this, [method, url, ...rest]);
            };
            XMLHttpRequest.prototype.send = function (body) {
                const url = this._reflexy_url ?? '';
                const method = (this._reflexy_method ?? 'GET').toUpperCase();
                if (/\/cart\/add(\.js)?/.test(url) && method === 'POST') {
                    this.addEventListener('load', () => {
                        if (this.status >= 200 && this.status < 300) {
                            try {
                                const data = JSON.parse(this.responseText);
                                const { variant_id, quantity, properties } = parseCartAddBody(body);
                                send('add_to_cart', String(data.product_id ?? 'unknown'), getSessionId(), { variant_id: variant_id || String(data.variant_id ?? ''), quantity, product_title: data.product_title ?? null, variant_title: data.variant_title ?? null, price_cents: data.price ?? null, properties, from_tryon_session: getSessionId() !== 'no_session', source: 'xhr_intercept' });
                            } catch (_) {}
                        }
                    });
                }
                return _originalSend.apply(this, arguments);
            };
        }

        function patchFormSubmit() {
            document.addEventListener('submit', function (e) {
                const form = e.target;
                if (!form || form.action?.indexOf('/cart/add') === -1) return;
                const variantId = form.querySelector('[name="id"]')?.value ?? '';
                const quantity = Number(form.querySelector('[name="quantity"]')?.value ?? 1);
                if (!variantId) return;
                send('add_to_cart', readProductId(), getSessionId(), { variant_id: variantId, quantity, from_tryon_session: getSessionId() !== 'no_session', source: 'form_submit' });
            }, { capture: true });
        }

        function readProductId() {
            return String(window?.ShopifyAnalytics?.meta?.product?.id ?? document.querySelector('[data-product-id]')?.dataset?.productId ?? 'unknown');
        }

        function init() {
            patchFetch();
            patchXHR();
            patchFormSubmit();
        }

        return { init };
    })();

    // ─── Main Class & Helpers ───────────────────────────────────────────────────
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = e => resolve(e.target.result);
            reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
            reader.readAsDataURL(file);
        });
    }

    function queryFirst(selectors, context = document) {
        for (const selector of selectors) {
            const el = context.querySelector(selector);
            if (el) return el;
        }
        return null;
    }

    class VirtualTryOn {
        constructor(config) {
            this.config = config;
            this.productImage = null;
            this.userImage = null;
            this.modal = null;
            this._stylesInjected = false;
            this._generationStartedAt = null;

            if (this.isProductPage()) {
                this.init();
            }
        }

        isProductPage() {
            return window?.Shopify?.product || window?.ShopifyAnalytics?.meta?.page?.pageType === 'product' || /\/products\//.test(window.location.pathname);
        }

        init() {
            this.injectStyles();
            this.createTryOnButton();
            ReflexyConversion.init(); // Initialize conversion tracking
        }

        injectStyles() {
            if (this._stylesInjected) return;
            this._stylesInjected = true;
            const style = document.createElement('style');
            style.id = 'vto-styles';
            style.textContent = `
                .vto-button { display: block; width: 100%; margin-bottom: 10px; padding: 13px 16px; background: #1a1a1a; color: #fff; border: 1px solid #333; border-radius: 8px; cursor: pointer; font-size: 15px; font-weight: 600; text-align: center; transition: background 0.2s, transform 0.1s; }
                .vto-button:hover { background: #333; }
                .vto-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.65); z-index: 999998; display: flex; align-items: center; justify-content: center; padding: 16px; animation: vtoFadeIn 0.2s ease; }
                .vto-modal { position: relative; background: #fff; border-radius: 16px; box-shadow: 0 24px 80px rgba(0,0,0,0.3); width: 100%; max-width: 520px; padding: 32px 28px 28px; animation: vtoSlideUp 0.25s ease; overflow: hidden; }
                .vto-close { position: absolute; top: 14px; right: 18px; background: none; border: none; font-size: 22px; cursor: pointer; color: #555; line-height: 1; padding: 4px 8px; border-radius: 6px; transition: background 0.15s; }
                .vto-close:hover { background: #f0f0f0; }
                .vto-title { margin: 0 0 6px; font-size: 20px; font-weight: 700; color: #111; }
                .vto-subtitle { margin: 0 0 20px; font-size: 13px; color: #777; }
                .vto-product-thumb { display: block; max-height: 120px; border-radius: 8px; margin: 0 auto 20px; object-fit: contain; }
                .vto-dropzone { border: 2px dashed #ccc; border-radius: 12px; padding: 28px 20px; text-align: center; cursor: pointer; transition: border-color 0.2s, background 0.2s; background: #fafafa; position: relative; }
                .vto-dropzone.vto-drag-over { border-color: #1a1a1a; background: #f0f0f0; }
                .vto-dropzone-icon { font-size: 36px; margin-bottom: 8px; display: block; }
                .vto-dropzone-text { font-size: 14px; color: #555; margin: 0; line-height: 1.5; }
                .vto-dropzone-hint { font-size: 12px; color: #aaa; margin: 6px 0 0; }
                .vto-file-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
                .vto-preview-wrap { display: none; position: relative; text-align: center; margin-bottom: 20px; }
                .vto-preview-wrap.vto-visible { display: block; }
                .vto-preview-img { width: 100%; max-height: 200px; object-fit: cover; border-radius: 10px; }
                .vto-preview-remove { position: absolute; top: 6px; right: 6px; background: rgba(0,0,0,0.5); color: #fff; border: none; border-radius: 50%; width: 26px; height: 26px; cursor: pointer; font-size: 14px; line-height: 26px; text-align: center; padding: 0; }
                .vto-generate-btn { display: block; width: 100%; margin-top: 16px; padding: 14px; background: linear-gradient(135deg, #1a1a1a 0%, #444 100%); color: #fff; border: none; border-radius: 10px; font-size: 15px; font-weight: 700; cursor: pointer; transition: opacity 0.2s, transform 0.1s; }
                .vto-generate-btn:disabled { opacity: 0.4; cursor: not-allowed; }
                .vto-progress-wrap { display: none; margin-top: 16px; }
                .vto-progress-wrap.vto-visible { display: block; }
                .vto-progress-label { font-size: 13px; color: #555; margin-bottom: 6px; text-align: center; }
                .vto-progress-track { height: 6px; background: #eee; border-radius: 99px; overflow: hidden; }
                .vto-progress-bar { height: 100%; width: 0%; background: linear-gradient(90deg, #1a1a1a, #777); border-radius: 99px; transition: width 0.4s ease; }
                .vto-result-wrap { display: none; margin-top: 20px; }
                .vto-result-wrap.vto-visible { display: block; }
                .vto-result-img { width: 100%; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
                .vto-result-actions { display: flex; gap: 10px; margin-top: 12px; }
                .vto-result-actions a, .vto-result-actions button { flex: 1; padding: 10px; border-radius: 8px; font-size: 14px; font-weight: 600; text-align: center; text-decoration: none; cursor: pointer; }
                .vto-btn-download { background: #1a1a1a; color: #fff; border: none; }
                .vto-btn-retry { background: none; color: #1a1a1a; border: 1px solid #ccc; }
                .vto-error { display: none; margin-top: 14px; padding: 10px 14px; background: #fff0f0; border: 1px solid #fcc; border-radius: 8px; font-size: 13px; color: #c00; text-align: center; }
                @keyframes vtoFadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes vtoSlideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
            `;
            document.head.appendChild(style);
        }

        createTryOnButton() {
            const form = queryFirst(['form[action*="/cart/add"]', 'form.product-form', 'form[data-type="add-to-cart-form"]', '#product-form', '.product__form']);
            if (!form) return console.warn('[VirtualTryOn] Formulário de produto não encontrado.');
            const addBtn = queryFirst(['button[name="add"]', 'button.product-form__submit', 'button[data-add-to-cart]', 'button.add-to-cart', 'button[type="submit"]'], form);
            if (!addBtn) return console.warn('[VirtualTryOn] Botão "Adicionar ao Carrinho" não encontrado.');
            if (document.querySelector('.vto-button')) return;

            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'vto-button';
            btn.innerHTML = '👗 Provar em Mim';
            btn.setAttribute('aria-label', 'Abrir virtual try-on');
            btn.addEventListener('click', this.openModal.bind(this));
            addBtn.parentNode.insertBefore(btn, addBtn);
        }

        getProductImage() {
            const selectors = ['.product__media-item--main img', '.product--large .product__media-item img', '.product-gallery__image img', '.product-single__photo img', '.product-featured-img', '#main-product-image', 'img.featured-image', '.product-image-container img', '.product__photo img', '[data-product-featured-image]', '.product-images img:first-child', '.main-product-image img', 'img[itemprop="image"]'];
            const img = queryFirst(selectors);
            if (img) {
                let src = img.dataset.src || img.dataset.lazySrc || img.currentSrc || img.src;
                if (src && src.startsWith('//')) src = 'https:' + src;
                return src || null;
            }
            const allImgs = Array.from(document.querySelectorAll('img'));
            for (const el of allImgs) {
                if (el.naturalWidth > 300 && el.naturalHeight > 300) {
                    const s = el.currentSrc || el.src;
                    if (s && !s.includes('logo') && !s.includes('icon')) return s;
                }
            }
            return null;
        }

        openModal() {
            this.productImage = this.getProductImage();
            if (!this.productImage) return alert('Não foi possível encontrar a imagem do produto.');
            this._removeModal();
            ReflexyAnalytics.track.tryonInitiated();

            const overlay = document.createElement('div');
            overlay.className = 'vto-overlay';
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
                        <input class="vto-file-input" type="file" id="vtoFileInput" accept="image/jpeg,image/png,image/webp">
                        <span class="vto-dropzone-icon">📷</span>
                        <p class="vto-dropzone-text">Arraste sua foto ou <strong>clique para selecionar</strong></p>
                        <p class="vto-dropzone-hint">JPG ou PNG · máx. 10 MB</p>
                    </div>
                    <div class="vto-preview-wrap" id="vtoPreviewWrap"><img class="vto-preview-img" id="vtoPreviewImg" src=""><button class="vto-preview-remove" id="vtoPreviewRemove">✕</button></div>
                    <button class="vto-generate-btn" id="vtoGenerateBtn" disabled>✨ Gerar look com IA</button>
                    <div class="vto-progress-wrap" id="vtoProgressWrap"><p class="vto-progress-label" id="vtoProgressLabel">Processando…</p><div class="vto-progress-track"><div class="vto-progress-bar" id="vtoProgressBar"></div></div></div>
                    <div class="vto-result-wrap" id="vtoResultWrap"><img class="vto-result-img" id="vtoResultImg" src=""><div class="vto-result-actions"><a class="vto-btn-download" id="vtoDownloadBtn" download="tryon-result.jpg">⬇ Baixar</a><button class="vto-btn-retry" id="vtoRetryBtn">↺ Tentar Novamente</button></div></div>
                    <div class="vto-error" id="vtoError"></div>
                </div>`;
        }

        _bindModalEvents() {
            const self = this;
            const overlay = this.modal;
            overlay.addEventListener('click', e => { if (e.target === overlay) self._removeModal('overlay_click'); });
            overlay.querySelector('.vto-close').addEventListener('click', () => self._removeModal('close_button'));
            this._escHandler = e => { if (e.key === 'Escape') self._removeModal('escape_key'); };
            document.addEventListener('keydown', this._escHandler);
            overlay.querySelector('#vtoFileInput').addEventListener('change', e => { if (e.target.files?.[0]) self.handleFileUpload(e.target.files[0]); });
            const dropzone = overlay.querySelector('#vtoDropzone');
            dropzone.addEventListener('dragover', e => { e.preventDefault(); dropzone.classList.add('vto-drag-over'); });
            dropzone.addEventListener('dragleave', () => dropzone.classList.remove('vto-drag-over'));
            dropzone.addEventListener('drop', e => {
                e.preventDefault();
                dropzone.classList.remove('vto-drag-over');
                if (e.dataTransfer?.files?.[0]) self.handleFileUpload(e.dataTransfer.files[0]);
            });
            overlay.querySelector('#vtoPreviewRemove').addEventListener('click', () => {
                self.userImage = null;
                overlay.querySelector('#vtoPreviewWrap').classList.remove('vto-visible');
                overlay.querySelector('#vtoDropzone').style.display = '';
                overlay.querySelector('#vtoGenerateBtn').disabled = true;
                overlay.querySelector('#vtoResultWrap').classList.remove('vto-visible');
                overlay.querySelector('#vtoError').classList.remove('vto-visible');
            });
            overlay.querySelector('#vtoGenerateBtn').addEventListener('click', () => self.generateLook());
            overlay.querySelector('#vtoRetryBtn').addEventListener('click', () => {
                self.userImage = null;
                overlay.querySelector('#vtoPreviewWrap').classList.remove('vto-visible');
                overlay.querySelector('#vtoDropzone').style.display = '';
                overlay.querySelector('#vtoResultWrap').classList.remove('vto-visible');
                overlay.querySelector('#vtoProgressWrap').classList.remove('vto-visible');
                overlay.querySelector('#vtoError').classList.remove('vto-visible');
                overlay.querySelector('#vtoGenerateBtn').disabled = true;
            });
        }

        _removeModal(closedBy = 'unknown') {
            const imageWasShown = !!this.modal?.querySelector('#vtoResultWrap.vto-visible');
            ReflexyAnalytics.track.modalClosed({ imageWasShown, closedBy });
            if (this.modal) {
                document.body.removeChild(this.modal);
                this.modal = null;
            }
            document.body.style.overflow = '';
            if (this._escHandler) {
                document.removeEventListener('keydown', this._escHandler);
                this._escHandler = null;
            }
            if (this._progressInterval) {
                clearInterval(this._progressInterval);
                this._progressInterval = null;
            }
        }

        handleFileUpload(file) {
            if (!file.type.startsWith('image/')) return this.showError('Por favor, selecione um arquivo de imagem.');
            if (file.size > 10 * 1024 * 1024) return this.showError('A imagem deve ter no máximo 10 MB.');

            fileToBase64(file).then(dataUri => {
                this.userImage = dataUri;
                const overlay = this.modal;
                if (!overlay) return;
                overlay.querySelector('#vtoPreviewImg').src = dataUri;
                overlay.querySelector('#vtoPreviewWrap').classList.add('vto-visible');
                overlay.querySelector('#vtoDropzone').style.display = 'none';
                overlay.querySelector('#vtoGenerateBtn').disabled = false;
                overlay.querySelector('#vtoError').classList.remove('vto-visible');
            }).catch(err => this.showError(`Falha ao carregar a imagem: ${err.message}`));
        }

        generateLook() {
            if (!this.userImage) return this.showError('Envie uma foto antes de gerar o look.');
            if (!this.productImage) return this.showError('Imagem do produto não disponível.');

            const self = this;
            const overlay = this.modal;
            overlay.querySelector('#vtoResultWrap').classList.remove('vto-visible');
            overlay.querySelector('#vtoError').classList.remove('vto-visible');
            overlay.querySelector('#vtoGenerateBtn').disabled = true;
            this.showLoading(0);
            this._generationStartedAt = Date.now();

            let progress = 0;
            this._progressInterval = setInterval(() => {
                if (progress < 85) {
                    progress += Math.random() * 4;
                    self.showLoading(Math.min(progress, 85));
                }
            }, 400);

            fetch(this.config.apiEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: this.userImage, productImage: this.productImage, shop: this.config.shop }) })
                .then(res => {
                    if (!res.ok) return res.json().catch(() => ({})).then(data => { throw new Error(data.message || `Erro do servidor (${res.status}).`); });
                    return res.json();
                })
                .then(data => {
                    clearInterval(self._progressInterval);
                    self._progressInterval = null;
                    self.showLoading(100);
                    const resultUrl = data.resultUrl || data.result_url || data.image || data.url;
                    if (!resultUrl) throw new Error('A IA não retornou uma imagem válida.');
                    setTimeout(() => {
                        overlay.querySelector('#vtoProgressWrap').classList.remove('vto-visible');
                        self.displayResult(resultUrl);
                        overlay.querySelector('#vtoGenerateBtn').disabled = false;
                    }, 500);
                })
                .catch(err => {
                    clearInterval(self._progressInterval);
                    self._progressInterval = null;
                    overlay.querySelector('#vtoProgressWrap').classList.remove('vto-visible');
                    overlay.querySelector('#vtoGenerateBtn').disabled = false;
                    self.showError(err.message || 'Ocorreu um erro. Tente novamente.');
                });
        }

        showLoading(progress) {
            const overlay = this.modal;
            if (!overlay) return;
            const wrap = overlay.querySelector('#vtoProgressWrap');
            const bar = overlay.querySelector('#vtoProgressBar');
            const label = overlay.querySelector('#vtoProgressLabel');
            wrap.classList.add('vto-visible');
            bar.style.width = `${Math.min(100, progress).toFixed(1)}%`;
            label.textContent = progress < 30 ? 'Analisando a imagem…' : progress < 60 ? 'Aplicando o look com IA…' : progress < 90 ? 'Finalizando detalhes…' : 'Quase pronto…';
        }

        displayResult(imageUrl) {
            const overlay = this.modal;
            if (!overlay) return;
            const resultImg = overlay.querySelector('#vtoResultImg');
            const downloadBtn = overlay.querySelector('#vtoDownloadBtn');
            overlay.querySelector('#vtoResultWrap').classList.add('vto-visible');
            resultImg.src = imageUrl;
            downloadBtn.href = imageUrl;
            ReflexyAnalytics.track.tryonCompleted(this._generationStartedAt);
        }

        showError(message) {
            const overlay = this.modal;
            if (!overlay) return console.error('[VirtualTryOn]', message);
            const errorEl = overlay.querySelector('#vtoError');
            errorEl.textContent = `⚠️ ${message}`;
            errorEl.classList.add('vto-visible');
            setTimeout(() => errorEl.classList.remove('vto-visible'), 6000);
        }
    }

    // ─── Bootstrap ────────────────────────────────────────────────────────────
    function bootstrap() {
        const scriptTag = document.querySelector('script[src*="virtual-tryon.js"]');
        const shop = scriptTag?.dataset.shop;
        const apiEndpoint = scriptTag?.dataset.apiEndpoint || 'https://tryon-app-tau.vercel.app/api/tryon';

        if (shop) {
            new VirtualTryOn({ shop, apiEndpoint });
        } else if (/\/products\//.test(window.location.pathname)) {
            console.info('[VirtualTryOn] Rodando em modo de desenvolvimento.');
            new VirtualTryOn({ shop: window.location.hostname, apiEndpoint });
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
        bootstrap();
    }
})();
