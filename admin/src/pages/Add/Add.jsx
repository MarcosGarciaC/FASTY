import React, { useState, useEffect } from 'react';
import './Add.css';
import axios from 'axios';
import { toast } from 'react-toastify';

const Add = ({ url }) => {
  const [image, setImage] = useState(null);
  const [data, setData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Almuerzo",
    ingredients: "",
    is_available: true,
    preparation_time: "",
    daily_quantity: "",
    cafeteria_id: ""
  });

  useEffect(() => {
    const fetchCafeteriaId = async () => {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        toast.error("User ID not found");
        return;
      }

      try {
        const response = await axios.get(`${url}/api/cafetin/by-owner/${userId}`);
        if (response.data.success) {
          setData(prev => ({
            ...prev,
            cafeteria_id: response.data.data._id
          }));
        } else {
          toast.error("No cafeteria found for this user");
        }
      } catch (error) {
        console.error("Error fetching cafeteria:", error);
        toast.error("Error getting cafeteria ID");
      }
    };

    fetchCafeteriaId();
  }, [url]);

  const onChangeHandler = (event) => {
    const { name, value, type, checked } = event.target;
    setData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("price", Number(data.price));
    formData.append("category", data.category);
    formData.append("ingredients", data.ingredients);
    formData.append("is_available", data.is_available);
    formData.append("preparation_time", data.preparation_time);
    formData.append("daily_quantity", data.daily_quantity);
    formData.append("cafeteria_id", data.cafeteria_id);
    formData.append("image", image);

    try {
      const response = await axios.post(`${url}/api/food/add`, formData);
      if (response.data.success) {
        setData({
          name: "",
          description: "",
          price: "",
          category: "Almuerzo",
          ingredients: "",
          is_available: true,
          preparation_time: "",
          daily_quantity: "",
          cafeteria_id: data.cafeteria_id
        });
        setImage(null);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || "Error adding food");
      }
    } catch (error) {
      toast.error("Request failed");
      console.error(error);
    }
  };

  return (
    <div className="add-form-container">
      <form className="food-form" onSubmit={onSubmitHandler}>
        <h2>Add New Food Item</h2>
        
        <div className="form-group image-upload">
          <label>Upload Image</label>
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
              onChange={(e) => setImage(e.target.files[0])}
              type="file"
              id="image"
              required
              hidden
            />
          </div>
        </div>

        <div className="form-group">
          <label>Product Name</label>
          <input 
            onChange={onChangeHandler} 
            value={data.name} 
            type="text" 
            name="name" 
            placeholder="e.g. Fried Chicken" 
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            rows="3"
            placeholder="Describe the dish..."
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <select onChange={onChangeHandler} value={data.category} name="category">
              <option value="Almuerzo">Lunch</option>
              <option value="Bebida">Drinks</option>
              <option value="Snack">Salad</option>
            </select>
          </div>
          <div className="form-group">
            <label>Price</label>
            <input 
              onChange={onChangeHandler} 
              value={data.price} 
              type="number" 
              name="price" 
              placeholder="e.g. 50" 
            />
          </div>
        </div>

        <div className="form-group">
          <label>Ingredients</label>
          <textarea
            onChange={onChangeHandler}
            value={data.ingredients}
            name="ingredients"
            rows="2"
            placeholder="e.g. rice, chicken, salad"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Prep Time (min)</label>
            <input
              onChange={onChangeHandler}
              value={data.preparation_time}
              type="number"
              name="preparation_time"
              placeholder="e.g. 15"
            />
          </div>
          <div className="form-group">
            <label>Daily Quantity</label>
            <input
              onChange={onChangeHandler}
              value={data.daily_quantity}
              type="number"
              name="daily_quantity"
              placeholder="e.g. 30"
            />
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
            Available
          </label>
        </div>

        <input
          type="hidden"
          value={data.cafeteria_id}
          name="cafeteria_id"
        />

        <button type="submit" className="submit-btn">Add Item</button>
      </form>
    </div>
  );
};

export default Add;