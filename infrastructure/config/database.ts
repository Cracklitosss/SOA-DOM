import { createPool, Pool } from 'mysql2/promise';

export class Database {
  private static instance: Database;
  private pool: Pool;

  private constructor() {
    this.pool = createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'grupos_eventos_db',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  public static getInstance(): Database {
    if (!Database.instance) {
      Database.instance = new Database();
    }
    return Database.instance;
  }

  public getPool(): Pool {
    return this.pool;
  }

  public async query(sql: string, params?: any[]): Promise<any> {
    try {
      const [results] = await this.pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }
} 