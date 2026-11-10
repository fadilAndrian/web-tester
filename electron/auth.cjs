const crypto = require('crypto');

const SECRET_KEY = process.env.AUTH_SECRET || 'qa-flow-studio-jwt-secret-key-2026-secure-token';

/**
 * Hash a password using PBKDF2 with a cryptographic salt
 * @param {string} password 
 * @returns {string} salt:hash
 */
function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password harus berupa teks yang valid');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify a plaintext password against a stored salt:hash string
 * @param {string} password 
 * @param {string} storedHash 
 * @returns {boolean}
 */
function verifyPassword(password, storedHash) {
  if (!password || !storedHash || !storedHash.includes(':')) {
    return false;
  }
  const [salt, originalHash] = storedHash.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  try {
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(originalHash, 'hex'));
  } catch (e) {
    return false;
  }
}

/**
 * Generate a signed JWT-compatible token
 * @param {object} user 
 * @returns {string} token
 */
function generateToken(user) {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    name: user.name,
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days expiration
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SECRET_KEY).update(payloadB64).digest('base64url');
  return `${payloadB64}.${signature}`;
}

/**
 * Verify and decode token
 * @param {string} token 
 * @returns {object|null}
 */
function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, signature] = parts;
  const expectedSig = crypto.createHmac('sha256', SECRET_KEY).update(payloadB64).digest('base64url');
  if (signature !== expectedSig) return null;

  try {
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }
    return payload;
  } catch (err) {
    return null;
  }
}

/**
 * Sanitize user object to omit password_hash
 * @param {object} user 
 * @returns {object}
 */
function sanitizeUser(user) {
  if (!user) return null;
  const { password_hash, passwordHash, ...rest } = user;
  return {
    id: rest.id,
    name: rest.name,
    email: rest.email,
    role: rest.role,
    phone: rest.phone || '',
    bio: rest.bio || '',
    status: rest.status || 'active',
    createdAt: rest.created_at || rest.createdAt,
    updatedAt: rest.updated_at || rest.updatedAt
  };
}

/**
 * Calculate readable diff between old user data and updated user data
 * @param {object} oldData 
 * @param {object} newData 
 * @returns {{ before: object, after: object, summary: string }}
 */
function computeUserChanges(oldData, newData) {
  const trackedFields = ['name', 'email', 'role', 'phone', 'bio', 'status'];
  const fieldLabels = {
    name: 'Nama',
    email: 'Email',
    role: 'Role',
    phone: 'Nomor Telepon',
    bio: 'Bio / Catatan',
    status: 'Status Akun'
  };

  const before = {};
  const after = {};
  const diffPhrases = [];

  for (const field of trackedFields) {
    if (newData[field] !== undefined) {
      const oldVal = (oldData[field] ?? '').toString().trim();
      const newVal = (newData[field] ?? '').toString().trim();

      if (oldVal !== newVal) {
        before[field] = oldVal;
        after[field] = newVal;
        const label = fieldLabels[field] || field;
        diffPhrases.push(`Mengubah ${label} dari "${oldVal || '-'}" menjadi "${newVal || '-'}"`);
      }
    }
  }

  if (newData.password) {
    diffPhrases.push('Memperbarui kata sandi (password reset)');
    before.password = '[TERSEMBUNYI]';
    after.password = '[DIPERBARUI]';
  }

  const summary = diffPhrases.length > 0 
    ? diffPhrases.join('; ') 
    : 'Tidak ada perubahan data terdeteksi';

  return { before, after, summary };
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken,
  sanitizeUser,
  computeUserChanges
};
