import crypto from 'crypto'

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function sendVerificationEmail(
  email: string, 
  token: string, 
  userData: { firstName: string; lastName: string }
) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`
  
  // Mock email service - replace with actual email provider (SendGrid, AWS SES, etc.)
  const emailData = {
    to: email,
    subject: 'Welcome to Snug & Kisses - Verify Your Account',
    html: generateVerificationEmailHTML(userData.firstName, verificationUrl),
    text: generateVerificationEmailText(userData.firstName, verificationUrl)
  }
  
  // Log for development - replace with actual email sending
  console.log('Verification Email:', emailData)
  
  // In production, you would use your email service:
  /*
  await emailService.send(emailData)
  */
  
  return true
}

function generateVerificationEmailHTML(firstName: string, verificationUrl: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Snug & Kisses</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3B2352, #4A2C5A); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .logo { font-size: 28px; font-weight: bold; margin-bottom: 10px; }
        .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; }
        .button { display: inline-block; background: #3B2352; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; border-radius: 0 0 8px 8px; }
        .security-note { background: #e8f4f8; border-left: 4px solid #17a2b8; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">💝 Snug & Kisses</div>
          <p>Professional Doula & Postpartum Care Services</p>
        </div>
        
        <div class="content">
          <h2>Welcome, ${firstName}! 🌟</h2>
          
          <p>Thank you for joining the Snug & Kisses family. We're excited to support you on your journey to parenthood with our professional, compassionate care services.</p>
          
          <p><strong>To complete your registration and access your personalized care portal, please verify your email address:</strong></p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">Verify My Email Address</a>
          </div>
          
          <div class="security-note">
            <strong>🔒 Security Note:</strong> This verification link will expire in 24 hours. If you didn't create this account, please ignore this email or contact our support team.
          </div>
          
          <h3>What's Next?</h3>
          <ol>
            <li><strong>Verify your email</strong> by clicking the button above</li>
            <li><strong>Complete your profile</strong> with any additional information</li>
            <li><strong>Schedule your consultation</strong> with our care coordinator</li>
            <li><strong>Get matched</strong> with the perfect care provider for your needs</li>
          </ol>
          
          <h3>Our Commitment to You</h3>
          <ul>
            <li>✅ <strong>HIPAA Compliant:</strong> Your health information is protected</li>
            <li>✅ <strong>Licensed & Insured:</strong> Professional, qualified care providers</li>
            <li>✅ <strong>24/7 Support:</strong> We're here when you need us most</li>
            <li>✅ <strong>Personalized Care:</strong> Services tailored to your unique needs</li>
          </ul>
          
          <p>If you have any questions or need assistance, our care coordination team is ready to help:</p>
          
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>Contact Information:</strong><br>
            📞 Phone: <a href="tel:+15551234567">(555) 123-4567</a><br>
            📧 Email: <a href="mailto:care@snugandkisses.com">care@snugandkisses.com</a><br>
            🌐 Website: <a href="https://snugandkisses.com">snugandkisses.com</a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>Snug & Kisses</strong><br>
          Professional Doula & Postpartum Care Services<br>
          Licensed • Insured • HIPAA Compliant</p>
          
          <p style="font-size: 12px; color: #999; margin-top: 15px;">
            This email was sent to ${email} because you registered for a Snug & Kisses account.
            If you did not register, please <a href="mailto:support@snugandkisses.com">contact support</a>.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

function generateVerificationEmailText(firstName: string, verificationUrl: string): string {
  return `
Welcome to Snug & Kisses, ${firstName}!

Thank you for joining our family. We're excited to support you with professional doula and postpartum care services.

To complete your registration, please verify your email address by visiting:
${verificationUrl}

This verification link will expire in 24 hours.

What's Next:
1. Verify your email address
2. Complete your profile setup
3. Schedule your initial consultation
4. Get matched with the perfect care provider

Our Commitment:
✅ HIPAA Compliant - Your health information is protected
✅ Licensed & Insured - Professional, qualified care providers  
✅ 24/7 Support - We're here when you need us most
✅ Personalized Care - Services tailored to your unique needs

Contact Us:
Phone: (555) 123-4567
Email: care@snugandkisses.com
Website: snugandkisses.com

If you have any questions, our care coordination team is ready to help.

---
Snug & Kisses
Professional Doula & Postpartum Care Services
Licensed • Insured • HIPAA Compliant

This email was sent because you registered for a Snug & Kisses account.
If you did not register, please contact support@snugandkisses.com.
  `
}

export async function verifyEmailToken(token: string) {
  // Mock implementation - replace with actual database verification
  try {
    // In a real implementation:
    /*
    const registration = await db.clientRegistrations.findFirst({
      where: { 
        verification_token: token,
        registration_status: 'pending',
        created_at: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // 24 hours
      }
    })
    
    if (!registration) {
      throw new Error('Invalid or expired verification token')
    }
    
    // Update registration status
    await db.clientRegistrations.update({
      where: { id: registration.id },
      data: {
        registration_status: 'verified',
        verified_at: new Date(),
        verification_token: null
      }
    })
    
    // Create user account
    const user = await db.users.create({
      data: {
        email: registration.email,
        name: `${registration.first_name} ${registration.last_name}`,
        role: 'client',
        is_active: true,
        zoho_contact_id: await createZohoContact(registration)
      }
    })
    
    return { success: true, user, registration }
    */
    
    // Mock response
    return {
      success: true,
      user: {
        id: 'user_' + Date.now(),
        email: 'verified@example.com',
        name: 'Verified User',
        role: 'client'
      }
    }
  } catch (error) {
    console.error('Email verification error:', error)
    throw new Error('Email verification failed')
  }
}