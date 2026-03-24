/**
 * Virtual Try-On Plugin for Shopify
 * Professional virtual fitting room experience
 * v2.5 - Theme-adaptive, two-mode UI (Rápido + Premium MAX), analytics & conversion tracking
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
            tryonCompleted: function (generationStartedAt, mode) {
                if (!_state.initiated) return;
                const durationMs = Date.now() - generationStartedAt;
                send('tryon_completed', _state.productId, getSessionId(), { variant_id: _state.variantId, size_label: _state.sizeLabel, duration_ms: durationMs, duration_bucket: durationMs < 15000 ? 'fast' : durationMs < 40000 ? 'normal' : 'slow', mode: mode || 'unknown' });
            },
            modalClosed: function (options) {
                options = options || {};
                const imageWasShown = options.imageWasShown !== undefined ? options.imageWasShown : true;
                const closedBy = options.closedBy || 'unknown';
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
            window.fetch = async function (input, init) {
                init = init || {};
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
            XMLHttpRequest.prototype.open = function (method, url) {
                this._reflexy_url = url;
                this._reflexy_method = method;
                return _originalOpen.apply(this, arguments);
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

    // ─── Helpers ──────────────────────────────────────────────────────────────

    function fileToBase64(file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onload = function (e) { resolve(e.target.result); };
            reader.onerror = function () { reject(new Error('Falha ao ler o arquivo.')); };
            reader.readAsDataURL(file);
        });
    }

    // Compress + resize before sending — keeps payload well under 4.5MB Vercel limit
    function compressImage(file) {
        return new Promise(function (resolve, reject) {
            var reader = new FileReader();
            reader.onerror = function () { reject(new Error('Falha ao ler o arquivo.')); };
            reader.onload = function (e) {
                var img = new Image();
                img.onerror = function () { reject(new Error('Falha ao processar a imagem.')); };
                img.onload = function () {
                    var MAX_DIM = 1024;
                    var w = img.width, h = img.height;
                    if (w > MAX_DIM || h > MAX_DIM) {
                        if (w >= h) { h = Math.round(h * MAX_DIM / w); w = MAX_DIM; }
                        else { w = Math.round(w * MAX_DIM / h); h = MAX_DIM; }
                    }
                    var canvas = document.createElement('canvas');
                    canvas.width = w;
                    canvas.height = h;
                    canvas.getContext('2d').drawImage(img, 0, 0, w, h);
                    resolve(canvas.toDataURL('image/jpeg', 0.88));
                };
                img.src = e.target.result;
            };
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
            this.sessionId = this.generateSessionId();
            this.modalOpenTime = null;
            this._hideBadge = false; // set to true for Enterprise plan via /api/widget/config

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
            ReflexyConversion.init();
            this._fetchWidgetConfig();
        }

        _fetchWidgetConfig() {
            if (!this.config.apiKey) return;
            var self = this;
            var base = this.config.apiEndpoint.replace(/\/api\/tryon.*$/, '');
            fetch(base + '/api/widget/config?key=' + encodeURIComponent(this.config.apiKey))
                .then(function(r) { return r.ok ? r.json() : {}; })
                .then(function(cfg) { self._hideBadge = !!cfg.hideBadge; })
                .catch(function() { /* fail silently */ });
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

        /* ─── Mode Toggle ─── */
        /* Hidden while premium mode is disabled in widget — remove display:none to restore */
        .vto-mode-toggle {
          display: none;
          margin-top: 16px;
          border: 1.5px solid #e0e0e0;
          border-radius: ${t.borderRadius};
          overflow: hidden;
          background: #f8f8f8;
        }
        .vto-mode-option {
          flex: 1;
          padding: 10px 8px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-family: ${t.fontFamily};
          font-size: 13px;
          color: #666;
          transition: all 0.25s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          position: relative;
        }
        .vto-mode-option:first-child {
          border-right: 1.5px solid #e0e0e0;
        }
        .vto-mode-option.vto-mode-active {
          background: #fff;
          color: #111;
          font-weight: 600;
        }
        .vto-mode-option.vto-mode-active.vto-mode-fast {
          box-shadow: inset 0 -2px 0 ${t.primaryColor};
        }
        .vto-mode-option.vto-mode-active.vto-mode-premium {
          box-shadow: inset 0 -2px 0 ${t.primaryColor};
        }
        .vto-mode-option:hover:not(.vto-mode-active) {
          background: #f0f0f0;
        }
        .vto-mode-name {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
        }
        .vto-mode-desc {
          font-size: 11px;
          color: #999;
          font-weight: 400;
        }
        .vto-mode-option.vto-mode-active .vto-mode-desc {
          color: #777;
        }
        .vto-mode-badge {
          font-size: 9px;
          background: #333;
          color: #fff;
          padding: 1px 5px;
          border-radius: 3px;
          font-weight: 700;
          letter-spacing: 0.3px;
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

        /* ─── Email Gate ─── */
        .vto-email-gate {
          margin-top: 16px;
          padding: 16px;
          background: #f9f9f9;
          border: 1px solid #ebebeb;
          border-radius: ${t.borderRadius};
          text-align: center;
        }
        .vto-gate-title {
          font-size: 14px;
          font-weight: 600;
          color: #111;
          margin: 0 0 4px;
        }
        .vto-gate-desc {
          font-size: 12px;
          color: #888;
          margin: 0 0 12px;
          line-height: 1.4;
        }
        .vto-email-label {
          font-size: 12px;
          color: #666;
          margin: 0 0 8px;
          font-weight: 500;
        }
        .vto-email-row {
          display: flex;
          gap: 8px;
        }
        .vto-email-input {
          flex: 1;
          padding: 9px 12px;
          border: 1px solid #ddd;
          border-radius: ${t.borderRadius};
          font-size: 13px;
          font-family: ${t.fontFamily};
          color: #111;
          background: #fff;
          outline: none;
          transition: border-color 0.2s;
        }
        .vto-email-input:focus { border-color: rgba(${primaryRgb}, 0.5); }
        .vto-email-btn {
          padding: 9px 16px;
          background: ${t.primaryColor};
          color: ${t.primaryTextColor};
          border: none;
          border-radius: ${t.borderRadius};
          font-size: 13px;
          font-weight: 600;
          font-family: ${t.fontFamily};
          cursor: pointer;
          white-space: nowrap;
          transition: opacity 0.2s;
        }
        .vto-email-btn:hover { opacity: 0.85; }
        .vto-email-confirm {
          font-size: 12px;
          color: #22a87a;
          margin: 8px 0 0;
          display: none;
        }

        /* ─── Lead Capture (post-generation) ─── */
        .vto-lead-capture {
          margin-top: 12px;
          padding: 12px 14px;
          background: #f9f9f9;
          border: 1px solid #ebebeb;
          border-radius: ${t.borderRadius};
          text-align: center;
          display: none;
        }
        .vto-lead-capture .vto-email-row { justify-content: center; }

        /* ─── Brand ─── */
        .vto-brand {
          font-size: 11px;
          color: #c8c8c8;
          text-align: center;
          margin: 20px 0 0;
          padding-top: 14px;
          border-top: 1px solid #f0f0f0;
        }
        .vto-brand a {
          color: inherit;
          text-decoration: none;
        }
        .vto-brand a:hover { color: #888; }

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
                    if (src && src.startsWith('http')) {
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
            this.modalOpenTime = Date.now();
            this.trackEvent('tryon_initiated');
            ReflexyAnalytics.track.tryonInitiated();
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
        
        <div class="vto-mode-toggle">
          <button type="button" class="vto-mode-option vto-mode-fast vto-mode-active" data-mode="fast">
            <span class="vto-mode-name">Rápido</span>
            <span class="vto-mode-desc">~15 seg</span>
          </button>
          <!-- Premium MAX: desativado no widget (disponível no Studio Pro) — remover display:none para reativar -->
          <button type="button" class="vto-mode-option vto-mode-premium" data-mode="premium" style="display:none">
            <span class="vto-mode-name">Premium <span class="vto-mode-badge">MAX</span></span>
            <span class="vto-mode-desc">~1 min &middot; Melhor qualidade</span>
          </button>
        </div>
        
        <button class="vto-generate-btn" disabled>${ICONS.camera} Experimentar</button>
        
        <div class="vto-progress-wrap">
          <p class="vto-progress-label">Gerando sua prova virtual com IA premium...</p>
          <p class="vto-progress-sublabel" style="font-size:11px;color:#aaa;text-align:center;margin-top:4px;">Isso pode levar até 1 minuto para o melhor resultado</p>
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

        <div class="vto-lead-capture">
          <p class="vto-email-label">Receber esta foto por email</p>
          <div class="vto-email-row">
            <input type="email" class="vto-lead-input vto-email-input" placeholder="seu@email.com">
            <button type="button" class="vto-lead-btn vto-email-btn">Enviar</button>
          </div>
          <p class="vto-lead-confirm vto-email-confirm">&#10003; Ótimo! Em breve você recebe sua foto.</p>
        </div>

        <div class="vto-email-gate" style="display:none">
          <p class="vto-gate-title">Quer tentar de novo?</p>
          <p class="vto-gate-desc">Deixe seu email para liberar mais uma geração gratuita.</p>
          <div class="vto-email-row">
            <input type="email" class="vto-email-input" placeholder="seu@email.com">
            <button type="button" class="vto-email-btn">Liberar</button>
          </div>
          <p class="vto-email-confirm">&#10003; Pronto! Pode enviar sua foto.</p>
        </div>

        ${this._hideBadge ? '' : '<p class="vto-brand">Powered by <a href="https://reflexy.co" target="_blank" rel="noopener">Reflexy</a></p>'}
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

            // Mode toggle
            self.selectedMode = 'fast'; // Default (premium hidden — available in Studio Pro only)
            var modeOptions = modal.querySelectorAll('.vto-mode-option');
            modeOptions.forEach(function(opt) {
                opt.addEventListener('click', function() {
                    modeOptions.forEach(function(o) { o.classList.remove('vto-mode-active'); });
                    opt.classList.add('vto-mode-active');
                    self.selectedMode = opt.getAttribute('data-mode');
                    self.updateProgressLabels();
                });
            });

            // Auto-detect product price and pre-select mode
            self.autoSelectMode();

            // Generate
            generateBtn.addEventListener('click', function() { self.generate(); });

            // Retry — gate on 2nd attempt
            retryBtn.addEventListener('click', function() {
                if (self._hasGeneratedOnce && !self._emailCaptured) {
                    self.showEmailGate();
                } else {
                    self.reset();
                }
            });

            // Lead capture (post-generation)
            var leadCapture = modal.querySelector('.vto-lead-capture');
            var leadInput = modal.querySelector('.vto-lead-input');
            var leadBtn = modal.querySelector('.vto-lead-btn');
            var leadConfirm = modal.querySelector('.vto-lead-confirm');
            if (leadBtn) {
                leadBtn.addEventListener('click', function() {
                    var email = leadInput ? leadInput.value.trim() : '';
                    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        if (leadInput) leadInput.style.borderColor = '#f87171';
                        return;
                    }
                    if (leadInput) leadInput.style.borderColor = '';
                    leadBtn.disabled = true;
                    var captureEndpoint = self.config.apiEndpoint.replace(/\/api\/tryon.*$/, '/api/tryon/email-capture');
                    fetch(captureEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: email, shop: self.config.shop, result_url: self._resultUrl }),
                    }).catch(function() {}).finally(function() {
                        self._leadCaptured = true;
                        var row = leadCapture ? leadCapture.querySelector('.vto-email-row') : null;
                        if (row) row.style.display = 'none';
                        if (leadConfirm) leadConfirm.style.display = 'block';
                        setTimeout(function() {
                            if (leadCapture) leadCapture.style.display = 'none';
                        }, 2500);
                    });
                });
            }

            // Email gate submit
            var emailGate = modal.querySelector('.vto-email-gate');
            var emailInput = modal.querySelector('.vto-email-input:not(.vto-lead-input)');
            var emailBtn = modal.querySelector('.vto-email-btn:not(.vto-lead-btn)');
            var emailConfirm = modal.querySelector('.vto-email-confirm:not(.vto-lead-confirm)');
            if (emailBtn) {
                emailBtn.addEventListener('click', function() {
                    var email = emailInput ? emailInput.value.trim() : '';
                    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                        emailInput.style.borderColor = '#f87171';
                        return;
                    }
                    emailInput.style.borderColor = '';
                    emailBtn.disabled = true;
                    var captureEndpoint = self.config.apiEndpoint.replace(/\/api\/tryon.*$/, '/api/tryon/email-capture');
                    fetch(captureEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: email, shop: self.config.shop, result_url: self._resultUrl }),
                    }).catch(function() {}).finally(function() {
                        self._emailCaptured = true;
                        if (emailConfirm) emailConfirm.style.display = 'block';
                        var row = emailGate ? emailGate.querySelector('.vto-email-row') : null;
                        if (row) row.style.display = 'none';
                        setTimeout(function() {
                            if (emailGate) emailGate.style.display = 'none';
                            self.reset();
                        }, 1400);
                    });
                });
            }
        }

        autoSelectMode() {
            // Try to detect product price from the page
            var priceEl = document.querySelector('.price__regular .price-item--regular, .product-price, .price .money, [data-product-price], .price-item, .product__price');
            if (priceEl) {
                var priceText = priceEl.textContent || '';
                var priceNum = parseFloat(priceText.replace(/[^0-9.,]/g, '').replace(',', '.'));
                if (!isNaN(priceNum)) {
                    // Products under 150 BRL: default to fast
                    if (priceNum < 150) {
                        this.selectedMode = 'fast';
                        var modeOptions = this.modal.querySelectorAll('.vto-mode-option');
                        modeOptions.forEach(function(o) { o.classList.remove('vto-mode-active'); });
                        var fastBtn = this.modal.querySelector('.vto-mode-fast');
                        if (fastBtn) fastBtn.classList.add('vto-mode-active');
                    }
                    // Products 150+ BRL: keep premium (default)
                }
            }
        }

        updateProgressLabels() {
            var progressLabel = this.modal.querySelector('.vto-progress-label');
            var progressSublabel = this.modal.querySelector('.vto-progress-sublabel');
            if (this.selectedMode === 'fast') {
                if (progressLabel) progressLabel.textContent = 'Gerando resultado r\u00e1pido...';
                if (progressSublabel) progressSublabel.textContent = 'Resultado em ~15 segundos';
            } else {
                if (progressLabel) progressLabel.textContent = 'Gerando sua prova virtual com IA premium...';
                if (progressSublabel) progressSublabel.textContent = 'Isso pode levar at\u00e9 1 minuto para o melhor resultado';
            }
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

            compressImage(file).then(function (base64) {
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
            this._generationStartedAt = Date.now();

            // Update progress labels based on selected mode
            this.updateProgressLabels();

            var isFast = this.selectedMode === 'fast';
            var progressSpeed = isFast ? 6 : 2;
            var progress = 0;
            var progressLabel = this.modal.querySelector('.vto-progress-label');
            var interval = setInterval(function () {
                progress += Math.random() * progressSpeed;
                if (progress > 95) progress = 95;
                progressBar.style.width = progress + '%';
                if (isFast) {
                    if (progress > 40 && progress < 70 && progressLabel) {
                        progressLabel.textContent = 'Ajustando a pe\u00e7a...';
                    } else if (progress >= 70 && progressLabel) {
                        progressLabel.textContent = 'Quase pronto...';
                    }
                } else {
                    if (progress > 20 && progress < 45 && progressLabel) {
                        progressLabel.textContent = 'Analisando a pe\u00e7a e ajustando o caimento...';
                    } else if (progress >= 45 && progress < 75 && progressLabel) {
                        progressLabel.textContent = 'Preservando detalhes do produto...';
                    } else if (progress >= 75 && progressLabel) {
                        progressLabel.textContent = 'Finalizando com qualidade m\u00e1xima...';
                    }
                }
            }, 1000);

            var productInfo = this.getProductInfo();
            fetch(this.config.apiEndpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    image: this.userImage,
                    productImage: this.productImage,
                    mode: this.selectedMode || 'premium',
                    apiKey: this.config.apiKey,
                    productTitle: productInfo.name || null,
                    productDescription: productInfo.description || null,
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
                        this.trackEvent('tryon_completed', { mode: this.selectedMode });
                        ReflexyAnalytics.track.tryonCompleted(this._generationStartedAt, this.selectedMode);
                        this.showResult(data.resultUrl);
                    }.bind(this), 400);
                }.bind(this))
                .catch(function (err) {
                    this.trackEvent('tryon_failed', { error: err.message, mode: this.selectedMode });
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

            // Hide upload section, preview, subtitle, header, and generate button
            var uploadSection = this.modal.querySelector('.vto-upload-section');
            var previewWrap = this.modal.querySelector('.vto-preview-wrap');
            var subtitle = this.modal.querySelector('.vto-subtitle');
            var header = this.modal.querySelector('.vto-header');
            var generateBtn = this.modal.querySelector('.vto-generate-btn');
            if (uploadSection) uploadSection.style.display = 'none';
            if (previewWrap) previewWrap.style.display = 'none';
            if (subtitle) subtitle.style.display = 'none';
            if (header) header.style.display = 'none';
            if (generateBtn) generateBtn.style.display = 'none';

            resultImg.src = url;
            this._resultUrl = url;
            this._hasGeneratedOnce = true;
            resultWrap.classList.add('vto-visible');

            // Show post-generation lead capture (unless email already captured this session)
            var leadCapture = this.modal.querySelector('.vto-lead-capture');
            if (leadCapture && !this._leadCaptured) leadCapture.style.display = 'block';

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

        showEmailGate() {
            var resultWrap = this.modal.querySelector('.vto-result-wrap');
            var emailGate = this.modal.querySelector('.vto-email-gate');
            if (resultWrap) resultWrap.classList.remove('vto-visible');
            if (emailGate) emailGate.style.display = 'block';
        }

        reset() {
            var previewWrap = this.modal.querySelector('.vto-preview-wrap');
            var dropzone = this.modal.querySelector('.vto-dropzone');
            var generateBtn = this.modal.querySelector('.vto-generate-btn');
            var resultWrap = this.modal.querySelector('.vto-result-wrap');
            var uploadSection = this.modal.querySelector('.vto-upload-section');
            var subtitle = this.modal.querySelector('.vto-subtitle');
            var header = this.modal.querySelector('.vto-header');
            var emailGate = this.modal.querySelector('.vto-email-gate');
            var leadCapture = this.modal.querySelector('.vto-lead-capture');
            var modeToggle = this.modal.querySelector('.vto-mode-toggle');

            this.userImage = null;
            previewWrap.classList.remove('vto-visible');
            previewWrap.style.display = '';
            resultWrap.classList.remove('vto-visible');
            if (emailGate) emailGate.style.display = 'none';
            if (leadCapture) leadCapture.style.display = 'none';
            dropzone.style.display = 'block';
            if (uploadSection) uploadSection.style.display = '';
            if (subtitle) subtitle.style.display = '';
            if (header) header.style.display = '';
            if (modeToggle) modeToggle.style.display = '';
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
            if (this.modalOpenTime) {
                var timeSpent = Math.round((Date.now() - this.modalOpenTime) / 1000);
                this.trackEvent('modal_closed', { time_spent_seconds: timeSpent });
                this.modalOpenTime = null;
            }
            var imageWasShown = !!(this.modal && this.modal.querySelector('.vto-result-wrap.vto-visible'));
            ReflexyAnalytics.track.modalClosed({ imageWasShown: imageWasShown, closedBy: 'user' });
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

        generateSessionId() {
            return 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }

        trackEvent(eventType, metadata) {
            if (!this.config.apiKey) return;

            var productInfo = this.getProductInfo();
            var payload = {
                api_key: this.config.apiKey,
                event_type: eventType,
                product_id: productInfo.id,
                product_name: productInfo.name,
                product_image_url: this.productImage,
                session_id: this.sessionId,
                user_fingerprint: this.getUserFingerprint(),
                metadata: metadata || {}
            };

            fetch(this.config.apiEndpoint.replace('/tryon', '/analytics'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            }).catch(function() {}); // Silent fail
        }

        getProductInfo() {
            var productId = null;
            var productName = null;
            var productDescription = null;

            // Try to get product ID from URL or meta tags
            var urlMatch = window.location.pathname.match(/\/products\/([^\/\?]+)/);
            if (urlMatch) productId = urlMatch[1];

            var metaProduct = document.querySelector('meta[property="og:title"]');
            if (metaProduct) productName = metaProduct.content;

            if (!productName) {
                var titleEl = document.querySelector('.product-title, .product__title, h1');
                if (titleEl) productName = titleEl.textContent.trim();
            }

            // Extract product description for garment analysis context
            var descEl = document.querySelector('.product-description, .product__description, [data-product-description], .product-single__description, .product-desc, .description');
            if (descEl) {
                productDescription = descEl.textContent.trim().substring(0, 300);
            }
            if (!productDescription) {
                var metaDesc = document.querySelector('meta[name="description"]');
                if (metaDesc) productDescription = metaDesc.content.substring(0, 300);
            }

            return { id: productId, name: productName, description: productDescription };
        }

        getUserFingerprint() {
            // Simple fingerprint based on screen and navigator
            var fp = [screen.width, screen.height, navigator.language, navigator.platform].join('|');
            return btoa(fp).substr(0, 16);
        }
    }

    // ─── Init ─────────────────────────────────────────────────────────────────

    var scriptTag = document.currentScript;
    var config = {
        shop: scriptTag ? scriptTag.dataset.shop : '',
        apiEndpoint: scriptTag ? scriptTag.dataset.apiEndpoint : 'https://tryon-app-tau.vercel.app/api/tryon',
        apiKey: (window.TryOnConfig && window.TryOnConfig.apiKey) || null,
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () {
            new VirtualTryOn(config);
        });
    } else {
        new VirtualTryOn(config);
    }
})();
