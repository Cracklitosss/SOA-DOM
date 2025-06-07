import { EventoRepository } from '../../domain/repositories/EventoRepository';
import { Evento } from '../../domain/aggregates/Evento';
import { AsistenteEvento } from '../../domain/entities';
import { 
  EventoId, 
  UsuarioId, 
  GrupoId, 
  PrivacidadEventoVO, 
  EstadoAsistenciaVO 
} from '../../domain/value-objects';
import { Database } from '../config/database';

export class MySQLEventoRepository implements EventoRepository {
  private db: Database;

  constructor() {
    this.db = Database.getInstance();
  }

  async save(evento: Evento): Promise<void> {
    console.log('Guardando evento:', evento.id.getValue());
  }

  async findById(id: EventoId): Promise<Evento | null> {
    console.log('Buscando evento por ID:', id.getValue());
    return null;
  }

  async findByIdWithAsistentes(id: EventoId): Promise<Evento | null> {
    console.log('Buscando evento con asistentes:', id.getValue());
    return null;
  }

  async findByUsuario(usuarioId: UsuarioId): Promise<Evento[]> {
    console.log('Buscando eventos por usuario:', usuarioId.getValue());
    return [];
  }

  async findByGrupo(grupoId: GrupoId): Promise<Evento[]> {
    console.log('Buscando eventos por grupo:', grupoId.getValue());
    return []; 
  }

  async findByFechaInicio(desde: Date, hasta: Date): Promise<Evento[]> {
    console.log('Buscando eventos por fecha:', desde, hasta);
    return []; 
  }

  async delete(id: EventoId): Promise<void> {
    console.log('Eliminando evento:', id.getValue());
  }

  async findAll(limit?: number, offset?: number): Promise<Evento[]> {
    console.log('Listando todos los eventos:', { limit, offset });
    return [];      
  }

  async countTotal(): Promise<number> {
    console.log('Contando total de eventos');
    return 0;
  }

  private mapToEntity(data: any): Evento {
    const id = EventoId.of(data.id);
    const creadorId = UsuarioId.of(data.creador_id);
    const privacidad = PrivacidadEventoVO.of(data.privacidad);
    const grupoId = data.grupo_id ? GrupoId.of(data.grupo_id) : null;
    
    return new Evento(
      id,
      data.nombre,
      data.descripcion,
      creadorId,
      data.ubicacion,
      new Date(data.fecha_inicio),
      privacidad,
      data.fecha_fin ? new Date(data.fecha_fin) : null,
      grupoId
    );
  }

  private mapToAsistenteEntity(data: any): AsistenteEvento {
    const eventoId = EventoId.of(data.evento_id);
    const usuarioId = UsuarioId.of(data.usuario_id);
    const estado = EstadoAsistenciaVO.of(data.estado);
    
    return new AsistenteEvento(
      eventoId,
      usuarioId,
      estado,
      new Date(data.fecha_respuesta)
    );
  }
} 