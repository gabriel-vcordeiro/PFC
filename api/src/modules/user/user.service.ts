import { supabase } from '../../db/supabase/client';
import { AuditAction, auditService } from '../audit/audit.service';

export class UserService {
  async deleteUserData(userId: string, ipAddress?: string, userAgent?: string) {
    const { data: user, error: fetchError } = await supabase
      .from('pfc_users')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (!user || fetchError) {
      await auditService.logActivity(
        userId,
        AuditAction.USER_DATA_DELETION_FAILED,
        {
          reason: 'Usuário não encontrado',
        },
        ipAddress,
        userAgent
      );
      throw new Error('Usuário não encontrado.');
    }

    const { error: deleteError } = await supabase.from('pfc_users').delete().eq('id', userId);

    if (deleteError) {
      await auditService.logActivity(
        userId,
        AuditAction.USER_DATA_DELETION_FAILED,
        {
          email: user.email,
          reason: deleteError.message,
        },
        ipAddress,
        userAgent
      );
      throw new Error('Erro ao deletar dados pessoais.');
    }

    await auditService.logActivity(
      null,
      AuditAction.USER_DATA_DELETED,
      {
        userId,
        email: user.email,
        deletedAt: new Date().toISOString(),
      },
      ipAddress,
      userAgent
    );

    return {
      message: 'Dados pessoais deletados com sucesso.',
    };
  }

  //precisa ser acrescentado a cada mudança de dados pessoais, como email e username
  async exportUserData(userId: string, ipAddress?: string, userAgent?: string) {
    const { data: user, error } = await supabase
      .from('pfc_users')
      .select('id, username, email')
      .eq('id', userId)
      .single();

    if (!user || error) {
      throw new Error('Usuário não encontrado.');
    }

    const exportedAt = new Date().toISOString();

    await auditService.logActivity(
      userId,
      AuditAction.USER_DATA_EXPORTED,
      {
        exportedAt,
        fields: ['id', 'username', 'email'],
      },
      ipAddress,
      userAgent
    );

    return {
      exportedAt,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }

  async getUserData(id: string) {
    const { data: user, error } = await supabase.from('pfc_users').select().eq('id', id).single();
    if (!user) {
      throw new Error('Usuário não encontrado.');
    }
    return {
      user: {
        id: id,
        username: user.username,
        email: user.email,
      },
    };
  }
}
