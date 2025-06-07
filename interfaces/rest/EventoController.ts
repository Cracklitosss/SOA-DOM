import { Request, Response } from 'express';
import { EventoUseCase } from '../../application/ports/input/EventoUseCase';
import { 
  CrearEventoDTO, 
  ActualizarEventoDTO,
  RespuestaEventoDTO,
  InvitarUsuarioEventoDTO
} from '../../application/dto';

export class EventoController {
  constructor(private readonly eventoUseCase: EventoUseCase) {}

  // GET /eventos
  async listarEventos(req: Request, res: Response): Promise<void> {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
      
      const eventos = await this.eventoUseCase.listarEventos(limit, offset);
      
      res.status(200).json(eventos);
    } catch (error) {
      console.error('Error al listar eventos:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  }

  // GET /eventos/:id
  async obtenerEvento(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const detallado = req.query.detallado === 'true';
      
      const evento = detallado 
        ? await this.eventoUseCase.obtenerEventoDetallado(id)
        : await this.eventoUseCase.obtenerEvento(id);
      
      if (!evento) {
        res.status(404).json({ mensaje: 'Evento no encontrado' });
        return;
      }
      
      res.status(200).json(evento);
    } catch (error) {
      console.error('Error al obtener evento:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  }

  // POST /eventos
  async crearEvento(req: Request, res: Response): Promise<void> {
    try {
      const dto: CrearEventoDTO = req.body;
      
      const nuevoEvento = await this.eventoUseCase.crearEvento(dto);
      
      res.status(201).json(nuevoEvento);
    } catch (error) {
      console.error('Error al crear evento:', error);
      
      if (error instanceof Error) {
        res.status(400).json({ mensaje: error.message });
      } else {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
      }
    }
  }

  // PUT /eventos/:id
  async actualizarEvento(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const dto: ActualizarEventoDTO = req.body;
      const usuarioId = req.headers['x-usuario-id'] as string;
      
      if (!usuarioId) {
        res.status(401).json({ mensaje: 'Falta el ID de usuario' });
        return;
      }
      
      const eventoActualizado = await this.eventoUseCase.actualizarEvento(id, dto, usuarioId);
      
      res.status(200).json(eventoActualizado);
    } catch (error) {
      console.error('Error al actualizar evento:', error);
      
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

  // DELETE /eventos/:id
  async eliminarEvento(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id;
      const usuarioId = req.headers['x-usuario-id'] as string;
      
      if (!usuarioId) {
        res.status(401).json({ mensaje: 'Falta el ID de usuario' });
        return;
      }
      
      await this.eventoUseCase.eliminarEvento(id, usuarioId);
      
      res.status(204).send();
    } catch (error) {
      console.error('Error al eliminar evento:', error);
      
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

  // GET /eventos/:id/asistentes
  async obtenerAsistentes(req: Request, res: Response): Promise<void> {
    try {
      const eventoId = req.params.id;
      
      const asistentes = await this.eventoUseCase.obtenerAsistentes(eventoId);
      
      res.status(200).json(asistentes);
    } catch (error) {
      console.error('Error al obtener asistentes del evento:', error);
      
      if (error instanceof Error && error.message.includes('encontrado')) {
        res.status(404).json({ mensaje: error.message });
      } else {
        res.status(500).json({ mensaje: 'Error interno del servidor' });
      }
    }
  }

  // POST /eventos/:id/asistentes
  async invitarUsuario(req: Request, res: Response): Promise<void> {
    try {
      const eventoId = req.params.id;
      const dto: InvitarUsuarioEventoDTO = req.body;
      const usuarioSolicitanteId = req.headers['x-usuario-id'] as string;
      
      if (!usuarioSolicitanteId) {
        res.status(401).json({ mensaje: 'Falta el ID de usuario solicitante' });
        return;
      }
      
      await this.eventoUseCase.invitarUsuario(eventoId, dto, usuarioSolicitanteId);
      
      res.status(201).json({ mensaje: 'Usuario invitado correctamente' });
    } catch (error) {
      console.error('Error al invitar usuario:', error);
      
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

  // PUT /eventos/:id/respuesta
  async registrarRespuesta(req: Request, res: Response): Promise<void> {
    try {
      const eventoId = req.params.id;
      const dto: RespuestaEventoDTO = req.body;
      
      await this.eventoUseCase.registrarRespuesta(eventoId, dto);
      
      res.status(200).json({ mensaje: 'Respuesta registrada correctamente' });
    } catch (error) {
      console.error('Error al registrar respuesta:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('acceso')) {
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

  // GET /eventos/proximos/:dias?
  async obtenerEventosProximos(req: Request, res: Response): Promise<void> {
    try {
      const dias = req.params.dias ? parseInt(req.params.dias) : undefined;
      
      const eventos = await this.eventoUseCase.obtenerEventosProximos(dias);
      
      res.status(200).json(eventos);
    } catch (error) {
      console.error('Error al obtener eventos próximos:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  }

  // GET /grupos/:grupoId/eventos
  async obtenerEventosDeGrupo(req: Request, res: Response): Promise<void> {
    try {
      const grupoId = req.params.grupoId;
      
      const eventos = await this.eventoUseCase.obtenerEventosDeGrupo(grupoId);
      
      res.status(200).json(eventos);
    } catch (error) {
      console.error('Error al obtener eventos del grupo:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  }

  // GET /usuarios/:usuarioId/eventos
  async obtenerEventosDeUsuario(req: Request, res: Response): Promise<void> {
    try {
      const usuarioId = req.params.usuarioId;
      
      const eventos = await this.eventoUseCase.obtenerEventosDeUsuario(usuarioId);
      
      res.status(200).json(eventos);
    } catch (error) {
      console.error('Error al obtener eventos del usuario:', error);
      res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
  }
} 