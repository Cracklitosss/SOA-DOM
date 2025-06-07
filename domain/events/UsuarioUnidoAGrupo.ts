import { DomainEvent } from './DomainEvent';
import { GrupoId, UsuarioId, RolGrupo } from '../value-objects';

export class UsuarioUnidoAGrupo implements DomainEvent {
  public readonly eventName = 'usuario.unido.a.grupo';
  public readonly occurredOn: Date;
  
  constructor(
    public readonly grupoId: GrupoId,
    public readonly usuarioId: UsuarioId,
    public readonly rol: RolGrupo
  ) {
    this.occurredOn = new Date();
  }
} 