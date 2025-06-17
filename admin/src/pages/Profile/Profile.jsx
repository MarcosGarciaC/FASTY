// src/pages/Profile/Profile.jsx
import React, { useState, useEffect, useContext } from 'react';
import './Profile.css';
import { AuthContext } from '../../Context/AuthContext';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const Profile = () => {
  const { auth } = useContext(AuthContext);
  const cafeteriaId = localStorage.getItem("user_id");
  const [cafetinId, setCafetinId] = useState(null);
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [passwordData, setPasswordData] = useState({
    email: auth.user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const [cafeData, setCafeData] = useState({
    name: '',
    description: '',
    location: '',
    logo: '',
    schedule: '',
    phone: '',
    status: 'active',
    prepTime: 15,
    maxOrders: 20,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  useEffect(() => {
    const fetchCafetin = async () => {
      try {
        const res = await fetch(`${API_URL}/api/cafetin/by-owner/${cafeteriaId}`);
        const data = await res.json();
        if (data.success && data.data) {
          const c = data.data;
          setCafetinId(c._id);
          setCafeData({
            name: c.name || '',
            description: c.description || '',
            location: c.location || '',
            logo: c.logo,
            schedule: c.opening_hours || '',
            phone: c.contact_phone || '',
            status: c.status || 'active',
            prepTime: c.order_preparation_time || 15,
            maxOrders: c.max_orders_per_time || 20,
          });
        }
      } catch (err) {
        console.error('Error loading cafetin:', err);
      }
    };
    fetchCafetin();
  }, [auth.user._id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCafeData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImageFile(file);
    setCafeData((prev) => ({ ...prev, logo: file ? URL.createObjectURL(file) : '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData();
      formData.append('name', cafeData.name);
      formData.append('description', cafeData.description);
      formData.append('location', cafeData.location);
      formData.append('opening_hours', cafeData.schedule);
      formData.append('contact_phone', cafeData.phone);
      formData.append('status', cafeData.status);
      formData.append('order_preparation_time', cafeData.prepTime);
      formData.append('max_orders_per_time', cafeData.maxOrders);
      if (selectedImageFile) {
        formData.append('logo', selectedImageFile);
      }

      const res = await fetch(`${API_URL}/api/cafetin/update/${cafetinId}`, {
        method: 'PUT',
        body: formData
      });

      const result = await res.json();
      if (result.success) {
        console.log('Cafetin updated:', result.data);
        setIsEditing(false);
      } else {
        console.error('Update failed:', result.message);
      }
    } catch (error) {
      console.error('Error updating cafetin:', error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/user/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({
          email: passwordData.email,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      const result = await res.json();
      if (result.success) {
        setPasswordSuccess('Password updated successfully');
        setPasswordData({
          email: auth.user?.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsEditingPassword(false);
      } else {
        setPasswordError(result.message);
      }
    } catch (error) {
      setPasswordError('Error updating password');
      console.error('Error updating password:', error);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Café Profile</h2>
        {!isEditing ? (
          <button className="edit-button" onClick={() => setIsEditing(true)}>Edit Profile</button>
        ) : (
          <button className="cancel-button" onClick={() => setIsEditing(false)}>Cancel</button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="profile-photo-section">
          <div className="profile-photo">
            <img 
              src={cafeData.logo || 'https://via.placeholder.com/150'} 
              alt="Profile" 
              className={cafeData.logo ? '' : 'placeholder'}
            />
            {isEditing && (
              <div className="photo-upload">
                <label className="upload-button">
                  Change Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Café Name</label>
            <input type="text" name="name" value={cafeData.name} onChange={handleChange} disabled={!isEditing} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input type="text" name="description" value={cafeData.description} onChange={handleChange} disabled={!isEditing} />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input type="text" name="location" value={cafeData.location} onChange={handleChange} disabled={!isEditing} />
          </div>
          
          <div className="form-group">
            <label>Phone</label>
            <input type="text" name="phone" value={cafeData.phone} onChange={handleChange} disabled={!isEditing} />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={cafeData.status} onChange={handleChange} disabled={!isEditing}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="form-group">
            <label>Prep Time (minutes)</label>
            <input type="number" name="prepTime" value={cafeData.prepTime} onChange={handleChange} disabled={!isEditing} />
          </div>
          <div className="form-group">
            <label>Max Orders</label>
            <input type="number" name="maxOrders" value={cafeData.maxOrders} onChange={handleChange} disabled={!isEditing} />
          </div>
        </div>

        {isEditing && (
          <div className="form-actions">
            <button type="submit" className="save-button">Save Changes</button>
          </div>
        )}
      </form>

      <div className="password-section">
        <div className="profile-header">
          <h2>Update Password</h2>
          {!isEditingPassword ? (
            <button className="edit-button" onClick={() => setIsEditingPassword(true)}>Change Password</button>
          ) : (
            <button className="cancel-button" onClick={() => {
              setIsEditingPassword(false);
              setPasswordData({
                email: auth.user?.email || '',
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
              });
              setPasswordError('');
              setPasswordSuccess('');
            }}>Cancel</button>
          )}
        </div>

        {isEditingPassword && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={passwordData.email}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
            </div>
            {passwordError && <p className="error-message">{passwordError}</p>}
            {passwordSuccess && <p className="success-message">{passwordSuccess}</p>}
            <div className="form-actions">
              <button type="submit" className="save-button">Update Password</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;