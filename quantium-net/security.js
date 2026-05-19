/**
 * QUANTIUM NET - Security Module
 * End-to-end encryption and security for Quantium Internet
 */

const crypto = require('crypto');

class QuantiumSecurity {
  constructor() {
    this.keys = new Map();
    this.cipher = 'aes-256-gcm';
    this.keyLength = 32;
  }

  /**
   * Generate key pair for quantum secure communication
   */
  generateKeyPair(userId) {
    const publicKey = crypto.randomBytes(this.keyLength).toString('hex');
    const privateKey = crypto.randomBytes(this.keyLength).toString('hex');
    
    this.keys.set(userId, {
      publicKey,
      privateKey,
      createdAt: Date.now()
    });
    
    return { publicKey, privateKey };
  }

  /**
   * Encrypt data
   */
  encrypt(plaintext, key) {
    const iv = crypto.randomBytes(16);
    const keyBuffer = Buffer.from(key, 'hex');
    
    const cipherObj = crypto.createCipheriv(this.cipher, keyBuffer, iv);
    
    let encrypted = cipherObj.update(plaintext, 'utf8', 'hex');
    encrypted += cipherObj.final('hex');
    
    const authTag = cipherObj.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypt data
   */
  decrypt(encryptedData, key) {
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const keyBuffer = Buffer.from(key, 'hex');
    const authTag = Buffer.from(encryptedData.authTag, 'hex');
    
    const decipher = crypto.createDecipheriv(this.cipher, keyBuffer, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Create secure hash
   */
  hash(data, algorithm = 'sha256') {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  /**
   * Generate random token
   */
  generateToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Verify data integrity
   */
  verify(data, hash, algorithm = 'sha256') {
    const computedHash = this.hash(data, algorithm);
    return computedHash === hash;
  }
}

// Secure Session Manager
class SecureSession {
  constructor(security) {
    this.security = security;
    this.sessions = new Map();
  }

  /**
   * Create new session
   */
  create(userId, metadata = {}) {
    const sessionId = this.security.generateToken(32);
    const sessionKey = this.security.generateToken(32);
    
    const session = {
      id: sessionId,
      userId,
      key: sessionKey,
      createdAt: Date.now(),
      lastActivity: Date.now(),
      expiresAt: Date.now() + (metadata.duration || 3600000), // 1 hour default
      metadata
    };
    
    this.sessions.set(sessionId, session);
    
    return {
      sessionId,
      key: sessionKey,
      expiresAt: session.expiresAt
    };
  }

  /**
   * Validate session
   */
  validate(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return { valid: false, reason: 'Session not found' };
    }
    
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(sessionId);
      return { valid: false, reason: 'Session expired' };
    }
    
    session.lastActivity = Date.now();
    return { valid: true, session };
  }

  /**
   * Invalidate session
   */
  invalidate(sessionId) {
    return this.sessions.delete(sessionId);
  }

  /**
   * Get active session count
   */
  getActiveCount() {
    return this.sessions.size;
  }
}

// Permission Manager
class PermissionManager {
  constructor() {
    this.permissions = new Map();
    this.roles = new Map();
  }

  /**
   * Define role
   */
  defineRole(roleId, permissions) {
    this.roles.set(roleId, {
      id: roleId,
      permissions,
      createdAt: Date.now()
    });
    
    return { success: true, roleId };
  }

  /**
   * Grant permission
   */
  grant(userId, permission) {
    if (!this.permissions.has(userId)) {
      this.permissions.set(userId, new Set());
    }
    
    this.permissions.get(userId).add(permission);
    return { success: true, permission };
  }

  /**
   * Check permission
   */
  hasPermission(userId, permission) {
    const userPerms = this.permissions.get(userId);
    if (!userPerms) return false;
    
    return userPerms.has(permission);
  }

  /**
   * Revoke permission
   */
  revoke(userId, permission) {
    const userPerms = this.permissions.get(userId);
    if (!userPerms) return { success: false };
    
    userPerms.delete(permission);
    return { success: true };
  }
}

module.exports = { QuantiumSecurity, SecureSession, PermissionManager };

// Demo
if (require.main === module) {
  const security = new QuantiumSecurity();
  const sessions = new SecureSession(security);
  const permissions = new PermissionManager();

  console.log('=== QUANTIUM SECURITY ===');
  
  // Generate keys
  const keys = security.generateKeyPair('user_1');
  console.log('Generated Keys:', keys.publicKey.substring(0, 16) + '...');
  
  // Encrypt data
  const encrypted = security.encrypt('Hello Quantium!', keys.privateKey);
  console.log('Encrypted:', encrypted.encrypted.substring(0, 20) + '...');
  
  // Decrypt
  const decrypted = security.decrypt(encrypted, keys.privateKey);
  console.log('Decrypted:', decrypted);
  
  // Create session
  const session = sessions.create('user_1', { role: 'admin' });
  console.log('Session:', session.sessionId.substring(0, 16) + '...');
  
  // Validate session
  console.log('Valid:', sessions.validate(session.sessionId));
  
  // Define roles
  permissions.defineRole('admin', ['read', 'write', 'delete']);
  permissions.defineRole('user', ['read']);
  
  // Grant permissions
  permissions.grant('user_1', 'read');
  permissions.grant('user_1', 'write');
  console.log('Has read:', permissions.hasPermission('user_1', 'read'));
  console.log('Has delete:', permissions.hasPermission('user_1', 'delete'));
}
