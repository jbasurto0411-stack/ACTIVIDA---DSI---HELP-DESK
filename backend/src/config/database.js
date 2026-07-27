const { Pool } = require('pg');

if (!process.env.DATABASE_URL) {
  throw new Error(
    'La variable de entorno DATABASE_URL no está configurada.',
  );
}

const useSSL = process.env.DATABASE_SSL === 'true';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: useSSL
    ? {
        rejectUnauthorized: false,
      }
    : false,
});

pool.on('connect', () => {
  console.log('Conectado correctamente a PostgreSQL de Supabase.');
});

pool.on('error', (error) => {
  console.error('Error inesperado en PostgreSQL:', error);
});

module.exports = pool;