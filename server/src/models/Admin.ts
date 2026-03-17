import { PoolClient } from 'pg';
import bcrypt from 'bcrypt';

export interface Admin {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'manager';
  created_at: Date;
  updated_at: Date;
}

export class AdminModel {
  constructor(public db: PoolClient) {}

  async create(adminData: Omit<Admin, 'id' | 'created_at' | 'updated_at' | 'password_hash'> & { password: string }): Promise<Admin> {
    const passwordHash = await bcrypt.hash(adminData.password, 10);
    const query = `
      INSERT INTO admins (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [adminData.name, adminData.email, passwordHash, adminData.role];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<Admin | null> {
    const query = 'SELECT * FROM admins WHERE email = $1';
    const result = await this.db.query(query, [email]);
    return result.rows[0] || null;
  }

  async findById(id: number): Promise<Admin | null> {
    const query = 'SELECT * FROM admins WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}