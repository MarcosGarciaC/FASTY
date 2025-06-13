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
    if (!userId) return toast.error("ID de usuario no encontrado");
    try {
      const caf = await axios.get(`${url}/api/cafetin/by-owner/${userId}`);
      if (!caf.data.success) return toast.error("Cafetería no encontrada");
      const foods = await axios.get(`${url}/api/food/list/by-cafeteria/${caf.data.data._id}`);
      if (foods.data.success) setList(foods.data.data);
    } catch (e) {
      console.error(e);
      toast.error("Error cargando comidas");
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
        toast.error("Error actualizando comida");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error actualizando comida");
    }
  };

  const removeFood = async (id) => {
    try {
      const res = await axios.post(`${url}/api/food/remove`, { id });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchList();
      } else toast.error("Error al eliminar comida");
    } catch (e) {
      console.error(e);
      toast.error("Error al eliminar comida");
    }
  };

  const handleChange = (e, key) => {
    setFormData(prev => ({ ...prev, [key]: e.target.value }));
  };

  const handleImage = e => setImageFile(e.target.files[0]);

  return (
    <div className="list-container">
      <h1>📦 Menú del Cafetín</h1>
      <div className="cards">
        {list.map(food => (
          <div key={food._id} className="food-card">
            {editingId === food._id ? (
              <>
                <div className="card-header">
                  <h3>Editar: {food.name}</h3>
                </div>
                <div className="card-body">
                  <label>Imagen:</label>
                  <img src={`${url}/images/${food.image}`} alt={food.name} />
                  <input type="file" accept="image/*" onChange={handleImage} />

                  <label>Nombre:</label>
                  <input value={formData.name} onChange={(e) => handleChange(e, 'name')} />

                  <label>Categoría:</label>
                  <input value={formData.category} onChange={(e) => handleChange(e, 'category')} />

                  <label>Precio:</label>
                  <input type="number" value={formData.price} onChange={(e) => handleChange(e, 'price')} />

                  <label>Descripción:</label>
                  <textarea value={formData.description} onChange={(e) => handleChange(e, 'description')} />

                  <label>Ingredientes:</label>
                  <textarea value={formData.ingredients} onChange={(e) => handleChange(e, 'ingredients')} />

                  <div className="card-actions">
                    <button onClick={saveEdit} className="btn-save">💾 Guardar</button>
                    <button onClick={cancelEdit} className="btn-cancel">✖ Cancelar</button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="card-header">
                  <h3>{food.name}</h3>
                  <span className="price-tag">${food.price.toFixed(2)}</span>
                </div>
                <div className="card-body">
                  <img src={`${url}/images/${food.image}`} alt={food.name} />

                  <p><strong>Categoría:</strong> {food.category}</p>
                  <p><strong>Descripción:</strong> {food.description}</p>
                  <p><strong>Ingredientes:</strong> {food.ingredients.join(", ")}</p>

                  <div className="card-actions">
                    <button onClick={() => startEdit(food)} className="btn-edit">✎ Editar</button>
                    <button onClick={() => removeFood(food._id)} className="btn-delete">🗑 Eliminar</button>
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
