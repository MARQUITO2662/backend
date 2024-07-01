// src/models/user.mjs
import pool from '../database.mjs';

export const findUserByEmail = async (email) => {
  const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return user[0];
};

export const createUser = async (email, hashedPassword) => {
  await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
};

export const updateUserProfile = async (userId, { name, bio, phone, email, password }) => {
  const result = await pool.query(
    'UPDATE users SET name = ?, bio = ?, phone = ?, email = ?, password = ? WHERE id = ?',
    [name, bio, phone, email, password, userId]
  );
  return result[0];
};
