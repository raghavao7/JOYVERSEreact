// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import '../styles/Admin.css';

// const Admin = () => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [loginData, setLoginData] = useState({ email: '', password: '' });
//   const [childData, setChildData] = useState({ name: '', email: '' });
//   const [children, setChildren] = useState([]);
//   const [message, setMessage] = useState('');
//   const [selectedChild, setSelectedChild] = useState(null);
//   const [reports, setReports] = useState([]);
//   const [newChildCredentials, setNewChildCredentials] = useState(null);
//   const navigate = useNavigate();

//   // Validate email format
//   const validateEmail = (email) => {
//     return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
//   };

//   // Fetch children on dashboard load
//   useEffect(() => {
//     if (!isLogin) {
//       const token = localStorage.getItem('admin_token');
//       if (!token) {
//         setMessage('Please log in again');
//         setIsLogin(true);
//         return;
//       }
//       axios.get('http://localhost:3000/admin/children', {
//         headers: { 'Authorization': `Bearer ${token}` },
//       })
//         .then((response) => setChildren(response.data))
//         .catch((error) => {
//           console.error('Error fetching children:', error);
//           setMessage(error.response?.data?.message || 'Error fetching children');
//         });
//     }
//   }, [isLogin]);

//   // Handle Admin Login
//   const handleLogin = (e) => {
//     e.preventDefault();
//     if (!validateEmail(loginData.email)) {
//       setMessage('Invalid email format');
//       return;
//     }
//     axios.post('http://localhost:3000/admin/login', loginData)
//       .then((response) => {
//         localStorage.setItem('admin_token', response.data.token);
//         setIsLogin(false);
//         setMessage('Login successful');
//         setLoginData({ email: '', password: '' });
//       })
//       .catch((error) => {
//         console.error('Error logging in:', error);
//         setMessage(error.response?.data?.message || 'Login failed');
//       });
//   };

//   // Handle Logout
//   const handleLogout = () => {
//     localStorage.removeItem('admin_token');
//     setIsLogin(true);
//     setMessage('Logged out successfully');
//     navigate('/admin');
//   };

//   // Handle Child Registration
//   const handleChildRegistration = (e) => {
//     e.preventDefault();
//     if (!validateEmail(childData.email)) {
//       setMessage('Invalid email format');
//       return;
//     }
//     const token = localStorage.getItem('admin_token');
//     if (!token) {
//       setMessage('Please log in again');
//       setIsLogin(true);
//       return;
//     }
//     axios.post('http://localhost:3000/admin/register-child', childData, {
//       headers: { 'Authorization': `Bearer ${token}` },
//     })
//       .then((response) => {
//         setMessage(response.data.message);
//         setNewChildCredentials({
//           userId: response.data.userId,
//           password: response.data.password,
//         });
//         setChildData({ name: '', email: '' });
//         // Refresh children list
//         axios.get('http://localhost:3000/admin/children', {
//           headers: { 'Authorization': `Bearer ${token}` },
//         })
//           .then((response) => setChildren(response.data))
//           .catch((error) => {
//             console.error('Error refreshing children:', error);
//             setMessage(error.response?.data?.message || 'Error refreshing children');
//           });
//       })
//       .catch((error) => {
//         console.error('Error registering child:', error);
//         setMessage(error.response?.data?.message || 'Registration failed');
//       });
//   };

//   // Toggle Child Status
//   const handleToggleChild = (id) => {
//     const token = localStorage.getItem('admin_token');
//     if (!token) {
//       setMessage('Please log in again');
//       setIsLogin(true);
//       return;
//     }
//     axios.put(`http://localhost:3000/admin/child/${id}/toggle`, {}, {
//       headers: { 'Authorization': `Bearer ${token}` },
//     })
//       .then((response) => {
//         setMessage(response.data.message);
//         setChildren(children.map(child =>
//           child._id === id ? { ...child, active: !child.active } : child
//         ));
//       })
//       .catch((error) => {
//         console.error('Error toggling child:', error);
//         setMessage(error.response?.data?.message || 'Error toggling child');
//       });
//   };

//   // Delete Child
//   const handleDeleteChild = (id) => {
//     const token = localStorage.getItem('admin_token');
//     if (!token) {
//       setMessage('Please log in again');
//       setIsLogin(true);
//       return;
//     }
//     axios.delete(`http://localhost:3000/admin/child/${id}`, {
//       headers: { 'Authorization': `Bearer ${token}` },
//     })
//       .then((response) => {
//         setMessage(response.data.message);
//         setChildren(children.filter(child => child._id !== id));
//       })
//       .catch((error) => {
//         console.error('Error deleting child:', error);
//         setMessage(error.response?.data?.message || 'Error deleting child');
//       });
//   };

//   // View Child Reports
//   const handleViewReports = (id) => {
//     const token = localStorage.getItem('admin_token');
//     if (!token) {
//       setMessage('Please log in again');
//       setIsLogin(true);
//       return;
//     }
//     axios.get(`http://localhost:3000/admin/child/${id}/reports`, {
//       headers: { 'Authorization': `Bearer ${token}` },
//     })
//       .then((response) => {
//         setReports(response.data);
//         setSelectedChild(id);
//       })
//       .catch((error) => {
//         console.error('Error fetching reports:', error);
//         setMessage(error.response?.data?.message || 'Error fetching reports');
//       });
//   };

//   // Update Child
//   const handleUpdateChild = (id) => {
//     const token = localStorage.getItem('admin_token');
//     if (!token) {
//       setMessage('Please log in again');
//       setIsLogin(true);
//       return;
//     }
//     if (!validateEmail(childData.email)) {
//       setMessage('Invalid email format');
//       return;
//     }
//     axios.put(`http://localhost:3000/admin/child/${id}`, childData, {
//       headers: { 'Authorization': `Bearer ${token}` },
//     })
//       .then((response) => {
//         setMessage(response.data.message);
//         setChildren(children.map(child =>
//           child._id === id ? { ...child, name: childData.name, email: childData.email } : child
//         ));
//         setChildData({ name: '', email: '' });
//       })
//       .catch((error) => {
//         console.error('Error updating child:', error);
//         setMessage(error.response?.data?.message || 'Error updating child');
//       });
//   };

//   // Populate child data for editing
//   const handleEditChild = (child) => {
//     setChildData({ name: child.name, email: child.email });
//     setSelectedChild(child._id);
//   };

//   return (
//     <div className="admin-container max-w-4xl mx-auto p-6 bg-gray-100 min-h-screen">
//       {isLogin ? (
//         <div className="login-form bg-white p-6 rounded shadow-md w-full max-w-md mx-auto">
//           <h2 className="text-2xl mb-4">Admin Login</h2>
//           <form onSubmit={handleLogin}>
//             <input
//               type="email"
//               placeholder="Email"
//               value={loginData.email}
//               onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
//               className="w-full p-2 mb-4 border rounded"
//               required
//             />
//             <input
//               type="password"
//               placeholder="Password"
//               value={loginData.password}
//               onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
//               className="w-full p-2 mb-4 border rounded"
//               required
//             />
//             <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded">Login</button>
//           </form>
//           {message && <p className="mt-4 text-red-500">{message}</p>}
//         </div>
//       ) : (
//         <div className="admin-dashboard">
//           <div className="flex justify-between items-center mb-6">
//             <h1 className="text-3xl">Admin Dashboard</h1>
//             <button
//               onClick={handleLogout}
//               className="bg-red-500 text-white p-2 rounded"
//             >
//               Logout
//             </button>
//           </div>

//           {/* Child Registration */}
//           <div className="child-registration mb-6 bg-white p-6 rounded shadow-md">
//             <h2 className="text-xl mb-4">Register New Child</h2>
//             <form onSubmit={handleChildRegistration}>
//               <input
//                 type="text"
//                 placeholder="Child Name"
//                 value={childData.name}
//                 onChange={(e) => setChildData({ ...childData, name: e.target.value })}
//                 className="w-full p-2 mb-4 border rounded"
//                 required
//               />
//               <input
//                 type="email"
//                 placeholder="Child Email"
//                 value={childData.email}
//                 onChange={(e) => setChildData({ ...childData, email: e.target.value })}
//                 className="w-full p-2 mb-4 border rounded"
//                 required
//               />
//               <button type="submit" className="bg-blue-500 text-white p-2 rounded">Register Child</button>
//             </form>
//             {newChildCredentials && (
//               <div className="mt-4 p-4 bg-green-100 rounded">
//                 <p>Child registered! Share these credentials:</p>
//                 <p><strong>User ID:</strong> {newChildCredentials.userId}</p>
//                 <p><strong>Password:</strong> {newChildCredentials.password}</p>
//               </div>
//             )}
//             {message && <p className="mt-4 text-red-500">{message}</p>}
//           </div>

//           {/* Child List */}
//           <div className="child-list mb-6">
//             <h2 className="text-xl mb-4">Registered Children</h2>
//             <table className="w-full bg-white shadow-md rounded">
//               <thead>
//                 <tr className="bg-gray-200">
//                   <th className="p-2">Name</th>
//                   <th className="p-2">Email</th>
//                   <th className="p-2">User ID</th>
//                   <th className="p-2">Status</th>
//                   <th className="p-2">Actions</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {children.map((child) => (
//                   <tr key={child._id}>
//                     <td className="p-2">{child.name}</td>
//                     <td className="p-2">{child.email}</td>
//                     <td className="p-2">{child.userId}</td>
//                     <td className="p-2">{child.active ? 'Active' : 'Disabled'}</td>
//                     <td className="p-2">
//                       <button
//                         onClick={() => handleToggleChild(child._id)}
//                         className="bg-yellow-500 text-white p-1 rounded mr-2"
//                       >
//                         {child.active ? 'Disable' : 'Enable'}
//                       </button>
//                       <button
//                         onClick={() => handleDeleteChild(child._id)}
//                         className="bg-red-500 text-white p-1 rounded mr-2"
//                       >
//                         Delete
//                       </button>
//                       <button
//                         onClick={() => handleViewReports(child._id)}
//                         className="bg-green-500 text-white p-1 rounded mr-2"
//                       >
//                         View Reports
//                       </button>
//                       <button
//                         onClick={() => handleEditChild(child)}
//                         className="bg-blue-500 text-white p-1 rounded"
//                       >
//                         Edit
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>

//           {/* Update Child Form */}
//           {selectedChild && !reports.length && (
//             <div className="child-update mb-6 bg-white p-6 rounded shadow-md">
//               <h2 className="text-xl mb-4">Update Child</h2>
//               <form onSubmit={(e) => { e.preventDefault(); handleUpdateChild(selectedChild); }}>
//                 <input
//                   type="text"
//                   placeholder="Child Name"
//                   value={childData.name}
//                   onChange={(e) => setChildData({ ...childData, name: e.target.value })}
//                   className="w-full p-2 mb-4 border rounded"
//                   required
//                 />
//                 <input
//                   type="email"
//                   placeholder="Child Email"
//                   value={childData.email}
//                   onChange={(e) => setChildData({ ...childData, email: e.target.value })}
//                   className="w-full p-2 mb-4 border rounded"
//                   required
//                 />
//                 <button type="submit" className="bg-blue-500 text-white p-2 rounded">Update Child</button>
//               </form>
//             </div>
//           )}

//           {/* Reports */}
//           {selectedChild && reports.length > 0 && (
//             <div className="child-reports bg-white p-6 rounded shadow-md">
//               <h2 className="text-xl mb-4">Emotion Reports</h2>
//               <table className="w-full">
//                 <thead>
//                   <tr className="bg-gray-200">
//                     <th className="p-2">Emotion</th>
//                     <th className="p-2">Score</th>
//                     <th className="p-2">Date</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {reports.map((report, index) => (
//                     <tr key={index}>
//                       <td className="p-2">{report.emotion}</td>
//                       <td className="p-2">{report.score}</td>
//                       <td className="p-2">{new Date(report.date).toLocaleString()}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//               <button
//                 onClick={() => setReports([])}
//                 className="mt-4 bg-gray-500 text-white p-2 rounded"
//               >
//                 Back to Child List
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Admin;










import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import '../styles/Admin.css';

const socket = io("http://localhost:3000");

const AdminDashboard = () => {
    const [children, setChildren] = useState([]);
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [generatedCode, setGeneratedCode] = useState('');

    useEffect(() => {
        fetchChildren();

        socket.on("newChild", fetchChildren);
        socket.on("updateChildren", fetchChildren);

        return () => {
            socket.off("newChild", fetchChildren);
            socket.off("updateChildren", fetchChildren);
        };
    }, []);

    const fetchChildren = async () => {
        try {
            const res = await fetch('http://localhost:3000/children');
            const data = await res.json();
            setChildren(data);
        } catch (error) {
            console.error("Error fetching children:", error);
        }
    };

    const handleRegister = async () => {
        if (!name || !phone || !/^\d{10}$/.test(phone)) {
            alert('Please enter a valid name and 10-digit phone number.');
            return;
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        setGeneratedCode(code);

        try {
            const res = await fetch('http://localhost:3000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, userId: code })
            });

            if (!res.ok) throw new Error('Registration failed');
            alert('Child registered successfully!');
            setName('');
            setPhone('');
        } catch (error) {
            console.error(error);
            alert('Failed to register child.');
        }
    };

    return (
        <div className="admin-container">
            <div className="sidebar">
                <div className="logo">Admin Dashboard</div>
                <ul>
                    <li className="active"><a href="#">Dashboard</a></li>
                    <li><a href="#">Users</a></li>
                    <li><a href="#">Settings</a></li>
                </ul>
                <div className="profile">
                    <img src="profile.jpg" alt="User Profile" />
                    <div className="username">John Doe</div>
                    <div className="email">johndoe@example.com</div>
                </div>
            </div>

            <div className="main-content">
                <nav className="top-nav">
                    <div className="search-container">
                        <input type="text" placeholder="Search..." className="search-input" />
                    </div>
                    <span>{new Date().toLocaleDateString()}</span>
                </nav>

                <div className="dashboard">
                    <h2><b>Latest Reports</b></h2>
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>User ID</th>
                                <th>Registered At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {children.map(child => (
                                <tr key={child._id}>
                                    <td>{child.name}</td>
                                    <td>{child.phone}</td>
                                    <td>{child.userId}</td>
                                    <td>{new Date(child.registeredAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="registration">
                        <h3>Register a Child</h3>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
                        <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone Number" />
                        <button className="btn btn-primary" onClick={handleRegister}>Register</button>
                        {generatedCode && (
                            <p className="text-success">
                                Generated Code: <span>{generatedCode}</span>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
