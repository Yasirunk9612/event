import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const ADMIN_EMAIL = 'admin@event.com';
const ADMIN_PW = 'Admin1234';

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Only allow registering admins with the shared admin credentials
    const isAdmin = email === ADMIN_EMAIL;
    if (isAdmin && password !== ADMIN_PW) {
      return res.status(400).json({ message: 'Admin must use the designated admin password' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const pwToHash = password || (isAdmin ? ADMIN_PW : '');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(pwToHash, salt);

    const user = new User({ name, email, passwordHash, role: isAdmin ? 'admin' : 'user' });
    await user.save();

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    // If logging in as admin, accept the shared credentials even if user not present
    if (email === ADMIN_EMAIL && password === ADMIN_PW) {
      // find or create admin user
      let admin = await User.findOne({ email: ADMIN_EMAIL });
      if (!admin) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(ADMIN_PW, salt);
        admin = new User({ name: 'Admin', email: ADMIN_EMAIL, passwordHash, role: 'admin' });
        await admin.save();
      }
      const token = jwt.sign({ id: admin._id, role: 'admin' }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
      return res.json({ token, user: { id: admin._id, email: admin.email, role: admin.role, name: admin.name } });
    }

    // regular user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'devsecret', { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, email: user.email, role: user.role, name: user.name } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
