import { Evento } from '../aggregates/Evento';
import { UsuarioId, EventoId, GrupoId, EstadoAsistenciaVO, EstadoAsistencia } from '../value-objects';
import { EventoRepository } from '../repositories/EventoRepository';
import { GrupoRepository } from '../repositories/GrupoRepository';

export class EventoService {
  constructor(
    private eventoRepository: EventoRepository,
    private grupoRepository: GrupoRepository
  ) {}

  public async verificarPermisosEdicion(eventoId: EventoId, usuarioId: UsuarioId): Promise<boolean> {
    const evento = await this.eventoRepository.findById(eventoId);
    
    if (!evento) {
      throw new Error('Evento no encontrado');
    }
    
    // Verificar si el usuario es el creador
    return evento.creadorId.equals(usuarioId);
  }

  public async obtenerEventosProximos(dias: number = 30): Promise<Evento[]> {
    const hoy = new Date();
    const hasta = new Date();
    hasta.setDate(hoy.getDate() + dias);
    
    return this.eventoRepository.findByFechaInicio(hoy, hasta);
  }

  public async obtenerEventosDeUsuario(usuarioId: UsuarioId): Promise<Evento[]> {
    return this.eventoRepository.findByUsuario(usuarioId);
  }

  public async obtenerEventosDeGrupo(grupoId: GrupoId): Promise<Evento[]> {
    return this.eventoRepository.findByGrupo(grupoId);
  }

  public async obtenerAsistentesConfirmados(eventoId: EventoId): Promise<UsuarioId[]> {
    const evento = await this.eventoRepository.findByIdWithAsistentes(eventoId);
    
    if (!evento) {
      throw new Error('Evento no encontrado');
    }
    
    return evento.asistentes
      .filter(a => a.estado.isAsistira())
      .map(a => a.usuarioId);
  }

  public async puedeUsuarioVerEvento(eventoId: EventoId, usuarioId: UsuarioId): Promise<boolean> {
    const evento = await this.eventoRepository.findById(eventoId);
    
    if (!evento) {
      throw new Error('Evento no encontrado');
    }
    
    // Si el usuario es el creador, siempre puede ver el evento
    if (evento.creadorId.equals(usuarioId)) {
      return true;
    }
    
    // Si el evento es público, cualquier usuario puede verlo
    if (evento.privacidad.getValue() === 'PUBLICO') {
      return true;
    }
    
    // Si el evento pertenece a un grupo, verificar si el usuario es miembro
    if (evento.grupoId) {
      const grupo = await this.grupoRepository.findByIdWithMiembros(evento.grupoId);
      if (grupo) {
        return grupo.miembros.some(m => m.usuarioId.equals(usuarioId));
      }
    }
    
    // Si el evento es privado o solo invitados, verificar si el usuario está en la lista de asistentes
    const eventoConAsistentes = await this.eventoRepository.findByIdWithAsistentes(eventoId);
    return eventoConAsistentes?.asistentes.some(a => a.usuarioId.equals(usuarioId)) || false;
  }
} 