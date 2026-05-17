import { useNavigate } from "react-router-dom";

export default function ConsentPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-semibold text-gray-900 mb-2">
          Política de Consentimento
        </h1>
        <p className="text-gray-600 mb-8">
          · Revisado em: 16 de maio de 2026 · Versão: 1.0.0
        </p>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              1. Consentimento de Dados
            </h2>
            <p>
              Ao criar uma conta em nossa plataforma, você autoriza a coleta e
              o processamento de seus dados pessoais conforme descrito nesta
              política. Seu consentimento é fundamental para que possamos
              fornecer nossos serviços de forma personalizada e eficiente.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              2. Dados Coletados
            </h2>
            <p className="mb-3">Coletamos e processamos os seguintes dados:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Informações de identificação (nome, email, username)</li>
              <li>Dados de autenticação (senha criptografada)</li>
              <li>Informações de perfil do usuário</li>
              <li>Dados de uso da plataforma</li>
              <li>Endereço IP e informações do dispositivo</li>
              <li>Registros de atividades e logs</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              3. Finalidades do Processamento
            </h2>
            <p className="mb-3">
              Seus dados são utilizados para as seguintes finalidades:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Criar e gerenciar sua conta de usuário</li>
              <li>Autenticar e verificar sua identidade</li>
              <li>Fornecer suporte ao cliente</li>
              <li>Melhorar e personalizar nossos serviços</li>
              <li>Análise de uso e estatísticas</li>
              <li>Segurança e prevenção de fraudes</li>
              <li>Conformidade com obrigações legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              4. Compartilhamento de Dados
            </h2>
            <p>
              Seus dados podem ser compartilhados com terceiros apenas quando
              necessário para fornecer nossos serviços ou quando exigido por lei.
              Nunca vendemos seus dados pessoais a terceiros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              5. Segurança dos Dados
            </h2>
            <p>
              Implementamos medidas técnicas e organizacionais para proteger seus
              dados contra acesso não autorizado, alteração, divulgação ou
              destruição. No entanto, nenhuma transmissão de dados é 100% segura.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              6. Retenção de Dados
            </h2>
            <p>
              Manteremos seus dados pessoais enquanto sua conta estiver ativa.
              Se você desativar sua conta, seus dados serão retidos conforme
              exigido por lei ou excluídos após um período de retenção específico.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              7. Seus Direitos
            </h2>
            <p className="mb-3">Você possui o direito de:</p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Acessar seus dados pessoais</li>
              <li>Corrigir informações inexatas</li>
              <li>Solicitar a exclusão de seus dados</li>
              <li>Retirar seu consentimento a qualquer momento</li>
              <li>Receber seus dados em formato portátil</li>
              <li>Apresentar reclamações às autoridades competentes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              8. Consentimento
            </h2>
            <p>
              Ao marcar a caixa de consentimento durante o registro, você
              confirma que leu, compreendeu e concorda com esta política. Você
              pode retirar seu consentimento a qualquer momento entrando em
              contato conosco através de nossos canais de suporte.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              9. Contato
            </h2>
            <p>
              Se tiver dúvidas sobre esta política ou sobre o processamento de
              seus dados, entre em contato conosco através do email de suporte
              ou dos formulários disponíveis na plataforma.
            </p>
          </section>
        </div>

        <button
          onClick={() => navigate("/register")}
          className="mt-12 px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Voltar ao Cadastro
        </button>
      </div>
    </div>
  );
}
