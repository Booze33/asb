import { PoolClient } from 'pg';

export interface Appointment {
  id: number;
  client_id: number;
  date_time: Date;
  duration: number;
  status: 'booked' | 'confirmed' | 'cancelled' | 'completed' | 'missed';
  created_at: Date;
  updated_at: Date;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export class AppointmentModel {
  constructor(private db: PoolClient) {}

  async create(appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> {
    const query = `
      INSERT INTO appointments (client_id, date_time, duration, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const values = [appointmentData.client_id, appointmentData.date_time, appointmentData.duration, appointmentData.status];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async findById(id: number): Promise<Appointment | null> {
    const query = `
      SELECT a.*, c.name, c.email, c.phone, c.address
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      WHERE a.id = $1
    `;
    const result = await this.db.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByClientAndDateTime(clientId: number, dateTime: Date): Promise<Appointment | null> {
    const query = `
      SELECT * FROM appointments 
      WHERE client_id = $1 AND date_time = $2
    `;
    const result = await this.db.query(query, [clientId, dateTime]);
    return result.rows[0] || null;
  }

  async findByDateTime(dateTime: Date): Promise<Appointment | null> {
    const query = `
      SELECT * FROM appointments 
      WHERE date_time = $1
    `;
    const result = await this.db.query(query, [dateTime]);
    return result.rows[0] || null;
  }
}