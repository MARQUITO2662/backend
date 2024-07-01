// server.mjs

import express from 'express';
import { createPool } from 'mysql2/promise';
import cors from 'cors';
import userRoutes from './routes/userRoutes.mjs'; // Asegúrate de que la ruta sea correcta
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER, PORT, allowedOrigins } from './config/config.mjs';

const app = express();

// Middleware para permitir CORS
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware para parsear el body de las solicitudes
app.use(express.json());

// Configurar la conexión a la base de datos con pool
export const pool = createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: DB_PORT
});

// Swagger
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Autenticación',
      version: '1.0.0',
      description: 'API para autenticación de usuarios',
    },
    servers: [{ url: `http://localhost:${PORT}` }],
  },
  apis: ['./routes/*.mjs'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Rutas de usuario
app.use('/api/users', userRoutes); // Asegúrate de que la ruta sea '/api/users'

// Manejo de errores CORS
app.options('/api/users/login', cors()); // Ruta específica para OPTIONS preflight request

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
