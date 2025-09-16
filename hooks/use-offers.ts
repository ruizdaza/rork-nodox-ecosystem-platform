import { useState } from "react";

interface Category {
  id: string;
  name: string;
}

interface Offer {
  id: string;
  title: string;
  business: string;
  category: string;
  description: string;
  image: string;
  discount: string;
  originalPrice: string;
  ncopPrice: number;
  location: string;
  rating: number;
}

export const useOffers = () => {
  const [categories] = useState<Category[]>([
    { id: "restaurant", name: "Restaurantes" },
    { id: "fashion", name: "Moda" },
    { id: "health", name: "Salud" },
    { id: "entertainment", name: "Entretenimiento" },
    { id: "services", name: "Servicios" },
  ]);

  const [offers] = useState<Offer[]>([
    {
      id: "1",
      title: "Almuerzo Ejecutivo Completo",
      business: "Restaurante El Sabor",
      category: "restaurant",
      description: "Disfruta de nuestro almuerzo ejecutivo con entrada, plato fuerte, postre y bebida. Ingredientes frescos y cocina tradicional.",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
      discount: "20% OFF",
      originalPrice: "$25.000",
      ncopPrice: 50,
      location: "Zona Rosa, Bogotá",
      rating: 4.8,
    },
    {
      id: "2",
      title: "Colección Primavera-Verano",
      business: "Tienda Fashion",
      category: "fashion",
      description: "Renueva tu guardarropa con nuestra nueva colección. Prendas de alta calidad con diseños únicos y modernos.",
      image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
      discount: "15% OFF",
      originalPrice: "$80.000",
      ncopPrice: 30,
      location: "Centro Comercial Andino",
      rating: 4.6,
    },
    {
      id: "3",
      title: "Consulta Médica General",
      business: "Clínica Salud Total",
      category: "health",
      description: "Consulta médica general con profesionales especializados. Incluye examen físico completo y recomendaciones.",
      image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
      discount: "25% OFF",
      originalPrice: "$60.000",
      ncopPrice: 40,
      location: "Chapinero, Bogotá",
      rating: 4.9,
    },
    {
      id: "4",
      title: "Entrada Doble al Cine",
      business: "Cineplex Premium",
      category: "entertainment",
      description: "Disfruta de las últimas películas en nuestras salas premium con sonido envolvente y asientos reclinables.",
      image: "https://images.unsplash.com/photo-1489599735734-79b4169c4388?w=400&h=300&fit=crop",
      discount: "30% OFF",
      originalPrice: "$40.000",
      ncopPrice: 60,
      location: "Centro Comercial Titán",
      rating: 4.7,
    },
    {
      id: "5",
      title: "Corte y Peinado Profesional",
      business: "Salón Belleza & Estilo",
      category: "services",
      description: "Servicio completo de peluquería con estilistas profesionales. Incluye lavado, corte, peinado y tratamiento capilar.",
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&h=300&fit=crop",
      discount: "18% OFF",
      originalPrice: "$45.000",
      ncopPrice: 35,
      location: "Zona T, Bogotá",
      rating: 4.5,
    },
    {
      id: "6",
      title: "Cena Romántica para Dos",
      business: "Restaurante La Terraza",
      category: "restaurant",
      description: "Cena romántica con vista panorámica de la ciudad. Menú de 3 tiempos con maridaje de vinos incluido.",
      image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop",
      discount: "22% OFF",
      originalPrice: "$120.000",
      ncopPrice: 80,
      location: "La Candelaria, Bogotá",
      rating: 4.9,
    },
    {
      id: "7",
      title: "Zapatos Deportivos Premium",
      business: "SportZone",
      category: "fashion",
      description: "Zapatos deportivos de última tecnología para running y entrenamiento. Comodidad y rendimiento garantizados.",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
      discount: "12% OFF",
      originalPrice: "$150.000",
      ncopPrice: 45,
      location: "Centro Comercial Santafé",
      rating: 4.4,
    },
    {
      id: "8",
      title: "Masaje Relajante Completo",
      business: "Spa Renacer",
      category: "health",
      description: "Masaje terapéutico de cuerpo completo con aceites esenciales. Perfecto para liberar el estrés y relajar los músculos.",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop",
      discount: "20% OFF",
      originalPrice: "$70.000",
      ncopPrice: 55,
      location: "Usaquén, Bogotá",
      rating: 4.8,
    },
  ]);

  return {
    offers,
    categories,
  };
};