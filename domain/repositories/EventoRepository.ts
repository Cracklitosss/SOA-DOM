import { Evento } from '../aggregates/Evento';
import { EventoId, UsuarioId, GrupoId } from '../value-objects';

export interface EventoRepository {
  save(evento: Evento): Promise<void>;
  findById(id: EventoId): Promise<Evento | null>;
  findByIdWithAsistentes(id: EventoId): Promise<Evento | null>;
  findByUsuario(usuarioId: UsuarioId): Promise<Evento[]>;
  findByGrupo(grupoId: GrupoId): Promise<Evento[]>;
  findByFechaInicio(desde: Date, hasta: Date): Promise<Evento[]>;
  delete(id: EventoId): Promise<void>;
  findAll(limit?: number, offset?: number): Promise<Evento[]>;
  countTotal(): Promise<number>;
} 