import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../server.mjs';
import { SECRET_KEY } from '../config/config.mjs';
import { verifyToken } from '../middlewares/authMiddleware.mjs';

const router = express.Router();

// Ruta para registrar usuario
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const passwordRegex = /^(?=.*[A-Z]).{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ message: 'La contraseña debe tener al menos 8 caracteres y una letra mayúscula' });
    }

    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
    res.status(200).json({ message: 'Usuario registrado exitosamente' });
  } catch (error) {
    console.error('Error registrando usuario:', error);
    res.status(500).json({ message: 'Error registrando usuario' });
  }
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const user = rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ message: 'Inicio de sesión exitoso', token });
  } catch (error) {
    console.error('Error iniciando sesión:', error);
    res.status(500).json({ message: 'Error iniciando sesión' });
  }
});

// Ruta para actualizar el perfil del usuario
router.post('/update-profile', verifyToken, async (req, res) => {
  const { userId, name, bio, phone, email, password } = req.body;

  // Validar que todos los campos estén presentes
  if (!userId || !name || !bio || !phone || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
    // Verificar si el nuevo email ya existe
    const [existingUser] = await pool.query('SELECT * FROM users WHERE email = ? AND id != ?', [email, userId]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'El email ya está registrado por otro usuario' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = 'UPDATE users SET name=?, bio=?, phone=?, email=?, password=? WHERE id=?';
    const [result] = await pool.query(query, [name, bio, phone, email, hashedPassword, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({ message: 'Perfil actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar el perfil del usuario:', error);
    res.status(500).json({ message: 'Error al actualizar el perfil del usuario' });
  }
});

export default router;
