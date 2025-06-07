import { DomainEvent } from './DomainEvent';
import { EventoId, UsuarioId, EstadoAsistencia } from '../value-objects';

export class RespuestaEventoActualizada implements DomainEvent {
  public readonly eventName = 'respuesta.evento.actualizada';
  public readonly occurredOn: Date;
  
  constructor(
    public readonly eventoId: EventoId,
    public readonly usuarioId: UsuarioId,
    public readonly estadoAnterior: EstadoAsistencia,
    public readonly estadoNuevo: EstadoAsistencia
  ) {
    this.occurredOn = new Date();
  }
} 