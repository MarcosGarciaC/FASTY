import React, { useEffect, useState } from 'react';
import './List.css';
import axios from "axios";
import { toast } from "react-toastify";

const List = ({ url }) => {
  const [list, setList] = useState([]);
  const [editingFoodId, setEditingFoodId] = useState(null);
  const [editedData, setEditedData] = useState({});

  const fetchList = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      toast.error("No se encontró el ID del usuario en localStorage");
      return;
    }

    try {
      const cafeteriaRes = await axios.get(`${url}/api/cafetin/by-owner/${userId}`);
      if (!cafeteriaRes.data.success || !cafeteriaRes.data.data) {
        toast.error("No se encontró la cafetería del usuario");
        return;
      }

      const cafeteriaId = cafeteriaRes.data.data._id;
      const response = await axios.get(`${url}/api/food/list/by-cafeteria/${cafeteriaId}`);

      if (response.data.success) {
        setList(response.data.data);
      } else {
        toast.error("Error al obtener la lista de comidas");
      }

    } catch (error) {
      console.error(error);
      toast.error("Error al cargar los datos");
    }
  };

  const removeFood = async (foodId) => {
    try {
      const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
      if (response.data.success) {
        toast.success(response.data.message);
        fetchList();
      } else {
        toast.error("Error al eliminar");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al eliminar");
    }
  };

  const startEdit = (food) => {
    setEditingFoodId(food._id);
    setEditedData({ ...food });
  };

  const cancelEdit = () => {
    setEditingFoodId(null);
    setEditedData({});
  };

  const saveEdit = async () => {
    try {
      const response = await axios.put(`${url}/api/food/update`, editedData);
      if (response.data.success) {
        toast.success(response.data.message);
        setEditingFoodId(null);
        fetchList();
      } else {
        toast.error("Error al guardar");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar");
    }
  };

  const handleChange = (e, key) => {
    setEditedData(prev => ({ ...prev, [key]: e.target.value }));
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div>
      <div className='list add flex-col'>
        <p>Lista de comidas del cafetín</p>
        <div className='list-table'>
          <div className="list-table-format title">
            <b>Imagen</b>
            <b>Nombre</b>
            <b>Categoría</b>
            <b>Precio</b>
            <b>Descripción</b>
            <b>Acciones</b>
          </div>
          {list.map((item, index) => (
            <div key={index} className='list-table-format'>
              <img src={`${url}/images/${item.image}`} alt='comida' />
              {editingFoodId === item._id ? (
                <>
                  <input value={editedData.name} onChange={(e) => handleChange(e, 'name')} />
                  <input value={editedData.category} onChange={(e) => handleChange(e, 'category')} />
                  <input type="number" value={editedData.price} onChange={(e) => handleChange(e, 'price')} />
                  <input value={editedData.description} onChange={(e) => handleChange(e, 'description')} />
                  <div className="edit-actions">
                    <button className="save-btn" onClick={saveEdit}>💾</button>
                    <button className="cancel-btn" onClick={cancelEdit}>✖</button>
                  </div>
                </>
              ) : (
                <>
                  <p>{item.name}</p>
                  <p>{item.category}</p>
                  <p>${item.price}</p>
                  <p>{item.description}</p>
                  <div className="edit-actions">
                    <button onClick={() => startEdit(item)}>✎</button>
                    <button onClick={() => removeFood(item._id)} className="delete-btn">🗑</button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default List;
