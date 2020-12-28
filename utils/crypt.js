import crypto from 'crypto';

export const hash = (text, algorithm = 'sha256') => crypto.createHash(algorithm).update(text).digest('base64');
