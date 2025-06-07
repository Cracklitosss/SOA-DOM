import { GrupoId, UsuarioId, RolGrupo, RolGrupoVO } from '../value-objects';

export class MiembroGrupo {
  private _grupoId: GrupoId;
  private _usuarioId: UsuarioId;
  private _rol: RolGrupoVO;
  private _fechaUnion: Date;

  constructor(
    grupoId: GrupoId,
    usuarioId: UsuarioId,
    rol: RolGrupoVO,
    fechaUnion?: Date
  ) {
    this._grupoId = grupoId;
    this._usuarioId = usuarioId;
    this._rol = rol;
    this._fechaUnion = fechaUnion || new Date();
  }

  public get grupoId(): GrupoId {
    return this._grupoId;
  }

  public get usuarioId(): UsuarioId {
    return this._usuarioId;
  }

  public get rol(): RolGrupoVO {
    return this._rol;
  }

  public get fechaUnion(): Date {
    return this._fechaUnion;
  }

  public cambiarRol(nuevoRol: RolGrupoVO): void {
    this._rol = nuevoRol;
  }

  public esAdministrador(): boolean {
    return this._rol.isAdministrador();
  }

  public esModerador(): boolean {
    return this._rol.isModerador();
  }
} 