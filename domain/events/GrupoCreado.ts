import { DomainEvent } from './DomainEvent';
import { GrupoId, UsuarioId, PrivacidadGrupo } from '../value-objects';

export class GrupoCreado implements DomainEvent {
  public readonly eventName = 'grupo.creado';
  public readonly occurredOn: Date;
  
  constructor(
    public readonly grupoId: GrupoId,
    public readonly creadorId: UsuarioId,
    public readonly nombre: string,
    public readonly privacidad: PrivacidadGrupo
  ) {
    this.occurredOn = new Date();
  }
} 