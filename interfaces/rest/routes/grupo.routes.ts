import { Router } from 'express';
import { GrupoController } from '../GrupoController';
import { GrupoService } from '../../../application/services/GrupoService';
import { MySQLGrupoRepository } from '../../../infrastructure/persistence/MySQLGrupoRepository';
import { GrupoService as DomainGrupoService } from '../../../domain/services/GrupoService';

// Configuración de dependencias
const grupoRepository = new MySQLGrupoRepository();
const domainGrupoService = new DomainGrupoService(grupoRepository);
const grupoService = new GrupoService(grupoRepository, domainGrupoService);
const grupoController = new GrupoController(grupoService);

const router = Router();

// Rutas de Grupos
router.get('/', grupoController.listarGrupos.bind(grupoController));
router.get('/:id', grupoController.obtenerGrupo.bind(grupoController));
router.post('/', grupoController.crearGrupo.bind(grupoController));
router.put('/:id', grupoController.actualizarGrupo.bind(grupoController));
router.delete('/:id', grupoController.eliminarGrupo.bind(grupoController));

// Rutas de Miembros
router.get('/:id/miembros', grupoController.obtenerMiembrosGrupo.bind(grupoController));
router.post('/:id/miembros', grupoController.agregarMiembro.bind(grupoController));
router.delete('/:grupoId/miembros/:usuarioId', grupoController.removerMiembro.bind(grupoController));
router.put('/:grupoId/miembros/:usuarioId/rol', grupoController.cambiarRolMiembro.bind(grupoController));

// Rutas de Publicaciones
router.get('/:id/publicaciones', grupoController.obtenerPublicacionesGrupo.bind(grupoController));
router.post('/:id/publicaciones', grupoController.crearPublicacion.bind(grupoController));
router.put('/:grupoId/publicaciones/:publicacionId/aprobar', grupoController.aprobarPublicacion.bind(grupoController));
router.put('/:grupoId/publicaciones/:publicacionId/rechazar', grupoController.rechazarPublicacion.bind(grupoController));

// Rutas de Usuario
router.get('/usuarios/:usuarioId/grupos', grupoController.obtenerGruposDeUsuario.bind(grupoController));

export default router; 