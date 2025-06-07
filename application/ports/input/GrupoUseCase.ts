import { 
  GrupoDTO, 
  GrupoDetalladoDTO, 
  CrearGrupoDTO, 
  ActualizarGrupoDTO,
  AgregarMiembroDTO,
  CambiarRolMiembroDTO,
  PublicacionGrupoDTO
} from '../../dto';

export interface GrupoUseCase {
  // Operaciones básicas
  crearGrupo(dto: CrearGrupoDTO): Promise<GrupoDTO>;
  obtenerGrupo(id: string): Promise<GrupoDTO | null>;
  obtenerGrupoDetallado(id: string): Promise<GrupoDetalladoDTO | null>;
  actualizarGrupo(id: string, dto: ActualizarGrupoDTO, usuarioId: string): Promise<GrupoDTO>;
  eliminarGrupo(id: string, usuarioId: string): Promise<void>;
  
  // Operaciones de miembros
  agregarMiembro(grupoId: string, dto: AgregarMiembroDTO, usuarioSolicitanteId: string): Promise<void>;
  removerMiembro(grupoId: string, usuarioId: string, usuarioSolicitanteId: string): Promise<void>;
  cambiarRolMiembro(grupoId: string, dto: CambiarRolMiembroDTO, usuarioSolicitanteId: string): Promise<void>;
  obtenerMiembrosGrupo(grupoId: string): Promise<any[]>;
  
  // Operaciones de publicaciones
  crearPublicacion(grupoId: string, autorId: string, contenido: string): Promise<PublicacionGrupoDTO>;
  aprobarPublicacion(grupoId: string, publicacionId: string, usuarioId: string): Promise<void>;
  rechazarPublicacion(grupoId: string, publicacionId: string, usuarioId: string): Promise<void>;
  obtenerPublicacionesGrupo(grupoId: string): Promise<PublicacionGrupoDTO[]>;
  
  // Consultas
  listarGrupos(limit?: number, offset?: number): Promise<GrupoDTO[]>;
  buscarGruposPorNombre(nombre: string): Promise<GrupoDTO[]>;
  obtenerGruposDeUsuario(usuarioId: string): Promise<GrupoDTO[]>;
  contarTotalGrupos(): Promise<number>;
} 