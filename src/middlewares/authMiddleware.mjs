// authMiddleware.mjs
import jwt from 'jsonwebtoken';
import { SECRET_KEY } from '../config/config.mjs';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Token de autorización no proporcionado' });
  }

  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token de autorización inválido' });
    }
    req.user = decoded;
    next();
  });
};
