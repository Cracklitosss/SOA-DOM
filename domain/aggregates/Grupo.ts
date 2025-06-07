import { GrupoId, UsuarioId, PrivacidadGrupo, PrivacidadGrupoVO, RolGrupo, RolGrupoVO } from '../value-objects';
import { MiembroGrupo, PublicacionGrupo } from '../entities';
import { GrupoCreado, UsuarioUnidoAGrupo } from '../events';
import { DomainEventPublisher } from '../events/DomainEventPublisher';

export class Grupo {
  private _id: GrupoId;
  private _nombre: string;
  private _descripcion: string;
  private _creadorId: UsuarioId;
  private _privacidad: PrivacidadGrupoVO;
  private _fechaCreacion: Date;
  private _miembros: MiembroGrupo[] = [];
  private _publicaciones: PublicacionGrupo[] = [];

  constructor(
    id: GrupoId,
    nombre: string,
    descripcion: string,
    creadorId: UsuarioId,
    privacidad: PrivacidadGrupoVO,
    fechaCreacion?: Date
  ) {
    if (!nombre || nombre.trim() === '') {
      throw new Error('El nombre del grupo no puede estar vacío');
    }
    
    this._id = id;
    this._nombre = nombre;
    this._descripcion = descripcion;
    this._creadorId = creadorId;
    this._privacidad = privacidad;
    this._fechaCreacion = fechaCreacion || new Date();
    
    // Añadir al creador como administrador
    const creadorComoMiembro = new MiembroGrupo(
      id,
      creadorId,
      RolGrupoVO.of(RolGrupo.ADMINISTRADOR),
      this._fechaCreacion
    );
    
    this._miembros.push(creadorComoMiembro);
  }

  public static create(
    nombre: string,
    descripcion: string,
    creadorId: UsuarioId,
    privacidad: PrivacidadGrupoVO
  ): Grupo {
    const id = GrupoId.create();
    const grupo = new Grupo(id, nombre, descripcion, creadorId, privacidad);
    
    // Publicar evento de dominio
    const event = new GrupoCreado(
      id,
      creadorId,
      nombre,
      privacidad.getValue()
    );
    
    DomainEventPublisher.getInstance().publish(event);
    
    return grupo;
  }

  // Getters
  public get id(): GrupoId {
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

  public get privacidad(): PrivacidadGrupoVO {
    return this._privacidad;
  }

  public get fechaCreacion(): Date {
    return this._fechaCreacion;
  }

  public get miembros(): MiembroGrupo[] {
    return [...this._miembros];
  }

  public get publicaciones(): PublicacionGrupo[] {
    return [...this._publicaciones];
  }

  // Métodos de negocio
  public agregarMiembro(usuarioId: UsuarioId, rol: RolGrupoVO): void {
    // Verificar que el usuario no sea ya miembro
    if (this.esMiembro(usuarioId)) {
      throw new Error('El usuario ya es miembro del grupo');
    }

    const miembro = new MiembroGrupo(this._id, usuarioId, rol);
    this._miembros.push(miembro);

    // Publicar evento de dominio
    const event = new UsuarioUnidoAGrupo(
      this._id,
      usuarioId,
      rol.getValue()
    );
    
    DomainEventPublisher.getInstance().publish(event);
  }

  public removerMiembro(usuarioId: UsuarioId): void {
    // No se puede eliminar al creador
    if (this._creadorId.equals(usuarioId)) {
      throw new Error('No se puede eliminar al creador del grupo');
    }

    // Verificar que haya al menos un administrador después de la eliminación
    const esAdministrador = this.getMiembro(usuarioId)?.esAdministrador() || false;
    if (esAdministrador && this.contarAdministradores() <= 1) {
      throw new Error('No se puede eliminar el último administrador del grupo');
    }

    this._miembros = this._miembros.filter(
      m => !m.usuarioId.equals(usuarioId)
    );
  }

  public cambiarRolMiembro(usuarioId: UsuarioId, nuevoRol: RolGrupoVO): void {
    const miembro = this.getMiembro(usuarioId);
    if (!miembro) {
      throw new Error('El usuario no es miembro del grupo');
    }

    // Si estamos degradando un administrador, verificar que quede al menos uno
    if (miembro.esAdministrador() && !nuevoRol.isAdministrador() && this.contarAdministradores() <= 1) {
      throw new Error('No se puede degradar al último administrador del grupo');
    }

    miembro.cambiarRol(nuevoRol);
  }

  public crearPublicacion(autorId: UsuarioId, contenido: string): PublicacionGrupo {
    // Verificar que el autor sea miembro
    if (!this.esMiembro(autorId)) {
      throw new Error('Solo los miembros pueden crear publicaciones');
    }

    const publicacion = new PublicacionGrupo(this._id, autorId, contenido);
    
    // Si el autor es moderador o administrador, aprobar automáticamente
    const autor = this.getMiembro(autorId);
    if (autor && autor.esModerador()) {
      publicacion.aprobar();
    }
    
    this._publicaciones.push(publicacion);
    return publicacion;
  }

  public aprobarPublicacion(publicacionId: string, aprobadorId: UsuarioId): void {
    // Verificar que el aprobador sea moderador o administrador
    const aprobador = this.getMiembro(aprobadorId);
    if (!aprobador || !aprobador.esModerador()) {
      throw new Error('Solo moderadores y administradores pueden aprobar publicaciones');
    }

    const publicacion = this.getPublicacion(publicacionId);
    if (!publicacion) {
      throw new Error('Publicación no encontrada');
    }

    publicacion.aprobar();
  }

  public rechazarPublicacion(publicacionId: string, rechazadorId: UsuarioId): void {
    // Verificar que el rechazador sea moderador o administrador
    const rechazador = this.getMiembro(rechazadorId);
    if (!rechazador || !rechazador.esModerador()) {
      throw new Error('Solo moderadores y administradores pueden rechazar publicaciones');
    }

    const publicacion = this.getPublicacion(publicacionId);
    if (!publicacion) {
      throw new Error('Publicación no encontrada');
    }

    publicacion.rechazar();
  }

  public actualizarInformacion(
    nombre: string,
    descripcion: string,
    privacidad: PrivacidadGrupoVO
  ): void {
    if (!nombre || nombre.trim() === '') {
      throw new Error('El nombre del grupo no puede estar vacío');
    }
    
    this._nombre = nombre;
    this._descripcion = descripcion;
    this._privacidad = privacidad;
  }

  // Métodos de ayuda
  private getMiembro(usuarioId: UsuarioId): MiembroGrupo | undefined {
    return this._miembros.find(m => m.usuarioId.equals(usuarioId));
  }

  private getPublicacion(publicacionId: string): PublicacionGrupo | undefined {
    return this._publicaciones.find(p => p.id === publicacionId);
  }

  private esMiembro(usuarioId: UsuarioId): boolean {
    return this._miembros.some(m => m.usuarioId.equals(usuarioId));
  }

  private contarAdministradores(): number {
    return this._miembros.filter(m => m.esAdministrador()).length;
  }
} 