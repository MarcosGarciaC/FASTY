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
    </div>
  );
};

export default Profile;
