import React, { useState } from 'react';
import axios from 'axios';
import './../styles/Admin.css';
import { useHistory } from 'react-router-dom';

// Admin Login Component
const Admin = () => {
  const [admin, setAdmin] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [childData, setChildData] = useState({ name: '', age: '', adminId: '' });
  const [profileData, setProfileData] = useState({ email: '', password: '', avatar: null });
  const history = useHistory();

  // Handle login form change
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  // Handle child registration form change
  const handleChildChange = (e) => {
    setChildData({
      ...childData,
      [e.target.name]: e.target.value
    });
  };

  // Handle profile update form change
  const handleProfileChange = (e) => {
    if (e.target.name === 'avatar') {
      setProfileData({
        ...profileData,
        [e.target.name]: e.target.files[0]
      });
    } else {
      setProfileData({
        ...profileData,
        [e.target.name]: e.target.value
      });
    }
  };

  // Handle login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/admin/login', loginData);
      localStorage.setItem('adminToken', res.data.token); // Save token
      setAdmin(true);
      history.push('/admin-dashboard'); // Redirect to admin dashboard
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  //Handle child registration
  const handleChildRegister = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.post('/admin/register-child', childData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Child registered successfully', res.data);
    } catch (error) {
      console.error('Child registration failed', error);
    }
  };

  //Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('email', profileData.email);
      formData.append('password', profileData.password);
      if (profileData.avatar) formData.append('avatar', profileData.avatar);

      const res = await axios.patch('/admin/update-profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      console.log('Profile updated successfully', res.data);
    } catch (error) {
      console.error('Profile update failed', error);
    }
  };

  //Handle theme toggle
  const handleThemeToggle = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    if (currentTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
      {!admin ? (
        <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <form onSubmit={handleLoginSubmit}>
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Admin Login</h2>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 dark:text-white">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={loginData.email}
                onChange={handleLoginChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 dark:text-white">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                value={loginData.password}
                onChange={handleLoginChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded-lg">Login</button>
          </form>
          <div className="mt-4 flex justify-center items-center">
            <button onClick={handleThemeToggle} className="text-blue-500">Toggle Theme</button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          {/* Child Registration Form */}
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">Register Child</h2>
          <form onSubmit={handleChildRegister}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 dark:text-white">Child's Name</label>
              <input
                type="text"
                name="name"
                id="name"
                value={childData.name}
                onChange={handleChildChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="age" className="block text-gray-700 dark:text-white">Child's Age</label>
              <input
                type="number"
                name="age"
                id="age"
                value={childData.age}
                onChange={handleChildChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <button type="submit" className="w-full bg-green-500 text-white p-3 rounded-lg">Register Child</button>
          </form>

          {/* Admin Profile Update Form */}
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mt-6 mb-6">Update Profile</h2>
          <form onSubmit={handleProfileUpdate}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 dark:text-white">Email</label>
              <input
                type="email"
                name="email"
                id="email"
                value={profileData.email}
                onChange={handleProfileChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-700 dark:text-white">Password</label>
              <input
                type="password"
                name="password"
                id="password"
                value={profileData.password}
                onChange={handleProfileChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="avatar" className="block text-gray-700 dark:text-white">Profile Picture</label>
              <input
                type="file"
                name="avatar"
                id="avatar"
                onChange={handleProfileChange}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>
            <button type="submit" className="w-full bg-blue-500 text-white p-3 rounded-lg">Update Profile</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Admin;
