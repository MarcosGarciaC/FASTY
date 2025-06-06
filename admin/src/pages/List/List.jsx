import React, { useEffect, useState } from 'react';
import './List.css';
import axios from "axios";
import { toast } from "react-toastify";

const List = ({ url }) => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    const userId = localStorage.getItem("user_id");
    if (!userId) {
      toast.error("No se encontró el ID del usuario en localStorage");
      return;
    }

    try {
      // Obtener la cafetería asociada al user_id
      const cafeteriaRes = await axios.get(`${url}/api/cafetin/by-owner/${userId}`);
      if (!cafeteriaRes.data.success || !cafeteriaRes.data.data) {
        toast.error("No se encontró la cafetería del usuario");
        return;
      }

      const cafeteriaId = cafeteriaRes.data.data._id;

      // Usar el ID de cafetería para traer comidas
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
    const response = await axios.post(`${url}/api/food/remove`, { id: foodId });
    if (response.data.success) {
      toast.success(response.data.message);
      fetchList(); // recargar lista
    } else {
      toast.error("Error al eliminar");
    }
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
            <b>Eliminar</b>
          </div>
          {list.map((item, index) => (
            <div key={index} className='list-table-format'>
              <img src={`${url}/images/${item.image}`} alt='comida' />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>${item.price}</p>
              <p>{item.description}</p>
              <p onClick={() => removeFood(item._id)} style={{ cursor: 'pointer', color: 'red' }}>x</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default List;
