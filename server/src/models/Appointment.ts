import { PoolClient } from 'pg';

export interface Appointment {
  id: number;
  client_id: number;
  service: string;
  date_time: Date;
  duration: number;
  status: 'booked' | 'confirmed' | 'cancelled' | 'completed' | 'missed';
  created_at: Date;
  updated_at: Date;
  reminder_scheduled_at?: Date | null;
}

export interface AppointmentWithClient extends Appointment {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export class AppointmentModel {
  constructor(private db: PoolClient) {}

  async create(appointmentData: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>): Promise<Appointment> {
    const query = `
      INSERT INTO appointments (client_id, service, date_time, duration, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [appointmentData.client_id, appointmentData.service || 'General Appointment', appointmentData.date_time, appointmentData.duration, appointmentData.status];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async findById(id: number): Promise<AppointmentWithClient | null> {
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

  async findByDateTime(dateTime: Date, duration?: number): Promise<Appointment | null> {
    let query = `
      SELECT * FROM appointments 
      WHERE status NOT IN ('cancelled', 'missed')
        AND date_time < $1 + ($2 || ' minutes')::interval
        AND date_time + (duration || ' minutes')::interval > $1
      LIMIT 1
    `;
    
    const values = [dateTime, duration || 60]; // Default duration of 60 minutes if not provided
    const result = await this.db.query(query, values);
    return result.rows[0] || null;
  }
}
