import { 
  EventoDTO, 
  EventoDetalladoDTO, 
  CrearEventoDTO, 
  ActualizarEventoDTO,
  RespuestaEventoDTO,
  InvitarUsuarioEventoDTO,
  AsistenteEventoDTO
} from '../../dto';

export interface EventoUseCase {
  // Operaciones básicas
  crearEvento(dto: CrearEventoDTO): Promise<EventoDTO>;
  obtenerEvento(id: string): Promise<EventoDTO | null>;
  obtenerEventoDetallado(id: string): Promise<EventoDetalladoDTO | null>;
  actualizarEvento(id: string, dto: ActualizarEventoDTO, usuarioId: string): Promise<EventoDTO>;
  eliminarEvento(id: string, usuarioId: string): Promise<void>;
  
  // Operaciones de asistentes
  invitarUsuario(eventoId: string, dto: InvitarUsuarioEventoDTO, usuarioSolicitanteId: string): Promise<void>;
  registrarRespuesta(eventoId: string, dto: RespuestaEventoDTO): Promise<void>;
  obtenerAsistentes(eventoId: string): Promise<AsistenteEventoDTO[]>;
  obtenerAsistentesConfirmados(eventoId: string): Promise<string[]>;
  
  // Listados y búsquedas
  listarEventos(limit?: number, offset?: number): Promise<EventoDTO[]>;
  buscarEventosPorNombre(nombre: string): Promise<EventoDTO[]>;
  obtenerEventosDeUsuario(usuarioId: string): Promise<EventoDTO[]>;
  obtenerEventosDeGrupo(grupoId: string): Promise<EventoDTO[]>;
  obtenerEventosProximos(dias?: number): Promise<EventoDTO[]>;
  contarTotalEventos(): Promise<number>;
} 