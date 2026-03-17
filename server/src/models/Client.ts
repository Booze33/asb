import { PoolClient } from 'pg';

export interface Client {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: Date;
  updated_at: Date;
}

export class ClientModel {
  constructor(private db: PoolClient) {}

  async create(clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<Client> {
    const query = `
      INSERT INTO clients (name, email, phone, address)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [clientData.name, clientData.email, clientData.phone, clientData.address];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async findByEmailOrPhone(email: string, phone: string): Promise<Client | null> {
    const query = `
      SELECT * FROM clients 
      WHERE email = $1 OR phone = $2
    `;
    const result = await this.db.query(query, [email, phone]);
    return result.rows[0] || null;
  }

  async findById(id: number): Promise<Client | null> {
    const query = 'SELECT * FROM clients WHERE id = $1';
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }
}