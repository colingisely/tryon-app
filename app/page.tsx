import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-800">
      {/* Header */}
      <header className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-black">Reflexy</div>
        <nav className="space-x-8">
          <Link href="#features" className="hover:text-black">Features</Link>
          <Link href="#pricing" className="hover:text-black">Preços</Link>
          <Link href="/login" className="hover:text-black">Entrar</Link>
          <Link href="/signup" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">Começar Grátis</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="text-center py-20">
        <h1 className="text-5xl font-bold mb-4">O reflexo da sua conversão.</h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">A Reflexy é a tecnologia que mostra o que seu cliente faz antes de comprar — e transforma isso em vantagem competitiva.</p>
        <div className="space-x-4">
          <Link href="/signup" className="bg-black text-white px-6 py-3 rounded-md text-lg hover:bg-gray-800">Começar Grátis</Link>
          <Link href="#pricing" className="border border-black text-black px-6 py-3 rounded-md text-lg hover:bg-gray-100">Ver Planos</Link>
        </div>
      </main>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-12">Simples, rápido e mágico. Em 3 passos.</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="text-5xl font-bold text-black mb-4">1</div>
              <h3 className="text-2xl font-bold mb-2">Envie uma foto</h3>
              <p className="text-gray-600">Seu cliente tira uma foto ou escolhe uma da galeria.</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-black mb-4">2</div>
              <h3 className="text-2xl font-bold mb-2">Escolha a roupa</h3>
              <p className="text-gray-600">Ele navega pela sua loja e clica no botão "Provar".</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-black mb-4">3</div>
              <h3 className="text-2xl font-bold mb-2">Veja a mágica</h3>
              <p className="text-gray-600">Em segundos, nossa IA veste seu cliente com a roupa escolhida, com um realismo impressionante.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Uma plataforma, quatro reflexos.</h2>
          <div className="grid md:grid-cols-2 gap-16">
            <div className="p-8 border rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Reflexo Visual: O Espelho Inteligente</h3>
              <p className="text-gray-600">Nosso Virtual Try-On projeta um reflexo simulado do cliente usando a peça. É um espelho inteligente mediado por IA que aumenta a confiança e reduz devoluções.</p>
            </div>
            <div className="p-8 border rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Reflexo do Produto: O Estúdio Instantâneo</h3>
              <p className="text-gray-600">O Studio Pro cria um reflexo hiper-realista do produto em 4K, mesmo sem ensaio físico. É o reflexo idealizado do produto para performance comercial e marketing.</p>
            </div>
            <div className="p-8 border rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Reflexo Comportamental: O Painel da Intenção</h3>
              <p className="text-gray-600">Nosso Analytics capta reflexos invisíveis: o que o cliente prova, o que abandona, o que adiciona ao carrinho. Dados que são reflexos diretos da intenção de compra.</p>
            </div>
            <div className="p-8 border rounded-lg">
              <h3 className="text-2xl font-bold mb-4">Reflexo da Conversão: A Clareza Estratégica</h3>
              <p className="text-gray-600">A Reflexy não mostra apenas imagens, mostra padrões de decisão. Damos a você o reflexo da sua própria conversão para você vender mais e errar menos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Planos flexíveis para lojas de todos os tamanhos.</h2>
          <p className="text-lg text-gray-600 mb-12">Comece grátis. Escale conforme seu negócio cresce. Cancele a qualquer momento.</p>
          <div className="grid md:grid-cols-4 gap-8">
            {/* Free Plan */}
            <div className="border p-8 rounded-lg bg-white">
              <h3 className="text-2xl font-bold mb-4">Grátis</h3>
              <p className="text-5xl font-bold mb-4">R$0<span className="text-lg font-normal">/mês</span></p>
              <p className="text-gray-600 mb-6">100 provadores/mês</p>
              <Link href="/signup" className="border border-black text-black w-full block py-2 rounded-md hover:bg-gray-100">Começar</Link>
            </div>
            {/* Starter Plan */}
            <div className="border p-8 rounded-lg bg-white">
              <h3 className="text-2xl font-bold mb-4">Básico</h3>
              <p className="text-5xl font-bold mb-4">R$99<span className="text-lg font-normal">/mês</span></p>
              <p className="text-gray-600 mb-6">500 rápidos + 10 premium</p>
              <Link href="/signup?plan=starter" className="border border-black text-black w-full block py-2 rounded-md hover:bg-gray-100">Escolher Plano</Link>
            </div>
            {/* Pro Plan */}
            <div className="border-2 border-black p-8 rounded-lg bg-white relative">
              <span className="bg-black text-white text-xs font-bold px-3 py-1 rounded-full absolute -top-3">MAIS POPULAR</span>
              <h3 className="text-2xl font-bold mb-4">Profissional</h3>
              <p className="text-5xl font-bold mb-4">R$249<span className="text-lg font-normal">/mês</span></p>
              <p className="text-gray-600 mb-6">2.000 rápidos + 50 premium</p>
              <Link href="/signup?plan=pro" className="bg-black text-white w-full block py-2 rounded-md hover:bg-gray-800">Escolher Plano</Link>
            </div>
            {/* Enterprise Plan */}
            <div className="border p-8 rounded-lg bg-white">
              <h3 className="text-2xl font-bold mb-4">Empresarial</h3>
              <p className="text-2xl font-bold mb-4">Sob Consulta</p>
              <p className="text-gray-600 mb-6">Provadores ilimitados, suporte dedicado, API customizada.</p>
              <Link href="/contact" className="border border-black text-black w-full block py-2 rounded-md hover:bg-gray-100">Contato</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="container mx-auto px-6 max-w-3xl">
          <h2 className="text-4xl font-bold text-center mb-12">Perguntas Frequentes</h2>
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold">Como funciona a privacidade dos meus clientes?</h3>
              <p className="text-gray-600 mt-2">A privacidade é nossa prioridade. As fotos dos clientes são processadas e deletadas imediatamente após o uso. Não armazenamos nenhuma imagem.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold">A Reflexy funciona em qualquer plataforma de e-commerce?</h3>
              <p className="text-gray-600 mt-2">Sim! Oferecemos integração nativa com Shopify e WooCommerce, e nossa API flexível permite a instalação em qualquer outra plataforma.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold">Qual a diferença entre o modo rápido e o premium?</h3>
              <p className="text-gray-600 mt-2">O modo rápido é ideal para uma visualização instantânea. O modo premium usa um modelo de IA mais potente para gerar imagens com qualidade de estúdio, perfeitas para marketing.</p>
            </div>
            <div>
              <h3 className="text-xl font-bold">Posso customizar a aparência do botão e do modal?</h3>
              <p className="text-gray-600 mt-2">Sim, você pode customizar cores e textos para que a Reflexy se integre perfeitamente à identidade visual da sua marca.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-12">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Produto</h3>
              <ul className="space-y-2">
                <li><Link href="#pricing" className="hover:underline">Preços</Link></li>
                <li><Link href="#features" className="hover:underline">Studio Pro</Link></li>
                <li><Link href="#features" className="hover:underline">Analytics</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Soluções</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">Lojas Shopify</a></li>
                <li><a href="#" className="hover:underline">Lojas WooCommerce</a></li>
                <li><a href="#" className="hover:underline">Desenvolvedores</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">Blog</a></li>
                <li><a href="#" className="hover:underline">Documentação da API</a></li>
                <li><a href="/contact" className="hover:underline">Contato</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Empresa</h3>
              <ul className="space-y-2">
                <li><a href="#" className="hover:underline">Sobre nós</a></li>
                <li><a href="#" className="hover:underline">Carreiras</a></li>
                <li><a href="/terms" className="hover:underline">Termos de Serviço</a></li>
                <li><a href="/privacy" className="hover:underline">Política de Privacidade</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 text-center text-sm text-gray-400">
            <p>© 2026 Reflexy. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
