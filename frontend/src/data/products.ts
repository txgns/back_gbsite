
import { Product } from "../context/CartContext";

const products: Product[] = [
  {
    id: 1,
    name: "Camisa Gambiarra Robotics",
    price: 75.00,
    image: "/products/tshirt.png",
    category: "Vestuário",
    description: "Camisa oficial da equipe Gambiarra Robotics, 100% algodão de alta qualidade com estampa exclusiva."
  },
  {
    id: 2,
    name: "Caneca Gambiarra",
    price: 35.00,
    image: "/products/mug.png",
    category: "Acessórios",
    description: "Caneca de cerâmica com o logo da Gambiarra Robotics, ideal para seu café enquanto programa seus robôs."
  },
  {
    id: 3,
    name: "Hoodie Gambiarra",
    price: 120.00,
    image: "/products/hoodie.png",
    category: "Vestuário",
    description: "Hoodie confortável com o logo da Gambiarra Robotics, perfeito para dias frios no laboratório."
  },
  {
    id: 4,
    name: "Adesivos Gambiarra",
    price: 10.00,
    image: "/products/stickers.png",
    category: "Acessórios",
    description: "Conjunto de adesivos da Gambiarra Robotics para personalizar seus dispositivos."
  },
  {
    id: 5,
    name: "Boné Gambiarra",
    price: 40.00,
    image: "/products/cap.png",
    category: "Vestuário",
    description: "Boné ajustável com logo bordado da Gambiarra Robotics."
  }
];

export default products;
