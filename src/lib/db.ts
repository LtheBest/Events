import type { Env } from '../types';

/**
 * Utilitaires pour interagir avec la base de données D1
 */

export class DatabaseService {
  constructor(private db: D1Database) {}

  /**
   * Exécute une requête SELECT et retourne tous les résultats
   */
  async query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
      const stmt = this.db.prepare(sql);
      const result = params.length > 0 
        ? await stmt.bind(...params).all()
        : await stmt.all();
      
      return (result.results as T[]) || [];
    } catch (error) {
      console.error('Database query error:', error);
      throw new Error('Database query failed');
    }
  }

  /**
   * Exécute une requête SELECT et retourne le premier résultat
   */
  async queryOne<T = any>(sql: string, params: any[] = []): Promise<T | null> {
    try {
      const stmt = this.db.prepare(sql);
      const result = params.length > 0
        ? await stmt.bind(...params).first()
        : await stmt.first();
      
      return result as T | null;
    } catch (error) {
      console.error('Database queryOne error:', error);
      throw new Error('Database query failed');
    }
  }

  /**
   * Exécute une requête INSERT/UPDATE/DELETE
   */
  async execute(sql: string, params: any[] = []): Promise<D1Result> {
    try {
      const stmt = this.db.prepare(sql);
      const result = params.length > 0
        ? await stmt.bind(...params).run()
        : await stmt.run();
      
      return result;
    } catch (error) {
      console.error('Database execute error:', error);
      throw new Error('Database execution failed');
    }
  }

  /**
   * Exécute plusieurs requêtes dans une transaction
   */
  async batch(statements: { sql: string; params?: any[] }[]): Promise<D1Result[]> {
    try {
      const preparedStmts = statements.map(({ sql, params }) => {
        const stmt = this.db.prepare(sql);
        return params && params.length > 0 ? stmt.bind(...params) : stmt;
      });
      
      const results = await this.db.batch(preparedStmts);
      return results;
    } catch (error) {
      console.error('Database batch error:', error);
      throw new Error('Database batch execution failed');
    }
  }

  /**
   * Génère un ID unique
   */
  generateId(): string {
    return crypto.randomUUID().replace(/-/g, '').substring(0, 16);
  }
}

export function createDbService(env: Env): DatabaseService {
  return new DatabaseService(env.DB);
}
