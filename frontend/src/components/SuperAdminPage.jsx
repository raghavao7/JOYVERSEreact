import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './../styles/SuperAdmin.css';

const SuperAdminPage = () => {
  const [admins, setAdmins] = useState([]);
  const [phoneToDisable, setPhoneToDisable] = useState('');
  const [phoneToDelete, setPhoneToDelete] = useState('');
  const [adminData, setAdminData] = useState({
    name: '',
    phone: '',
    email: '',
    profilePhoto: '',
    password: ''
  });
  const [message, setMessage] = useState('');
  useEffect(() => {
    axios.get('http://localhost:3000/superadmin/admins', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`,
      },
    })
    .then((response) => {
      console.log("Fetched Admins:", response.data); // <-- 👈 Add this line
      setAdmins(response.data);
    })
    .catch((error) => {
      console.error('Error fetching admins:', error);
    });
  }, []);
  
  // Fetch all admins on page load
  useEffect(() => {
    axios.get('http://localhost:3000/superadmin/admins', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`, // Make sure to use the correct token here
      },
    })
    .then((response) => {
      setAdmins(response.data);
    })
    .catch((error) => {
      console.error('Error fetching admins:', error);
    });
  }, []);

  // Handle Admin Registration
  const handleAdminRegistration = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', adminData.name);
    formData.append('phone', adminData.phone);
    formData.append('email', adminData.email);
    formData.append('profilePhoto', adminData.profilePhoto);
    formData.append('password', adminData.password);

    axios.post('http://localhost:3000/superadmin/register-admin', formData, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`,
      },
    })
    .then((response) => {
      setMessage(response.data.message);
      setAdminData({
        name: '',
        phone: '',
        email: '',
        profilePhoto: '',
        password: ''
      });
    })
    .catch((error) => {
      console.error('Error registering admin:', error);
      setMessage('Registration failed');
    });
  };

  // Handle Disable Admin
  // Handle Disable Admin - Updated version

const handleDisableAdmin = () => {
    if (!phoneToDisable) {
      alert('Please enter a phone number');
      return;
    }
  
    axios.put('http://localhost:3000/superadmin/disable-admin', 
      { phone: phoneToDisable }, 
      {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`,
        },
      }
    )
    .then((response) => {
      alert(response.data.message);
      // Refresh the admin list
      axios.get('http://localhost:3000/superadmin/admins', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`,
        },
      })
      .then((response) => {
        setAdmins(response.data);
        setPhoneToDisable('');
      });
    })
    .catch((error) => {
      console.error('Error disabling admin:', error);
      alert(error.response?.data?.message || 'Error disabling admin');
    });
  };
  
  // Handle Delete Admin - Updated version
  const handleDeleteAdmin = () => {
    if (!phoneToDelete) {
      alert('Please enter a phone number');
      return;
    }
  
    axios.delete(`http://localhost:3000/superadmin/delete-admin/${phoneToDelete}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`,
      },
    })
    .then((response) => {
      alert(response.data.message);
      // Refresh the admin list
      axios.get('http://localhost:3000/superadmin/admins', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`,
        },
      })
      .then((response) => {
        setAdmins(response.data);
        setPhoneToDelete('');
      });
    })
    .catch((error) => {
      console.error('Error deleting admin:', error);
      alert(error.response?.data?.message || 'Error deleting admin');
    });
  };
  return (
    <div className="superadmin-container">
      <h1>SuperAdmin Dashboard</h1>

      {/* Admin Registration */}
      <div className="admin-registration">
        <h2>Register New Admin</h2>
        <form onSubmit={handleAdminRegistration}>
          <input
            type="text"
            placeholder="Admin Name"
            value={adminData.name}
            onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={adminData.phone}
            onChange={(e) => setAdminData({ ...adminData, phone: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={adminData.email}
            onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
            required
          />
          <input
            type="file"
            onChange={(e) => setAdminData({ ...adminData, profilePhoto: e.target.files[0] })}
          />
          <input
            type="password"
            placeholder="Password"
            value={adminData.password}
            onChange={(e) => setAdminData({ ...adminData, password: e.target.value })}
            required
          />
          <button type="submit">Register Admin</button>
        </form>
        {message && <p>{message}</p>}
      </div>

      {/* View All Admins */}
      <div className="admin-list">
        <h2>Registered Admins</h2>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin) => (
              <tr key={admin.phone}>
                <td>{admin.name}</td>
                <td>{admin.phone}</td>
                <td>{admin.email}</td>
                <td>{admin.active ? 'Active' : 'Disabled'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Disable Admin */}
      <div>
        <h2>Disable Admin</h2>
        <input
          type="text"
          placeholder="Enter phone number to disable"
          value={phoneToDisable}
          onChange={(e) => setPhoneToDisable(e.target.value)}
        />
        <button onClick={handleDisableAdmin}>Disable Admin</button>
      </div>

      {/* Delete Admin */}
      <div>
        <h2>Delete Admin</h2>
        <input
          type="text"
          placeholder="Enter phone number to delete"
          value={phoneToDelete}
          onChange={(e) => setPhoneToDelete(e.target.value)}
        />
        <button onClick={handleDeleteAdmin}>Delete Admin</button>
      </div>
    </div>
  );
};

export default SuperAdminPage;
