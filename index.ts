import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from 'dotenv';
import routes from './interfaces/rest/routes';

// Cargar variables de entorno
config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas de la API
app.use('/api', routes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'Microservicio de Grupos y Eventos funcionando!',
    documentation: '/api-docs'
  });
});

// Manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: err.message
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en puerto ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});

export default app; 