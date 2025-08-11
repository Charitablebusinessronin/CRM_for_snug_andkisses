-- RefreshTokens table for storing hashed refresh tokens
-- Create in Catalyst DataStore (ZCQL)

CREATE TABLE RefreshTokens (
  ROWID BIGINT PRIMARY KEY AUTO_INCREMENT,
  userId VARCHAR(255) NOT NULL,
  refreshToken TEXT NOT NULL, -- sha256 hash
  createdAt DATETIME NOT NULL,
  expiresAt DATETIME NOT NULL,
  revokedAt DATETIME,
  revokedReason VARCHAR(255),
  isActive BOOLEAN DEFAULT true,
  INDEX idx_userId (userId),
  INDEX idx_expiresAt (expiresAt),
  INDEX idx_isActive (isActive)
);
