import { EventoId, UsuarioId, EstadoAsistencia, EstadoAsistenciaVO } from '../value-objects';
import { RespuestaEventoActualizada } from '../events';
import { DomainEventPublisher } from '../events/DomainEventPublisher';

export class AsistenteEvento {
  private _eventoId: EventoId;
  private _usuarioId: UsuarioId;
  private _estado: EstadoAsistenciaVO;
  private _fechaRespuesta: Date;

  constructor(
    eventoId: EventoId,
    usuarioId: UsuarioId,
    estado: EstadoAsistenciaVO,
    fechaRespuesta?: Date
  ) {
    this._eventoId = eventoId;
    this._usuarioId = usuarioId;
    this._estado = estado;
    this._fechaRespuesta = fechaRespuesta || new Date();
  }

  public get eventoId(): EventoId {
    return this._eventoId;
  }

  public get usuarioId(): UsuarioId {
    return this._usuarioId;
  }

  public get estado(): EstadoAsistenciaVO {
    return this._estado;
  }

  public get fechaRespuesta(): Date {
    return this._fechaRespuesta;
  }

  public cambiarEstado(nuevoEstado: EstadoAsistenciaVO): void {
    const estadoAnterior = this._estado;
    this._estado = nuevoEstado;
    this._fechaRespuesta = new Date();
    
    // Publicar evento de dominio
    const event = new RespuestaEventoActualizada(
      this._eventoId,
      this._usuarioId,
      this._estado.getValue(),
      nuevoEstado.getValue()
    );
    
    DomainEventPublisher.getInstance().publish(event);
  }

  public vaAsistir(): boolean {
    return this._estado.isAsistira();
  }
} 