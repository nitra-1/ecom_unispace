require('dotenv').config()

/**
 * Knex configuration file.
 *
 * Supports two database clients:
 *   - "sqlite3"   → for local development (no server needed)
 *   - "pg"        → for PostgreSQL in staging / production
 *
 * Switch between them by setting DB_CLIENT in your .env file.
 */
module.exports = {
  development: {
    client: process.env.DB_CLIENT || 'sqlite3',
    connection:
      process.env.DB_CLIENT === 'pg'
        ? {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            database: process.env.DB_NAME,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD
          }
        : { filename: process.env.DB_FILENAME || './database/appointments.sqlite' },
    useNullAsDefault: true, // required for SQLite
    migrations: {
      directory: '../database/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: '../database/seeds'
    }
  },

  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    },
    pool: { min: 2, max: 10 },
    migrations: {
      directory: '../database/migrations',
      tableName: 'knex_migrations'
    },
    seeds: {
      directory: '../database/seeds'
    }
  }
}
