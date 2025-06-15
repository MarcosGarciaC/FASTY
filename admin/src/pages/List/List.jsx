import React, { useEffect, useState } from 'react';
import './List.css';
import axios from "axios";
import { toast } from "react-toastify";

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    fetchList();
  }, []);

const fetchList = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) return toast.error("User ID not found");
    try {
      const caf = await axios.get(`${url}/api/cafetin/by-owner/${userId}`);
      if (!caf.data.success) return toast.error("Cafeteria not found");
      // Save cafeteria_id to localStorage
      localStorage.setItem("cafeteria_id", caf.data.data._id);
      const foods = await axios.get(`${url}/api/food/list/by-cafeteria/${caf.data.data._id}`);
      if (foods.data.success) setList(foods.data.data);
    } catch (e) {
      console.error(e);
      toast.error("Error loading foods");
    }
  };

  const startEdit = (food) => {
    setEditingId(food._id);
    setFormData({ ...food, ingredients: food.ingredients.join(", ") });
    setImageFile(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({});
    setImageFile(null);
  };

  const saveEdit = async () => {
    try {
      const fd = new FormData();
      fd.append("id", formData._id);
      ["name", "category", "price", "description"].forEach(key => fd.append(key, formData[key]));
      fd.append("ingredients", JSON.stringify(formData.ingredients.split(",").map(s => s.trim())));
      if (imageFile) fd.append("image", imageFile);

      const res = await axios.put(`${url}/api/food/update`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        cancelEdit();
        fetchList();
      } else {
        toast.error("Error updating food");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error updating food");
    }
  };

  const removeFood = async (id) => {
    try {
      const res = await axios.post(`${url}/api/food/remove`, { id });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchList();
      } else toast.error("Error deleting food");
    } catch (e) {
      console.error(e);
      toast.error("Error deleting food");
    }
  };

  const handleChange = (e, key) => {
    setFormData(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleImage = e => setImageFile(e.target.files[0]);

  return (
    <div className="list-container">
      <h1>Menu Items</h1>
      <div className="food-grid">
        {list.map(food => (
          <div key={food._id} className="food-card">
            {editingId === food._id ? (
              <div className="edit-form">
                <div className="form-header">
                  <h3>Edit: {food.name}</h3>
                </div>
                <div className="form-body">
                  <div className="form-group">
                    <label>Image</label>
                    <img src={`${url}/images/${food.image}`} alt={food.name} />
                    <input type="file" accept="image/*" onChange={handleImage} />
                  </div>

                  <div className="form-group">
                    <label>Name</label>
                    <input value={formData.name} onChange={(e) => handleChange(e, 'name')} />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <input value={formData.category} onChange={(e) => handleChange(e, 'category')} />
                  </div>

                  <div className="form-group">
                    <label>Price</label>
                    <input type="number" value={formData.price} onChange={(e) => handleChange(e, 'price')} />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea value={formData.description} onChange={(e) => handleChange(e, 'description')} />
                  </div>

                  <div className="form-group">
                    <label>Ingredients</label>
                    <textarea value={formData.ingredients} onChange={(e) => handleChange(e, 'ingredients')} />
                  </div>

                  <div className="form-actions">
                    <button onClick={saveEdit} className="save-btn">Save</button>
                    <button onClick={cancelEdit} className="cancel-btn">Cancel</button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="card-header">
                  <h3>{food.name}</h3>
                  <span className="price">${food.price.toFixed(2)}</span>
                </div>
                <div className="card-body">
                  <img src={`${url}/images/${food.image}`} alt={food.name} />
                  <div className="card-details">
                    <p><span>Category:</span> {food.category}</p>
                    <p><span>Description:</span> {food.description}</p>
                    <p><span>Ingredients:</span> {food.ingredients.join(", ")}</p>
                  </div>
                  <div className="card-actions">
                    <button onClick={() => startEdit(food)} className="edit-btn">Edit</button>
                    <button onClick={() => removeFood(food._id)} className="delete-btn">Delete</button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;