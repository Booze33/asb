import request from 'supertest';
import app from '../src/app';
import pool from '../src/config/database';
import { ClientModel } from '../src/models/Client';
import { AppointmentModel } from '../src/models/Appointment';

// Mock the email queue
jest.mock('../src/jobs/queue', () => ({
  emailQueue: {
    add: jest.fn()
  }
}));

describe('Appointment API Endpoints', () => {
  let testClient: any;
  let testAppointment: any;

  beforeAll(async () => {
    // Clean up test data
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM appointments WHERE client_id IN (SELECT id FROM clients WHERE email LIKE $1)', ['test_%']);
      await client.query('DELETE FROM clients WHERE email LIKE $1', ['test_%']);
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
    } finally {
      client.release();
    }
    await pool.end();
  });

  describe('POST /api/appointments', () => {
    it('should create a new appointment with new client', async () => {
      const appointmentData = {
        name: 'John Doe',
        email: 'test_john@example.com',
        phone: '+1234567890',
        address: '123 Test Street',
        date_time: new Date(Date.now() + 600000).toISOString(), // 10 minutes from now
        duration: 60
      };

      const response = await request(app)
        .post('/api/appointments')
        .send(appointmentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Appointment created successfully');
      expect(response.body.data.appointment.client.name).toBe(appointmentData.name);
      expect(response.body.data.appointment.client.email).toBe(appointmentData.email);
      expect(response.body.data.appointment.duration).toBe(appointmentData.duration);
      expect(response.body.data.appointment.status).toBe('booked');

      // Store for cleanup
      testClient = response.body.data.appointment.client;
      testAppointment = response.body.data.appointment;
    });

    it('should create a new appointment with existing client', async () => {
      const appointmentData = {
        name: 'John Doe',
        email: 'test_john@example.com', // Same email as previous test
        phone: '+1234567890',
        address: '123 Test Street',
        date_time: new Date(Date.now() + 1200000).toISOString(), // 20 minutes from now
        duration: 90
      };

      const response = await request(app)
        .post('/api/appointments')
        .send(appointmentData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appointment.client.id).toBe(testClient.id); // Same client ID
    });

    it('should return 400 for invalid input', async () => {
      const invalidData = {
        name: '', // Invalid: empty name
        email: 'invalid-email', // Invalid: not a valid email
        phone: '123', // Invalid: too short
        address: '', // Invalid: empty address
        date_time: 'invalid-date', // Invalid: not a valid date
        duration: 10 // Invalid: too short
      };

      const response = await request(app)
        .post('/api/appointments')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
      expect(response.body.errors).toHaveLength(6);
    });

    it('should return 409 for double booking', async () => {
      const appointmentData = {
        name: 'Jane Doe',
        email: 'test_jane@example.com',
        phone: '+0987654321',
        address: '456 Test Avenue',
        date_time: testAppointment.date_time, // Same time as existing appointment
        duration: 60
      };

      const response = await request(app)
        .post('/api/appointments')
        .send(appointmentData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('This time slot is already booked. Please choose a different time.');
    });

    it('should return 400 for past date', async () => {
      const appointmentData = {
        name: 'Past Appointment',
        email: 'past@example.com',
        phone: '+1112223333',
        address: '789 Past Street',
        date_time: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        duration: 60
      };

      const response = await request(app)
        .post('/api/appointments')
        .send(appointmentData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });
  });

  describe('GET /api/appointments/:id', () => {
    it('should retrieve appointment details with correct email', async () => {
      const response = await request(app)
        .get(`/api/appointments/${testAppointment.id}`)
        .query({ email: testClient.email })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.appointment.id).toBe(testAppointment.id);
      expect(response.body.data.appointment.client.email).toBe(testClient.email);
      expect(response.body.data.appointment.date_time).toBe(testAppointment.date_time);
    });

    it('should return 404 for non-existent appointment', async () => {
      const response = await request(app)
        .get('/api/appointments/99999')
        .query({ email: 'nonexistent@example.com' })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Appointment not found');
    });

    it('should return 403 for wrong email', async () => {
      const response = await request(app)
        .get(`/api/appointments/${testAppointment.id}`)
        .query({ email: 'wrong@example.com' })
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Access denied: This appointment does not belong to the provided email');
    });

    it('should return 400 for invalid appointment ID', async () => {
      const response = await request(app)
        .get('/api/appointments/invalid')
        .query({ email: testClient.email })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });

    it('should return 400 for missing email parameter', async () => {
      const response = await request(app)
        .get(`/api/appointments/${testAppointment.id}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Validation error');
    });
  });
});