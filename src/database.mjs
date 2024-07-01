// src/models/user.js
import pool from '../database.mjs';

export const findUserByEmail = async (email) => {
  const [user] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  return user[0];
};

export const createUser = async (email, hashedPassword) => {
  await pool.query('INSERT INTO users (email, password) VALUES (?, ?)', [email, hashedPassword]);
};
