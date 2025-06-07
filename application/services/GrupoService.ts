import { GrupoUseCase } from '../ports/input/GrupoUseCase';
import { GrupoRepository } from '../../domain/repositories/GrupoRepository';
import { 
  GrupoDTO, 
  GrupoDetalladoDTO, 
  CrearGrupoDTO, 
  ActualizarGrupoDTO,
  AgregarMiembroDTO,
  CambiarRolMiembroDTO,
  PublicacionGrupoDTO,
  MiembroGrupoDTO
} from '../dto';
import { Grupo } from '../../domain/aggregates/Grupo';
import { 
  GrupoId, 
  UsuarioId, 
  PrivacidadGrupoVO, 
  RolGrupoVO 
} from '../../domain/value-objects';
import { GrupoService as DomainGrupoService } from '../../domain/services/GrupoService';

export class GrupoService implements GrupoUseCase {
  constructor(
    private readonly grupoRepository: GrupoRepository,
    private readonly grupoService: DomainGrupoService
  ) {}

  async crearGrupo(dto: CrearGrupoDTO): Promise<GrupoDTO> {
    const creadorId = UsuarioId.of(dto.creadorId);
    const privacidad = PrivacidadGrupoVO.of(dto.privacidad);
    
    const grupo = Grupo.create(
      dto.nombre,
      dto.descripcion,
      creadorId,
      privacidad
    );
    
    await this.grupoRepository.save(grupo);
    
    return this.mapToDTO(grupo);
  }

  async obtenerGrupo(id: string): Promise<GrupoDTO | null> {
    const grupoId = GrupoId.of(id);
    const grupo = await this.grupoRepository.findById(grupoId);
    
    if (!grupo) {
      return null;
    }
    
    return this.mapToDTO(grupo);
  }

  async obtenerGrupoDetallado(id: string): Promise<GrupoDetalladoDTO | null> {
    const grupoId = GrupoId.of(id);
    const grupo = await this.grupoRepository.findByIdWithMiembros(grupoId);
    
    if (!grupo) {
      return null;
    }
    
    return this.mapToDetalladoDTO(grupo);
  }

  async actualizarGrupo(id: string, dto: ActualizarGrupoDTO, usuarioId: string): Promise<GrupoDTO> {
    const grupoId = GrupoId.of(id);
    const userId = UsuarioId.of(usuarioId);
    
    // Verificar permisos
    const tienePermiso = await this.grupoService.verificarPermisosAdministracion(grupoId, userId);
    if (!tienePermiso) {
      throw new Error('No tienes permiso para actualizar este grupo');
    }
    
    const grupo = await this.grupoRepository.findById(grupoId);
    if (!grupo) {
      throw new Error('Grupo no encontrado');
    }
    
    // Actualizar propiedades que están presentes en el DTO
    const nombre = dto.nombre ?? grupo.nombre;
    const descripcion = dto.descripcion ?? grupo.descripcion;
    const privacidad = dto.privacidad 
      ? PrivacidadGrupoVO.of(dto.privacidad) 
      : grupo.privacidad;
    
    grupo.actualizarInformacion(nombre, descripcion, privacidad);
    
    await this.grupoRepository.save(grupo);
    
    return this.mapToDTO(grupo);
  }

  async eliminarGrupo(id: string, usuarioId: string): Promise<void> {
    const grupoId = GrupoId.of(id);
    const userId = UsuarioId.of(usuarioId);
    
    const grupo = await this.grupoRepository.findById(grupoId);
    if (!grupo) {
      throw new Error('Grupo no encontrado');
    }
    
    // Solo el creador puede eliminar el grupo
    if (!grupo.creadorId.equals(userId)) {
      throw new Error('Solo el creador puede eliminar el grupo');
    }
    
    await this.grupoRepository.delete(grupoId);
  }

  async agregarMiembro(grupoId: string, dto: AgregarMiembroDTO, usuarioSolicitanteId: string): Promise<void> {
    const gId = GrupoId.of(grupoId);
    const solicitanteId = UsuarioId.of(usuarioSolicitanteId);
    
    // Verificar permisos
    const tienePermiso = await this.grupoService.verificarPermisosAdministracion(gId, solicitanteId);
    if (!tienePermiso) {
      throw new Error('No tienes permiso para agregar miembros a este grupo');
    }
    
    const grupo = await this.grupoRepository.findById(gId);
    if (!grupo) {
      throw new Error('Grupo no encontrado');
    }
    
    const nuevoMiembroId = UsuarioId.of(dto.usuarioId);
    const rol = RolGrupoVO.of(dto.rol);
    
    grupo.agregarMiembro(nuevoMiembroId, rol);
    
    await this.grupoRepository.save(grupo);
  }

  async removerMiembro(grupoId: string, usuarioId: string, usuarioSolicitanteId: string): Promise<void> {
    const gId = GrupoId.of(grupoId);
    const solicitanteId = UsuarioId.of(usuarioSolicitanteId);
    const userId = UsuarioId.of(usuarioId);
    
    // Verificar permisos (se puede remover a sí mismo o si es administrador)
    if (!solicitanteId.equals(userId)) {
      const tienePermiso = await this.grupoService.verificarPermisosAdministracion(gId, solicitanteId);
      if (!tienePermiso) {
        throw new Error('No tienes permiso para remover miembros de este grupo');
      }
    }
    
    const grupo = await this.grupoRepository.findById(gId);
    if (!grupo) {
      throw new Error('Grupo no encontrado');
    }
    
    grupo.removerMiembro(userId);
    
    await this.grupoRepository.save(grupo);
  }

  async cambiarRolMiembro(grupoId: string, dto: CambiarRolMiembroDTO, usuarioSolicitanteId: string): Promise<void> {
    const gId = GrupoId.of(grupoId);
    const solicitanteId = UsuarioId.of(usuarioSolicitanteId);
    
    // Verificar permisos
    const tienePermiso = await this.grupoService.verificarPermisosAdministracion(gId, solicitanteId);
    if (!tienePermiso) {
      throw new Error('No tienes permiso para cambiar roles en este grupo');
    }
    
    const grupo = await this.grupoRepository.findById(gId);
    if (!grupo) {
      throw new Error('Grupo no encontrado');
    }
    
    const miembroId = UsuarioId.of(dto.usuarioId);
    const nuevoRol = RolGrupoVO.of(dto.nuevoRol);
    
    grupo.cambiarRolMiembro(miembroId, nuevoRol);
    
    await this.grupoRepository.save(grupo);
  }

  async obtenerMiembrosGrupo(grupoId: string): Promise<MiembroGrupoDTO[]> {
    const gId = GrupoId.of(grupoId);
    
    const grupo = await this.grupoRepository.findByIdWithMiembros(gId);
    if (!grupo) {
      throw new Error('Grupo no encontrado');
    }
    
    return grupo.miembros.map(miembro => ({
      usuarioId: miembro.usuarioId.getValue(),
      rol: miembro.rol.getValue(),
      fechaUnion: miembro.fechaUnion.toISOString()
    }));
  }

  async crearPublicacion(grupoId: string, autorId: string, contenido: string): Promise<PublicacionGrupoDTO> {
    const gId = GrupoId.of(grupoId);
    const userId = UsuarioId.of(autorId);
    
    const grupo = await this.grupoRepository.findById(gId);
    if (!grupo) {
      throw new Error('Grupo no encontrado');
    }
    
    const publicacion = grupo.crearPublicacion(userId, contenido);
    
    await this.grupoRepository.save(grupo);
    
    return {
      id: publicacion.id,
      autorId: publicacion.autorId.getValue(),
      contenido: publicacion.contenido,
      fechaCreacion: publicacion.fechaCreacion.toISOString(),
      aprobada: publicacion.aprobada
    };
  }

  async aprobarPublicacion(grupoId: string, publicacionId: string, usuarioId: string): Promise<void> {
    const gId = GrupoId.of(grupoId);
    const userId = UsuarioId.of(usuarioId);
    
    // Verificar permisos
    const tienePermiso = await this.grupoService.verificarPermisosModeracion(gId, userId);
    if (!tienePermiso) {
      throw new Error('No tienes permiso para aprobar publicaciones en este grupo');
    }
    
    const grupo = await this.grupoRepository.findById(gId);
    if (!grupo) {
      throw new Error('Grupo no encontrado');
    }
    
    grupo.aprobarPublicacion(publicacionId, userId);
    
    await this.grupoRepository.save(grupo);
  }

  async rechazarPublicacion(grupoId: string, publicacionId: string, usuarioId: string): Promise<void> {
    const gId = GrupoId.of(grupoId);
    const userId = UsuarioId.of(usuarioId);
    
    // Verificar permisos
    const tienePermiso = await this.grupoService.verificarPermisosModeracion(gId, userId);
    if (!tienePermiso) {
      throw new Error('No tienes permiso para rechazar publicaciones en este grupo');
    }
    
    const grupo = await this.grupoRepository.findById(gId);
    if (!grupo) {
      throw new Error('Grupo no encontrado');
    }
    
    grupo.rechazarPublicacion(publicacionId, userId);
    
    await this.grupoRepository.save(grupo);
  }

  async obtenerPublicacionesGrupo(grupoId: string): Promise<PublicacionGrupoDTO[]> {
    const gId = GrupoId.of(grupoId);
    
    const grupo = await this.grupoRepository.findById(gId);
    if (!grupo) {
      throw new Error('Grupo no encontrado');
    }
    
    return grupo.publicaciones.map(publicacion => ({
      id: publicacion.id,
      autorId: publicacion.autorId.getValue(),
      contenido: publicacion.contenido,
      fechaCreacion: publicacion.fechaCreacion.toISOString(),
      aprobada: publicacion.aprobada
    }));
  }

  async listarGrupos(limit?: number, offset?: number): Promise<GrupoDTO[]> {
    const grupos = await this.grupoRepository.findAll(limit, offset);
    return grupos.map(grupo => this.mapToDTO(grupo));
  }

  async buscarGruposPorNombre(nombre: string): Promise<GrupoDTO[]> {
    // Esta función debería implementarse en el repositorio
    // Por ahora, obtenemos todos y filtramos
    const grupos = await this.grupoRepository.findAll();
    const filtrados = grupos.filter(g => 
      g.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
    
    return filtrados.map(grupo => this.mapToDTO(grupo));
  }

  async obtenerGruposDeUsuario(usuarioId: string): Promise<GrupoDTO[]> {
    const userId = UsuarioId.of(usuarioId);
    const grupos = await this.grupoRepository.findByUsuario(userId);
    
    return grupos.map(grupo => this.mapToDTO(grupo));
  }

  async contarTotalGrupos(): Promise<number> {
    return this.grupoRepository.countTotal();
  }

  // Funciones de mapeo
  private mapToDTO(grupo: Grupo): GrupoDTO {
    return {
      id: grupo.id.getValue(),
      nombre: grupo.nombre,
      descripcion: grupo.descripcion,
      creadorId: grupo.creadorId.getValue(),
      privacidad: grupo.privacidad.getValue(),
      fechaCreacion: grupo.fechaCreacion.toISOString()
    };
  }

  private mapToDetalladoDTO(grupo: Grupo): GrupoDetalladoDTO {
    return {
      ...this.mapToDTO(grupo),
      miembros: grupo.miembros.map(miembro => ({
        usuarioId: miembro.usuarioId.getValue(),
        rol: miembro.rol.getValue(),
        fechaUnion: miembro.fechaUnion.toISOString()
      })),
      publicaciones: grupo.publicaciones.map(publicacion => ({
        id: publicacion.id,
        autorId: publicacion.autorId.getValue(),
        contenido: publicacion.contenido,
        fechaCreacion: publicacion.fechaCreacion.toISOString(),
        aprobada: publicacion.aprobada
      }))
    };
  }
} 