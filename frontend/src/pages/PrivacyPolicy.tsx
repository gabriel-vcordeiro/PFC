import { useNavigate } from 'react-router-dom';

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-semibold text-gray-900 mb-2">Política de Privacidade</h1>
        <p className="text-gray-600 mb-8">Última atualização: 5 de maio de 2026</p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">1. Introdução</h2>
            <p>
              Esta Política de Privacidade descreve como coletamos, usamos e protegemos suas informações pessoais quando você utiliza nossa aplicação.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">2. Informações que Coletamos</h2>
            <p className="mb-3">Podemos coletar as seguintes informações:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Informações de conta: email, nome de usuário e senha (criptografada)</li>
              <li>Dados de uso: informações sobre como você interage com a aplicação</li>
              <li>Informações técnicas: endereço IP, tipo de navegador, sistema operacional</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">3. Como Usamos suas Informações</h2>
            <p className="mb-3">Utilizamos suas informações para:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Fornecer e manter nossos serviços</li>
              <li>Autenticar usuários e proteger contas</li>
              <li>Melhorar a experiência do usuário</li>
              <li>Cumprir obrigações legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">4. Compartilhamento de Informações</h2>
            <p className="mb-3">Não vendemos ou alugamos suas informações pessoais. Podemos compartilhar informações apenas:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Com seu consentimento explícito</li>
              <li>Para cumprir leis ou ordens judiciais</li>
              <li>Para proteger nossos direitos e segurança</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">5. Segurança</h2>
            <p>
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso não autorizado, alteração, divulgação ou destruição.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">6. Seus Direitos</h2>
            <p className="mb-3">Você tem o direito de:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Acessar suas informações pessoais</li>
              <li>Corrigir dados incorretos</li>
              <li>Solicitar exclusão de seus dados</li>
              <li>Optar por não receber comunicações de marketing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">7. Cookies</h2>
            <p>
              Utilizamos cookies para melhorar sua experiência. Você pode controlar o uso de cookies através das configurações do seu navegador.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">8. Alterações nesta Política</h2>
            <p>
              Podemos atualizar esta política periodicamente. Notificaremos sobre mudanças significativas através de nossa aplicação ou por email.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">9. Contato</h2>
            <p>
              Se você tiver dúvidas sobre esta política, entre em contato conosco através do email: privacy@exemplo.com
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