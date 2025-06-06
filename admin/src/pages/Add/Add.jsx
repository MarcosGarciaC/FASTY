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

  // Obtener el ID del usuario (cafetería) desde localStorage
useEffect(() => {
  const fetchCafeteriaId = async () => {
    const userId = localStorage.getItem('user_id'); // asegurarte de que este sea el campo correcto
    if (!userId) {
      toast.error("No se encontró el ID del usuario en localStorage");
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
        toast.error("No se encontró una cafetería asociada a este usuario");
      }
    } catch (error) {
      console.error("Error fetching cafeteria:", error);
      toast.error("Error al obtener el ID de la cafetería");
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
          cafeteria_id: data.cafeteria_id // mantener el mismo ID
        });
        setImage(null);
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || "Error al agregar comida");
      }
    } catch (error) {
      toast.error("No se pudo enviar la solicitud");
      console.error(error);
    }
  };

  localStorage.setItem("cafeteria_id", data.cafeteria_id);


  return (
    <div className="add">
      <form className="flex-col" onSubmit={onSubmitHandler}>
        <div className="add-img-upload flex-col">
          <p>Subir Imagen</p>
          <label htmlFor="image">
            {image ? (
              <img src={URL.createObjectURL(image)} alt="preview" />
            ) : (
              <i className="fa-solid fa-cloud-arrow-up fa-4x"></i>
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

        <div className="add-product-name flex-col">
          <p>Nombre del producto</p>
          <input onChange={onChangeHandler} value={data.name} type="text" name="name" placeholder="Ej: Pollo frito" />
        </div>

        <div className="add-product-description flex-col">
          <p>Descripción del producto</p>
          <textarea
            onChange={onChangeHandler}
            value={data.description}
            name="description"
            rows="4"
            placeholder="Describe el platillo..."
          />
        </div>

        <div className="add-category-price">
          <div className="add-category flex-col">
            <p>Categoría</p>
            <select onChange={onChangeHandler} value={data.category} name="category">
              <option value="Almuerzo">Almuerzo</option>
              <option value="Bebidas">Bebidas</option>
              <option value="Salad">Ensalada</option>
            </select>
          </div>
          <div className="add-price flex-col">
            <p>Precio</p>
            <input onChange={onChangeHandler} value={data.price} type="number" name="price" placeholder="Ej: 50" />
          </div>
        </div>

        <div className="flex-col">
          <p>Ingredientes</p>
          <textarea
            onChange={onChangeHandler}
            value={data.ingredients}
            name="ingredients"
            rows="2"
            placeholder="Ej: arroz, pollo, ensalada"
          />
        </div>

        <div className="flex-col">
          <p>Tiempo de preparación (min)</p>
          <input
            onChange={onChangeHandler}
            value={data.preparation_time}
            type="number"
            name="preparation_time"
            placeholder="Ej: 15"
          />
        </div>

        <div className="flex-col">
          <p>Cantidad diaria disponible</p>
          <input
            onChange={onChangeHandler}
            value={data.daily_quantity}
            type="number"
            name="daily_quantity"
            placeholder="Ej: 30"
          />
        </div>

        <div className="flex-col">
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

        <div className="flex-col" hidden>
          <p hidden>ID de Cafetería</p>
          <input
            hidden
            value={data.cafeteria_id}
            type="text"
            name="cafeteria_id"
            readOnly
          />
        </div>

        <button type="submit" className="add-btn">Agregar</button>
      </form>
    </div>
  );
};

export default Add;
