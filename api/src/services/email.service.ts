import nodemailer from 'nodemailer';
import { env } from '../config/env';

const transporter = nodemailer.createTransport({
  host: env.smtpHost,
  port: env.smtpPort,
  secure: env.smtpSecure,
  auth: {
    user: env.smtpUser,
    pass: env.smtpPass
  }
});

export class EmailService {
  async sendPasswordResetEmail(email: string, resetToken: string, expiresAt: Date) {
    if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
      throw new Error('SMTP não configurado. Verifique as variáveis de ambiente.');
    }

    const resetLink = `${env.frontendUrl}/reset-password?token=${resetToken}`;
    const expiresAtFormatted = expiresAt.toLocaleString('pt-BR');

    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Recuperação de senha</h2>
        <p>Você solicitou recuperar sua senha. Clique no botão abaixo para continuar:</p>
        <a href="${resetLink}" style="display:inline-block;padding:12px 20px;color:#fff;background:#007bff;border-radius:5px;text-decoration:none;">Resetar Senha</a>
        <p>Se o botão não funcionar, cole este link no navegador:</p>
        <p><a href="${resetLink}">${resetLink}</a></p>
        <p>Este link expira em ${expiresAtFormatted}.</p>
        <p>Se você não solicitou a recuperação, ignore este email.</p>
      </div>
    `;

    await transporter.sendMail({
      from: env.emailFrom,
      to: email,
      subject: 'Recuperação de senha - PFC',
      html
    });
  }

  async sendPasswordChangedEmail(email: string) {
    if (!env.smtpHost || !env.smtpUser || !env.smtpPass) {
      return;
    }

    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2>Sua senha foi alterada</h2>
        <p>Sua senha foi atualizada com sucesso.</p>
        <p>Se você não fez essa alteração, entre em contato imediatamente.</p>
      </div>
    `;

    await transporter.sendMail({
      from: env.emailFrom,
      to: email,
      subject: 'Senha alterada - PFC',
      html
    });
  }
}

export const emailService = new EmailService();
