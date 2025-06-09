import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const url = import.meta.env.VITE_API_BASE_URL;
  const [token, setToken] = useState("");
  const [food_list, setFoodList] = useState([]);
  const [cafetinList, setCafetinList] = useState([]);
  const [orderItems, setOrderItems] = useState([]);

  const addToCart = (food_id, cafeteria_id) => {
    // Check if cart has items from a different cafeteria
    const currentCafeteriaId = orderItems.length > 0 ? orderItems[0].cafeteria_id : null;
    if (currentCafeteriaId && currentCafeteriaId !== cafeteria_id) {
      alert("Solo puedes seleccionar items de una cafeteria a la vez. Por favor limpia tu carrito para añadir items de otra cafeteria.");
      return;
    }

    // Update cartItems for compatibility with other components
    setCartItems((prev) => ({
      ...prev,
      [food_id]: (prev[food_id] || 0) + 1
    }));

    // Update orderItems to maintain food_id, quantity, and cafeteria_id
    setOrderItems((prev) => {
      const existing = prev.find((item) => item.food_id === food_id);
      if (existing) {
        return prev.map((item) =>
          item.food_id === food_id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { food_id, quantity: 1, cafeteria_id }];
      }
    });
  };

  const removeFromCart = (food_id) => {
    setCartItems((prev) => {
      const newQuantity = (prev[food_id] || 0) - 1;
      if (newQuantity <= 0) {
        const newCart = { ...prev };
        delete newCart[food_id];
        return newCart;
      }
      return { ...prev, [food_id]: newQuantity };
    });

    setOrderItems((prev) => {
      const existing = prev.find((item) => item.food_id === food_id);
      if (!existing) return prev;

      if (existing.quantity === 1) {
        return prev.filter((item) => item.food_id !== food_id);
      } else {
        return prev.map((item) =>
          item.food_id === food_id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      }
    });
  };

  const clearCart = () => {
    setCartItems({});
    setOrderItems([]);
  };

  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find((product) => product._id === item);
        totalAmount += itemInfo.price * cartItems[item];
      }
    }
    return totalAmount;
  };

  const fetchFoodList = async () => {
    const response = await axios.get(`${url}/api/food/list`);
    setFoodList(response.data.data);
  };

  const fetchCafetines = async () => {
    try {
      const response = await axios.get(`${url}/api/cafetin/list`);
      setCafetinList(response.data.data);
    } catch (error) {
      console.error("Error fetching cafetines:", error);
    }
  };

  useEffect(() => {
    async function loadData() {
      await fetchFoodList();
      await fetchCafetines();
      if (localStorage.getItem("token")) {
        setToken(localStorage.getItem("token"));
      }
    }
    loadData();
  }, []);

  const contextValue = {
    food_list,
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    clearCart,
    getTotalCartAmount,
    url,
    token,
    setToken,
    cafetinList,
    orderItems
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;