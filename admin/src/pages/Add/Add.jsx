import React, { useState, useEffect } from 'react';
import './Add.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Add = ({ url }) => {
  const [image, setImage] = useState(null);
  const [data, setData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Almuerzo',
    ingredients: '',
    is_available: true,
    preparation_time: '',
    daily_quantity: '',
    cafeteria_id: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCafeteriaId = async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        toast.error('User ID not found');
        return;
      }

      try {
        const response = await axios.get(`${url}/api/cafetin/by-owner/${userId}`);
        if (response.data.success) {
          setData((prev) => ({
            ...prev,
            cafeteria_id: response.data.data._id,
          }));
        } else {
          toast.error('No cafeteria found for this user');
        }
      } catch (error) {
        console.error('Error fetching cafeteria:', error);
        toast.error('Error getting cafeteria ID');
      }
    };

    fetchCafeteriaId();
  }, [url]);

  const validateForm = () => {
    const newErrors = {};

    // Image validation
    if (!image) {
      newErrors.image = 'Image is required';
    } else if (!['image/jpeg', 'image/png', 'image/jpg'].includes(image.type)) {
      newErrors.image = 'Only JPEG, JPG, or PNG images are allowed';
    } else if (image.size > 5 * 1024 * 1024) {
      newErrors.image = 'Image size must be less than 5MB';
    }

    // Name validation
    if (!data.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (data.name.length < 3 || data.name.length > 100) {
      newErrors.name = 'Name must be between 3 and 100 characters';
    }

    // Description validation (optional, only check max length)
    if (data.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    // Price validation
    const price = Number(data.price);
    if (!data.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(price) || price <= 0) {
      newErrors.price = 'Price must be a positive number';
    }

    // Category validation
    const validCategories = ['Almuerzo', 'Bebida', 'Ensalada', 'Reposteria'];
    if (!validCategories.includes(data.category)) {
      newErrors.category = 'Invalid category selected';
    }

    // Ingredients validation (optional, only check max length)
    if (data.ingredients.length > 300) {
      newErrors.ingredients = 'Ingredients must be less than 300 characters';
    }

    // Preparation time validation
    const prepTime = Number(data.preparation_time);
    if (!data.preparation_time) {
      newErrors.preparation_time = 'Preparation time is required';
    } else if (isNaN(prepTime) || prepTime <= 0 || prepTime > 120) {
      newErrors.preparation_time = 'Preparation time must be a positive number between 1 and 120 minutes';
    }

    // Daily quantity validation
    const quantity = Number(data.daily_quantity);
    if (!data.daily_quantity) {
      newErrors.daily_quantity = 'Daily quantity is required';
    } else if (isNaN(quantity) || quantity <= 0 || quantity > 1000) {
      newErrors.daily_quantity = 'Daily quantity must be a positive number between 1 and 1000';
    }

    // Cafeteria ID validation
    if (!data.cafeteria_id) {
      newErrors.cafeteria_id = 'Cafeteria ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onChangeHandler = (event) => {
    const { name, value, type, checked } = event.target;
    setData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error for field on change
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('description', data.description);
    formData.append('price', Number(data.price));
    formData.append('category', data.category);
    formData.append('ingredients', data.ingredients);
    formData.append('is_available', data.is_available);
    formData.append('preparation_time', data.preparation_time);
    formData.append('daily_quantity', data.daily_quantity);
    formData.append('cafeteria_id', data.cafeteria_id);
    formData.append('image', image);

    try {
      const response = await axios.post(`${url}/api/food/add`, formData);
      if (response.data.success) {
        setData({
          name: '',
          description: '',
          price: '',
          category: 'Almuerzo',
          ingredients: '',
          is_available: true,
          preparation_time: '',
          daily_quantity: '',
          cafeteria_id: data.cafeteria_id,
        });
        setImage(null);
        setErrors({});
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || 'Error adding food');
      }
    } catch (error) {
      toast.error('Request failed');
      console.error(error);
    }
  };

  return (
    <div className="add-form-container">
      <form className="food-form" onSubmit={onSubmitHandler}>
        <h2>Agrega una nueva comida</h2>

        <div className="form-group image-upload">
          <label>Sube tu imagen</label>
          <div className="image-preview">
            <label htmlFor="image">
              {image ? (
                <img src={URL.createObjectURL(image)} alt="preview" />
              ) : (
                <div className="upload-placeholder">
                  <i className="fa-solid fa-cloud-arrow-up fa-4x"></i>
                </div>
              )}
            </label>
            <input
              onChange={(e) => {
                setImage(e.target.files[0]);
                setErrors((prev) => ({ ...prev, image: '' }));
              }}
              type="file"
              id="image"
              accept="image/jpeg,image/png,image/jpg"
              hidden
            />
          </div>
          {errors.image && <span className="error">{errors.image}</span>}
        </div>

        <div className="form-group">
          <label>Nombre del producto</label>
          <input
            onChange={onChangeHandler}
            value={data.name}
            type="text"
            name="name"
            placeholder="e.g. Fried Chicken"
          />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label>Descripción (opcional)</label>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            rows="3"
            placeholder="Describe the dish..."
          />
          {errors.description && <span className="error">{errors.description}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Categoria</label>
            <select onChange={onChangeHandler} value={data.category} name="category">
              <option value="Almuerzo">Almuerzo</option>
              <option value="Bebida">Bebida</option>
              <option value="Ensalada">Ensalada</option>
              <option value="Reposteria">Reposteria</option>
            </select>
            {errors.category && <span className="error">{errors.category}</span>}
          </div>
          <div className="form-group">
            <label>Precio</label>
            <input
              onChange={onChangeHandler}
              value={data.price}
              type="number"
              name="price"
              placeholder="e.g. 50"
              step="0.01"
            />
            {errors.price && <span className="error">{errors.price}</span>}
          </div>
        </div>

        <div className="form-group">
          <label>Ingredientes (opcional)</label>
          <textarea
            onChange={onChangeHandler}
            value={data.ingredients}
            name="ingredients"
            rows="2"
            placeholder="e.g. rice, chicken, salad"
          />
          {errors.ingredients && <span className="error">{errors.ingredients}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Tiempo de preparación (min)</label>
            <input
              onChange={onChangeHandler}
              value={data.preparation_time}
              type="number"
              name="preparation_time"
              placeholder="e.g. 15"
            />
            {errors.preparation_time && <span className="error">{errors.preparation_time}</span>}
          </div>
          <div className="form-group">
            <label>Cantidad Diaria</label>
            <input
              onChange={onChangeHandler}
              value={data.daily_quantity}
              type="number"
              name="daily_quantity"
              placeholder="e.g. 30"
            />
            {errors.daily_quantity && <span className="error">{errors.daily_quantity}</span>}
          </div>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="is_available"
              checked={data.is_available}
              onChange={onChangeHandler}
            />
            Disponible
          </label>
        </div>

        <input type="hidden" value={data.cafeteria_id} name="cafeteria_id" />
        {errors.cafeteria_id && <span className="error">{errors.cafeteria_id}</span>}

        <button type="submit" className="submit-btn">Agregar Item</button>
      </form>
    </div>
  );
};

export default Add;