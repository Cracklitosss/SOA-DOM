import { Grupo } from '../aggregates/Grupo';
import { UsuarioId, GrupoId, RolGrupoVO } from '../value-objects';
import { GrupoRepository } from '../repositories/GrupoRepository';

export class GrupoService {
  constructor(private grupoRepository: GrupoRepository) {}

  public async verificarPermisosAdministracion(grupoId: GrupoId, usuarioId: UsuarioId): Promise<boolean> {
    const grupo = await this.grupoRepository.findByIdWithMiembros(grupoId);
    
    if (!grupo) {
      throw new Error('Grupo no encontrado');
    }
    
    // Verificar si el usuario es el creador o tiene rol de administrador
    const esCreador = grupo.creadorId.equals(usuarioId);
    
    if (esCreador) {
      return true;
    }
    
    // Buscar al usuario en los miembros y verificar si es administrador
    const miembro = grupo.miembros.find(m => m.usuarioId.equals(usuarioId));
    return miembro?.esAdministrador() || false;
  }

  public async verificarPermisosModeracion(grupoId: GrupoId, usuarioId: UsuarioId): Promise<boolean> {
    const grupo = await this.grupoRepository.findByIdWithMiembros(grupoId);
    
    if (!grupo) {
      throw new Error('Grupo no encontrado');
    }
    
    // Verificar si el usuario es el creador o tiene rol de moderador o administrador
    const esCreador = grupo.creadorId.equals(usuarioId);
    
    if (esCreador) {
      return true;
    }
    
    // Buscar al usuario en los miembros y verificar si es moderador o administrador
    const miembro = grupo.miembros.find(m => m.usuarioId.equals(usuarioId));
    return miembro?.esModerador() || false;
  }

  public async obtenerGruposDeUsuario(usuarioId: UsuarioId): Promise<Grupo[]> {
    return this.grupoRepository.findByUsuario(usuarioId);
  }
} 