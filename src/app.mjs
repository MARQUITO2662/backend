// Importación de módulos
import express from 'express';
import { router as userRoutes } from './routes/userRoutes.mjs';
import swaggerJsDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Creación de la aplicación Express
const app = express();

// Middleware para parsear JSON
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes);

// Configuración de Swagger
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'Authentication API',
      description: 'API for user authentication',
      version: '1.0.0'
    },
  },
  apis: ['./src/routes/*.mjs'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Puerto de escucha
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
