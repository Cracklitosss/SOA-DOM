import { Grupo } from '../aggregates/Grupo';
import { GrupoId, UsuarioId } from '../value-objects';

export interface GrupoRepository {
  save(grupo: Grupo): Promise<void>;
  findById(id: GrupoId): Promise<Grupo | null>;
  findByIdWithMiembros(id: GrupoId): Promise<Grupo | null>;
  findByUsuario(usuarioId: UsuarioId): Promise<Grupo[]>;
  delete(id: GrupoId): Promise<void>;
  findAll(limit?: number, offset?: number): Promise<Grupo[]>;
  countTotal(): Promise<number>;
} 