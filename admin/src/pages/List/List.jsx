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
      localStorage.setItem("cafeteria_id", caf.data.data._id);
      const foods = await axios.get(`${url}/api/food/list/by-cafeteria/${caf.data.data._id}`);
      if (foods.data.success) {
        console.log("Fetched foods:", foods.data.data);
        setList(foods.data.data);
      }
    } catch (e) {
      console.error("Fetch list error:", e);
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
      console.error("Save edit error:", e);
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
      console.error("Remove food error:", e);
      toast.error("Error deleting food");
    }
  };

  const handleChange = (e, key) => {
    setFormData(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleImage = e => {
    const file = e.target.files[0];
    if (file) {
      console.log("Selected image:", { name: file.name, size: file.size, type: file.type });
      setImageFile(file);
    }
  };

  return (
    <div className="list-container">
      <h1>Menú Items</h1>
      <div className="food-grid">
        {list.map(food => (
          <div key={food._id} className="food-card">
            {editingId === food._id ? (
              <div className="edit-form">
                <div className="form-header">
                  <h3>Editar: {food.name}</h3>
                </div>
                <div className="form-body">
                  <div className="form-group">
                    <label>Imagen</label>
                    {food.image ? (
                      <img src={food.image} alt={food.name} className="edit-image-preview" />
                    ) : (
                      <p>No image available</p>
                    )}
                    <input type="file" accept="image/*" onChange={handleImage} />
                  </div>

                  <div className="form-group">
                    <label>Nombre</label>
                    <input value={formData.name} onChange={(e) => handleChange(e, 'name')} />
                  </div>

                  <div className="form-group">
                    <label>Categoria</label>
                    <input value={formData.category} onChange={(e) => handleChange(e, 'category')} />
                  </div>

                  <div className="form-group">
                    <label>Precio</label>
                    <input type="number" value={formData.price} onChange={(e) => handleChange(e, 'price')} />
                  </div>

                  <div className="form-group">
                    <label>Descripción</label>
                    <textarea value={formData.description} onChange={(e) => handleChange(e, 'description')} />
                  </div>

                  <div className="form-group">
                    <label>Ingredientes</label>
                    <textarea value={formData.ingredients} onChange={(e) => handleChange(e, 'ingredients')} />
                  </div>

                  <div className="form-actions">
                    <button onClick={saveEdit} className="save-btn">Actualizar</button>
                    <button onClick={cancelEdit} className="cancel-btn">Cancelar</button>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div className="card-header">
                  <h3>{food.name}</h3>
                  <span className="price">C${food.price.toFixed(2)}</span>
                </div>
                <div className="card-body">
                  {food.image ? (
                    <img src={food.image} alt={food.name} className="food-image" />
                  ) : (
                    <p>No image available</p>
                  )}
                  <div className="card-details">
                    <p><span>Categoria:</span> {food.category}</p>
                    <p><span>Descripción:</span> {food.description}</p>
                    <p><span>Ingredientes:</span> {food.ingredients.join(", ")}</p>
                  </div>
                  <div className="card-actions">
                    <button onClick={() => startEdit(food)} className="edit-btn">Editar</button>
                    <button onClick={() => removeFood(food._id)} className="delete-btn">Eliminar</button>
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