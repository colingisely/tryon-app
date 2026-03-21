/**
 * Reflexy — app/terms/page.tsx
 * Termos de Uso — atualizado em março de 2026
 */

export const metadata = {
  title: 'Termos de Uso | Reflexy',
  description: 'Termos de Uso da plataforma Reflexy — leia antes de utilizar nossos serviços.',
}

export default function TermsPage() {
  return (
    <main style={{ background: '#06050F', minHeight: '100vh', padding: '60px 24px 80px' }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>

        {/* Back link */}
        <a
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 13,
            color: '#7050A0',
            textDecoration: 'none',
            marginBottom: 40,
          }}
        >
          ← Voltar para o início
        </a>

        {/* Terms content */}
        <div
          style={{
            fontFamily: 'Arial, sans-serif',
            color: '#EDEBF5',
            lineHeight: 1.7,
          }}
          className="terms-content"
          dangerouslySetInnerHTML={{ __html: TERMS_HTML }}
        />

        {/* Footer note */}
        <div style={{
          marginTop: 48,
          paddingTop: 24,
          borderTop: '1px solid rgba(184,174,221,.10)',
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
        }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(160,156,192,.50)' }}>
            © {new Date().getFullYear()} Reflexy. Todos os direitos reservados.
          </span>
          <a href="/privacy" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(160,156,192,.50)', textDecoration: 'none' }}>
            Política de Privacidade →
          </a>
        </div>
      </div>

      <style>{`
        .terms-content h1 {
          font-family: 'Bricolage Grotesque', Arial, sans-serif;
          font-size: clamp(24px, 3vw, 36px);
          font-weight: 700;
          color: #EDEBF5;
          letter-spacing: -.02em;
          margin-bottom: 8px;
        }
        .terms-content h2 {
          font-family: 'Bricolage Grotesque', Arial, sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #EDEBF5;
          margin-top: 40px;
          margin-bottom: 12px;
          padding-top: 16px;
          border-top: 1px solid rgba(184,174,221,.08);
        }
        .terms-content h3 {
          font-family: 'DM Sans', Arial, sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #EDEBF5;
          margin-top: 24px;
          margin-bottom: 8px;
        }
        .terms-content p,
        .terms-content li,
        .terms-content div {
          font-family: 'DM Sans', Arial, sans-serif;
          font-size: 14px;
          color: rgba(237,235,245,.72);
          line-height: 1.8;
        }
        .terms-content a {
          color: #7050A0;
          text-decoration: underline;
        }
        .terms-content a:hover {
          color: #A07FD0;
        }
        .terms-content strong {
          color: #EDEBF5;
          font-weight: 600;
        }
        .terms-content em {
          color: rgba(237,235,245,.60);
        }
        .terms-content ul {
          padding-left: 20px;
          margin: 8px 0 16px;
        }
        .terms-content li {
          margin-bottom: 6px;
        }
        .terms-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          font-size: 13px;
        }
        .terms-content th,
        .terms-content td {
          border: 1px solid rgba(184,174,221,.20);
          padding: 8px 12px;
          color: rgba(237,235,245,.70);
        }
        .terms-content th {
          background: rgba(112,80,160,.12);
          color: #EDEBF5;
          font-weight: 600;
        }
      `}</style>
    </main>
  )
}

/* ─── Terms of Use Content ──────────────────────────────────────────────────── */
const TERMS_HTML = `
<div>
<h1>Termos de Uso</h1>
<div><strong>Última atualização: março de 2026</strong></div>
<br>
<div>Bem-vindo(a) à <strong>Reflexy</strong>. Ao acessar ou utilizar nossa plataforma, você concorda com os presentes Termos de Uso. Leia-os com atenção antes de criar sua conta ou usar qualquer funcionalidade do serviço.</div>
<br>

<h2>Índice</h2>
<div><a href="#aceite">1. Aceitação dos Termos</a></div>
<div><a href="#servico">2. Descrição do Serviço</a></div>
<div><a href="#cadastro">3. Cadastro e Conta</a></div>
<div><a href="#planos">4. Planos e Pagamentos</a></div>
<div><a href="#creditos">5. Sistema de Créditos</a></div>
<div><a href="#uso">6. Uso Aceitável</a></div>
<div><a href="#conteudo">7. Conteúdo do Usuário</a></div>
<div><a href="#pi">8. Propriedade Intelectual</a></div>
<div><a href="#privacidade">9. Privacidade</a></div>
<div><a href="#responsabilidade">10. Limitação de Responsabilidade</a></div>
<div><a href="#cancelamento">11. Suspensão e Cancelamento</a></div>
<div><a href="#modificacoes">12. Modificações dos Termos</a></div>
<div><a href="#lei">13. Lei Aplicável e Foro</a></div>
<div><a href="#contato">14. Contato</a></div>
<br>

<h2 id="aceite">1. Aceitação dos Termos</h2>
<div>Ao acessar o site <a href="https://www.reflexy.co" target="_blank">www.reflexy.co</a>, criar uma conta ou utilizar qualquer recurso da plataforma Reflexy, você declara ter lido, compreendido e concordado integralmente com estes Termos de Uso, bem como com nossa <a href="/privacy">Política de Privacidade</a>.</div>
<br>
<div>Se você estiver aceitando estes Termos em nome de uma empresa ou outra entidade jurídica, declara ter autoridade para vincular essa entidade. Caso não concorde com qualquer disposição destes Termos, não utilize o serviço.</div>
<br>
<div>O uso da plataforma é destinado exclusivamente a pessoas físicas maiores de 18 (dezoito) anos ou emancipadas, ou a pessoas jurídicas devidamente representadas por seus responsáveis legais.</div>
<br>

<h2 id="servico">2. Descrição do Serviço</h2>
<div>A Reflexy é uma plataforma SaaS (Software as a Service) de inteligência artificial voltada para lojistas de moda no e-commerce. Nossos principais recursos incluem:</div>
<ul>
<li><strong>Virtual Try-On:</strong> tecnologia de IA generativa que permite a consumidores visualizar como peças de roupa ficariam em seus próprios corpos, integrável a lojas Shopify;</li>
<li><strong>Studio Pro:</strong> geração de imagens de modelos digitais com alta qualidade, utilizando créditos premium;</li>
<li><strong>Analytics:</strong> painel de dados com insights sobre comportamento de compra, conversão e engajamento dos consumidores;</li>
<li><strong>Integração Shopify:</strong> instalação e sincronização direta com lojas na plataforma Shopify.</li>
</ul>
<div>A Reflexy reserva-se o direito de adicionar, modificar ou descontinuar funcionalidades a qualquer momento, comunicando alterações relevantes com antecedência razoável.</div>
<br>

<h2 id="cadastro">3. Cadastro e Conta</h2>
<div>Para utilizar a plataforma, é necessário criar uma conta fornecendo informações verdadeiras, completas e atualizadas. Você é responsável por:</div>
<ul>
<li>manter a confidencialidade de suas credenciais de acesso (e-mail e senha);</li>
<li>todas as atividades realizadas por meio de sua conta;</li>
<li>notificar imediatamente a Reflexy em caso de acesso não autorizado ou suspeita de violação de segurança, pelo e-mail <a href="mailto:reflexy.co@gmail.com">reflexy.co@gmail.com</a>.</li>
</ul>
<div>A Reflexy não se responsabiliza por perdas ou danos decorrentes do uso indevido de suas credenciais por terceiros em razão de falha de guarda por parte do usuário.</div>
<br>
<div>É proibido criar contas de forma automatizada, manter múltiplas contas para contornar limitações de plano ou compartilhar credenciais entre diferentes usuários.</div>
<br>

<h2 id="planos">4. Planos e Pagamentos</h2>
<div>A Reflexy oferece os seguintes planos de assinatura mensal, cobrados antecipadamente via <strong>Stripe</strong>:</div>
<br>
<table>
  <thead>
    <tr>
      <th>Plano</th>
      <th>Preço mensal</th>
      <th>Provas Virtuais (Fast Credits)</th>
      <th>Studio Pro (Premium Credits)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Preview</strong></td>
      <td>Grátis</td>
      <td>10/mês</td>
      <td>—</td>
    </tr>
    <tr>
      <td><strong>Starter</strong></td>
      <td>US$ 19</td>
      <td>100/mês</td>
      <td>5/mês</td>
    </tr>
    <tr>
      <td><strong>Growth</strong></td>
      <td>US$ 39</td>
      <td>300/mês</td>
      <td>10/mês</td>
    </tr>
    <tr>
      <td><strong>Pro</strong></td>
      <td>US$ 99</td>
      <td>800/mês</td>
      <td>20/mês</td>
    </tr>
  </tbody>
</table>
<br>
<div>Os valores exatos são os exibidos no momento da assinatura em <a href="https://www.reflexy.co/#planos" target="_blank">reflexy.co/#planos</a> e podem variar conforme câmbio ou ajustes de precificação.</div>
<br>
<h3>Cobrança e Renovação</h3>
<div>As assinaturas são renovadas automaticamente a cada 30 dias na data de aniversário da contratação. O pagamento é processado pelo Stripe no cartão de crédito cadastrado. Em caso de falha no pagamento, a Reflexy poderá suspender o acesso ao plano até a regularização.</div>
<br>
<h3>Upgrade e Downgrade</h3>
<div>Você pode alterar seu plano a qualquer momento. Upgrades têm efeito imediato (com cobrança proporcional ao período restante, conforme política do Stripe). Downgrades entram em vigor no próximo ciclo de cobrança.</div>
<br>
<h3>Política de Reembolso</h3>
<div>Não são concedidos reembolsos por períodos parciais de uso, créditos já consumidos ou por mudança de plano. Reembolsos excepcionais podem ser avaliados pela equipe Reflexy caso a caso, a exclusivo critério da plataforma, em situações de cobrança indevida comprovada. Solicitações devem ser enviadas para <a href="mailto:reflexy.co@gmail.com">reflexy.co@gmail.com</a> em até 7 dias após a cobrança.</div>
<br>

<h2 id="creditos">5. Sistema de Créditos</h2>
<div>A Reflexy opera com dois tipos de créditos:</div>
<ul>
<li><strong>Fast Credits (créditos rápidos):</strong> utilizados para gerações de virtual try-on. São incluídos em todos os planos e renovados mensalmente;</li>
<li><strong>Premium Credits (créditos premium):</strong> utilizados para geração de imagens no Studio Pro. Disponíveis nos planos Growth e Pro e renovados mensalmente.</li>
</ul>
<h3>Regras dos Créditos</h3>
<ul>
<li><strong>Renovação mensal:</strong> os créditos são repostos na data de aniversário da assinatura, não havendo acúmulo de saldo não utilizado para o mês seguinte;</li>
<li><strong>Não transferíveis:</strong> créditos são vinculados à conta do usuário e não podem ser transferidos para terceiros, cedidos ou comercializados;</li>
<li><strong>Não reembolsáveis:</strong> créditos já consumidos não geram direito a reembolso monetário, seja por cancelamento, downgrade ou qualquer outro motivo;</li>
<li><strong>Créditos adicionais:</strong> a Reflexy poderá disponibilizar pacotes de créditos avulsos para aquisição. As condições serão informadas na plataforma no momento da oferta.</li>
</ul>
<div>No plano Pro, os fast credits são descritos como "ilimitados" dentro de um uso razoável e de boa-fé. A Reflexy reserva-se o direito de limitar ou suspender contas que apresentem uso abusivo ou automatizado que comprometa a infraestrutura da plataforma.</div>
<br>

<h2 id="uso">6. Uso Aceitável</h2>
<div>Você concorda em utilizar a plataforma Reflexy exclusivamente para fins lícitos e de acordo com estes Termos. É expressamente proibido:</div>
<ul>
<li>realizar scraping, crawling ou extração automatizada de dados da plataforma sem autorização prévia e escrita da Reflexy;</li>
<li>efetuar engenharia reversa, descompilar, desmontar ou tentar obter o código-fonte da plataforma, dos modelos de IA ou de qualquer componente do serviço;</li>
<li>fazer-se passar por outra pessoa ou entidade, incluindo funcionários ou representantes da Reflexy;</li>
<li>carregar, transmitir ou gerar conteúdo ilegal, difamatório, obsceno, fraudulento, que infrinja direitos de terceiros ou que viole a legislação brasileira aplicável;</li>
<li>utilizar a plataforma para fins de treinamento de modelos de IA concorrentes ou para desenvolvimento de produtos que concorram diretamente com a Reflexy sem autorização;</li>
<li>tentar acessar sistemas, redes ou dados da Reflexy de forma não autorizada;</li>
<li>interferir na segurança, integridade ou desempenho da plataforma, incluindo ataques de negação de serviço (DoS/DDoS);</li>
<li>usar a plataforma para envio de spam, phishing ou qualquer comunicação não solicitada em massa;</li>
<li>carregar imagens de menores de idade para funcionalidades de virtual try-on ou geração de modelos.</li>
</ul>
<div>O descumprimento das regras de uso aceitável pode resultar na suspensão imediata da conta, sem direito a reembolso.</div>
<br>

<h2 id="conteudo">7. Conteúdo do Usuário</h2>
<div>Para utilizar determinadas funcionalidades (como virtual try-on), você poderá fazer upload de imagens e outros arquivos para a plataforma.</div>
<br>
<h3>Titularidade</h3>
<div>Você retém todos os direitos de propriedade intelectual sobre as imagens e conteúdos que enviar. A Reflexy não reivindica propriedade sobre seu conteúdo.</div>
<br>
<h3>Licença Concedida à Reflexy</h3>
<div>Ao enviar conteúdo para a plataforma, você concede à Reflexy uma licença limitada, não exclusiva, mundial, isenta de royalties, para usar, armazenar, processar e exibir esse conteúdo exclusivamente para fins de prestação do serviço contratado (ex.: processar a imagem para gerar o resultado de virtual try-on). Essa licença não autoriza a Reflexy a usar seu conteúdo para outros fins, como publicidade ou treinamento de modelos de IA, sem seu consentimento expresso.</div>
<br>
<h3>Responsabilidade pelo Conteúdo</h3>
<div>Você é o único responsável pelo conteúdo que enviar e declara que:</div>
<ul>
<li>possui todos os direitos necessários sobre as imagens carregadas (incluindo direito de imagem de pessoas retratadas, quando aplicável);</li>
<li>o conteúdo não viola direitos de terceiros, leis de direitos autorais ou qualquer outra legislação aplicável;</li>
<li>o conteúdo não contém material ilegal, ofensivo ou que viole os presentes Termos.</li>
</ul>
<div>A Reflexy reserva-se o direito de remover conteúdos que violem estes Termos e de reportar às autoridades competentes quando exigido por lei.</div>
<br>

<h2 id="pi">8. Propriedade Intelectual</h2>
<div>A plataforma Reflexy, incluindo mas não se limitando a seu código-fonte, modelos de inteligência artificial, algoritmos, interfaces visuais, logotipos, marcas, textos e demais elementos, é de propriedade exclusiva da Reflexy e de seus licenciantes, estando protegida pela legislação brasileira e internacional de propriedade intelectual.</div>
<br>
<div>Nenhuma disposição destes Termos transfere ao usuário qualquer direito de propriedade intelectual sobre a plataforma ou seus componentes. O uso do serviço concede ao usuário uma licença de uso pessoal, não exclusiva, intransferível e revogável, limitada ao escopo contratado em seu plano.</div>
<br>
<div>É vedada a reprodução, distribuição, modificação, criação de obras derivadas, exibição pública ou qualquer outra forma de exploração dos elementos protegidos da plataforma sem autorização prévia e escrita da Reflexy.</div>
<br>

<h2 id="privacidade">9. Privacidade</h2>
<div>O tratamento de dados pessoais realizado pela Reflexy é regido pela <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong> e está detalhado em nossa <a href="/privacy">Política de Privacidade</a>, disponível em <a href="https://www.reflexy.co/privacy" target="_blank">reflexy.co/privacy</a>.</div>
<br>
<div>Ao utilizar a plataforma, você reconhece ter lido e compreendido nossa Política de Privacidade e consente com o tratamento de seus dados nos termos ali descritos.</div>
<br>

<h2 id="responsabilidade">10. Limitação de Responsabilidade</h2>
<div>O serviço Reflexy é fornecido <strong>"no estado em que se encontra"</strong> (<em>as-is</em>) e <strong>"conforme disponível"</strong>, sem garantias expressas ou implícitas de qualquer natureza, incluindo, sem limitação, garantias de adequação a uma finalidade específica, não violação ou desempenho ininterrupto.</div>
<br>
<h3>Resultados de IA</h3>
<div>A Reflexy não garante resultados específicos decorrentes do uso das funcionalidades de inteligência artificial, como virtual try-on ou geração de imagens no Studio Pro. Os resultados podem variar em qualidade, precisão e aderência à realidade, sendo de responsabilidade do usuário avaliar a adequação das imagens geradas para seus fins comerciais.</div>
<br>
<h3>Limite de Indenização</h3>
<div>Na máxima extensão permitida pela legislação brasileira aplicável, a responsabilidade total da Reflexy perante o usuário, por qualquer causa e independentemente da forma da ação, fica limitada ao valor efetivamente pago pelo usuário nos 3 (três) meses imediatamente anteriores ao evento que originou o dano.</div>
<br>
<div>A Reflexy não se responsabiliza por:</div>
<ul>
<li>danos indiretos, incidentais, especiais, exemplares ou consequenciais;</li>
<li>lucros cessantes, perda de dados ou perda de oportunidades de negócio;</li>
<li>interrupções de serviço decorrentes de manutenção, falhas de terceiros ou casos de força maior;</li>
<li>uso indevido da plataforma pelo usuário ou por terceiros que tiveram acesso às suas credenciais.</li>
</ul>
<div>Esta limitação aplica-se mesmo que a Reflexy tenha sido avisada da possibilidade de tais danos. Nada nesta cláusula exclui a responsabilidade por danos causados com dolo ou culpa grave, conforme exigido pelo Código de Defesa do Consumidor (Lei nº 8.078/1990) quando aplicável.</div>
<br>

<h2 id="cancelamento">11. Suspensão e Cancelamento</h2>
<h3>Cancelamento pelo Usuário</h3>
<div>Você pode cancelar sua assinatura a qualquer momento pela área de configurações da conta. O cancelamento entra em vigor ao final do período de faturamento vigente, mantendo o acesso às funcionalidades do plano até essa data. Não há reembolso proporcional pelo período não utilizado após o cancelamento.</div>
<br>
<h3>Suspensão ou Cancelamento pela Reflexy</h3>
<div>A Reflexy reserva-se o direito de suspender ou encerrar sua conta, com ou sem aviso prévio, nas seguintes hipóteses:</div>
<ul>
<li>violação de qualquer disposição destes Termos de Uso;</li>
<li>uso da plataforma para atividades ilegais ou fraudulentas;</li>
<li>comportamento que cause danos à plataforma, a outros usuários ou a terceiros;</li>
<li>inadimplência no pagamento da assinatura;</li>
<li>determinação judicial ou exigência de autoridade competente.</li>
</ul>
<div>Em caso de suspensão por violação dos Termos, não haverá reembolso de valores já pagos. A Reflexy envidará esforços razoáveis para notificar o usuário antes de uma suspensão, exceto em situações que exijam ação imediata para proteger a plataforma ou terceiros.</div>
<br>
<h3>Encerramento da Plataforma</h3>
<div>Em caso de descontinuação da plataforma, a Reflexy comunicará os usuários com antecedência mínima de 30 (trinta) dias, assegurando o acesso ao serviço pelo período remanescente pago.</div>
<br>

<h2 id="modificacoes">12. Modificações dos Termos</h2>
<div>A Reflexy pode atualizar estes Termos de Uso periodicamente para refletir mudanças na plataforma, na legislação aplicável ou em nossas práticas comerciais.</div>
<br>
<div>Para alterações materiais — aquelas que afetem significativamente seus direitos ou obrigações —, notificaremos os usuários com antecedência mínima de <strong>30 (trinta) dias</strong>, por e-mail cadastrado ou por aviso destacado na plataforma. A data da última atualização será sempre indicada no topo deste documento.</div>
<br>
<div>O uso continuado da plataforma após a entrada em vigor das alterações constitui aceitação dos novos Termos. Caso não concorde com as modificações, você poderá cancelar sua assinatura antes da data de vigência, conforme previsto na Seção 11.</div>
<br>

<h2 id="lei">13. Lei Aplicável e Foro</h2>
<div>Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil, incluindo, sem limitação:</div>
<ul>
<li>Código Civil (Lei nº 10.406/2002);</li>
<li>Código de Defesa do Consumidor (Lei nº 8.078/1990), quando aplicável;</li>
<li>Lei Geral de Proteção de Dados — LGPD (Lei nº 13.709/2018);</li>
<li>Marco Civil da Internet (Lei nº 12.965/2014).</li>
</ul>
<div>Fica eleito o foro da Comarca de <strong>São Paulo/SP</strong>, com renúncia expressa a qualquer outro, por mais privilegiado que seja, para dirimir quaisquer controvérsias decorrentes destes Termos de Uso.</div>
<br>
<div>Para usuários que se enquadrem como consumidores nos termos do CDC, a eleição de foro não prejudica o direito de acionar o Juizado Especial Cível competente em seu domicílio.</div>
<br>

<h2 id="contato">14. Contato</h2>
<div>Para dúvidas, sugestões ou reclamações relacionadas a estes Termos de Uso, entre em contato com a equipe Reflexy:</div>
<br>
<div><strong>Reflexy</strong> — plataforma operada por seus fundadores e colaboradores</div>
<div>Site: <a href="https://www.reflexy.co" target="_blank">www.reflexy.co</a></div>
<div>E-mail: <a href="mailto:reflexy.co@gmail.com">reflexy.co@gmail.com</a></div>
<br>
<div>Nos comprometemos a responder sua mensagem em até 5 (cinco) dias úteis.</div>
</div>
`
