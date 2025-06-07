import { EventoId, UsuarioId, PrivacidadEvento, PrivacidadEventoVO, GrupoId, EstadoAsistencia, EstadoAsistenciaVO } from '../value-objects';
import { AsistenteEvento } from '../entities';
import { EventoCreado } from '../events';
import { DomainEventPublisher } from '../events/DomainEventPublisher';

export class Evento {
  private _id: EventoId;
  private _nombre: string;
  private _descripcion: string;
  private _creadorId: UsuarioId;
  private _ubicacion: string;
  private _fechaInicio: Date;
  private _fechaFin: Date | null;
  private _privacidad: PrivacidadEventoVO;
  private _grupoId: GrupoId | null;
  private _asistentes: AsistenteEvento[] = [];

  constructor(
    id: EventoId,
    nombre: string,
    descripcion: string,
    creadorId: UsuarioId,
    ubicacion: string,
    fechaInicio: Date,
    privacidad: PrivacidadEventoVO,
    fechaFin: Date | null = null,
    grupoId: GrupoId | null = null
  ) {
    if (!nombre || nombre.trim() === '') {
      throw new Error('El nombre del evento no puede estar vacío');
    }
    
    if (fechaInicio < new Date()) {
      throw new Error('La fecha de inicio no puede ser en el pasado');
    }
    
    if (fechaFin && fechaFin <= fechaInicio) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }
    
    this._id = id;
    this._nombre = nombre;
    this._descripcion = descripcion;
    this._creadorId = creadorId;
    this._ubicacion = ubicacion;
    this._fechaInicio = fechaInicio;
    this._fechaFin = fechaFin;
    this._privacidad = privacidad;
    this._grupoId = grupoId;
    
    // Añadir al creador como asistente
    const creadorComoAsistente = new AsistenteEvento(
      id,
      creadorId,
      EstadoAsistenciaVO.of(EstadoAsistencia.ASISTIRA)
    );
    
    this._asistentes.push(creadorComoAsistente);
  }

  public static create(
    nombre: string,
    descripcion: string,
    creadorId: UsuarioId,
    ubicacion: string,
    fechaInicio: Date,
    privacidad: PrivacidadEventoVO,
    fechaFin: Date | null = null,
    grupoId: GrupoId | null = null
  ): Evento {
    const id = EventoId.create();
    const evento = new Evento(
      id,
      nombre,
      descripcion,
      creadorId,
      ubicacion,
      fechaInicio,
      privacidad,
      fechaFin,
      grupoId
    );
    
    // Publicar evento de dominio
    const event = new EventoCreado(
      id,
      creadorId,
      nombre,
      fechaInicio,
      privacidad.getValue(),
      grupoId || undefined
    );
    
    DomainEventPublisher.getInstance().publish(event);
    
    return evento;
  }

  // Getters
  public get id(): EventoId {
    return this._id;
  }

  public get nombre(): string {
    return this._nombre;
  }

  public get descripcion(): string {
    return this._descripcion;
  }

  public get creadorId(): UsuarioId {
    return this._creadorId;
  }

  public get ubicacion(): string {
    return this._ubicacion;
  }

  public get fechaInicio(): Date {
    return this._fechaInicio;
  }

  public get fechaFin(): Date | null {
    return this._fechaFin;
  }

  public get privacidad(): PrivacidadEventoVO {
    return this._privacidad;
  }

  public get grupoId(): GrupoId | null {
    return this._grupoId;
  }

  public get asistentes(): AsistenteEvento[] {
    return [...this._asistentes];
  }

  // Métodos de negocio
  public invitarUsuario(usuarioId: UsuarioId): AsistenteEvento {
    // Verificar que el usuario no esté ya invitado
    if (this.esAsistente(usuarioId)) {
      throw new Error('El usuario ya está invitado al evento');
    }

    const asistente = new AsistenteEvento(
      this._id,
      usuarioId,
      EstadoAsistenciaVO.of(EstadoAsistencia.SIN_RESPUESTA)
    );
    
    this._asistentes.push(asistente);
    return asistente;
  }

  public registrarRespuesta(usuarioId: UsuarioId, estado: EstadoAsistenciaVO): void {
    const asistente = this.getAsistente(usuarioId);
    
    // Si no está invitado, crearlo como nuevo asistente
    if (!asistente) {
      const nuevoAsistente = new AsistenteEvento(this._id, usuarioId, estado);
      this._asistentes.push(nuevoAsistente);
      return;
    }
    
    // Actualizar estado
    asistente.cambiarEstado(estado);
  }

  public actualizarDetalles(
    nombre: string,
    descripcion: string,
    ubicacion: string,
    fechaInicio: Date,
    fechaFin: Date | null,
    privacidad: PrivacidadEventoVO
  ): void {
    if (!nombre || nombre.trim() === '') {
      throw new Error('El nombre del evento no puede estar vacío');
    }
    
    if (fechaInicio < new Date() && fechaInicio !== this._fechaInicio) {
      throw new Error('No se puede cambiar la fecha de inicio a una fecha pasada');
    }
    
    if (fechaFin && fechaFin <= fechaInicio) {
      throw new Error('La fecha de fin debe ser posterior a la fecha de inicio');
    }
    
    this._nombre = nombre;
    this._descripcion = descripcion;
    this._ubicacion = ubicacion;
    this._fechaInicio = fechaInicio;
    this._fechaFin = fechaFin;
    this._privacidad = privacidad;
  }

  public contarAsistentes(): number {
    return this._asistentes.filter(a => a.vaAsistir()).length;
  }

  public cancelarEvento(): void {
    if (this._fechaInicio < new Date()) {
      throw new Error('No se puede cancelar un evento que ya ha ocurrido');
    }
    
    // Implementar lógica para cancelar el evento
    // Por ejemplo, notificar a todos los asistentes
  }

  // Métodos de ayuda
  private getAsistente(usuarioId: UsuarioId): AsistenteEvento | undefined {
    return this._asistentes.find(a => a.usuarioId.equals(usuarioId));
  }

  private esAsistente(usuarioId: UsuarioId): boolean {
    return this._asistentes.some(a => a.usuarioId.equals(usuarioId));
  }
} 