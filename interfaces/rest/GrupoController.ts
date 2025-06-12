import { Request, Response } from 'express';
import { GrupoUseCase } from '../../application/ports/input/GrupoUseCase';
import { 
  CrearGrupoDTO, 
  ActualizarGrupoDTO,
  AgregarMiembroDTO,
  CambiarRolMiembroDTO
} from '../../application/dto';

export class GrupoController {
  constructor(private readonly grupoUseCase: GrupoUseCase) {}

  // GET /grupos
  async listarGrupos(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      
      const grupos = await this.grupoUseCase.listarGrupos(limit, offset);
      
      res.status(200).json(grupos);
    } catch (error) {
      console.error('Error al listar grupos:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  }

  // GET /grupos/:id
  async obtenerGrupo(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const detallado = req.query.detallado === 'true';
      
      const grupo = detallado 
        ? await this.grupoUseCase.obtenerGrupoDetallado(id)
        : await this.grupoUseCase.obtenerGrupo(id);
      
      if (!grupo) {
        res.status(404).json({ mensaje: 'Grupo no encontrado' });
        return;
      }
      
      res.status(200).json(grupo);
    } catch (error) {
      console.error('Error al obtener grupo:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  }

  // POST /grupos
  async crearGrupo(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.headers['x-usuario-id'] as string;
      
      if (!usuarioId) {
        res.status(401).json({ mensaje: 'Falta el ID de usuario en el encabezado x-usuario-id' });
        return;
      }
      
      const dto: CrearGrupoDTO = {
        ...req.body,
        creadorId: usuarioId
      };
      
      const nuevoGrupo = await this.grupoUseCase.crearGrupo(dto);
      
      res.status(201).json(nuevoGrupo);
    } catch (error) {
      console.error('Error al crear grupo:', error);
      
      if (error instanceof Error) {
        res.status(400).json({ mensaje: error.message });
      } else {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
      }
    }
  }

  // PUT /grupos/:id
  async actualizarGrupo(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const dto: ActualizarGrupoDTO = req.body;
      const usuarioId = req.headers['x-usuario-id'] as string;
      
      if (!usuarioId) {
        res.status(401).json({ mensaje: 'Falta el ID de usuario' });
        return;
      }
      
      const grupoActualizado = await this.grupoUseCase.actualizarGrupo(id, dto, usuarioId);
      
      res.status(200).json(grupoActualizado);
    } catch (error) {
      console.error('Error al actualizar grupo:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('permiso')) {
          res.status(403).json({ mensaje: error.message });
        } else if (error.message.includes('encontrado')) {
          res.status(404).json({ mensaje: error.message });
        } else {
          res.status(400).json({ mensaje: error.message });
        }
      } else {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
      }
    }
  }

  // DELETE /grupos/:id
  async eliminarGrupo(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const usuarioId = req.headers['x-usuario-id'] as string;
      
      if (!usuarioId) {
        res.status(401).json({ mensaje: 'Falta el ID de usuario' });
        return;
      }
      
      await this.grupoUseCase.eliminarGrupo(id, usuarioId);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar grupo:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('creador')) {
          res.status(403).json({ mensaje: error.message });
        } else if (error.message.includes('encontrado')) {
          res.status(404).json({ mensaje: error.message });
        } else {
          res.status(400).json({ mensaje: error.message });
        }
      } else {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
      }
    }
  }

  // POST /grupos/:id/miembros
  async agregarMiembro(req: Request, res: Response): Promise<void> {
    try {
      const grupoId = req.params.id;
      const dto: AgregarMiembroDTO = req.body;
      const usuarioSolicitanteId = req.headers['x-usuario-id'] as string;
      
      if (!usuarioSolicitanteId) {
        res.status(401).json({ mensaje: 'Falta el ID de usuario solicitante' });
        return;
      }
      
      await this.grupoUseCase.agregarMiembro(grupoId, dto, usuarioSolicitanteId);
      
      res.status(201).json({ mensaje: 'Miembro agregado correctamente' });
    } catch (error) {
      console.error('Error al agregar miembro:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('permiso')) {
          res.status(403).json({ mensaje: error.message });
        } else if (error.message.includes('encontrado')) {
          res.status(404).json({ mensaje: error.message });
        } else {
          res.status(400).json({ mensaje: error.message });
        }
      } else {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
      }
    }
  }

  // DELETE /grupos/:grupoId/miembros/:usuarioId
  async removerMiembro(req: Request, res: Response): Promise<void> {
    try {
      const grupoId = req.params.grupoId;
      const usuarioId = req.params.usuarioId;
      const usuarioSolicitanteId = req.headers['x-usuario-id'] as string;
      
      if (!usuarioSolicitanteId) {
        res.status(401).json({ mensaje: 'Falta el ID de usuario solicitante' });
        return;
      }
      
      await this.grupoUseCase.removerMiembro(grupoId, usuarioId, usuarioSolicitanteId);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error al remover miembro:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('permiso') || error.message.includes('último administrador')) {
          res.status(403).json({ mensaje: error.message });
        } else if (error.message.includes('encontrado')) {
          res.status(404).json({ mensaje: error.message });
        } else {
          res.status(400).json({ mensaje: error.message });
        }
      } else {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
      }
    }
  }

  // PUT /grupos/:grupoId/miembros/:usuarioId/rol
  async cambiarRolMiembro(req: Request, res: Response): Promise<void> {
    try {
      const grupoId = req.params.grupoId;
      const dto: CambiarRolMiembroDTO = {
        usuarioId: req.params.usuarioId,
        nuevoRol: req.body.nuevoRol
      };
      const usuarioSolicitanteId = req.headers['x-usuario-id'] as string;
      
      if (!usuarioSolicitanteId) {
        res.status(401).json({ mensaje: 'Falta el ID de usuario solicitante' });
        return;
      }
      
      await this.grupoUseCase.cambiarRolMiembro(grupoId, dto, usuarioSolicitanteId);
      
      res.status(200).json({ mensaje: 'Rol cambiado correctamente' });
    } catch (error) {
      console.error('Error al cambiar rol de miembro:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('permiso') || error.message.includes('último administrador')) {
          res.status(403).json({ mensaje: error.message });
        } else if (error.message.includes('encontrado')) {
          res.status(404).json({ mensaje: error.message });
        } else {
          res.status(400).json({ mensaje: error.message });
        }
      } else {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
      }
    }
  }

  // GET /grupos/:id/miembros
  async obtenerMiembrosGrupo(req: Request, res: Response): Promise<void> {
    try {
      const grupoId = req.params.id;
      
      const miembros = await this.grupoUseCase.obtenerMiembrosGrupo(grupoId);
      
      res.status(200).json(miembros);
    } catch (error) {
      console.error('Error al obtener miembros del grupo:', error);
      
      if (error instanceof Error && error.message.includes('encontrado')) {
        res.status(404).json({ mensaje: error.message });
      } else {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
      }
    }
  }

  // POST /grupos/:id/publicaciones
  async crearPublicacion(req: Request, res: Response): Promise<void> {
    try {
      const grupoId = req.params.id;
      const autorId = req.headers['x-usuario-id'] as string;
      const contenido = req.body.contenido;
      
      if (!autorId) {
        res.status(401).json({ mensaje: 'Falta el ID de usuario autor' });
        return;
      }
      
      if (!contenido) {
        res.status(400).json({ mensaje: 'El contenido es obligatorio' });
        return;
      }
      
      const publicacion = await this.grupoUseCase.crearPublicacion(grupoId, autorId, contenido);
      
      res.status(201).json(publicacion);
    } catch (error) {
      console.error('Error al crear publicación:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('miembro')) {
          res.status(403).json({ mensaje: error.message });
        } else if (error.message.includes('encontrado')) {
          res.status(404).json({ mensaje: error.message });
        } else {
          res.status(400).json({ mensaje: error.message });
        }
      } else {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
      }
    }
  }

  // GET /grupos/:id/publicaciones
  async obtenerPublicacionesGrupo(req: Request, res: Response): Promise<void> {
    try {
      const grupoId = req.params.id;
      
      const publicaciones = await this.grupoUseCase.obtenerPublicacionesGrupo(grupoId);
      
      res.status(200).json(publicaciones);
    } catch (error) {
      console.error('Error al obtener publicaciones del grupo:', error);
      
      if (error instanceof Error && error.message.includes('encontrado')) {
        res.status(404).json({ mensaje: error.message });
      } else {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
      }
    }
  }

  // PUT /grupos/:grupoId/publicaciones/:publicacionId/aprobar
  async aprobarPublicacion(req: Request, res: Response): Promise<void> {
    try {
      const grupoId = req.params.grupoId;
      const publicacionId = req.params.publicacionId;
      const usuarioId = req.headers['x-usuario-id'] as string;
      
      if (!usuarioId) {
        res.status(401).json({ mensaje: 'Falta el ID de usuario' });
        return;
      }
      
      await this.grupoUseCase.aprobarPublicacion(grupoId, publicacionId, usuarioId);
      
      res.status(200).json({ mensaje: 'Publicación aprobada correctamente' });
    } catch (error) {
      console.error('Error al aprobar publicación:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('permiso')) {
          res.status(403).json({ mensaje: error.message });
        } else if (error.message.includes('encontrado')) {
          res.status(404).json({ mensaje: error.message });
        } else {
          res.status(400).json({ mensaje: error.message });
        }
      } else {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
      }
    }
  }

  // PUT /grupos/:grupoId/publicaciones/:publicacionId/rechazar
  async rechazarPublicacion(req: Request, res: Response): Promise<void> {
    try {
      const grupoId = req.params.grupoId;
      const publicacionId = req.params.publicacionId;
      const usuarioId = req.headers['x-usuario-id'] as string;
      
      if (!usuarioId) {
        res.status(401).json({ mensaje: 'Falta el ID de usuario' });
        return;
      }
      
      await this.grupoUseCase.rechazarPublicacion(grupoId, publicacionId, usuarioId);
      
      res.status(200).json({ mensaje: 'Publicación rechazada correctamente' });
    } catch (error) {
      console.error('Error al rechazar publicación:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('permiso')) {
          res.status(403).json({ mensaje: error.message });
        } else if (error.message.includes('encontrado')) {
          res.status(404).json({ mensaje: error.message });
        } else {
          res.status(400).json({ mensaje: error.message });
        }
      } else {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
      }
    }
  }

  // GET /usuarios/:usuarioId/grupos
  async obtenerGruposDeUsuario(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.params.usuarioId;
      
      const grupos = await this.grupoUseCase.obtenerGruposDeUsuario(usuarioId);
      
      res.status(200).json(grupos);
    } catch (error) {
      console.error('Error al obtener grupos del usuario:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  }
} 