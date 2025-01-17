require('dotenv').config();
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const mongoose = require('mongoose'); // Usamos mongoose en lugar de MongoClient
const userRoutes = require('./server/routes/userRoutes');
const bookRoutes = require('./server/routes/bookRoutes');
const genreRoutes = require('./server/routes/genreRoutes');
const authRoutes = require('./server/routes/authRoutes');

// Obtiene la URI de MongoDB y el puerto desde las variables de entorno
const uri = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000;

// Inicializa la aplicación Express
const app = express();

// Middleware para manejar JSON
app.use(express.json({ limit: '1mb' })); // Límite de tamaño para manejar JSON

// Configuración de Swagger-JSDoc
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Backend Intelecto API',
      version: '1.0.0',
      description: 'Documentación de la API para el proyecto Backend Intelecto.',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`, // Utiliza el puerto del servidor
        description: 'Servidor local',
      },
    ],
  },
  apis: ['./server/routes/*.js'], // Asegúrate de que esta ruta apunte a tus archivos de rutas
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Rutas API
app.use('/api', userRoutes);
app.use('/api', bookRoutes);
app.use('/api', genreRoutes);
app.use('/api', authRoutes);

// Usar Swagger UI para exponer la documentación
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Conexión a MongoDB con mongoose
async function connectToDatabase() {
  try {
    // Conexión a MongoDB usando mongoose
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Tiempo de espera para selección de servidor
    });

    console.log('Conectado a MongoDB Atlas con mongoose');
  } catch (error) {
    console.error('Error al conectar a MongoDB Atlas con mongoose:', error);
    process.exit(1); // Sale del proceso si hay un error crítico
  }
}

// Llamada a la función para conectar a la base de datos y luego iniciar el servidor
connectToDatabase().then(() => {
  // Inicia el servidor solo después de conectar a la base de datos
  app.listen(PORT, () => {
    console.log(`Servidor iniciado en el puerto ${PORT}`);
    console.log(`Documentación disponible en http://localhost:${PORT}/api-docs`);
  });

  // Manejo de cierre de la aplicación
  process.on('SIGINT', async () => {
    console.log('Cerrando conexión a MongoDB...');
    await mongoose.connection.close(); // Cierra la conexión con mongoose
    console.log('Conexión a MongoDB cerrada');
    process.exit(0);
  });
});
