import crypto from 'crypto';
import { User } from '../models/User.js';

const hashPassword = (password) => {
  return crypto.createHash('sha256').update(password).digest('hex');
};

export const AuthController = {
  async register(req, res) {
    try {
      const { email, name, password } = req.body || {};

      if (!email || !name || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email, name, and password are required.'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          error: 'Password must be at least 6 characters.'
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const existingUser = await User.findByEmail(normalizedEmail);

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'This email is already registered.'
        });
      }

      const userId = `usr_${crypto.randomBytes(8).toString('hex')}`;
      const passwordHash = hashPassword(password);

      const newUser = await User.create(userId, normalizedEmail, name.trim(), passwordHash);

      return res.status(201).json({
        success: true,
        user: {
          uid: newUser.id,
          email: newUser.email,
          displayName: newUser.displayName
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({
        success: false,
        error: 'Registration failed. Please try again.'
      });
    }
  },

  async login(req, res) {
    try {
      const { email, password } = req.body || {};

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required.'
        });
      }

      const normalizedEmail = email.toLowerCase().trim();
      const user = await User.findByEmail(normalizedEmail);

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.'
        });
      }

      const passwordHash = hashPassword(password);
      if (user.passwordHash !== passwordHash) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password.'
        });
      }

      return res.json({
        success: true,
        user: {
          uid: user.id,
          email: user.email,
          displayName: user.displayName
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        error: 'Login failed. Please try again.'
      });
    }
  }
};
