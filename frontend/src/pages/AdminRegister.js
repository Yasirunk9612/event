import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './css/AdminAuth.css';

const API_AUTH = 'http://localhost:5002/api/auth';

const AdminRegister = () => {
  const [email, setEmail] = useState('admin@event.com');
  const [password, setPassword] = useState('Admin1234');
  const [name, setName] = useState('Admin');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_AUTH}/register`, { name, email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Register failed');
    }
  };

  return (
    <div className="auth-page">
      <h2>Admin Register</h2>
      <form onSubmit={handleSubmit} className="auth-form">
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
        <button type="submit">Register</button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default AdminRegister;
