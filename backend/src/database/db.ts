import { Pool } from 'pg';
import { env } from '../config/env.js';

export interface IDbResult<T = unknown> {
  rows: T[];
  rowCount?: number | null;
}

export interface IDbPool {
  query<T = unknown>(text: string, params?: any[]): Promise<IDbResult<T>>;
}

class DatabaseConnection {
  private static instance: DatabaseConnection;
  private pool: Pool | null = null;
  private isConnected = false;
  private connectionPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  public async connect(): Promise<void> {
    if (env.isTest || this.isConnected) {
      return;
    }

    if (!env.databaseUrl) {
      throw new Error('DATABASE_URL não definida. Configure a conexão PostgreSQL no arquivo .env.');
    }

    if (!this.connectionPromise) {
      this.connectionPromise = this.initializePool();
    }

    try {
      await this.connectionPromise;
    } finally {
      this.connectionPromise = null;
    }
  }

  private async initializePool(): Promise<void> {
    const pool = new Pool({
      connectionString: env.databaseUrl,
      ssl: env.isProduction ? { rejectUnauthorized: false } : false,
    });

    try {
      await pool.query('SELECT 1');
      await this.ensureUserTables(pool);
      this.pool = pool;
      this.isConnected = true;
      console.log('[Database] Conectado ao PostgreSQL.');
    } catch (error) {
      await pool.end();
      throw new Error('Falha ao autenticar ou conectar ao PostgreSQL. Verifique DATABASE_URL.', { cause: error });
    }
  }

  private async ensureUserTables(pool: Pool): Promise<void> {
    await pool.query(`
      DO $migration$
      BEGIN
        CREATE TYPE user_role_enum AS ENUM ('ADMIN', 'VET', 'RECEPTIONIST', 'CLIENT');
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END
      $migration$;

      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(150) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role user_role_enum NOT NULL DEFAULT 'CLIENT',
        phone VARCHAR(30),
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        last_login_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT chk_users_email_lowercase CHECK (email = LOWER(email))
      );

      CREATE TABLE IF NOT EXISTS atendente (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        nome VARCHAR(150) NOT NULL,
        email VARCHAR(150) UNIQUE NOT NULL,
        telefone VARCHAR(20),
        criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS feriado_nacional (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ano INTEGER NOT NULL,
        data_feriado DATE NOT NULL,
        nome VARCHAR(150) NOT NULL,
        tipo VARCHAR(50) NOT NULL DEFAULT 'national',
        criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uk_feriado_ano_data UNIQUE (ano, data_feriado)
      );

      CREATE INDEX IF NOT EXISTS idx_feriado_ano ON feriado_nacional(ano);
      CREATE INDEX IF NOT EXISTS idx_feriado_data ON feriado_nacional(data_feriado);
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(LOWER(email));
    `);
  }

  public getPool(): IDbPool | null {
    return this.pool ? { query: <T = unknown>(sql: string, params?: any[]) => this.query<T>(sql, params) } : null;
  }

  public isAvailable(): boolean {
    return this.isConnected && this.pool !== null;
  }

  public async query<T = unknown>(sql: string, params?: any[]): Promise<IDbResult<T>> {
    if (this.pool && this.isConnected) {
      const result = await this.pool.query(sql, params);
      return {
        rows: result.rows.map((row) => row as unknown as T),
        rowCount: result.rowCount,
      };
    }
    throw new Error('PostgreSQL indisponível. A conexão deve ser estabelecida antes de executar consultas.');
  }
}

export { DatabaseConnection };
export const db = DatabaseConnection.getInstance();
