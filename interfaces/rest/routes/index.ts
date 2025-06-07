import { Router } from 'express';
import grupoRoutes from './grupo.routes';
import eventoRoutes from './evento.routes';

const router = Router();

// Rutas principales
router.use('/grupos', grupoRoutes);
router.use('/eventos', eventoRoutes);

export default router; 