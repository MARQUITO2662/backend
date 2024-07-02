// swagger.js
import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'API de Autenticación',
    description: 'API para autenticación de usuarios'
  },
  host: 'localhost:3000'
};

const outputFile = './swagger-output.json';
const routes = ['./server.mjs']; // Ruta al archivo principal de tus rutas

swaggerAutogen()(outputFile, routes, doc);
