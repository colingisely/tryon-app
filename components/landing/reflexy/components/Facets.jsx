'use client';

import { useEffect } from 'react';

export default function Facets() {
  useEffect(() => {
    /* ── §02 FACETS — lógica completa ── */
    (function() {
      'use strict';

      const T = {
        abyss:    "#06050F",
        onyx:     "#0F0D1E",
        plum:     "#2B1250",
        mauve:    "#7050A0",
        lavender: "#B8AEDD",
        mist:     "#EDEBF5",
        verdigris:"#0CC89E",
        dusk:     "#A09CC0",
        rule:     "rgba(184,174,221,0.14)",
        ruleV:    "rgba(184,174,221,0.26)",
      };

      const FONT = {
        mark:  "'Bricolage Grotesque', sans-serif",
        serif: "'Instrument Serif', serif",
        body:  "'DM Sans', sans-serif",
        data:  "'IBM Plex Mono', monospace",
      };

      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const durFast = prefersReduced ? "0ms" : "300ms";

      const FACETS = [
        {
          id: "visual", num: "01", label: "Reflexo Visual",
          title: "Provador Virtual com IA",
          quote: "Seu cliente se vê usando a peça antes de comprar.",
          desc: "Em até 15 segundos, uma simulação hiper-realista gerada por IA elimina a dúvida e aumenta a confiança na decisão de compra. O cliente faz upload de uma foto e vê a peça em si mesmo — com precisão de fit, cor e caimento.",
          iconId: "icon-eye",
          features: [
            "Geração em até 15 segundos",
            "Funciona com qualquer peça do catálogo",
            "Reduz devoluções por insegurança de fit",
            "Diferenciação competitiva imediata",
          ],
          stat: { value: "+38%", label: "conversão · benchmark setor", isData: true },
          secondStat: { value: "< 15s", label: "tempo de geração" },
          demoType: "tryon",
        },
        {
          id: "produto", num: "02", label: "Reflexo do Produto",
          title: "Studio Pro — Imagens 4K com IA",
          quote: "Transforme qualquer peça em imagem profissional — sem ensaio fotográfico.",
          desc: "Ideal para dropshipping, lançamentos rápidos e escala de produção de criativos. Gere imagens 4K sem modelo, sem estúdio e sem custo fixo — em até 60 segundos.",
          iconId: "icon-image",
          features: [
            "Imagens hiper-realistas em 4K",
            "Geração em até 60 segundos",
            "Sem modelo, sem estúdio, sem custo fixo",
            "Pronto para ads, e-commerce e campanhas",
          ],
          stat: { value: "4K", label: "resolução de imagem", isData: true },
          secondStat: { value: "< 60s", label: "por imagem" },
          demoType: "studio",
        },
        {
          id: "comportamental", num: "03", label: "Reflexo Comportamental",
          title: "Analytics de Intenção",
          quote: "O que o cliente prova, hesita, abandona — tudo vira inteligência.",
          desc: "Reflexy captura o que nenhuma métrica tradicional captura: o comportamento real durante a jornada de prova. Quais peças foram mais experimentadas, onde a hesitação aconteceu.",
          iconId: "icon-barchart3",
          features: [
            "Peças mais provadas por produto e SKU",
            "Detecção de hesitação por sessão",
            "Sinal de intenção — rastreamento add_to_cart",
            "Dados anonimizados — LGPD e GDPR",
          ],
          stat: { value: "+38%", label: "conversão com provador", isData: true },
          secondStat: { value: "21.7%", label: "hesitação detectada" },
          demoType: "analytics",
        },
        {
          id: "estrategico", num: "04", label: "Reflexo Estratégico",
          title: "Clareza para Decisões",
          quote: "Não apenas o que vendeu. O que foi provado, considerado — e onde a decisão foi tomada.",
          desc: "Com os quatro reflexos integrados, você enxerga o funil completo: da prova ao carrinho, do carrinho à compra. Sessões com provador comparadas às sem provador.",
          iconId: "icon-layoutdashboard",
          features: [
            "Funil completo — prova → carrinho → compra",
            "Impacto do provador nas vendas",
            "Sessões com provador vs. sem provador",
            "Jornada de cada sessão reconstruída",
          ],
          stat: { value: "19%", label: "conversão com provador", isData: true },
          secondStat: { value: "2.4%", label: "sem provador" },
          demoType: "dashboard",
        },
      ];

      let activeIndex = 0;
      let revealed = false;
      let statsVisible = false;
      let currentDemoCleanup = null;

      function makeSvgIcon(symbolId, size, color) {
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", size);
        svg.setAttribute("height", size);
        svg.setAttribute("fill", "none");
        svg.style.color = color;
        svg.style.flexShrink = "0";
        const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
        use.setAttribute("href", "#" + symbolId);
        use.setAttribute("stroke", color);
        svg.appendChild(use);
        return svg;
      }

      function animateCounter(el, value, delay) {
        const numericPart = value.replace(/[^0-9.]/g, "");
        const prefix = (value.match(/^[^0-9.]*/) || [""])[0];
        const suffix = (value.match(/[^0-9.]*$/) || [""])[0];
        const target = parseFloat(numericPart);

        if (isNaN(target)) { el.textContent = value; return null; }

        el.textContent = prefix + "0" + suffix;
        let outerTimer = null;
        let innerInterval = null;

        outerTimer = setTimeout(() => {
          const duration = 1200;
          const steps = 40;
          const stepTime = duration / steps;
          let current = 0;
          innerInterval = setInterval(() => {
            current++;
            const progress = current / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            const val = target * eased;
            el.textContent = prefix + (numericPart.includes(".") ? val.toFixed(1) : Math.round(val).toString()) + suffix;
            if (current >= steps) {
              clearInterval(innerInterval);
              innerInterval = null;
            }
          }, stepTime);
        }, delay);

        return () => {
          if (outerTimer) clearTimeout(outerTimer);
          if (innerInterval) clearInterval(innerInterval);
        };
      }

      function buildTryOnDemo(container) {
        const timers = [];
        let step = 0;

        const grid = document.createElement("div");
        grid.style.cssText = "display:grid;grid-template-columns:1fr 8px 1fr;gap:0;height:100%;min-height:160px;";

        const leftPanel = document.createElement("div");
        leftPanel.style.cssText = `background:${T.onyx};border:1px solid ${T.rule};padding:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;transition:box-shadow 700ms cubic-bezier(0.16,1,0.3,1);`;

        const uploadIcon = makeSvgIcon("icon-upload", 20, T.dusk);
        uploadIcon.style.transition = "all 300ms";

        const uploadLabel = document.createElement("span");
        uploadLabel.style.cssText = `font-family:${FONT.data};font-size:8px;letter-spacing:.15em;text-transform:uppercase;color:${T.dusk};opacity:.4;transition:all 300ms;`;
        uploadLabel.textContent = "Aguardando upload";

        const progressTrack = document.createElement("div");
        progressTrack.style.cssText = "width:100%;height:3px;background:rgba(184,174,221,.08);margin-top:4px;";
        const progressBar = document.createElement("div");
        progressBar.style.cssText = "height:100%;background:transparent;width:0%;transition:width 800ms cubic-bezier(0.16,1,0.3,1);";
        progressTrack.appendChild(progressBar);

        leftPanel.appendChild(uploadIcon);
        leftPanel.appendChild(uploadLabel);
        leftPanel.appendChild(progressTrack);

        const axis = document.createElement("div");
        axis.style.cssText = `background:linear-gradient(to bottom,transparent,${T.lavender}33 30%,${T.verdigris}88 50%,${T.lavender}33 70%,transparent);position:relative;`;

        const axisDot = document.createElement("div");
        axisDot.style.cssText = `position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:6px;height:6px;border-radius:50%;background:${T.lavender};box-shadow:0 0 4px ${T.lavender};transition:all 500ms;`;
        axis.appendChild(axisDot);

        const rightPanel = document.createElement("div");
        rightPanel.style.cssText = `background:${T.onyx};border:1px solid ${T.rule};padding:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;transition:box-shadow 700ms cubic-bezier(0.16,1,0.3,1);`;

        const waitLabel = document.createElement("span");
        waitLabel.style.cssText = `font-family:${FONT.data};font-size:8px;letter-spacing:.15em;text-transform:uppercase;color:${T.dusk};opacity:.3;`;
        waitLabel.textContent = "Aguardando";
        rightPanel.appendChild(waitLabel);

        grid.appendChild(leftPanel);
        grid.appendChild(axis);
        grid.appendChild(rightPanel);
        container.appendChild(grid);

        function applyStep1() {
          step = 1;
          leftPanel.style.boxShadow = "0 0 24px rgba(43,18,80,.4)";
          const u = uploadIcon.querySelector("use");
          if (u) u.setAttribute("stroke", T.lavender);
          uploadIcon.style.color = T.lavender;
          uploadLabel.style.color = T.lavender;
          uploadLabel.style.opacity = "1";
          uploadLabel.textContent = "Upload completo";
          progressBar.style.background = T.lavender;
          progressBar.style.width = "100%";
        }

        function applyStep2() {
          step = 2;
          axisDot.style.background = T.verdigris;
          axisDot.style.boxShadow = `0 0 8px ${T.verdigris}`;

          while (rightPanel.firstChild) rightPanel.removeChild(rightPanel.firstChild);

          const sparkIcon = makeSvgIcon("icon-sparkles", 20, T.dusk);
          sparkIcon.style.transition = "color 300ms";

          const procLabel = document.createElement("span");
          procLabel.style.cssText = `font-family:${FONT.data};font-size:8px;letter-spacing:.15em;text-transform:uppercase;color:${T.dusk};transition:color 300ms;`;
          procLabel.textContent = "Processando...";

          const shimTrack = document.createElement("div");
          shimTrack.style.cssText = "width:100%;height:3px;background:rgba(184,174,221,.08);overflow:hidden;";
          const shimBar = document.createElement("div");
          shimBar.style.cssText = `height:100%;width:60%;background:linear-gradient(90deg,transparent,${T.mauve},transparent);animation:shimmer 1.2s ease-in-out infinite;`;
          shimTrack.appendChild(shimBar);

          rightPanel.appendChild(sparkIcon);
          rightPanel.appendChild(procLabel);
          rightPanel.appendChild(shimTrack);
        }

        function applyStep3() {
          step = 3;
          const sparkIcon = rightPanel.querySelector("svg");
          if (sparkIcon) {
            const u = sparkIcon.querySelector("use");
            if (u) u.setAttribute("stroke", T.verdigris);
          }
          const procLabel = rightPanel.querySelectorAll("span")[0];
          if (procLabel) { procLabel.style.color = T.verdigris; procLabel.textContent = "Simulação pronta"; }
          const shimTrack = rightPanel.querySelector("div");
          if (shimTrack) rightPanel.removeChild(shimTrack);

          rightPanel.style.boxShadow = `0 0 24px rgba(12,200,158,.25)`;

          const checkRow = document.createElement("div");
          checkRow.style.cssText = "display:flex;align-items:center;gap:6px;margin-top:4px;";
          const checkIcon = makeSvgIcon("icon-check", 12, T.verdigris);
          const timeLabel = document.createElement("span");
          timeLabel.style.cssText = `font-family:${FONT.data};font-size:9px;color:${T.verdigris};letter-spacing:.08em;`;
          timeLabel.textContent = "~15s";
          checkRow.appendChild(checkIcon);
          checkRow.appendChild(timeLabel);
          rightPanel.appendChild(checkRow);
        }

        timers.push(setTimeout(applyStep1, 800));
        timers.push(setTimeout(applyStep2, 2200));
        timers.push(setTimeout(applyStep3, 3400));

        return () => timers.forEach(clearTimeout);
      }

      function buildStudioDemo(container) {
        const labels = ["4K", "ADV", "CAT", "ADS"];
        let activeCard = 0;

        const wrapper = document.createElement("div");
        wrapper.style.cssText = "display:flex;flex-direction:column;gap:12px;padding:16px 0;";

        const cardGrid = document.createElement("div");
        cardGrid.style.cssText = "display:grid;grid-template-columns:repeat(4,1fr);gap:8px;";

        const cards = labels.map((l, i) => {
          const card = document.createElement("div");
          card.style.cssText = `background:${T.onyx};border:1px solid ${T.rule};padding:16px 8px;text-align:center;transition:all 200ms cubic-bezier(0.4,0,0.2,1);`;

          const topLabel = document.createElement("div");
          topLabel.style.cssText = `font-family:${FONT.data};font-size:10px;color:${T.dusk};letter-spacing:.1em;margin-bottom:6px;transition:color 200ms;`;
          topLabel.textContent = l;

          const statusLabel = document.createElement("div");
          statusLabel.style.cssText = `font-family:${FONT.data};font-size:8px;color:${T.dusk};opacity:.3;letter-spacing:.12em;text-transform:uppercase;transition:all 200ms;`;
          statusLabel.textContent = "—";

          card.appendChild(topLabel);
          card.appendChild(statusLabel);
          cardGrid.appendChild(card);
          return { card, topLabel, statusLabel };
        });

        const footNote = document.createElement("div");
        footNote.style.cssText = `font-family:${FONT.data};font-size:8px;color:${T.dusk};opacity:.5;letter-spacing:.12em;text-transform:uppercase;text-align:center;`;
        footNote.textContent = "zero custo fixo · até 60s por imagem";

        wrapper.appendChild(cardGrid);
        wrapper.appendChild(footNote);
        container.appendChild(wrapper);

        function updateCards() {
          cards.forEach(({ card, topLabel, statusLabel }, i) => {
            const isActive = i === activeCard;
            card.style.background = isActive ? "rgba(43,18,80,.65)" : T.onyx;
            card.style.border = `1px solid ${isActive ? T.ruleV : T.rule}`;
            topLabel.style.color = isActive ? T.mist : T.dusk;
            const done = i <= activeCard;
            statusLabel.style.color = done ? T.verdigris : T.dusk;
            statusLabel.style.opacity = done ? "1" : ".3";
            statusLabel.textContent = done ? "pronto" : "—";
          });
        }

        updateCards();
        const interval = setInterval(() => {
          activeCard = (activeCard + 1) % 4;
          updateCards();
        }, 1500);

        return () => clearInterval(interval);
      }

      function buildAnalyticsDemo(container) {
        const items = [
          { label: "Prova iniciada",          value: "127 / dia",  color: T.verdigris },
          { label: "Adicionou ao carrinho",   value: "34.8%",      color: T.verdigris },
          { label: "Hesitação detectada",     value: "21.7%",      color: T.lavender  },
          { label: "Abandono pós-prova",      value: "14.1%",      color: T.dusk      },
        ];

        const wrapper = document.createElement("div");
        wrapper.style.cssText = `display:flex;flex-direction:column;gap:1px;background:${T.rule};`;

        items.forEach(item => {
          const row = document.createElement("div");
          row.style.cssText = `background:${T.abyss};padding:12px 16px;display:flex;justify-content:space-between;align-items:center;`;

          const lbl = document.createElement("span");
          lbl.style.cssText = `font-family:${FONT.body};font-size:12px;font-weight:300;color:${T.dusk};`;
          lbl.textContent = item.label;

          const val = document.createElement("span");
          val.style.cssText = `font-family:${FONT.data};font-size:11px;color:${item.color};letter-spacing:-.01em;`;
          val.textContent = item.value;

          row.appendChild(lbl);
          row.appendChild(val);
          wrapper.appendChild(row);
        });

        container.appendChild(wrapper);
        return () => {};
      }

      function buildDashboardDemo(container) {
        const bars    = [100, 34, 19];
        const colors  = [T.mauve, T.lavender, T.verdigris];
        const opacities = [".6", ".5", "1"];
        const labelsText = ["86 provas", "29 add_to_cart", "16 compras"];

        const wrapper = document.createElement("div");
        wrapper.style.cssText = "display:flex;flex-direction:column;gap:16px;";

        const title = document.createElement("div");
        title.style.cssText = `font-family:${FONT.data};font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:${T.dusk};opacity:.5;`;
        title.textContent = "Vestido Floral · ref. 0291";
        wrapper.appendChild(title);

        bars.forEach((w, i) => {
          const row = document.createElement("div");
          row.style.cssText = "display:flex;align-items:center;gap:12px;";

          const track = document.createElement("div");
          track.style.cssText = "flex:1;height:6px;background:rgba(184,174,221,.06);";

          const fill = document.createElement("div");
          fill.style.cssText = `height:100%;width:${w}%;background:${colors[i]};opacity:${opacities[i]};transition:width 700ms cubic-bezier(0.16,1,0.3,1);`;
          track.appendChild(fill);

          const lbl = document.createElement("span");
          lbl.style.cssText = `font-family:${FONT.data};font-size:9px;color:${T.dusk};min-width:100px;letter-spacing:.02em;`;
          lbl.textContent = labelsText[i];

          row.appendChild(track);
          row.appendChild(lbl);
          wrapper.appendChild(row);
        });

        const statsRow = document.createElement("div");
        statsRow.style.cssText = `display:flex;gap:24px;padding-top:8px;border-top:1px solid ${T.rule};`;

        const s1 = document.createElement("div");
        const s1Val = document.createElement("div");
        s1Val.style.cssText = `font-family:${FONT.data};font-size:18px;font-weight:500;color:${T.verdigris};letter-spacing:-.02em;`;
        s1Val.textContent = "19%";
        const s1Lbl = document.createElement("div");
        s1Lbl.style.cssText = `font-family:${FONT.data};font-size:8px;color:${T.dusk};letter-spacing:.1em;text-transform:uppercase;margin-top:2px;`;
        s1Lbl.textContent = "com provador";
        s1.appendChild(s1Val);
        s1.appendChild(s1Lbl);

        const s2 = document.createElement("div");
        const s2Val = document.createElement("div");
        s2Val.style.cssText = `font-family:${FONT.data};font-size:18px;font-weight:500;color:${T.dusk};letter-spacing:-.02em;opacity:.5;`;
        s2Val.textContent = "2.4%";
        const s2Lbl = document.createElement("div");
        s2Lbl.style.cssText = `font-family:${FONT.data};font-size:8px;color:${T.dusk};letter-spacing:.1em;text-transform:uppercase;margin-top:2px;opacity:.4;`;
        s2Lbl.textContent = "sem provador";
        s2.appendChild(s2Val);
        s2.appendChild(s2Lbl);

        statsRow.appendChild(s1);
        statsRow.appendChild(s2);
        wrapper.appendChild(statsRow);

        container.appendChild(wrapper);
        return () => {};
      }

      const DEMO_BUILDERS = {
        tryon:     buildTryOnDemo,
        studio:    buildStudioDemo,
        analytics: buildAnalyticsDemo,
        dashboard: buildDashboardDemo,
      };

      function renderNav() {
        const nav = document.getElementById("facet-nav");
        if (!nav) return;
        nav.innerHTML = "";

        FACETS.forEach((f, i) => {
          const btn = document.createElement("button");
          const isActive = i === activeIndex;

          btn.style.cssText = `background:${isActive ? T.onyx : T.abyss};border:none;cursor:pointer;padding:24px 20px;display:flex;flex-direction:column;gap:10px;align-items:flex-start;position:relative;overflow:hidden;transition:background ${durFast} cubic-bezier(0.4,0,0.2,1);width:100%;`;

          const line = document.createElement("div");
          line.style.cssText = `position:absolute;top:0;left:0;right:0;height:2px;background:${isActive ? T.lavender : "transparent"};transition:background ${durFast};`;
          btn.appendChild(line);

          const topRow = document.createElement("div");
          topRow.style.cssText = "display:flex;align-items:center;gap:10px;width:100%;";

          const numSpan = document.createElement("span");
          numSpan.style.cssText = `font-family:${FONT.data};font-size:9px;letter-spacing:.15em;color:${isActive ? T.lavender : T.dusk};opacity:${isActive ? 1 : .4};transition:all ${durFast};`;
          numSpan.textContent = f.num;

          const icon = makeSvgIcon(f.iconId, 16, isActive ? T.lavender : T.dusk);
          icon.style.opacity = isActive ? ".8" : ".35";
          icon.style.transition = `all ${durFast}`;

          topRow.appendChild(numSpan);
          topRow.appendChild(icon);
          btn.appendChild(topRow);

          const labelSpan = document.createElement("span");
          labelSpan.style.cssText = `font-family:${FONT.mark};font-weight:500;font-size:11px;letter-spacing:.08em;text-transform:uppercase;text-align:left;color:${isActive ? T.mist : T.dusk};opacity:${isActive ? 1 : .5};transition:all ${durFast};`;
          labelSpan.textContent = f.label;
          btn.appendChild(labelSpan);

          btn.addEventListener("click", () => handleFacetChange(i));
          nav.appendChild(btn);
        });
      }

      let counterCleanups = [];

      function renderPanels() {
        const facet = FACETS[activeIndex];
        const left  = document.getElementById("panel-left");
        const right = document.getElementById("panel-right");

        counterCleanups.forEach(fn => fn && fn());
        counterCleanups = [];

        if (currentDemoCleanup) { currentDemoCleanup(); currentDemoCleanup = null; }
        if (!left || !right) return;

        left.innerHTML = "";

        const facetLbl = document.createElement("div");
        facetLbl.style.cssText = `font-family:${FONT.data};font-size:8px;letter-spacing:.18em;text-transform:uppercase;color:${T.dusk};opacity:.5;`;
        facetLbl.textContent = `Faceta ${facet.num} / 04`;
        left.appendChild(facetLbl);

        const h3 = document.createElement("h3");
        h3.style.cssText = `font-family:${FONT.mark};font-weight:600;font-size:clamp(20px,2.5vw,28px);letter-spacing:-.02em;line-height:1.15;color:${T.mist};margin:0;`;
        h3.textContent = facet.title;
        left.appendChild(h3);

        const quote = document.createElement("p");
        quote.style.cssText = `font-family:${FONT.serif};font-style:italic;font-size:clamp(14px,1.6vw,17px);color:${T.dusk};line-height:1.5;letter-spacing:.02em;margin:0;padding-left:16px;border-left:1px solid ${T.lavender};`;
        quote.textContent = facet.quote;
        left.appendChild(quote);

        const desc = document.createElement("p");
        desc.style.cssText = `font-family:${FONT.body};font-weight:300;font-size:14px;line-height:1.75;color:${T.dusk};margin:0;max-width:440px;`;
        desc.textContent = facet.desc;
        left.appendChild(desc);

        const featList = document.createElement("div");
        featList.style.cssText = "display:flex;flex-direction:column;gap:8px;margin-top:4px;";
        facet.features.forEach(feat => {
          const row = document.createElement("div");
          row.style.cssText = "display:flex;align-items:flex-start;gap:10px;";

          const chk = makeSvgIcon("icon-check", 14, T.lavender);
          chk.style.marginTop = "2px";
          chk.style.flexShrink = "0";
          chk.style.opacity = ".6";

          const txt = document.createElement("span");
          txt.style.cssText = `font-family:${FONT.body};font-weight:300;font-size:13px;color:${T.dusk};line-height:1.5;`;
          txt.textContent = feat;

          row.appendChild(chk);
          row.appendChild(txt);
          featList.appendChild(row);
        });
        left.appendChild(featList);

        right.innerHTML = "";

        const demoLbl = document.createElement("div");
        demoLbl.style.cssText = `font-family:${FONT.data};font-size:8px;letter-spacing:.15em;text-transform:uppercase;color:${T.dusk};opacity:.4;`;
        demoLbl.textContent = `${facet.label} · reflexy_${facet.id}_${facet.num}`;
        right.appendChild(demoLbl);

        const demoPanel = document.createElement("div");
        demoPanel.style.cssText = `background:rgba(15,13,30,.65);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);border:1px solid rgba(184,174,221,.13);padding:24px;min-height:200px;`;
        right.appendChild(demoPanel);

        const builder = DEMO_BUILDERS[facet.demoType];
        currentDemoCleanup = builder ? builder(demoPanel) : null;

        const statsRow = document.createElement("div");
        statsRow.style.cssText = `display:flex;gap:48px;padding-top:16px;border-top:1px solid ${T.rule};`;

        const s1 = document.createElement("div");
        const s1Val = document.createElement("div");
        s1Val.style.cssText = `font-family:${FONT.data};font-size:28px;font-weight:500;color:${facet.stat.isData ? T.verdigris : T.mist};letter-spacing:-.02em;line-height:1;`;
        s1Val.textContent = "0";
        const s1Lbl = document.createElement("div");
        s1Lbl.style.cssText = `font-family:${FONT.body};font-size:13px;color:${T.dusk};margin-top:4px;font-weight:300;`;
        s1Lbl.textContent = facet.stat.label;
        s1.appendChild(s1Val);
        s1.appendChild(s1Lbl);

        const s2 = document.createElement("div");
        const s2Val = document.createElement("div");
        s2Val.style.cssText = `font-family:${FONT.data};font-size:28px;font-weight:500;color:${T.dusk};letter-spacing:-.02em;line-height:1;`;
        s2Val.textContent = "0";
        const s2Lbl = document.createElement("div");
        s2Lbl.style.cssText = `font-family:${FONT.body};font-size:13px;color:${T.dusk};margin-top:4px;font-weight:300;opacity:.6;`;
        s2Lbl.textContent = facet.secondStat.label;
        s2.appendChild(s2Val);
        s2.appendChild(s2Lbl);

        statsRow.appendChild(s1);
        statsRow.appendChild(s2);
        right.appendChild(statsRow);

        if (statsVisible) {
          counterCleanups.push(animateCounter(s1Val, facet.stat.value, 200));
          counterCleanups.push(animateCounter(s2Val, facet.secondStat.value, 500));
        } else {
          s1Val._statValue = facet.stat.value;
          s1Val._statDelay = 200;
          s2Val._statValue = facet.secondStat.value;
          s2Val._statDelay = 500;
        }

        const liveRow = document.createElement("div");
        liveRow.style.cssText = `display:flex;align-items:center;gap:8px;font-family:${FONT.data};font-size:8px;letter-spacing:.12em;text-transform:uppercase;color:${T.dusk};opacity:.4;`;
        const dot = document.createElement("div");
        dot.style.cssText = `width:5px;height:5px;border-radius:50%;background:${T.verdigris};box-shadow:0 0 6px ${T.verdigris};flex-shrink:0;`;
        const liveText = document.createTextNode("live — shopify integration active");
        liveRow.appendChild(dot);
        liveRow.appendChild(liveText);
        right.appendChild(liveRow);

        right._s1Val = s1Val;
        right._s2Val = s2Val;
      }

      function handleFacetChange(i) {
        activeIndex = i;
        renderNav();
        renderPanels();
      }

      function triggerReveal() {
        revealed = true;

        const eyebrow      = document.getElementById("eyebrow");
        const secTitle     = document.getElementById("sec-title");
        const secSub       = document.getElementById("sec-sub");
        const facetNav     = document.getElementById("facet-nav");
        const facetContent = document.getElementById("facet-content");
        const bottomNote   = document.getElementById("bottom-note");

        if (eyebrow)      { eyebrow.style.opacity = "1";      eyebrow.style.transform = "translateY(0)"; }
        if (secTitle)     { secTitle.style.opacity = "1";     secTitle.style.transform = "translateY(0)"; }
        if (secSub)       { secSub.style.opacity = "1";       secSub.style.transform = "translateY(0)"; }
        if (facetNav)     { facetNav.style.opacity = "1";     facetNav.style.transform = "translateY(0)"; }
        if (facetContent) { facetContent.style.opacity = "1"; }
        if (bottomNote)   { bottomNote.style.opacity = "1"; }

        setTimeout(() => {
          statsVisible = true;
          const right = document.getElementById("panel-right");
          if (right && right._s1Val && right._s2Val) {
            counterCleanups.push(animateCounter(right._s1Val, right._s1Val._statValue || FACETS[activeIndex].stat.value, 200));
            counterCleanups.push(animateCounter(right._s2Val, right._s2Val._statValue || FACETS[activeIndex].secondStat.value, 500));
          }
        }, 400);
      }

      renderNav();
      renderPanels();

      const section = document.getElementById("reflexy-section");
      if (section) {
        const obs = new IntersectionObserver(([entry]) => {
          if (entry.isIntersecting) {
            triggerReveal();
            obs.disconnect();
          }
        }, { threshold: 0.15 });
        obs.observe(section);
      }
    })();

    /* ── §02 FACETS — ResizeObserver para responsividade ── */
    const inner       = document.getElementById('inner');
    const facetNav    = document.getElementById('facet-nav');
    const facetContent = document.getElementById('facet-content');
    let ro = null;

    function applyResponsiveLayout() {
      if (!inner) return;
      const mobile = window.innerWidth <= 768;
      inner.style.padding = mobile ? '0 24px' : '0 64px';
      if (facetNav)     facetNav.style.gridTemplateColumns    = mobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)';
      if (facetContent) facetContent.style.gridTemplateColumns = mobile ? '1fr' : '1fr 1fr';
    }

    if (inner) {
      applyResponsiveLayout();
      ro = new ResizeObserver(applyResponsiveLayout);
      ro.observe(document.body);
      window.addEventListener('resize', applyResponsiveLayout);
    }

    return () => {
      if (ro) { ro.disconnect(); window.removeEventListener('resize', applyResponsiveLayout); }
    };
  }, []);

  return (
    <>
      {/* ── §02 FACETS ── */}
      <div id="reflexy-section" style={{background:'#06050F',color:'#EDEBF5',fontFamily:"'DM Sans',sans-serif",fontWeight:300,minHeight:'100vh',padding:'112px 0',position:'relative',overflow:'hidden',WebkitFontSmoothing:'antialiased',borderBottom:'1px solid rgba(184,174,221,0.14)'}}>

        {/* Ambient glow */}
        <div style={{position:'absolute',top:'30%',left:'50%',transform:'translate(-50%,-50%)',width:'500px',height:'500px',borderRadius:'50%',background:'radial-gradient(circle,rgba(43,18,80,.3) 0%,transparent 70%)',pointerEvents:'none'}}></div>

        {/* Inner container */}
        <div id="inner" style={{maxWidth:'1080px',margin:'0 auto',padding:'0 64px',position:'relative',zIndex:1}}>

          {/* EYEBROW */}
          <div id="eyebrow" style={{fontFamily:"'IBM Plex Mono',monospace",fontSize:'9px',letterSpacing:'.30em',textTransform:'uppercase',color:'#0CC89E',display:'flex',alignItems:'center',gap:'14px',marginBottom:'48px',opacity:0,transform:'translateY(12px)',transition:'opacity 700ms cubic-bezier(0.16,1,0.3,1),transform 700ms cubic-bezier(0.16,1,0.3,1)'}}>
            <div style={{width:'20px',height:'1px',background:'#0CC89E',opacity:.6}}></div>
            A Solução
          </div>

          {/* SECTION TITLE */}
          <h2 id="sec-title" style={{fontFamily:"'Bricolage Grotesque',sans-serif",fontWeight:600,fontSize:'clamp(24px,3vw,38px)',letterSpacing:'-.02em',lineHeight:1.1,color:'#EDEBF5',margin:'0 0 12px 0',opacity:0,transform:'translateY(16px)',transition:'opacity 700ms cubic-bezier(0.16,1,0.3,1) 100ms,transform 700ms cubic-bezier(0.16,1,0.3,1) 100ms'}}>
            Quatro reflexos. Uma plataforma.
          </h2>

          {/* SUBTITLE */}
          <p id="sec-sub" style={{fontFamily:"'Instrument Serif',serif",fontStyle:'italic',fontSize:'clamp(15px,2vw,20px)',color:'#A09CC0',lineHeight:1.5,maxWidth:'640px',margin:'0 0 64px 0',letterSpacing:'.02em',opacity:0,transform:'translateY(16px)',transition:'opacity 700ms cubic-bezier(0.16,1,0.3,1) 200ms,transform 700ms cubic-bezier(0.16,1,0.3,1) 200ms'}}>
            Como a luz que atravessa uma gema, Reflexy transforma cada interação em camadas de inteligência.
          </p>

          {/* FACET NAVIGATION */}
          <div id="facet-nav" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'1px',background:'rgba(184,174,221,0.14)',border:'1px solid rgba(184,174,221,0.14)',marginBottom:'1px',opacity:0,transform:'translateY(20px)',transition:'opacity 700ms cubic-bezier(0.16,1,0.3,1) 300ms,transform 700ms cubic-bezier(0.16,1,0.3,1) 300ms'}}></div>

          {/* FACET CONTENT PANEL */}
          <div id="facet-content" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'1px',background:'rgba(184,174,221,0.14)',border:'1px solid rgba(184,174,221,0.14)',borderTop:'none',opacity:0,transition:'opacity 700ms cubic-bezier(0.16,1,0.3,1) 400ms'}}>
            {/* LEFT */}
            <div id="panel-left" style={{background:'#0F0D1E',padding:'48px',display:'flex',flexDirection:'column',gap:'24px'}}></div>
            {/* RIGHT */}
            <div id="panel-right" style={{background:'#06050F',padding:'48px 40px',display:'flex',flexDirection:'column',gap:'24px'}}></div>
          </div>

          {/* BOTTOM NOTE */}
          <div id="bottom-note" style={{marginTop:'32px',padding:'20px 28px',background:'#0F0D1E',border:'1px solid rgba(184,174,221,0.14)',borderLeft:'2px solid #B8AEDD',opacity:0,transition:'opacity 700ms cubic-bezier(0.16,1,0.3,1) 600ms'}}>
            <p style={{fontFamily:"'DM Sans',sans-serif",fontWeight:300,fontSize:'13px',lineHeight:1.75,color:'#A09CC0',margin:0}}>
              <span style={{color:'#B8AEDD',fontWeight:500}}>Integração completa:</span>{' '}
              Os quatro reflexos operam como um sistema unificado dentro do Shopify. Instale uma vez — os dados fluem automaticamente entre provador, studio, analytics e dashboard.
            </p>
          </div>

        </div>{/* /inner */}
      </div>{/* /section */}

      {/* SVG Icons (inline, reusáveis via symbols pelo JS dos Facets) */}
      <svg xmlns="http://www.w3.org/2000/svg" style={{display:'none'}}>
        <symbol id="icon-eye" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
        </symbol>
        <symbol id="icon-image" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
        </symbol>
        <symbol id="icon-barchart3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/>
        </symbol>
        <symbol id="icon-layoutdashboard" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/>
          <rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
        </symbol>
        <symbol id="icon-sparkles" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
          <path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>
        </symbol>
        <symbol id="icon-upload" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/>
        </symbol>
        <symbol id="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12"/>
        </symbol>
      </svg>
    </>
  );
}
