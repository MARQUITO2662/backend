import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../server.mjs';
import { SECRET_KEY } from '../config/config.mjs';
import { verifyToken } from '../middlewares/authMiddleware.mjs';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: API endpoints for user authentication
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Register a new user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: User registered successfully
 *       '400':
 *         description: Bad request
 *       '500':
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Log in a user
 *     description: Log in a user with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: User logged in successfully
 *       '401':
 *         description: Invalid credentials
 *       '500':
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /api/users/update-profile:
 *   post:
 *     summary: Update user profile
 *     description: Update the profile of the logged-in user
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *               name:
 *                 type: string
 *               bio:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - userId
 *               - name
 *               - bio
 *               - phone
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: Profile updated successfully
 *       '400':
 *         description: Bad request
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
router.post('/update-profile', verifyToken, async (req, res) => {
  const { userId, name, bio, phone, email, password } = req.body;

  if (!userId || !name || !bio || !phone || !email || !password) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios' });
  }

  try {
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
