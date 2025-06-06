import fasty_logo from './fasty_logo.png'
import header_img from './header_img.jpg'
//Menus images
import menu_1 from './menu_1.jpg'
import menu_2 from './menu_2.jpg'
//Cafeterias Logos
import logo_1 from './logo_1.jpg'
import logo_2 from './logo_2.jpg'
import logo_3 from './logo_3.jpg'
import logo_4 from './logo_4.jpeg'
import logo_5 from './logo_5.png'
import logo_6 from './logo_6.jpeg'

export const assets = {
  fasty_logo,
  header_img
}

export const menu_list = [
  {
    menu_name: "Hamburguer",
    menu_image: menu_1
  }
]


export const logo_list = [
  {
    logo_name: "DF",
    logo_image: logo_1
  },
  {
    logo_name: "NICA FIT",
    logo_image: logo_2
  },
  {
    logo_name: "Pitaya",
    logo_image: logo_3
  },
  {
    logo_name: "Chop Suey",
    logo_image: logo_4
  },
  {
    logo_name: "El Greco",
    logo_image: logo_5
  },
  {
    logo_name: "Cronchi",
    logo_image: logo_6
  }
]
export const food_list = [
  {
    _id: "682a3b2aa2e618ee7bb1c260",
    cafeteria_id: "662a93d3a1d46c1f6bd2637a", // ID de cafetería
    name: "Canada Dry",
    description: "Con carne, queso y papas",
    price: 80,
    category: "lunch",
    ingredients: ["carne", "queso", "papas"],
    is_available: true,
    preparation_time: 10,
    daily_quantity: 30,
    image: "1747598122383menu_2.jpg",
    rating: 4.2 // Añadido para mantener compatibilidad con FoodItem
  },
  {
    _id: "1",
    name: "Hamburger",
    image: "menu_1.jpg",
    price: 120,
    description: "With just 5 ingredients and 15 minutes of cooking time...",
    rating: 4.5,
    category: "Rapid Food",
    cafeteria_id: "662a93d3a1d46c1f6bd2637a", // Ejemplo: misma cafetería que el anterior
    ingredients: ["pan", "carne", "lechuga", "tomate"],
    is_available: true,
    preparation_time: 15,
    daily_quantity: 20
  },
  {
    _id: "2",
    name: "Greek Salad",
    image: "menu_2.jpg",
    price: 200,
    description: "This easy Greek salad is made with plum tomatoes...",
    rating: 3.0,
    category: "Salad",
    cafeteria_id: "663b94c4b2e719ff8cd4712b", // ID de otra cafetería
    ingredients: ["tomate", "pepino", "aceitunas", "queso feta"],
    is_available: true,
    preparation_time: 10,
    daily_quantity: 15
  }
  // ... más items
];
