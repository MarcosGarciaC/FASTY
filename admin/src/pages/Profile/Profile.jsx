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
  const [formError, setFormError] = useState('');
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

  const [passwordData, setPasswordData] = useState({
    email: auth.user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
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

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar,
      errors: [
        !minLength && 'La contraseña debe tener al menos 8 caracteres.',
        !hasUppercase && 'La contraseña debe incluir al menos una letra mayúscula.',
        !hasLowercase && 'La contraseña debe incluir al menos una letra minúscula.',
        !hasNumber && 'La contraseña debe incluir al menos un número.',
        !hasSpecialChar && 'La contraseña debe incluir al menos un carácter especial.'
      ].filter(Boolean)
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validación de campos vacíos
    const requiredFields = ['name', 'description', 'location', 'schedule', 'phone', 'status', 'prepTime', 'maxOrders'];
    const emptyField = requiredFields.find(field => cafeData[field] === '' || cafeData[field] === null);
    if (emptyField) {
      setFormError(`Por favor completa el campo "${emptyField}".`);
      return;
    }

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
        setFormError(result.message || 'Error al actualizar el perfil.');
      }
    } catch (error) {
      setFormError('Error al actualizar el perfil.');
      console.error('Error updating cafetin:', error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const { email, currentPassword, newPassword, confirmPassword } = passwordData;
    if (!email || !currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Por favor completa todos los campos de contraseña.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Las nuevas contraseñas no coinciden.');
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setPasswordError(validation.errors.join(' '));
      return;
    }

    try {
      const res = await fetch(`${API_URL}/api/user/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
        body: JSON.stringify({ email, currentPassword, newPassword })
      });

      const result = await res.json();
      if (result.success) {
        setPasswordSuccess('¡Contraseña actualizada con éxito!');
        setPasswordData({
          email: auth.user?.email || '',
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        setIsEditingPassword(false);
      } else {
        setPasswordError(result.message || 'Error al actualizar la contraseña.');
      }
    } catch (error) {
      setPasswordError('Error al actualizar la contraseña.');
      console.error('Error updating password:', error);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>Perfil del Café</h2>
        {!isEditing ? (
          <button className="edit-button" onClick={() => setIsEditing(true)}>Editar Perfil</button>
        ) : (
          <button className="cancel-button" onClick={() => {
            setIsEditing(false);
            setFormError('');
          }}>Cancelar</button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="profile-photo-section">
          <div className="profile-photo">
            <img 
              src={cafeData.logo || 'https://via.placeholder.com/150'} 
              alt="Perfil" 
              className={cafeData.logo ? '' : 'placeholder'}
            />
            {isEditing && (
              <div className="photo-upload">
                <label className="upload-button">
                  Cambiar Foto
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
            <label>Nombre del Café</label>
            <input type="text" name="name" value={cafeData.name} onChange={handleChange} disabled={!isEditing} />
          </div>
          <div className="form-group">
            <label>Descripción</label>
            <input type="text" name="description" value={cafeData.description} onChange={handleChange} disabled={!isEditing} />
          </div>
          <div className="form-group">
            <label>Ubicación</label>
            <input type="text" name="location" value={cafeData.location} onChange={handleChange} disabled={!isEditing} />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input type="text" name="phone" value={cafeData.phone} onChange={handleChange} disabled={!isEditing} />
          </div>
          <div className="form-group">
            <label>Estado</label>
            <select name="status" value={cafeData.status} onChange={handleChange} disabled={!isEditing}>
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
          <div className="form-group">
            <label>Tiempo de Preparación (minutos)</label>
            <input type="number" name="prepTime" value={cafeData.prepTime} onChange={handleChange} disabled={!isEditing} />
          </div>
          <div className="form-group">
            <label>Pedidos Máximos</label>
            <input type="number" name="maxOrders" value={cafeData.maxOrders} onChange={handleChange} disabled={!isEditing} />
          </div>
        </div>

        {formError && <p className="error-message">{formError}</p>}

        {isEditing && (
          <div className="form-actions">
            <button type="submit" className="save-button">Guardar Cambios</button>
          </div>
        )}
      </form>

      <div className="password-section">
        <div className="profile-header">
          <h2>Actualizar Contraseña</h2>
          {!isEditingPassword ? (
            <button className="edit-button" onClick={() => setIsEditingPassword(true)}>Cambiar Contraseña</button>
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
            }}>Cancelar</button>
          )}
        </div>

        {isEditingPassword && (
          <form onSubmit={handlePasswordSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  name="email"
                  value={passwordData.email}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Contraseña Actual</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nueva Contraseña</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  required
                />
              </div>
            </div>
            {passwordError && (
              <div className="password-error-message">
                <p>{passwordError}</p>
              </div>
            )}
            {passwordSuccess && (
              <div className="password-success-message">
                <p>{passwordSuccess}</p>
              </div>
            )}
            <div className="form-actions">
              <button type="submit" className="save-button">Actualizar Contraseña</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;