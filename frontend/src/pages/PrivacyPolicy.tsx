import { useNavigate } from 'react-router-dom';
 
export default function TermsOfUse() {
  const navigate = useNavigate();
 
  return (
<div className="min-h-screen bg-white px-4 py-16">
<div className="max-w-3xl mx-auto">
<h1 className="text-4xl font-semibold text-gray-900 mb-2">
          Termos de Uso
</h1>
<p className="text-gray-600 mb-8">
        · Revisado em: 6 de maio de 2026 · Versão: 2.1
</p>
 
        <div className="space-y-8 text-gray-700 leading-relaxed">
 
          <section>
<h2 className="text-2xl font-semibold text-gray-900 mb-3">
              1. Aceitação
</h2>
<p>
              Ao acessar ou utilizar qualquer serviço da NOSSOPFC Ltda., você declara ter lido, compreendido e concordado integralmente com estes Termos de Uso. Caso não concorde com qualquer disposição, você deve cessar imediatamente o uso dos nossos serviços.
</p>
<p className="mt-3">
              A utilização dos serviços implica aceitação automática destes Termos. Recomendamos que você os leia integralmente antes de prosseguir.
</p>
</section>
 
          <section>
<h2 className="text-2xl font-semibold text-gray-900 mb-3">
              2. Uso do Serviço
</h2>
<p className="mb-3">
              Nossos serviços são disponibilizados para uso pessoal e não comercial, salvo acordo expresso em contrário.
</p>
<ul className="list-disc list-inside space-y-2 pl-4">
<li>Utilizar os serviços apenas para finalidades lícitas e autorizadas.</li>
<li>Não interferir no funcionamento da plataforma ou de seus sistemas.</li>
<li>Manter suas credenciais de acesso em sigilo e segurança.</li>
<li>Notificar imediatamente qualquer uso não autorizado da sua conta.</li>
</ul>
</section>
 
          <section>
<h2 className="text-2xl font-semibold text-gray-900 mb-3">
              3. Conta do Usuário
</h2>
<p>
              Para acessar determinados recursos, pode ser necessário criar uma conta. Você é responsável por todas as atividades realizadas sob suas credenciais e por manter suas informações atualizadas e verídicas.
</p>
<p className="mt-3">
              Reservamo-nos o direito de suspender ou encerrar contas que violem estes Termos, sem aviso prévio.
</p>
</section>
 
          <section>
<h2 className="text-2xl font-semibold text-gray-900 mb-3">
              4. Conteúdo
</h2>
<p>
              Ao publicar ou compartilhar conteúdo, você concede uma licença não exclusiva para uso dentro da plataforma.
</p>
<p className="mt-3">
              Você declara possuir os direitos sobre o conteúdo compartilhado.
</p>
</section>
 
          <section>
<h2 className="text-2xl font-semibold text-gray-900 mb-3">
              5. Proibições
</h2>
<p className="mb-3">São proibidas as seguintes condutas:</p>
<ul className="list-disc list-inside space-y-2 pl-4">
<li>Publicar conteúdo ilegal ou que viole direitos de terceiros.</li>
<li>Utilizar automações sem autorização.</li>
<li>Tentar acessar áreas restritas.</li>
<li>Praticar spam ou fraude.</li>
<li>Reproduzir conteúdo sem autorização.</li>
</ul>
</section>
 
          <section>
<h2 className="text-2xl font-semibold text-gray-900 mb-3">
              6. Propriedade Intelectual
</h2>
<p>
              Todo o conteúdo da plataforma pertence à NOSSOPFC Ltda. e é protegido por lei.
</p>
</section>
 
          <section>
<h2 className="text-2xl font-semibold text-gray-900 mb-3">
              7. Responsabilidade
</h2>
<p>
              Não nos responsabilizamos por danos indiretos decorrentes do uso da plataforma.
</p>
<p className="mt-3">
              Os serviços são fornecidos sem garantias de disponibilidade contínua.
</p>
</section>
 
          <section>
<h2 className="text-2xl font-semibold text-gray-900 mb-3">
              8. Rescisão
</h2>
<p>
              Você pode encerrar sua conta a qualquer momento.
</p>
<p className="mt-3">
              Podemos suspender usuários que violem estes Termos.
</p>
</section>
 
          <section>
<h2 className="text-2xl font-semibold text-gray-900 mb-3">
              9. Foro
</h2>
<p>
              Estes Termos são regidos pelas leis brasileiras, sendo eleito o foro da Comarca de São Paulo/SP.
</p>
</section>
 
        </div>
 
        <button
          onClick={() => navigate('/')}
          className="mt-12 px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
>
          Voltar ao Login
</button>
</div>
</div>
  );
}