
// app/api/profiles/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  role: z.enum(['client', 'contractor', 'admin']),
  userId: z.string().min(1, 'User ID required')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = profileSchema.parse(body);
    
    // Database insertion with proper error handling
    const profileData = {
      id: crypto.randomUUID(),
      ...validatedData,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Replace with your actual database call
    const result = await createProfile(profileData);
    
    return NextResponse.json({ 
      success: true, 
      profile: result,
      message: 'Profile created successfully' 
    }, { status: 201 });
    
  } catch (error) {
    console.error('Profile creation error:', error);
    
    if (error.name === 'ZodError') {
      return NextResponse.json({ 
        success: false, 
        error: 'Validation failed',
        details: error.errors 
      }, { status: 400 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: 'Profile creation failed',
      message: error.message 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    const body = await request.json();
    const validatedData = profileSchema.parse(body);
    
    const updatedProfile = {
      ...validatedData,
      updatedAt: new Date().toISOString()
    };
    
    const result = await updateProfile(userId, updatedProfile);
    
    return NextResponse.json({ 
      success: true, 
      profile: result,
      message: 'Profile updated successfully' 
    });
    
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Profile update failed',
      message: error.message 
    }, { status: 500 });
  }
}

// Database functions
async function createProfile(profileData) {
  // Replace with your actual database logic
  // This should handle the actual insertion to your database
  try {
    // Example for PostgreSQL with proper error handling
    const query = `
      INSERT INTO profiles (id, first_name, last_name, email, phone, role, user_id, status, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `;
    
    const values = [
      profileData.id,
      profileData.firstName,
      profileData.lastName,
      profileData.email,
      profileData.phone,
      profileData.role,
      profileData.userId,
      profileData.status,
      profileData.createdAt,
      profileData.updatedAt
    ];
    
    const result = await db.query(query, values);
    return result.rows[0];
    
  } catch (dbError) {
    console.error('Database insertion error:', dbError);
    throw new Error(`Database error: ${dbError.message}`);
  }
}

async function updateProfile(userId, profileData) {
  try {
    const query = `
      UPDATE profiles 
      SET first_name = $2, last_name = $3, email = $4, phone = $5, 
          role = $6, updated_at = $7
      WHERE user_id = $1
      RETURNING *
    `;
    
    const values = [
      userId,
      profileData.firstName,
      profileData.lastName,
      profileData.email,
      profileData.phone,
      profileData.role,
      profileData.updatedAt
    ];
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Profile not found');
    }
    
    return result.rows[0];
    
  } catch (dbError) {
    console.error('Database update error:', dbError);
    throw new Error(`Database error: ${dbError.message}`);
  }
}
