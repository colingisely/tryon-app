/**
 * Reflexy — app/privacy/page.tsx
 * Política de Privacidade — gerada via Termly, atualizada em março de 2026
 */

export const metadata = {
  title: 'Política de Privacidade | Reflexy',
  description: 'Política de Privacidade da plataforma Reflexy.',
}

export default function PrivacyPage() {
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

        {/* Privacy content */}
        <div
          style={{
            fontFamily: 'Arial, sans-serif',
            color: '#EDEBF5',
            lineHeight: 1.7,
          }}
          className="privacy-content"
          dangerouslySetInnerHTML={{ __html: PRIVACY_HTML }}
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
          <a href="/terms" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: 'rgba(160,156,192,.50)', textDecoration: 'none' }}>
            Termos de Uso →
          </a>
        </div>
      </div>

      <style>{`
        .privacy-content h1 {
          font-family: 'Bricolage Grotesque', Arial, sans-serif;
          font-size: clamp(24px, 3vw, 36px);
          font-weight: 700;
          color: #EDEBF5;
          letter-spacing: -.02em;
          margin-bottom: 8px;
        }
        .privacy-content h2 {
          font-family: 'Bricolage Grotesque', Arial, sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #EDEBF5;
          margin-top: 40px;
          margin-bottom: 12px;
          padding-top: 16px;
          border-top: 1px solid rgba(184,174,221,.08);
        }
        .privacy-content h3 {
          font-family: 'DM Sans', Arial, sans-serif;
          font-size: 15px;
          font-weight: 600;
          color: #EDEBF5;
          margin-top: 24px;
          margin-bottom: 8px;
        }
        .privacy-content p,
        .privacy-content li,
        .privacy-content div {
          font-family: 'DM Sans', Arial, sans-serif;
          font-size: 14px;
          color: rgba(237,235,245,.72);
          line-height: 1.8;
        }
        .privacy-content a {
          color: #7050A0;
          text-decoration: underline;
        }
        .privacy-content a:hover {
          color: #A07FD0;
        }
        .privacy-content strong {
          color: #EDEBF5;
          font-weight: 600;
        }
        .privacy-content em {
          color: rgba(237,235,245,.60);
        }
        .privacy-content ul {
          padding-left: 20px;
          margin: 8px 0 16px;
        }
        .privacy-content li {
          margin-bottom: 6px;
        }
        .privacy-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 16px 0;
          font-size: 13px;
        }
        .privacy-content th,
        .privacy-content td {
          border: 1px solid rgba(184,174,221,.20);
          padding: 8px 12px;
          color: rgba(237,235,245,.70);
        }
        .privacy-content th {
          background: rgba(112,80,160,.12);
          color: #EDEBF5;
          font-weight: 600;
        }
      `}</style>
    </main>
  )
}

/* ─── Privacy Policy Content (Termly) ─────────────────────────────────────── */
const PRIVACY_HTML = `
<div>
<h1>PRIVACY POLICY</h1>
<div><strong>Last updated March 21, 2026</strong></div>
<br>
<div>This Privacy Notice for <strong>Reflexy</strong> (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), describes how and why we might access, collect, store, use, and/or share (&quot;process&quot;) your personal information when you use our services (&quot;Services&quot;), including when you:</div>
<ul>
<li>Visit our website at <a target="_blank" href="https://www.reflexy.co">https://www.reflexy.co</a></li>
<li>Use <strong>Reflexy</strong> — a SaaS platform with AI-powered virtual try-on for fashion e-commerce merchants (such as Shopify stores). Our solution allows end users to visualize how clothing would look on their own bodies using generative AI. We also offer Studio Pro for digital model creation and an Analytics tool providing insights on purchasing behavior, conversion, and customer engagement.</li>
<li>Engage with us in other related ways, including any marketing or events</li>
</ul>
<div><strong>Questions or concerns?</strong> Reading this Privacy Notice will help you understand your privacy rights and choices. If you do not agree with our policies and practices, please do not use our Services. If you still have any questions or concerns, please contact us at <a href="mailto:reflexy.co@gmail.com">reflexy.co@gmail.com</a>.</div>
<br>

<h2>SUMMARY OF KEY POINTS</h2>
<div><em><strong>This summary provides key points from our Privacy Notice.</strong></em></div><br>
<div><strong>What personal information do we process?</strong> When you visit, use, or navigate our Services, we may process personal information depending on how you interact with us and the Services, the choices you make, and the products and features you use.</div><br>
<div><strong>Do we process any sensitive personal information?</strong> We do not process sensitive personal information.</div><br>
<div><strong>Do we collect any information from third parties?</strong> We do not collect any information from third parties.</div><br>
<div><strong>How do we process your information?</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</div><br>
<div><strong>How do we keep your information safe?</strong> We have adequate organizational and technical processes in place to protect your personal information. However, no electronic transmission over the internet can be guaranteed to be 100% secure.</div><br>
<div><strong>What are your rights?</strong> Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information.</div><br>
<div><strong>How do you exercise your rights?</strong> The easiest way to exercise your rights is by submitting a <a href="https://app.termly.io/dsar/b1e3b002-63ea-49a1-a84a-31d859c9c79d" rel="noopener noreferrer" target="_blank">data subject access request</a>, or by contacting us. We will consider and act upon any request in accordance with applicable data protection laws.</div>
<br>

<h2 id="toc">TABLE OF CONTENTS</h2>
<div><a href="#infocollect">1. WHAT INFORMATION DO WE COLLECT?</a></div>
<div><a href="#infouse">2. HOW DO WE PROCESS YOUR INFORMATION?</a></div>
<div><a href="#legalbases">3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR PERSONAL INFORMATION?</a></div>
<div><a href="#whoshare">4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</a></div>
<div><a href="#cookies">5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</a></div>
<div><a href="#ai">6. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</a></div>
<div><a href="#sociallogins">7. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</a></div>
<div><a href="#inforetain">8. HOW LONG DO WE KEEP YOUR INFORMATION?</a></div>
<div><a href="#infosafe">9. HOW DO WE KEEP YOUR INFORMATION SAFE?</a></div>
<div><a href="#infominors">10. DO WE COLLECT INFORMATION FROM MINORS?</a></div>
<div><a href="#privacyrights">11. WHAT ARE YOUR PRIVACY RIGHTS?</a></div>
<div><a href="#DNT">12. CONTROLS FOR DO-NOT-TRACK FEATURES</a></div>
<div><a href="#uslaws">13. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</a></div>
<div><a href="#policyupdates">14. DO WE MAKE UPDATES TO THIS NOTICE?</a></div>
<div><a href="#contact">15. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</a></div>
<div><a href="#request">16. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</a></div>
<br>

<h2 id="infocollect">1. WHAT INFORMATION DO WE COLLECT?</h2>
<h3>Personal information you disclose to us</h3>
<div><em><strong>In Short:</strong> We collect personal information that you provide to us.</em></div><br>
<div>We collect personal information that you voluntarily provide to us when you register on the Services, express an interest in obtaining information about us or our products and Services, when you participate in activities on the Services, or otherwise when you contact us.</div><br>
<div><strong>Personal Information Provided by You.</strong> The personal information we collect may include the following:</div>
<ul>
<li>names</li>
<li>email addresses</li>
</ul>
<div><strong>Sensitive Information.</strong> We do not process sensitive information.</div><br>
<div><strong>Payment Data.</strong> We may collect data necessary to process your payment if you choose to make purchases, such as your payment instrument number, and the security code associated with your payment instrument. All payment data is handled and stored by <strong>Stripe</strong>. You may find their privacy notice here: <a target="_blank" href="https://stripe.com/br/privacy">https://stripe.com/br/privacy</a>.</div><br>
<div><strong>Social Media Login Data.</strong> We may provide you with the option to register with us using your existing social media account details. If you choose to register in this way, we will collect certain profile information about you from the social media provider.</div><br>
<div>All personal information that you provide to us must be true, complete, and accurate, and you must notify us of any changes to such personal information.</div>

<h3>Information automatically collected</h3>
<div><em><strong>In Short:</strong> Some information — such as your Internet Protocol (IP) address and/or browser and device characteristics — is collected automatically when you visit our Services.</em></div><br>
<div>We automatically collect certain information when you visit, use, or navigate the Services. This information does not reveal your specific identity but may include device and usage information, such as your IP address, browser and device characteristics, operating system, language preferences, referring URLs, device name, country, location, information about how and when you use our Services, and other technical information.</div><br>
<div>Like many businesses, we also collect information through cookies and similar technologies.</div>
<br>

<h2 id="infouse">2. HOW DO WE PROCESS YOUR INFORMATION?</h2>
<div><em><strong>In Short:</strong> We process your information to provide, improve, and administer our Services, communicate with you, for security and fraud prevention, and to comply with law.</em></div><br>
<div><strong>We process your personal information for a variety of reasons, including:</strong></div>
<ul>
<li><strong>To facilitate account creation and authentication and otherwise manage user accounts.</strong></li>
<li><strong>To request feedback.</strong> We may process your information when necessary to request feedback and to contact you about your use of our Services.</li>
<li><strong>To send you marketing and promotional communications.</strong> We may process the personal information you send to us for our marketing purposes, if this is in accordance with your marketing preferences. You can opt out of our marketing emails at any time.</li>
<li><strong>To protect our Services.</strong> We may process your information as part of our efforts to keep our Services safe and secure, including fraud monitoring and prevention.</li>
<li><strong>To identify usage trends.</strong> We may process information about how you use our Services to better understand how they are being used so we can improve them.</li>
<li><strong>To save or protect an individual&apos;s vital interest.</strong> We may process your information when necessary to save or protect an individual&apos;s vital interest, such as to prevent harm.</li>
</ul>
<br>

<h2 id="legalbases">3. WHAT LEGAL BASES DO WE RELY ON TO PROCESS YOUR INFORMATION?</h2>
<div><em><strong>In Short:</strong> We only process your personal information when we believe it is necessary and we have a valid legal reason to do so under applicable law, like with your consent, to comply with laws, to provide you with services to enter into or fulfill our contractual obligations, to protect your rights, or to fulfill our legitimate business interests.</em></div><br>
<div><em><strong>If you are located in the EU or UK, this section applies to you.</strong></em></div><br>
<div>The General Data Protection Regulation (GDPR) and UK GDPR require us to explain the valid legal bases we rely on in order to process your personal information. As such, we may rely on the following legal bases:</div>
<ul>
<li><strong>Consent.</strong> We may process your information if you have given us permission to use your personal information for a specific purpose. You can withdraw your consent at any time.</li>
<li><strong>Legitimate Interests.</strong> We may process your information when we believe it is reasonably necessary to achieve our legitimate business interests and those interests do not outweigh your interests and fundamental rights and freedoms.</li>
<li><strong>Legal Obligations.</strong> We may process your information where we believe it is necessary for compliance with our legal obligations.</li>
<li><strong>Vital Interests.</strong> We may process your information where we believe it is necessary to protect your vital interests or the vital interests of a third party.</li>
</ul>
<br>

<h2 id="whoshare">4. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?</h2>
<div><em><strong>In Short:</strong> We may share information in specific situations described in this section and/or with the following third parties.</em></div><br>
<div>We may need to share your personal information in the following situations:</div>
<ul>
<li><strong>Business Transfers.</strong> We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.</li>
<li><strong>Affiliates.</strong> We may share your information with our affiliates, in which case we will require those affiliates to honor this Privacy Notice.</li>
<li><strong>Business Partners.</strong> We may share your information with our business partners to offer you certain products, services, or promotions.</li>
</ul>
<br>

<h2 id="cookies">5. DO WE USE COOKIES AND OTHER TRACKING TECHNOLOGIES?</h2>
<div><em><strong>In Short:</strong> We may use cookies and other tracking technologies to collect and store your information.</em></div><br>
<div>We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services. Some online tracking technologies help us maintain the security of our Services and your account, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.</div>
<br>

<h2 id="ai">6. DO WE OFFER ARTIFICIAL INTELLIGENCE-BASED PRODUCTS?</h2>
<div><em><strong>In Short:</strong> We offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies.</em></div><br>
<div>As part of our Services, we offer products, features, or tools powered by artificial intelligence, machine learning, or similar technologies (collectively, &quot;AI Products&quot;). These tools are designed to enhance your experience and provide you with innovative solutions.</div><br>
<div><strong>Our AI Products are designed for the following functions:</strong></div>
<ul>
<li>Image generation (virtual try-on)</li>
<li>AI insights (analytics and recommendations)</li>
</ul>
<div>We provide the AI Products through third-party service providers (&quot;AI Service Providers&quot;). Your input, output, and personal information will be shared with and processed by these AI Service Providers to enable your use of our AI Products. You must not use the AI Products in any way that violates the terms or policies of any AI Service Provider.</div><br>
<div>All personal information processed using our AI Products is handled in line with our Privacy Notice and our agreement with third parties.</div>
<br>

<h2 id="sociallogins">7. HOW DO WE HANDLE YOUR SOCIAL LOGINS?</h2>
<div><em><strong>In Short:</strong> If you choose to register or log in to our Services using a social media account, we may have access to certain information about you.</em></div><br>
<div>Our Services offer you the ability to register and log in using your third-party social media account details (like your Google or GitHub logins). Where you choose to do this, we will receive certain profile information about you from your social media provider.</div><br>
<div>We will use the information we receive only for the purposes that are described in this Privacy Notice. We recommend that you review the privacy notice of each social media provider to understand how they collect, use, and share your personal information.</div>
<br>

<h2 id="inforetain">8. HOW LONG DO WE KEEP YOUR INFORMATION?</h2>
<div><em><strong>In Short:</strong> We keep your information for as long as necessary to fulfill the purposes outlined in this Privacy Notice unless otherwise required by law.</em></div><br>
<div>We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Notice, unless a longer retention period is required or permitted by law. No purpose in this notice will require us keeping your personal information for longer than the period of time in which users have an account with us.</div><br>
<div>When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible, then we will securely store your personal information and isolate it from any further processing until deletion is possible.</div>
<br>

<h2 id="infosafe">9. HOW DO WE KEEP YOUR INFORMATION SAFE?</h2>
<div><em><strong>In Short:</strong> We aim to protect your personal information through a system of organizational and technical security measures.</em></div><br>
<div>We have implemented appropriate and reasonable technical and organizational security measures designed to protect the security of any personal information we process. However, despite our safeguards and efforts to secure your information, no electronic transmission over the Internet or information storage technology can be guaranteed to be 100% secure, so we cannot promise or guarantee that hackers, cybercriminals, or other unauthorized third parties will not be able to defeat our security and improperly collect, access, steal, or modify your information. You should only access the Services within a secure environment.</div>
<br>

<h2 id="infominors">10. DO WE COLLECT INFORMATION FROM MINORS?</h2>
<div><em><strong>In Short:</strong> We do not knowingly collect data from or market to children under 18 years of age.</em></div><br>
<div>We do not knowingly collect, solicit data from, or market to children under 18 years of age, nor do we knowingly sell such personal information. By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent&apos;s use of the Services. If we learn that personal information from users less than 18 years of age has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records. If you become aware of any data we may have collected from children under age 18, please contact us at <a href="mailto:reflexy.co@gmail.com">reflexy.co@gmail.com</a>.</div>
<br>

<h2 id="privacyrights">11. WHAT ARE YOUR PRIVACY RIGHTS?</h2>
<div><em><strong>In Short:</strong> Depending on your state of residence in the US or in some regions, such as the European Economic Area (EEA), United Kingdom (UK), Switzerland, and Canada, you have rights that allow you greater access to and control over your personal information. You may review, change, or terminate your account at any time.</em></div><br>
<div>In some regions (like the EEA, UK, Switzerland, and Canada), you have certain rights under applicable data protection laws. These may include the right (i) to request access and obtain a copy of your personal information, (ii) to request rectification or erasure; (iii) to restrict the processing of your personal information; (iv) if applicable, to data portability; and (v) not to be subject to automated decision-making.</div><br>
<div>We will consider and act upon any request in accordance with applicable data protection laws.</div><br>
<div>If you are located in the EEA or UK and you believe we are unlawfully processing your personal information, you also have the right to complain to your <a href="https://ec.europa.eu/justice/data-protection/bodies/authorities/index_en.htm" rel="noopener noreferrer" target="_blank">Member State data protection authority</a> or <a href="https://ico.org.uk/make-a-complaint/data-protection-complaints/data-protection-complaints/" rel="noopener noreferrer" target="_blank">UK data protection authority</a>.</div><br>
<h3>Withdrawing your consent</h3>
<div>If we are relying on your consent to process your personal information, you have the right to withdraw your consent at any time by contacting us using the contact details provided in the section &quot;HOW CAN YOU CONTACT US ABOUT THIS NOTICE?&quot; below.</div><br>
<h3>Account Information</h3>
<div>If you would at any time like to review or change the information in your account or terminate your account, you can log in to your account settings and update your user account.</div><br>
<div>Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.</div><br>
<div>If you have questions or comments about your privacy rights, you may email us at <a href="mailto:reflexy.co@gmail.com">reflexy.co@gmail.com</a>.</div>
<br>

<h2 id="DNT">12. CONTROLS FOR DO-NOT-TRACK FEATURES</h2>
<div>Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track (&quot;DNT&quot;) feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected. At this stage, no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online.</div>
<br>

<h2 id="uslaws">13. DO UNITED STATES RESIDENTS HAVE SPECIFIC PRIVACY RIGHTS?</h2>
<div><em><strong>In Short:</strong> If you are a resident of California, Colorado, Connecticut, Delaware, Florida, Indiana, Iowa, Kentucky, Maryland, Minnesota, Montana, Nebraska, New Hampshire, New Jersey, Oregon, Rhode Island, Tennessee, Texas, Utah, or Virginia, you may have the right to request access to and receive details about the personal information we maintain about you.</em></div><br>
<div>We have not disclosed, sold, or shared any personal information to third parties for a business or commercial purpose in the preceding twelve (12) months. We will not sell or share personal information in the future belonging to website visitors, users, and other consumers.</div><br>
<h3>How to Exercise Your Rights</h3>
<div>To exercise these rights, you can contact us by submitting a <a href="https://app.termly.io/dsar/b1e3b002-63ea-49a1-a84a-31d859c9c79d" rel="noopener noreferrer" target="_blank">data subject access request</a>, by emailing us at <a href="mailto:reflexy.co@gmail.com">reflexy.co@gmail.com</a>, or by visiting <a href="https://www.reflexy.co/">https://www.reflexy.co/</a>.</div>
<br>

<h2 id="policyupdates">14. DO WE MAKE UPDATES TO THIS NOTICE?</h2>
<div><em><strong>In Short:</strong> Yes, we will update this notice as necessary to stay compliant with relevant laws.</em></div><br>
<div>We may update this Privacy Notice from time to time. The updated version will be indicated by an updated &quot;Revised&quot; date at the top of this Privacy Notice. If we make material changes to this Privacy Notice, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification. We encourage you to review this Privacy Notice frequently to be informed of how we are protecting your information.</div>
<br>

<h2 id="contact">15. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?</h2>
<div>If you have questions or comments about this notice, you may contact us by email at <a href="mailto:reflexy.co@gmail.com">reflexy.co@gmail.com</a> or by visiting <a href="https://www.reflexy.co/">https://www.reflexy.co/</a>.</div>
<br>

<h2 id="request">16. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?</h2>
<div>Based on the applicable laws of your country or state of residence in the US, you may have the right to request access to the personal information we collect from you, details about how we have processed it, correct inaccuracies, or delete your personal information. You may also have the right to withdraw your consent to our processing of your personal information. To request to review, update, or delete your personal information, please fill out and submit a <a href="https://app.termly.io/dsar/b1e3b002-63ea-49a1-a84a-31d859c9c79d" rel="noopener noreferrer" target="_blank">data subject access request</a>.</div>
</div>
`
