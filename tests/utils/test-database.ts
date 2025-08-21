/**
 * Test Database Utilities
 * Database setup and management for integration tests
 */

import { Pool } from 'pg'
import { promises as fs } from 'fs'
import path from 'path'

class TestDatabase {
  private pool: Pool | null = null

  async setup(): Promise<void> {
    // Create connection pool for test database
    this.pool = new Pool({
      host: process.env.TEST_DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT || '5432'),
      database: process.env.TEST_DB_NAME || 'snug_kisses_test',
      user: process.env.TEST_DB_USER || 'test_user',
      password: process.env.TEST_DB_PASSWORD || 'test_password',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    })

    // Initialize test database schema
    await this.initializeSchema()
    
    // Insert test data
    await this.insertTestData()
  }

  async cleanup(): Promise<void> {
    if (this.pool) {
      await this.pool.end()
      this.pool = null
    }
  }

  async reset(): Promise<void> {
    if (!this.pool) throw new Error('Database not initialized')

    // Clear all tables except schema
    await this.pool.query('TRUNCATE TABLE audit_logs RESTART IDENTITY CASCADE')
    await this.pool.query('TRUNCATE TABLE refresh_tokens RESTART IDENTITY CASCADE')
    await this.pool.query('TRUNCATE TABLE client_notes RESTART IDENTITY CASCADE')
    await this.pool.query('TRUNCATE TABLE service_requests RESTART IDENTITY CASCADE')
    await this.pool.query('TRUNCATE TABLE appointments RESTART IDENTITY CASCADE')
    await this.pool.query('TRUNCATE TABLE shifts RESTART IDENTITY CASCADE')
    await this.pool.query('TRUNCATE TABLE client_assignments RESTART IDENTITY CASCADE')
    await this.pool.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE')

    // Re-insert base test data
    await this.insertTestData()
  }

  async query(sql: string, params?: any[]): Promise<any[]> {
    if (!this.pool) throw new Error('Database not initialized')

    const result = await this.pool.query(sql, params)
    return result.rows
  }

  private async initializeSchema(): Promise<void> {
    if (!this.pool) throw new Error('Database not initialized')

    const schemaSQL = `
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'employee', 'client', 'contractor')),
        is_active BOOLEAN DEFAULT true,
        mfa_enabled BOOLEAN DEFAULT false,
        mfa_secret VARCHAR(255),
        phone VARCHAR(20),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Client assignments table
      CREATE TABLE IF NOT EXISTS client_assignments (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES users(id),
        employee_id INTEGER REFERENCES users(id),
        status VARCHAR(50) DEFAULT 'active',
        assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Service requests table
      CREATE TABLE IF NOT EXISTS service_requests (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES users(id),
        service_type VARCHAR(100) NOT NULL,
        description TEXT,
        urgency VARCHAR(20) DEFAULT 'normal',
        preferred_date DATE,
        preferred_time TIME,
        status VARCHAR(50) DEFAULT 'pending',
        assigned_to INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Appointments table
      CREATE TABLE IF NOT EXISTS appointments (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES users(id),
        caregiver_id INTEGER REFERENCES users(id),
        service_type VARCHAR(100) NOT NULL,
        scheduled_date TIMESTAMP NOT NULL,
        duration INTEGER DEFAULT 60,
        status VARCHAR(50) DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Shifts table
      CREATE TABLE IF NOT EXISTS shifts (
        id SERIAL PRIMARY KEY,
        employee_id INTEGER REFERENCES users(id),
        client_id INTEGER REFERENCES users(id),
        shift_date DATE NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME,
        status VARCHAR(50) DEFAULT 'scheduled',
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Client notes table
      CREATE TABLE IF NOT EXISTS client_notes (
        id SERIAL PRIMARY KEY,
        client_id INTEGER REFERENCES users(id),
        employee_id INTEGER REFERENCES users(id),
        shift_id INTEGER REFERENCES shifts(id),
        note_type VARCHAR(50) DEFAULT 'general',
        note_content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Refresh tokens table
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        refresh_token TEXT NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Audit logs table for HIPAA compliance
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        event_type VARCHAR(100) NOT NULL,
        user_email VARCHAR(255),
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        details JSONB,
        client_info JSONB,
        severity VARCHAR(20) DEFAULT 'LOW',
        retention_date TIMESTAMP
      );

      -- Create indexes for performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_client_assignments_client ON client_assignments(client_id);
      CREATE INDEX IF NOT EXISTS idx_client_assignments_employee ON client_assignments(employee_id);
      CREATE INDEX IF NOT EXISTS idx_service_requests_client ON service_requests(client_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_caregiver ON appointments(caregiver_id);
      CREATE INDEX IF NOT EXISTS idx_shifts_employee ON shifts(employee_id);
      CREATE INDEX IF NOT EXISTS idx_shifts_client ON shifts(client_id);
      CREATE INDEX IF NOT EXISTS idx_client_notes_client ON client_notes(client_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_event_type ON audit_logs(event_type);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON audit_logs(user_email);
    `

    await this.pool.query(schemaSQL)
  }

  private async insertTestData(): Promise<void> {
    if (!this.pool) throw new Error('Database not initialized')

    // Insert test users
    const testUsers = [
      {
        email: 'admin@snugkisses.com',
        password_hash: '$2a$12$mockHashedPasswordAdmin',
        first_name: 'Admin',
        last_name: 'User',
        role: 'admin',
        is_active: true,
        mfa_enabled: false
      },
      {
        email: 'employee@snugkisses.com',
        password_hash: '$2a$12$mockHashedPasswordEmployee',
        first_name: 'Employee',
        last_name: 'User',
        role: 'employee',
        is_active: true,
        mfa_enabled: false
      },
      {
        email: 'test@snugkisses.com',
        password_hash: '$2a$12$mockHashedPasswordClient',
        first_name: 'Test',
        last_name: 'Client',
        role: 'client',
        is_active: true,
        mfa_enabled: false,
        phone: '+1234567890'
      },
      {
        email: 'mfa-user@snugkisses.com',
        password_hash: '$2a$12$mockHashedPasswordMFA',
        first_name: 'MFA',
        last_name: 'User',
        role: 'client',
        is_active: true,
        mfa_enabled: true,
        mfa_secret: 'TESTSECRET123'
      }
    ]

    for (const user of testUsers) {
      await this.pool.query(`
        INSERT INTO users (email, password_hash, first_name, last_name, role, is_active, mfa_enabled, mfa_secret, phone)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (email) DO NOTHING
      `, [
        user.email,
        user.password_hash,
        user.first_name,
        user.last_name,
        user.role,
        user.is_active,
        user.mfa_enabled,
        user.mfa_secret || null,
        user.phone || null
      ])
    }

    // Get user IDs for relationships
    const clientResult = await this.pool.query('SELECT id FROM users WHERE email = $1', ['test@snugkisses.com'])
    const employeeResult = await this.pool.query('SELECT id FROM users WHERE email = $1', ['employee@snugkisses.com'])
    
    if (clientResult.rows.length > 0 && employeeResult.rows.length > 0) {
      const clientId = clientResult.rows[0].id
      const employeeId = employeeResult.rows[0].id

      // Insert client assignment
      await this.pool.query(`
        INSERT INTO client_assignments (client_id, employee_id, status)
        VALUES ($1, $2, 'active')
        ON CONFLICT DO NOTHING
      `, [clientId, employeeId])

      // Insert test service request
      await this.pool.query(`
        INSERT INTO service_requests (client_id, service_type, description, urgency, preferred_date, preferred_time, status)
        VALUES ($1, 'lactation support', 'Need help with breastfeeding', 'normal', '2024-02-15', '10:00:00', 'pending')
        ON CONFLICT DO NOTHING
      `, [clientId])

      // Insert test appointment
      await this.pool.query(`
        INSERT INTO appointments (client_id, caregiver_id, service_type, scheduled_date, duration, status, notes)
        VALUES ($1, $2, 'lactation support', '2024-02-15 10:00:00', 60, 'scheduled', 'Initial consultation')
        ON CONFLICT DO NOTHING
      `, [clientId, employeeId])

      // Insert test shift
      await this.pool.query(`
        INSERT INTO shifts (employee_id, client_id, shift_date, start_time, status)
        VALUES ($1, $2, '2024-02-15', '10:00:00', 'scheduled')
        ON CONFLICT DO NOTHING
      `, [employeeId, clientId])
    }
  }
}

export const testDb = new TestDatabase()