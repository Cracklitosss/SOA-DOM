export interface EventoDTO {
  id: string;
  nombre: string;
  descripcion: string;
  creadorId: string;
  ubicacion: string;
  fechaInicio: string;
  fechaFin?: string;
  privacidad: string;
  grupoId?: string;
}

export interface EventoDetalladoDTO extends EventoDTO {
  asistentes: AsistenteEventoDTO[];
}

export interface AsistenteEventoDTO {
  usuarioId: string;
  estado: string;
  fechaRespuesta: string;
}

export interface CrearEventoDTO {
  nombre: string;
  descripcion: string;
  creadorId: string;
  ubicacion: string;
  fechaInicio: string;
  fechaFin?: string;
  privacidad: string;
  grupoId?: string;
}

export interface ActualizarEventoDTO {
  nombre?: string;
  descripcion?: string;
  ubicacion?: string;
  fechaInicio?: string;
  fechaFin?: string;
  privacidad?: string;
}

export interface RespuestaEventoDTO {
  usuarioId: string;
  estado: string;
}

export interface InvitarUsuarioEventoDTO {
  usuarioId: string;
} 