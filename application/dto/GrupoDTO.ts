export interface GrupoDTO {
  id: string;
  nombre: string;
  descripcion: string;
  creadorId: string;
  privacidad: string;
  fechaCreacion: string;
}

export interface GrupoDetalladoDTO extends GrupoDTO {
  miembros: MiembroGrupoDTO[];
  publicaciones?: PublicacionGrupoDTO[];
}

export interface MiembroGrupoDTO {
  usuarioId: string;
  rol: string;
  fechaUnion: string;
}

export interface PublicacionGrupoDTO {
  id: string;
  autorId: string;
  contenido: string;
  fechaCreacion: string;
  aprobada: boolean;
}

export interface CrearGrupoDTO {
  nombre: string;
  descripcion: string;
  creadorId: string;
  privacidad: string;
}

export interface ActualizarGrupoDTO {
  nombre?: string;
  descripcion?: string;
  privacidad?: string;
}

export interface AgregarMiembroDTO {
  usuarioId: string;
  rol: string;
}

export interface CambiarRolMiembroDTO {
  usuarioId: string;
  nuevoRol: string;
} 