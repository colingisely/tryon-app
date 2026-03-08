'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  const [lang, setLang] = useState<'pt' | 'en'>('pt');
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeDemo, setActiveDemo] = useState<number>(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const stats = {
    pt: [
      { value: '+38%', label: 'Aumento médio em conversão' },
      { value: '-52%', label: 'Redução em devoluções' },
      { value: '4K', label: 'Imagens profissionais geradas por IA' },
      { value: '< 15s', label: 'Tempo médio de geração' },
    ],
    en: [
      { value: '+38%', label: 'Average conversion increase' },
      { value: '-52%', label: 'Return rate reduction' },
      { value: '4K', label: 'AI-generated professional images' },
      { value: '< 15s', label: 'Average generation time' },
    ],
  };

  const problems = {
    pt: [
      { icon: '↩', title: 'Altas taxas de devolução', desc: 'Tamanho errado, caimento diferente do esperado, decepção com o produto real.' },
      { icon: '🤔', title: 'Baixa confiança na compra', desc: 'Sem poder experimentar, o cliente hesita. A dúvida vira abandono de carrinho.' },
      { icon: '📷', title: 'Custo alto de fotografia', desc: 'Ensaios profissionais são caros, lentos e inescaláveis para catálogos grandes.' },
      { icon: '📊', title: 'Dados superficiais', desc: 'Cliques e vendas não revelam intenção. Você não sabe o que o cliente realmente queria.' },
    ],
    en: [
      { icon: '↩', title: 'High return rates', desc: 'Wrong size, unexpected fit, disappointment with the actual product.' },
      { icon: '🤔', title: 'Low purchase confidence', desc: "Without trying it on, the customer hesitates. Doubt becomes cart abandonment." },
      { icon: '📷', title: 'High photography costs', desc: 'Professional shoots are expensive, slow, and unscalable for large catalogs.' },
      { icon: '📊', title: 'Shallow data', desc: "Clicks and sales don't reveal intent. You don't know what the customer really wanted." },
    ],
  };

  const layers = {
    pt: [
      { number: '01', tag: 'Reflexo Visual', title: 'Provador Virtual com IA', desc: 'Seu cliente experimenta a peça antes de comprar. Em segundos, uma simulação hiper-realista gerada por IA elimina a dúvida e aumenta a confiança na decisão de compra.', bullets: ['Geração em menos de 15 segundos', 'Funciona com qualquer peça do catálogo', 'Reduz devoluções por insegurança', 'Diferenciação competitiva imediata'] },
      { number: '02', tag: 'Reflexo do Produto', title: 'Studio Pro — Imagens 4K com IA', desc: 'Transforme qualquer peça em imagem profissional 4K sem ensaio fotográfico. Ideal para dropshipping, lançamentos rápidos e escala de produção de criativos.', bullets: ['Imagens hiper-realistas em 4K', 'Sem modelo, sem estúdio, sem custo fixo', 'Escala ilimitada de produção', 'Pronto para ads, e-commerce e campanhas'] },
      { number: '03', tag: 'Reflexo Comportamental', title: 'Analytics de Intenção', desc: 'Reflexy captura o que nenhuma métrica tradicional captura: o comportamento do cliente durante a jornada de prova. Dados que revelam intenção real de compra.', bullets: ['Peças mais provadas por produto', 'Tempo médio de interação', 'Taxa de conversão try-on → carrinho', 'Padrões de hesitação e abandono'] },
      { number: '04', tag: 'Reflexo Estratégico', title: 'Clareza para Decisões', desc: 'Com os três reflexos integrados, você passa a enxergar o reflexo da sua própria conversão. Não apenas o que vendeu — mas o que quase vendeu, e por quê não vendeu.', bullets: ['Dashboard unificado de performance', 'Insights acionáveis por produto', 'Identificação de oportunidades ocultas', 'Inteligência que cresce com o uso'] },
    ],
    en: [
      { number: '01', tag: 'Visual Reflection', title: 'AI Virtual Try-On', desc: 'Your customer tries on the piece before buying. In seconds, a hyper-realistic AI simulation eliminates doubt and increases purchase confidence.', bullets: ['Generation in less than 15 seconds', 'Works with any catalog item', 'Reduces uncertainty-driven returns', 'Immediate competitive differentiation'] },
      { number: '02', tag: 'Product Reflection', title: 'Studio Pro — 4K AI Images', desc: 'Transform any piece into a professional 4K image without a photo shoot. Ideal for dropshipping, fast launches, and creative production at scale.', bullets: ['Hyper-realistic 4K images', 'No model, no studio, no fixed cost', 'Unlimited production scale', 'Ready for ads, e-commerce, and campaigns'] },
      { number: '03', tag: 'Behavioral Reflection', title: 'Intent Analytics', desc: 'Reflexy captures what no traditional metric captures: customer behavior during the try-on journey. Data that reveals real purchase intent.', bullets: ['Most tried items by product', 'Average interaction time', 'Try-on → cart conversion rate', 'Hesitation and abandonment patterns'] },
      { number: '04', tag: 'Strategic Reflection', title: 'Clarity for Decisions', desc: "With all three reflections integrated, you start seeing the reflection of your own conversion. Not just what sold — but what almost sold, and why it didn't.", bullets: ['Unified performance dashboard', 'Actionable insights per product', 'Hidden opportunity identification', 'Intelligence that grows with use'] },
    ],
  };

  const steps = {
    pt: [
      { n: '1', title: 'Instale o plugin', desc: 'Adicione o Reflexy à sua loja Shopify em menos de 5 minutos. Instalação simples com configuração básica necessária.' },
      { n: '2', title: 'Ative o provador', desc: 'O botão "Experimentar" aparece automaticamente nas páginas de produto. Seus clientes já podem usar.' },
      { n: '3', title: 'Acompanhe os dados', desc: 'Acesse o dashboard e veja em tempo real como seus clientes interagem com cada peça do catálogo.' },
    ],
    en: [
      { n: '1', title: 'Install the plugin', desc: 'Add Reflexy to your Shopify store in less than 5 minutes. Simple installation with basic setup required.' },
      { n: '2', title: 'Activate the try-on', desc: 'The "Try On" button appears automatically on product pages. Your customers can start using it right away.' },
      { n: '3', title: 'Track the data', desc: 'Access the dashboard and see in real time how your customers interact with each piece in your catalog.' },
    ],
  };

  const tableRows = [
    lang === 'pt' ? 'Provador virtual com IA' : 'AI Virtual Try-On',
    lang === 'pt' ? 'Geração de imagens profissionais 4K' : 'Professional 4K image generation',
    lang === 'pt' ? 'Analytics comportamental proprietário' : 'Proprietary behavioral analytics',
    lang === 'pt' ? 'Dados de intenção de compra' : 'Purchase intent data',
    lang === 'pt' ? 'Dashboard unificado' : 'Unified dashboard',
    lang === 'pt' ? 'Integração nativa Shopify' : 'Native Shopify integration',
    lang === 'pt' ? 'Modelo de dados proprietário' : 'Proprietary data model',
  ];
  const tableReflexy = ['✓', '✓', '✓', '✓', '✓', '✓', '✓'];
  const tableComp = ['✓', '✗', '✗', '✗', '✗', lang === 'pt' ? 'Parcial' : 'Partial', '✗'];

  const plans = {
    pt: [
      { name: 'Preview', price: '$0', period: '/mês', desc: 'Experimente sem compromisso', features: ['10 try-ons por mês', 'Sem Studio Pro', 'Dashboard básico', 'Marca d\'água Reflexy', 'Suporte padrão'], cta: 'Começar grátis', highlight: false },
      { name: 'Starter', price: '$19', period: '/mês', desc: 'Para lojas que estão começando', features: ['100 try-ons por mês', '5 imagens Studio Pro/mês', 'Excedente sob demanda', 'Painel de análise de dados', 'Suporte padrão'], cta: 'Assinar Starter', highlight: false },
      { name: 'Growth', price: '$29', period: '/mês', desc: 'Para lojas em crescimento', features: ['200 try-ons por mês', '10 imagens Studio Pro/mês', 'Excedente sob demanda', 'Analytics + dados de conversão', 'Suporte prioritário'], cta: 'Assinar Growth', highlight: true, badge: 'Mais popular' },
      { name: 'Pro', price: '$59', period: '/mês', desc: 'Para lojas que querem escalar', features: ['500 try-ons por mês', '10 imagens Studio Pro/mês', 'Excedente sob demanda', 'Analytics comportamental completo', 'Suporte VIP'], cta: 'Assinar Pro', highlight: false },
      { name: 'Enterprise', price: '$109', period: '/mês', desc: 'Para operações de alto volume', features: ['1.000 try-ons por mês', '10 imagens Studio Pro/mês', 'Excedente sob demanda', 'Analytics avançado completo', 'Suporte dedicado'], cta: 'Falar com vendas', highlight: false },
    ],
    en: [
      { name: 'Preview', price: '$0', period: '/month', desc: 'Try it with no commitment', features: ['10 try-ons per month', 'No Studio Pro', 'Basic dashboard', 'Reflexy watermark', 'Standard support'], cta: 'Start for free', highlight: false },
      { name: 'Starter', price: '$19', period: '/month', desc: 'For stores just getting started', features: ['100 try-ons per month', '5 Studio Pro images/month', 'On-demand overage', 'Data analytics panel', 'Standard support'], cta: 'Get Starter', highlight: false },
      { name: 'Growth', price: '$29', period: '/month', desc: 'For growing stores', features: ['200 try-ons per month', '10 Studio Pro images/month', 'On-demand overage', 'Analytics + conversion data', 'Priority support'], cta: 'Get Growth', highlight: true, badge: 'Most popular' },
      { name: 'Pro', price: '$59', period: '/month', desc: 'For stores that want to scale', features: ['500 try-ons per month', '10 Studio Pro images/month', 'On-demand overage', 'Full behavioral analytics', 'VIP support'], cta: 'Get Pro', highlight: false },
      { name: 'Enterprise', price: '$109', period: '/month', desc: 'For high-volume operations', features: ['1,000 try-ons per month', '10 Studio Pro images/month', 'On-demand overage', 'Full advanced analytics', 'Dedicated support'], cta: 'Talk to sales', highlight: false },
    ],
  };

  const testimonials = [
    { quote: lang === 'pt' ? 'Depois do Reflexy, minha taxa de devolução caiu 40% no primeiro mês. Os clientes chegam muito mais seguros na hora de comprar.' : 'After Reflexy, my return rate dropped 40% in the first month. Customers arrive much more confident when buying.', name: 'Ana Lima', store: lang === 'pt' ? 'Loja Moda Feminina · São Paulo' : 'Fashion Store · São Paulo' },
    { quote: lang === 'pt' ? 'O Studio Pro mudou minha operação de dropshipping. Consigo lançar produtos novos com fotos profissionais em minutos, sem custo de ensaio.' : 'Studio Pro changed my dropshipping operation. I can launch new products with professional photos in minutes, with no shoot cost.', name: 'Carlos Mendes', store: lang === 'pt' ? 'E-commerce Masculino · Rio de Janeiro' : 'Menswear E-commerce · Rio de Janeiro' },
    { quote: lang === 'pt' ? 'Os dados de analytics me mostraram que minha peça mais provada não era a mais vendida. Isso me fez repensar preço e descrição. Vendi 3x mais.' : "The analytics data showed me that my most tried-on item wasn't my best seller. That made me rethink pricing and description. I sold 3x more.", name: 'Mariana Costa', store: lang === 'pt' ? 'Boutique Online · Belo Horizonte' : 'Online Boutique · Belo Horizonte' },
  ];

  const faqs = {
    pt: [
      { q: 'Como o Reflexy se integra à minha loja Shopify?', a: 'A integração é feita via plugin JavaScript. Você adiciona uma única linha de código à sua loja e o botão "Experimentar" aparece automaticamente nas páginas de produto. Não é necessário conhecimento técnico.' },
      { q: 'O provador virtual funciona com qualquer tipo de roupa?', a: 'Sim. O Reflexy funciona com roupas femininas, masculinas, infantis, acessórios e calçados. O modelo de IA foi treinado para lidar com diferentes tipos de peças e estilos.' },
      { q: 'Os dados dos meus clientes são seguros?', a: 'Sim. O Reflexy não armazena imagens dos clientes. O processamento é feito em tempo real e os dados comportamentais são anonimizados. Estamos em conformidade com a LGPD.' },
      { q: 'Posso cancelar a qualquer momento?', a: 'Sim. Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento diretamente pelo dashboard, sem burocracia.' },
      { q: 'O que acontece quando esgoto meus créditos?', a: 'Quando os créditos mensais são esgotados, o provador continua visível na loja mas exibe uma mensagem informando que o serviço está temporariamente indisponível. Você pode fazer upgrade a qualquer momento.' },
      { q: 'O Reflexy funciona em outras plataformas além do Shopify?', a: 'Atualmente o Reflexy tem integração nativa com Shopify. Integrações com WooCommerce, VTEX e Nuvemshop estão no roadmap para os próximos meses.' },
    ],
    en: [
      { q: 'How does Reflexy integrate with my Shopify store?', a: 'Integration is done via a JavaScript plugin. You add a single line of code to your store and the "Try On" button appears automatically on product pages. No technical knowledge required.' },
      { q: 'Does the virtual try-on work with any type of clothing?', a: "Yes. Reflexy works with women's, men's, children's clothing, accessories, and footwear. The AI model was trained to handle different types of garments and styles." },
      { q: "Is my customers' data safe?", a: "Yes. Reflexy does not store customer images. Processing is done in real time and behavioral data is anonymized. We comply with GDPR and LGPD." },
      { q: 'Can I cancel at any time?', a: 'Yes. There is no lock-in period. You can cancel your subscription at any time directly from the dashboard, without any hassle.' },
      { q: 'What happens when I run out of credits?', a: 'When monthly credits are exhausted, the try-on remains visible in the store but displays a message informing that the service is temporarily unavailable. You can upgrade at any time.' },
      { q: 'Does Reflexy work on platforms other than Shopify?', a: 'Currently Reflexy has native integration with Shopify. Integrations with WooCommerce, VTEX, and other platforms are on the roadmap for the coming months.' },
    ],
  };

  const BG = '#08080f';
  const PURPLE = '#a855f7';
  const PURPLE_DARK = '#7c3aed';
  const GLASS = 'rgba(255,255,255,0.03)';
  const BORDER = 'rgba(255,255,255,0.07)';
  const TEXT_DIM = 'rgba(255,255,255,0.5)';
  const TEXT_MID = 'rgba(255,255,255,0.7)';

  return (
    <div style={{ background: BG, color: '#fff', fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif", minHeight: '100vh', overflowX: 'hidden' }}>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: scrolled ? 'rgba(8,8,15,0.92)' : 'transparent', backdropFilter: scrolled ? 'blur(20px)' : 'none', borderBottom: scrolled ? `1px solid ${BORDER}` : 'none', transition: 'all 0.3s ease' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Image src="/logos/logo-horizontal-dark.png" alt="Reflexy" width={120} height={32} style={{ height: 'auto' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <div style={{ display: 'flex', gap: '28px' }}>
            {[lang === 'pt' ? 'Funcionalidades' : 'Features', lang === 'pt' ? 'Como funciona' : 'How it works', lang === 'pt' ? 'Planos' : 'Pricing', 'FAQ'].map(item => (
              <a key={item} href="#" style={{ color: TEXT_DIM, fontSize: '14px', textDecoration: 'none' }}>{item}</a>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button onClick={() => setLang(lang === 'pt' ? 'en' : 'pt')} style={{ background: 'rgba(255,255,255,0.08)', border: `1px solid rgba(255,255,255,0.12)`, borderRadius: '6px', color: TEXT_MID, padding: '5px 12px', fontSize: '12px', cursor: 'pointer', fontWeight: 600 }}>
              {lang === 'pt' ? 'EN' : 'PT'}
            </button>
            <Link href="/login" style={{ color: TEXT_DIM, fontSize: '14px', textDecoration: 'none' }}>{lang === 'pt' ? 'Entrar' : 'Sign in'}</Link>
            <Link href="/signup" style={{ background: `linear-gradient(135deg, ${PURPLE_DARK}, ${PURPLE})`, color: '#fff', padding: '8px 20px', borderRadius: '8px', fontSize: '14px', textDecoration: 'none', fontWeight: 600, boxShadow: '0 0 20px rgba(139,92,246,0.3)' }}>{lang === 'pt' ? 'Começar grátis' : 'Start for free'}</Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 40px 80px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)', width: '700px', height: '700px', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '100px', padding: '6px 16px', marginBottom: '32px' }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: PURPLE, boxShadow: `0 0 8px ${PURPLE}` }} />
          <span style={{ fontSize: '13px', color: TEXT_MID, letterSpacing: '0.04em' }}>{lang === 'pt' ? 'Inteligência Comportamental para Moda' : 'Behavioral Commerce Intelligence for Fashion'}</span>
        </div>
        <h1 style={{ fontSize: 'clamp(48px,7vw,88px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.02em', marginBottom: '24px', maxWidth: '800px', background: 'linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          {lang === 'pt' ? 'O reflexo da sua conversão.' : 'The reflection of your conversion.'}
        </h1>
        <p style={{ fontSize: 'clamp(16px,2vw,20px)', color: TEXT_DIM, maxWidth: '620px', lineHeight: 1.7, marginBottom: '40px' }}>
          {lang === 'pt' ? 'Reflexy combina provador virtual com IA, geração de imagens profissionais e analytics comportamental para transformar cada interação em inteligência estratégica de venda.' : 'Reflexy combines AI virtual try-on, automated professional image generation, and behavioral analytics to turn every interaction into strategic sales intelligence.'}
        </p>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '80px' }}>
          <Link href="/signup" style={{ background: `linear-gradient(135deg,${PURPLE_DARK},${PURPLE})`, color: '#fff', padding: '14px 32px', borderRadius: '10px', fontSize: '16px', textDecoration: 'none', fontWeight: 600, boxShadow: '0 0 40px rgba(139,92,246,0.4)' }}>{lang === 'pt' ? 'Começar gratuitamente' : 'Start for free'}</Link>
          <a href="#how" style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.12)`, color: '#fff', padding: '14px 32px', borderRadius: '10px', fontSize: '16px', textDecoration: 'none', fontWeight: 500 }}>{lang === 'pt' ? 'Ver demonstração' : 'Watch demo'}</a>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: BORDER, borderRadius: '16px', overflow: 'hidden', maxWidth: '800px', width: '100%' }}>
          {stats[lang].map((s, i) => (
            <div key={i} style={{ background: GLASS, padding: '28px 20px', textAlign: 'center', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '32px', fontWeight: 700, color: PURPLE, marginBottom: '6px', letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: '12px', color: TEXT_DIM, lineHeight: 1.4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ padding: '100px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ fontSize: '12px', letterSpacing: '0.15em', color: PURPLE, textTransform: 'uppercase', fontWeight: 600 }}>{lang === 'pt' ? 'O Problema' : 'The Problem'}</span>
          <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, marginTop: '16px', marginBottom: '16px', letterSpacing: '-0.02em' }}>{lang === 'pt' ? 'Seu cliente não compra porque não tem certeza.' : "Your customer doesn't buy because they're not sure."}</h2>
          <p style={{ color: TEXT_DIM, fontSize: '18px', maxWidth: '500px', margin: '0 auto' }}>{lang === 'pt' ? 'O e-commerce de moda enfrenta desafios estruturais que custam receita todos os dias.' : 'Fashion e-commerce faces structural challenges that cost revenue every day.'}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '16px' }}>
          {problems[lang].map((item, i) => (
            <div key={i} style={{ background: GLASS, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '32px', backdropFilter: 'blur(10px)' }}>
              <div style={{ fontSize: '28px', marginBottom: '16px' }}>{item.icon}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>{item.title}</h3>
              <p style={{ color: TEXT_DIM, fontSize: '15px', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOLUTION */}
      <section style={{ padding: '100px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '80px' }}>
          <span style={{ fontSize: '12px', letterSpacing: '0.15em', color: PURPLE, textTransform: 'uppercase', fontWeight: 600 }}>{lang === 'pt' ? 'A Solução' : 'The Solution'}</span>
          <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, marginTop: '16px', marginBottom: '16px', letterSpacing: '-0.02em' }}>{lang === 'pt' ? 'Quatro reflexos. Uma plataforma.' : 'Four reflections. One platform.'}</h2>
          <p style={{ color: TEXT_DIM, fontSize: '18px', maxWidth: '600px', margin: '0 auto' }}>{lang === 'pt' ? 'Reflexy resolve simultaneamente o que nenhuma outra solução resolve: experiência visual, produção de imagem e inteligência comportamental.' : 'Reflexy simultaneously solves what no other solution solves: visual experience, image production, and behavioral intelligence.'}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {layers[lang].map((layer, i) => (
            <div key={i} style={{ background: GLASS, border: `1px solid ${BORDER}`, borderRadius: '20px', padding: '48px', backdropFilter: 'blur(20px)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', background: 'radial-gradient(circle,rgba(139,92,246,0.08) 0%,transparent 70%)', pointerEvents: 'none' }} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>{layer.number}</span>
                  <span style={{ fontSize: '12px', letterSpacing: '0.12em', color: PURPLE, textTransform: 'uppercase', fontWeight: 600, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', borderRadius: '100px', padding: '3px 12px' }}>{layer.tag}</span>
                </div>
                <h3 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '16px', letterSpacing: '-0.01em' }}>{layer.title}</h3>
                <p style={{ color: TEXT_DIM, fontSize: '16px', lineHeight: 1.7 }}>{layer.desc}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {layer.bullets.map((b, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: PURPLE, fontSize: '11px', fontWeight: 700 }}>✓</span>
                    </div>
                    <span style={{ color: TEXT_MID, fontSize: '15px' }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DEMO SECTION */}
      <section id="demo" style={{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ fontSize: '12px', letterSpacing: '0.15em', color: PURPLE, textTransform: 'uppercase', fontWeight: 600 }}>{lang === 'pt' ? 'Demonstração' : 'Demo'}</span>
          <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, marginTop: '16px', marginBottom: '16px', letterSpacing: '-0.02em' }}>
            {lang === 'pt' ? 'Veja o provador em ação.' : 'See the try-on in action.'}
          </h2>
          <p style={{ color: TEXT_DIM, fontSize: '18px', maxWidth: '560px', margin: '0 auto', lineHeight: 1.6 }}>
            {lang === 'pt' ? 'Resultados reais gerados pelo Reflexy em lojas Shopify. Clientes enviam uma foto e veem a peça em si mesmos em segundos.' : 'Real results generated by Reflexy in Shopify stores. Customers upload a photo and see the item on themselves in seconds.'}
          </p>
        </div>

        {/* Before/After Demo */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '48px' }}>
          {/* Before */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden', backdropFilter: 'blur(20px)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{lang === 'pt' ? 'Modal do Provador — Loja Shopify' : 'Try-On Modal — Shopify Store'}</span>
            </div>
            <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
              <img
                src="/demo-modal-before.png"
                alt={lang === 'pt' ? 'Modal do provador virtual na loja' : 'Virtual try-on modal in store'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
              />
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', padding: '6px 14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>{lang === 'pt' ? '① Cliente faz upload da foto' : '① Customer uploads photo'}</span>
              </div>
            </div>
          </div>

          {/* After */}
          <div style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '20px', overflow: 'hidden', backdropFilter: 'blur(20px)', boxShadow: '0 0 40px rgba(139,92,246,0.1)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(168,85,247,0.15)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: PURPLE, boxShadow: `0 0 8px ${PURPLE}` }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: PURPLE, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{lang === 'pt' ? 'Resultado Gerado pela IA — < 8 segundos' : 'AI-Generated Result — < 8 seconds'}</span>
            </div>
            <div style={{ position: 'relative', aspectRatio: '16/10', overflow: 'hidden' }}>
              <img
                src="/demo-result-after.png"
                alt={lang === 'pt' ? 'Resultado do provador virtual com IA' : 'AI virtual try-on result'}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }}
              />
              <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(139,92,246,0.85)', backdropFilter: 'blur(10px)', borderRadius: '8px', padding: '6px 14px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{lang === 'pt' ? '② IA gera resultado hiper-realista' : '② AI generates hyper-realistic result'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Video Demo Container */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', overflow: 'hidden', marginBottom: '48px' }}>
          <div style={{ padding: '20px 28px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.5)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{lang === 'pt' ? 'Vídeo de Demonstração' : 'Demo Video'}</span>
            </div>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>{lang === 'pt' ? 'Em breve' : 'Coming soon'}</span>
          </div>
          <div style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, rgba(8,8,15,1) 0%, rgba(20,10,40,1) 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative glow */}
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '400px', height: '200px', background: 'radial-gradient(ellipse, rgba(139,92,246,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
            {/* Play button */}
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(139,92,246,0.15)', border: '2px solid rgba(139,92,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.3s', position: 'relative', zIndex: 1 }}>
              <div style={{ width: 0, height: 0, borderTop: '14px solid transparent', borderBottom: '14px solid transparent', borderLeft: `22px solid ${PURPLE}`, marginLeft: '4px' }} />
            </div>
            <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', margin: '0 0 8px' }}>
                {lang === 'pt' ? 'Vídeo demonstrativo do Reflexy em ação' : 'Reflexy demo video in action'}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px', margin: 0 }}>
                {lang === 'pt' ? 'Substitua este container pelo seu vídeo de demonstração' : 'Replace this container with your demo video'}
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px', color: 'rgba(255,255,255,0.8)' }}>
            {lang === 'pt' ? 'Galeria de Resultados' : 'Results Gallery'}
          </h3>
          <p style={{ color: TEXT_DIM, fontSize: '15px', marginBottom: '32px' }}>
            {lang === 'pt' ? 'Exemplos reais gerados pelo provador virtual Reflexy.' : 'Real examples generated by the Reflexy virtual try-on.'}
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {/* Card 1 - Real result */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', overflow: 'hidden', aspectRatio: '3/4', position: 'relative' }}>
            <img
              src="/demo-result-after.png"
              alt="Try-on result 1"
              style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)' }} />
            <div style={{ position: 'absolute', bottom: '12px', left: '12px', right: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', background: 'rgba(139,92,246,0.6)', borderRadius: '6px', padding: '3px 8px' }}>Calça Bordada</span>
            </div>
          </div>
          {/* Cards 2-4 - Placeholder */}
          {[2, 3, 4].map((n) => (
            <div key={n} style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden', aspectRatio: '3/4', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(168,85,247,0.6)" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.25)', textAlign: 'center', padding: '0 16px' }}>
                {lang === 'pt' ? 'Adicione sua foto aqui' : 'Add your photo here'}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding: '100px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ fontSize: '12px', letterSpacing: '0.15em', color: PURPLE, textTransform: 'uppercase', fontWeight: 600 }}>{lang === 'pt' ? 'Como Funciona' : 'How It Works'}</span>
          <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, marginTop: '16px', marginBottom: '16px', letterSpacing: '-0.02em' }}>{lang === 'pt' ? 'Instale uma vez. Funciona para sempre.' : 'Install once. Works forever.'}</h2>
          <p style={{ color: TEXT_DIM, fontSize: '18px', maxWidth: '500px', margin: '0 auto' }}>{lang === 'pt' ? 'Integração em minutos com Shopify. Sem código, sem configuração complexa.' : 'Shopify integration in minutes. No code, no complex setup.'}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
          {steps[lang].map((step, i) => (
            <div key={i} style={{ background: GLASS, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '36px', backdropFilter: 'blur(10px)', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg,rgba(124,58,237,0.3),rgba(168,85,247,0.3))', border: '1px solid rgba(168,85,247,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '18px', fontWeight: 700, color: PURPLE }}>{step.n}</div>
              <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>{step.title}</h3>
              <p style={{ color: TEXT_DIM, fontSize: '15px', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* COMPETITIVE */}
      <section style={{ padding: '100px 40px', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ fontSize: '12px', letterSpacing: '0.15em', color: PURPLE, textTransform: 'uppercase', fontWeight: 600 }}>{lang === 'pt' ? 'Vantagem Competitiva' : 'Competitive Advantage'}</span>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 700, marginTop: '16px', marginBottom: '16px', letterSpacing: '-0.02em' }}>{lang === 'pt' ? 'A maioria resolve uma camada. Reflexy resolve três.' : 'Most solve one layer. Reflexy solves three.'}</h2>
          <p style={{ color: TEXT_DIM, fontSize: '17px', maxWidth: '560px', margin: '0 auto' }}>{lang === 'pt' ? 'Enquanto concorrentes focam apenas na experiência visual, Reflexy integra produção, experiência e inteligência em uma única plataforma.' : 'While competitors focus only on visual experience, Reflexy integrates production, experience, and intelligence into a single platform.'}</p>
        </div>
        <div style={{ background: GLASS, border: `1px solid ${BORDER}`, borderRadius: '20px', overflow: 'hidden', backdropFilter: 'blur(20px)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${BORDER}` }}>
                <th style={{ padding: '20px 28px', textAlign: 'left', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{lang === 'pt' ? 'Funcionalidade' : 'Feature'}</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: PURPLE, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Reflexy</th>
                <th style={{ padding: '20px 28px', textAlign: 'center', fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{lang === 'pt' ? 'Concorrentes' : 'Competitors'}</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, i) => (
                <tr key={i} style={{ borderBottom: i < tableRows.length - 1 ? `1px solid rgba(255,255,255,0.04)` : 'none' }}>
                  <td style={{ padding: '16px 28px', fontSize: '15px', color: TEXT_MID }}>{row}</td>
                  <td style={{ padding: '16px 28px', textAlign: 'center', fontSize: '16px', color: PURPLE, fontWeight: 700 }}>{tableReflexy[i]}</td>
                  <td style={{ padding: '16px 28px', textAlign: 'center', fontSize: '16px', color: tableComp[i] === '✓' ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.2)' }}>{tableComp[i]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ fontSize: '12px', letterSpacing: '0.15em', color: PURPLE, textTransform: 'uppercase', fontWeight: 600 }}>{lang === 'pt' ? 'Planos' : 'Pricing'}</span>
          <h2 style={{ fontSize: 'clamp(32px,4vw,52px)', fontWeight: 700, marginTop: '16px', marginBottom: '16px', letterSpacing: '-0.02em' }}>{lang === 'pt' ? 'Comece grátis. Escale quando precisar.' : 'Start free. Scale when you need.'}</h2>
          <p style={{ color: TEXT_DIM, fontSize: '18px' }}>{lang === 'pt' ? 'Planos desenhados para cada estágio do seu negócio.' : 'Plans designed for every stage of your business.'}</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px' }}>
          {plans[lang].map((plan, i) => (
            <div key={i} style={{ background: plan.highlight ? 'rgba(124,58,237,0.12)' : GLASS, border: plan.highlight ? '1px solid rgba(168,85,247,0.4)' : `1px solid ${BORDER}`, borderRadius: '20px', padding: '36px 28px', backdropFilter: 'blur(20px)', position: 'relative', boxShadow: plan.highlight ? '0 0 40px rgba(139,92,246,0.15)' : 'none' }}>
              {plan.highlight && (plan as any).badge && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: `linear-gradient(135deg,${PURPLE_DARK},${PURPLE})`, color: '#fff', fontSize: '11px', fontWeight: 700, padding: '4px 14px', borderRadius: '100px', whiteSpace: 'nowrap' }}>{(plan as any).badge}</div>
              )}
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>{plan.name}</h3>
              <p style={{ color: TEXT_DIM, fontSize: '13px', marginBottom: '16px' }}>{plan.desc}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '24px' }}>
                <span style={{ fontSize: '36px', fontWeight: 700, color: plan.highlight ? PURPLE : '#fff' }}>{plan.price}</span>
                <span style={{ fontSize: '14px', color: TEXT_DIM }}>{plan.period}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
                {plan.features.map((f, j) => (
                  <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: PURPLE, fontSize: '13px', marginTop: '2px', flexShrink: 0 }}>✓</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
              <Link href="/signup" style={{ display: 'block', textAlign: 'center', background: plan.highlight ? `linear-gradient(135deg,${PURPLE_DARK},${PURPLE})` : 'rgba(255,255,255,0.08)', border: plan.highlight ? 'none' : `1px solid rgba(255,255,255,0.12)`, color: '#fff', padding: '12px', borderRadius: '10px', fontSize: '14px', textDecoration: 'none', fontWeight: 600, boxShadow: plan.highlight ? '0 0 20px rgba(139,92,246,0.3)' : 'none' }}>{plan.cta}</Link>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '100px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ fontSize: '12px', letterSpacing: '0.15em', color: PURPLE, textTransform: 'uppercase', fontWeight: 600 }}>{lang === 'pt' ? 'Depoimentos' : 'Testimonials'}</span>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 700, marginTop: '16px', letterSpacing: '-0.02em' }}>{lang === 'pt' ? 'Lojistas que já usam o reflexo a seu favor.' : 'Store owners already using the reflection to their advantage.'}</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
          {testimonials.map((item, i) => (
            <div key={i} style={{ background: GLASS, border: `1px solid ${BORDER}`, borderRadius: '16px', padding: '32px', backdropFilter: 'blur(10px)' }}>
              <div style={{ color: PURPLE, fontSize: '28px', marginBottom: '16px', lineHeight: 1 }}>"</div>
              <p style={{ color: TEXT_MID, fontSize: '15px', lineHeight: 1.7, marginBottom: '24px', fontStyle: 'italic' }}>{item.quote}</p>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{item.name}</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.35)', marginTop: '2px' }}>{item.store}</div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '100px 40px', maxWidth: '760px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ fontSize: '12px', letterSpacing: '0.15em', color: PURPLE, textTransform: 'uppercase', fontWeight: 600 }}>FAQ</span>
          <h2 style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 700, marginTop: '16px', letterSpacing: '-0.02em' }}>{lang === 'pt' ? 'Perguntas frequentes.' : 'Frequently asked questions.'}</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {faqs[lang].map((item, i) => (
            <div key={i} style={{ background: GLASS, border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden', backdropFilter: 'blur(10px)' }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ width: '100%', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'none', border: 'none', cursor: 'pointer', color: '#fff', fontSize: '15px', fontWeight: 500, textAlign: 'left' }}>
                <span>{item.q}</span>
                <span style={{ color: PURPLE, fontSize: '20px', flexShrink: 0, marginLeft: '16px', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none', display: 'inline-block' }}>+</span>
              </button>
              {openFaq === i && <div style={{ padding: '0 24px 20px', color: TEXT_DIM, fontSize: '15px', lineHeight: 1.7 }}>{item.a}</div>}
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ padding: '100px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '800px', height: '400px', background: 'radial-gradient(ellipse,rgba(139,92,246,0.12) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: '700px', margin: '0 auto', position: 'relative' }}>
          <h2 style={{ fontSize: 'clamp(32px,5vw,60px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '20px', background: 'linear-gradient(135deg,#fff 0%,rgba(255,255,255,0.7) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {lang === 'pt' ? 'Comece a capturar o reflexo da sua conversão.' : 'Start capturing the reflection of your conversion.'}
          </h2>
          <p style={{ color: TEXT_DIM, fontSize: '18px', marginBottom: '40px', lineHeight: 1.6 }}>
            {lang === 'pt' ? 'Instale em minutos. Veja os dados em horas. Tome decisões melhores a partir de hoje.' : 'Install in minutes. See data in hours. Make better decisions starting today.'}
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/signup" style={{ background: `linear-gradient(135deg,${PURPLE_DARK},${PURPLE})`, color: '#fff', padding: '16px 40px', borderRadius: '12px', fontSize: '16px', textDecoration: 'none', fontWeight: 600, boxShadow: '0 0 50px rgba(139,92,246,0.4)' }}>{lang === 'pt' ? 'Começar gratuitamente' : 'Start for free'}</Link>
            <a href="mailto:hello@reflexy.co" style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid rgba(255,255,255,0.12)`, color: '#fff', padding: '16px 40px', borderRadius: '12px', fontSize: '16px', textDecoration: 'none', fontWeight: 500 }}>{lang === 'pt' ? 'Falar com a equipe' : 'Talk to the team'}</a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: `1px solid ${BORDER}`, padding: '60px 40px 40px', maxWidth: '1100px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '48px', marginBottom: '48px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <Image src="/logos/logo-horizontal-dark.png" alt="Reflexy" width={100} height={28} style={{ height: 'auto' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', lineHeight: 1.6, maxWidth: '280px' }}>{lang === 'pt' ? 'Inteligência comportamental para e-commerce de moda.' : 'Behavioral intelligence for fashion e-commerce.'}</p>
          </div>
          {[
            { title: lang === 'pt' ? 'Produto' : 'Product', items: lang === 'pt' ? ['Provador Virtual', 'Studio Pro', 'Analytics', 'Preços'] : ['Virtual Try-On', 'Studio Pro', 'Analytics', 'Pricing'] },
            { title: lang === 'pt' ? 'Empresa' : 'Company', items: lang === 'pt' ? ['Sobre', 'Blog', 'Carreiras', 'Contato'] : ['About', 'Blog', 'Careers', 'Contact'] },
            { title: lang === 'pt' ? 'Legal' : 'Legal', items: lang === 'pt' ? ['Privacidade', 'Termos de Uso', 'LGPD'] : ['Privacy', 'Terms of Use', 'GDPR'] },
          ].map((col, i) => (
            <div key={i}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: TEXT_DIM, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>{col.title}</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {col.items.map((item, j) => (
                  <a key={j} href="#" style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', textDecoration: 'none' }}>{item}</a>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '13px' }}>© 2025 Reflexy. {lang === 'pt' ? 'Todos os direitos reservados.' : 'All rights reserved.'}</span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 6px #22c55e' }} />
            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>All systems operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
