import { v4 as uuidv4 } from 'uuid';
import { GrupoId, UsuarioId } from '../value-objects';

export class PublicacionGrupo {
  private _id: string;
  private _grupoId: GrupoId;
  private _autorId: UsuarioId;
  private _contenido: string;
  private _fechaCreacion: Date;
  private _aprobada: boolean;

  constructor(
    grupoId: GrupoId,
    autorId: UsuarioId,
    contenido: string,
    id?: string,
    fechaCreacion?: Date,
    aprobada: boolean = false
  ) {
    this._id = id || uuidv4();
    this._grupoId = grupoId;
    this._autorId = autorId;
    this._contenido = contenido;
    this._fechaCreacion = fechaCreacion || new Date();
    this._aprobada = aprobada;
  }

  public get id(): string {
    return this._id;
  }

  public get grupoId(): GrupoId {
    return this._grupoId;
  }

  public get autorId(): UsuarioId {
    return this._autorId;
  }

  public get contenido(): string {
    return this._contenido;
  }

  public get fechaCreacion(): Date {
    return this._fechaCreacion;
  }

  public get aprobada(): boolean {
    return this._aprobada;
  }

  public aprobar(): void {
    this._aprobada = true;
  }

  public rechazar(): void {
    this._aprobada = false;
  }

  public editarContenido(nuevoContenido: string): void {
    if (!nuevoContenido || nuevoContenido.trim() === '') {
      throw new Error('El contenido no puede estar vacío');
    }
    this._contenido = nuevoContenido;
  }
} 