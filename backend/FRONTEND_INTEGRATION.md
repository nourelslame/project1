# Frontend Connection Guide
This guide explains how to connect your React Vite frontend to the new Stag.io backend API.

## 1. Create Axios Instance (`src/api/axios.js`)
Set up an Axios instance that automatically attaches your JWT token.

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// Automatically add JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Notice the Bearer prefix
  }
  return config;
});

export default api;
```

## 2. Example: `LoginPage.jsx`
Replace mock logic with actual authentication calls.

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios'; // Import the axios instance

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Send the request to /api/auth/login
      const res = await api.post('/auth/login', { email, password });
      
      // Store token and user data in localStorage
      localStorage.setItem('token', res.data.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.data.user));

      // Navigate based on user role
      const role = res.data.data.user.role;
      if (role === 'STUDENT') navigate('/student/dashboard');
      else if (role === 'COMPANY') navigate('/company/dashboard');
      else if (role === 'ADMIN') navigate('/admin/dashboard');

    } catch (err) {
      // Show user-friendly error message
      setError(err.response?.data?.message || 'Failed to login');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      {error && <p className="error">{error}</p>}
      <input 
         type="email" 
         placeholder="Email" 
         value={email} 
         onChange={(e) => setEmail(e.target.value)} 
         required 
      />
      <input 
         type="password" 
         placeholder="Password" 
         value={password} 
         onChange={(e) => setPassword(e.target.value)} 
         required 
      />
      <button type="submit">Login</button>
    </form>
  );
};

export default LoginPage;
```

## 3. Example: `StudentDashboard.jsx` (Student Profile & Applications)
Here's how a student can fetch their data based on the API routes built.

```jsx
import React, { useEffect, useState } from 'react';
import api from '../api/axios';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Run requests in parallel
        const [profileRes, appsRes] = await Promise.all([
          api.get('/student/profile'),
          api.get('/student/applications')
        ]);
        
        setProfile(profileRes.data.data);
        setApplications(appsRes.data.data);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1>Welcome back, {profile?.firstName}</h1>
      <p>University: {profile?.university}</p>
      
      <h2>My Applications</h2>
      <ul>
        {applications.map((app) => (
          <li key={app._id}>
            {app.offerId.title} - Status: <strong>{app.status}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StudentDashboard;
```
