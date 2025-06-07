import { DomainEvent } from './DomainEvent';
import { EventoId, UsuarioId, PrivacidadEvento, GrupoId } from '../value-objects';

export class EventoCreado implements DomainEvent {
  public readonly eventName = 'evento.creado';
  public readonly occurredOn: Date;
  
  constructor(
    public readonly eventoId: EventoId,
    public readonly creadorId: UsuarioId,
    public readonly nombre: string,
    public readonly fechaInicio: Date,
    public readonly privacidad: PrivacidadEvento,
    public readonly grupoId?: GrupoId
  ) {
    this.occurredOn = new Date();
  }
} 