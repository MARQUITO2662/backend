// server.mjs

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { createPool } from 'mysql2/promise';
import userRoutes from './routes/userRoutes.mjs';
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_USER, PORT, allowedOrigins } from './config/config.mjs';

const app = express();

// Middleware
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Database Pool
export const pool = createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: DB_PORT
});

// Swagger Options
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
  apis: ['./routes/*.mjs'], // Asegúrate de que esta ruta sea correcta según tu estructura de archivos
};

// Imprime swaggerOptions para verificar antes de inicializar swaggerJsDoc
console.log('Swagger Options:', swaggerOptions);

// Initialize Swagger-jsdoc
const swaggerDocs = swaggerJsDoc(swaggerOptions);

// Serve Swagger UI at /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use('/api/users', userRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
