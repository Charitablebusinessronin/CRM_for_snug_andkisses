/**
 * Zoho Catalyst Authentication Function
 * Handles authentication and JWT token management for the CRM system
 * Project ID: 30300000000035001
 * Client ID: 1000.YWW9X2SXPRD5O0EEYXPSCGD95OVDOH
 */

const catalyst = require('zcatalyst-sdk-node')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = async (req, context) => {
  const app = catalyst.initialize(req)
  
  try {
    const { action, ...payload } = req.body
    
    switch (action) {
      case 'authenticate':
        return await authenticateUser(app, payload, context)
      case 'refresh-token':
        return await refreshToken(app, payload, context)
      case 'validate-session':
        return await validateSession(app, payload, context)
      case 'logout':
        return await logoutUser(app, payload, context)
      default:
        return context.response.setStatus(400).send({
          success: false,
          error: 'Invalid action specified'
        })
    }
  } catch (error) {
    console.error('❌ Catalyst Auth Error:', error)
    await logAuditEvent(app, {
      eventType: 'AUTH_ERROR',
      details: { error: error.message },
      severity: 'HIGH'
    })
    
    return context.response.setStatus(500).send({
      success: false,
      error: 'Authentication service error'
    })
  }
}

/**
 * Authenticate user with email and password
 */
async function authenticateUser(app, payload, context) {
  const { email, password, clientInfo } = payload
  
  if (!email || !password) {
    return context.response.setStatus(400).send({
      success: false,
      error: 'Email and password required'
    })
  }

  try {
    // Query user from Zoho CRM
    const zcrmClient = app.crm()
    const users = await zcrmClient.getRecords({
      module_name: 'Contacts',
      criteria: `Email:equals:${email}`
    })

    if (!users.data || users.data.length === 0) {
      await logAuditEvent(app, {
        eventType: 'LOGIN_FAILED',
        userEmail: email,
        details: { reason: 'User not found' },
        clientInfo
      })
      
      return context.response.setStatus(401).send({
        success: false,
        error: 'Invalid credentials'
      })
    }

    const user = users.data[0]
    
    // Verify password (assuming password is stored in custom field)
    const isValidPassword = await bcrypt.compare(password, user.Password_Hash || '')
    
    if (!isValidPassword) {
      await logAuditEvent(app, {
        eventType: 'LOGIN_FAILED',
        userEmail: email,
        details: { reason: 'Invalid password' },
        clientInfo
      })
      
      return context.response.setStatus(401).send({
        success: false,
        error: 'Invalid credentials'
      })
    }

    // Generate tokens
    const tokenPayload = {
      userId: user.id,
      email: user.Email,
      role: user.Role || 'client',
      firstName: user.First_Name,
      lastName: user.Last_Name
    }

    const accessToken = jwt.sign(tokenPayload, process.env.JWT_SECRET, { 
      expiresIn: '1h' 
    })
    const refreshToken = jwt.sign(tokenPayload, process.env.JWT_REFRESH_SECRET, { 
      expiresIn: '7d' 
    })

    // Store refresh token in Catalyst DataStore
    await storeRefreshToken(app, user.id, refreshToken)

    // Log successful login
    await logAuditEvent(app, {
      eventType: 'LOGIN_SUCCESS',
      userEmail: email,
      details: { 
        role: user.Role,
        loginTime: new Date().toISOString()
      },
      clientInfo
    })

    return context.response.setStatus(200).send({
      success: true,
      data: {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          email: user.Email,
          role: user.Role,
          firstName: user.First_Name,
          lastName: user.Last_Name
        }
      }
    })

  } catch (error) {
    console.error('❌ Authentication error:', error)
    return context.response.setStatus(500).send({
      success: false,
      error: 'Authentication failed'
    })
  }
}

/**
 * Refresh access token using refresh token
 */
async function refreshToken(app, payload, context) {
  const { refreshToken } = payload
  
  if (!refreshToken) {
    return context.response.setStatus(400).send({
      success: false,
      error: 'Refresh token required'
    })
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    
    // Check if refresh token exists in store
    const storedToken = await getStoredRefreshToken(app, decoded.userId)
    if (storedToken !== refreshToken) {
      return context.response.setStatus(401).send({
        success: false,
        error: 'Invalid refresh token'
      })
    }

    // Generate new access token
    const newAccessToken = jwt.sign(
      {
        userId: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        firstName: decoded.firstName,
        lastName: decoded.lastName
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    )

    await logAuditEvent(app, {
      eventType: 'TOKEN_REFRESHED',
      userEmail: decoded.email,
      details: { userId: decoded.userId }
    })

    return context.response.setStatus(200).send({
      success: true,
      data: { accessToken: newAccessToken }
    })

  } catch (error) {
    return context.response.setStatus(401).send({
      success: false,
      error: 'Invalid refresh token'
    })
  }
}

/**
 * Validate session token
 */
async function validateSession(app, payload, context) {
  const { accessToken } = payload
  
  if (!accessToken) {
    return context.response.setStatus(400).send({
      success: false,
      error: 'Access token required'
    })
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET)
    
    return context.response.setStatus(200).send({
      success: true,
      data: {
        valid: true,
        user: {
          userId: decoded.userId,
          email: decoded.email,
          role: decoded.role,
          firstName: decoded.firstName,
          lastName: decoded.lastName
        }
      }
    })

  } catch (error) {
    return context.response.setStatus(401).send({
      success: false,
      data: { valid: false }
    })
  }
}

/**
 * Logout user and invalidate tokens
 */
async function logoutUser(app, payload, context) {
  const { userId, accessToken } = payload
  
  try {
    // Invalidate refresh token
    await removeRefreshToken(app, userId)
    
    // Decode for audit logging
    let userEmail = 'unknown'
    try {
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET)
      userEmail = decoded.email
    } catch (e) {
      // Token might be expired, continue with logout
    }

    await logAuditEvent(app, {
      eventType: 'LOGOUT',
      userEmail,
      details: { userId }
    })

    return context.response.setStatus(200).send({
      success: true,
      message: 'Logged out successfully'
    })

  } catch (error) {
    return context.response.setStatus(500).send({
      success: false,
      error: 'Logout failed'
    })
  }
}

/**
 * Store refresh token in Catalyst DataStore
 */
async function storeRefreshToken(app, userId, refreshToken) {
  const datastore = app.datastore()
  const table = datastore.table('refresh_tokens')
  
  const tokenRecord = {
    user_id: userId,
    refresh_token: refreshToken,
    created_at: new Date().toISOString(),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  }
  
  await table.insertRow(tokenRecord)
}

/**
 * Get stored refresh token
 */
async function getStoredRefreshToken(app, userId) {
  const datastore = app.datastore()
  const table = datastore.table('refresh_tokens')
  
  const result = await table.getRows({
    criteria: `user_id = '${userId}'`,
    order_by: 'created_at desc',
    limit: 1
  })
  
  return result.length > 0 ? result[0].refresh_token : null
}

/**
 * Remove refresh token
 */
async function removeRefreshToken(app, userId) {
  const datastore = app.datastore()
  const table = datastore.table('refresh_tokens')
  
  const result = await table.getRows({
    criteria: `user_id = '${userId}'`
  })
  
  for (const row of result) {
    await table.deleteRow(row.ROWID)
  }
}

/**
 * Log audit event for HIPAA compliance
 */
async function logAuditEvent(app, event) {
  const datastore = app.datastore()
  const auditTable = datastore.table('audit_logs')
  
  const auditRecord = {
    event_type: event.eventType,
    user_email: event.userEmail || 'system',
    timestamp: new Date().toISOString(),
    details: JSON.stringify(event.details || {}),
    client_info: JSON.stringify(event.clientInfo || {}),
    severity: event.severity || 'LOW',
    retention_date: new Date(Date.now() + 7 * 365 * 24 * 60 * 60 * 1000).toISOString()
  }
  
  try {
    await auditTable.insertRow(auditRecord)
  } catch (error) {
    console.error('❌ Audit logging failed:', error)
  }
}