import request from 'supertest';
import app from '../src/app';
import pool from '../src/config/database';
import { jwtService } from '../src/services/jwtService';

// Mock the email queue
jest.mock('../src/jobs/queue', () => ({
  emailQueue: {
    add: jest.fn()
  }
}));

describe('Admin API Endpoints', () => {
  let testAdmin: any;
  let testAppointment: any;
  let authToken: string;

  beforeAll(async () => {
    // Clean up test data
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM appointments WHERE client_id IN (SELECT id FROM clients WHERE email LIKE $1)', ['test_%']);
      await client.query('DELETE FROM clients WHERE email LIKE $1', ['test_%']);
      await client.query('DELETE FROM admins WHERE email LIKE $1', ['test_%']);
    } finally {
      client.release();
    }
  });

  afterAll(async () => {
    // Clean up test data
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM appointments WHERE client_id IN (SELECT id FROM clients WHERE email LIKE $1)', ['test_%']);
      await client.query('DELETE FROM clients WHERE email LIKE $1', ['test_%']);
      await client.query('DELETE FROM admins WHERE email LIKE $1', ['test_%']);
    } finally {
      client.release();
    }
    await pool.end();
  });

  describe('POST /api/admin/login', () => {
    it('should login admin successfully', async () => {
      // Create test admin
      const adminData = {
        name: 'Test Admin',
        email: 'test_admin@example.com',
        password: 'password123',
        role: 'admin'
      };

      const adminQuery = `
        INSERT INTO admins (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const passwordHash = require('bcrypt').hashSync(adminData.password, 10);
      const adminResult = await pool.query(adminQuery, [adminData.name, adminData.email, passwordHash, adminData.role]);
      testAdmin = adminResult.rows[0];

      const loginData = {
        email: adminData.email,
        password: adminData.password
      };

      const response = await request(app)
        .post('/api/admin/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.admin.email).toBe(adminData.email);
      expect(response.body.data.admin.role).toBe(adminData.role);

      authToken = response.body.data.token;
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'wrong@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/admin/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 400 for invalid input', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123' // Too short
      };

      const response = await request(app)
        .post('/api/admin/login')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('GET /api/admin/dashboard', () => {
    beforeAll(async () => {
      // Create test appointment for dashboard
      const clientQuery = `
        INSERT INTO clients (name, email, phone, address)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const clientResult = await pool.query(clientQuery, ['Test Client', 'test_client@example.com', '+1234567890', '123 Test St']);
      const client = clientResult.rows[0];

      const appointmentQuery = `
        INSERT INTO appointments (client_id, date_time, duration, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const appointmentResult = await pool.query(appointmentQuery, [
        client.id,
        new Date(Date.now() + 600000).toISOString(), // 10 minutes from now
        60,
        'booked'
      ]);
      testAppointment = appointmentResult.rows[0];
    });

    it('should retrieve dashboard with authentication', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appointments).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });

    it('should return 403 with invalid token', async () => {
      const response = await request(app)
        .get('/api/admin/dashboard')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid or expired token');
    });
  });

  describe('PUT /api/admin/appointments/:id', () => {
    it('should update appointment status', async () => {
      const updateData = {
        status: 'confirmed'
      };

      const response = await request(app)
        .put(`/api/admin/appointments/${testAppointment.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Appointment updated successfully');
      expect(response.body.data.appointment.status).toBe('confirmed');
    });

    it('should return 400 for invalid status transition', async () => {
      const updateData = {
        status: 'completed' // Cannot transition from completed to completed
      };

      const response = await request(app)
        .put(`/api/admin/appointments/${testAppointment.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid status transition');
    });

    it('should return 404 for non-existent appointment', async () => {
      const updateData = {
        status: 'cancelled'
      };

      const response = await request(app)
        .put('/api/admin/appointments/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Appointment not found');
    });

    it('should return 401 without authentication', async () => {
      const updateData = {
        status: 'cancelled'
      };

      const response = await request(app)
        .put(`/api/admin/appointments/${testAppointment.id}`)
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });
  });

  describe('DELETE /api/admin/appointments/:id', () => {
    it('should cancel appointment', async () => {
      // Create a new appointment to cancel
      const clientQuery = `
        INSERT INTO clients (name, email, phone, address)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const clientResult = await pool.query(clientQuery, ['Test Client 2', 'test_client2@example.com', '+0987654321', '456 Test Ave']);
      const client = clientResult.rows[0];

      const appointmentQuery = `
        INSERT INTO appointments (client_id, date_time, duration, status)
        VALUES ($1, $2, $3, $4)
        RETURNING *
      `;
      const appointmentResult = await pool.query(appointmentQuery, [
        client.id,
        new Date(Date.now() + 1200000).toISOString(), // 20 minutes from now
        90,
        'booked'
      ]);
      const appointmentToCancel = appointmentResult.rows[0];

      const response = await request(app)
        .delete(`/api/admin/appointments/${appointmentToCancel.id}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Appointment cancelled successfully');
      expect(response.body.data.appointment.status).toBe('cancelled');
    });

    it('should return 404 for non-existent appointment', async () => {
      const response = await request(app)
        .delete('/api/admin/appointments/99999')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Appointment not found');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .delete(`/api/admin/appointments/${testAppointment.id}`)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access token required');
    });
  });
});