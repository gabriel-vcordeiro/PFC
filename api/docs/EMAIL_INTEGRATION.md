# 📧 Integração de Envio de Email - Recuperação de Senha

Este documento descreve como integrar um serviço de envio de email à funcionalidade de recuperação de senha.

## 🚀 Opções de Serviços

### 1. **Resend** (Recomendado - Gratuito para desenvolvimento)
### 2. **SendGrid**
### 3. **Mailgun**
### 4. **AWS SES**

---

## 📨 Implementação com Resend

### 1. Instalar Dependências

```bash
cd api
npm install resend
npm install -D @types/resend
```

### 2. Adicionar ao `.env`

```env
RESEND_API_KEY=re_seu_api_key_aqui
FRONTEND_URL=http://localhost:5173
EMAIL_FROM=noreply@seu-dominio.com
```

### 3. Criar Serviço de Email

Crie o arquivo `api/src/services/email.service.ts`:

```typescript
import { Resend } from 'resend';
import { env } from '../config/env';

const resend = new Resend(env.resendApiKey);

export class EmailService {
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    expiresAt: Date
  ) {
    try {
      const resetLink = `${env.frontendUrl}/reset-password?token=${resetToken}`;
      
      const { error } = await resend.emails.send({
        from: env.emailFrom,
        to: email,
        subject: '🔐 Recuperar sua Senha - PFC App',
        html: this.getPasswordResetEmailTemplate(resetLink, expiresAt)
      });

      if (error) {
        console.error('Erro ao enviar email:', error);
        throw new Error('Erro ao enviar email de recuperação');
      }

      return { success: true };
    } catch (error) {
      console.error('Erro no serviço de email:', error);
      throw error;
    }
  }

  private getPasswordResetEmailTemplate(resetLink: string, expiresAt: Date): string {
    const expiresAtFormatted = expiresAt.toLocaleString('pt-BR');
    
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background-color: #fff3cd; border: 1px solid #ffc107; padding: 10px; border-radius: 5px; margin: 15px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Recuperação de Senha</h1>
            </div>
            <div class="content">
              <p>Olá,</p>
              <p>Você solicitou para recuperar sua senha. Clique no botão abaixo para continuar:</p>
              
              <a href="${resetLink}" class="button">Recuperar Senha</a>
              
              <p><strong>Ou copie e cole o link no seu navegador:</strong></p>
              <p style="word-break: break-all; background-color: #fff; padding: 10px; border: 1px solid #ddd; border-radius: 3px;">
                <code>${resetLink}</code>
              </p>
              
              <div class="warning">
                <strong>⚠️ Aviso de Segurança:</strong>
                <ul>
                  <li>Este link expira em <strong>${expiresAtFormatted}</strong></li>
                  <li>Se você não solicitou esta recuperação, ignore este email</li>
                  <li>Nunca compartilhe este link com outras pessoas</li>
                </ul>
              </div>
              
              <p>Se tiver dúvidas, entre em contato com nosso suporte.</p>
              
              <br>
              <p>
                Atenciosamente,<br>
                <strong>Equipe PFC</strong>
              </p>
            </div>
            <div class="footer">
              <p>© 2026 PFC App. Todos os direitos reservados.</p>
              <p>Este é um email automático, por favor não responda.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  async sendPasswordChangedEmail(email: string) {
    try {
      const { error } = await resend.emails.send({
        from: env.emailFrom,
        to: email,
        subject: '✅ Senha Alterada com Sucesso - PFC App',
        html: this.getPasswordChangedEmailTemplate()
      });

      if (error) {
        console.error('Erro ao enviar email:', error);
      }
    } catch (error) {
      console.error('Erro no serviço de email:', error);
    }
  }

  private getPasswordChangedEmailTemplate(): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-radius: 0 0 5px 5px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✅ Senha Alterada com Sucesso</h1>
            </div>
            <div class="content">
              <p>Olá,</p>
              <p>Sua senha foi alterada com sucesso em <strong>${new Date().toLocaleString('pt-BR')}</strong>.</p>
              
              <p>Se você não fez essa alteração, entre em contato conosco imediatamente.</p>
              
              <p>
                Atenciosamente,<br>
                <strong>Equipe PFC</strong>
              </p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}

export const emailService = new EmailService();
```

### 4. Atualizar `config/env.ts`

```typescript
export const env = {
  // ... outros
  resendApiKey: process.env.RESEND_API_KEY || '',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  emailFrom: process.env.EMAIL_FROM || 'noreply@exemplo.com'
};
```

### 5. Atualizar `auth.services.ts`

Adicione o import e envio de email:

```typescript
import { emailService } from '../../services/email.service';

// No método requestPasswordReset, adicione:
async requestPasswordReset(email: string, ipAddress?: string, userAgent?: string) {
  // ... código anterior ...

  // Enviar email
  try {
    await emailService.sendPasswordResetEmail(email, resetToken, new Date(Date.now() + RESET_TOKEN_EXPIRY));
  } catch (err) {
    console.error('Erro ao enviar email:', err);
    // Não lançar erro para não interromper o fluxo
  }

  // Remover de resposta (segurança)
  return {
    message: 'Se o email existir, você receberá um link de recuperação.'
  };
}

// No método resetPassword, adicione:
async resetPassword(resetToken: string, newPassword: string, ipAddress?: string, userAgent?: string) {
  // ... código anterior ...

  // Enviar email de confirmação
  try {
    const { data: user } = await supabase
      .from('pfc_users')
      .select('email')
      .eq('id', userId)
      .single();
    
    if (user) {
      await emailService.sendPasswordChangedEmail(user.email);
    }
  } catch (err) {
    console.error('Erro ao enviar email de confirmação:', err);
  }

  return { message: 'Senha resetada com sucesso.' };
}
```

---

## 📨 Implementação com SendGrid

### 1. Instalar Dependência

```bash
npm install @sendgrid/mail
npm install -D @types/@sendgrid/mail
```

### 2. Adicionar ao `.env`

```env
SENDGRID_API_KEY=SG.seu_chave_aqui
SENDGRID_FROM_EMAIL=noreply@seu-dominio.com
```

### 3. Criar Serviço

```typescript
import sgMail from '@sendgrid/mail';
import { env } from '../config/env';

sgMail.setApiKey(env.sendgridApiKey);

export class EmailService {
  async sendPasswordResetEmail(
    email: string,
    resetToken: string,
    expiresAt: Date
  ) {
    const resetLink = `${env.frontendUrl}/reset-password?token=${resetToken}`;
    
    const msg = {
      to: email,
      from: env.sendgridFromEmail,
      subject: '🔐 Recuperar sua Senha - PFC App',
      html: this.getPasswordResetEmailTemplate(resetLink, expiresAt)
    };

    try {
      await sgMail.send(msg);
      return { success: true };
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      throw new Error('Erro ao enviar email de recuperação');
    }
  }

  // Template é igual ao do Resend
}
```

---

## 🧪 Testando Envio de Email

### Com Resend (desenvolvimento)

1. Crie conta em [resend.com](https://resend.com)
2. Copie a API Key
3. Use `test@resend.dev` para testar (email automático retornado)
4. Para emails reais, verifique o domínio

### Teste Local

```bash
# Adicione logs temporários em auth.services.ts
console.log('Enviando email para:', email);
console.log('Token:', resetToken);
console.log('Link:', `http://localhost:5173/reset-password?token=${resetToken}`);
```

---

## 🔒 Boas Práticas

1. **Nunca envie o token em texto plano** - sempre na URL
2. **Usar HTTPS em produção**
3. **Limite de requisições** - máximo 3 por dia por email
4. **Template responsivo** - funciona em celulares
5. **Verificação de bounce** - remover emails inválidos

---

## Template de Email Alternativo (Mais Simples)

```typescript
private getPasswordResetEmailTemplate(resetLink: string, expiresAt: Date): string {
  return `
    <h2>Recuperação de Senha</h2>
    <p>Clique no link abaixo para resetar sua senha:</p>
    <p><a href="${resetLink}">Resetar Senha</a></p>
    <p>Este link expira em: ${expiresAt.toLocaleString('pt-BR')}</p>
    <p>Se não solicitou este email, ignore.</p>
  `;
}
```

---

## 📊 Monitoramento

Adicione logs:

```typescript
import { auditService, AuditAction } from '../services/audit.service';

// Após envio bem-sucedido
await auditService.logActivity(
  user.id,
  AuditAction.PASSWORD_RESET_REQUESTED,
  { email, emailSentAt: new Date() }
);
```

---

## 🚀 Deploy em Produção

1. Configure as variáveis de ambiente no seu host
2. Verifique o domínio no serviço de email
3. Configure SPF/DKIM/DMARC
4. Teste o fluxo completo
5. Monitore a taxa de entrega

---

## 📚 Referências

- [Resend Docs](https://resend.com/docs)
- [SendGrid Docs](https://docs.sendgrid.com/)
- [SMTP Best Practices](https://www.smtpget.com/article/best-practices)
