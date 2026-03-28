import { useState, useCallback, useEffect } from "react";
import { useNotifications } from './use-notifications';

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
  expiresAt?: Date;
  isNew?: boolean;
  isExpiring?: boolean;
}

export const useOffers = () => {
  const notifications = useNotifications();
  const [categories] = useState<Category[]>([
    { id: "restaurant", name: "Restaurantes" },
    { id: "fashion", name: "Moda" },
    { id: "health", name: "Salud" },
    { id: "entertainment", name: "Entretenimiento" },
    { id: "services", name: "Servicios" },
  ]);

  const [offers, setOffers] = useState<Offer[]>([
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
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      isNew: true,
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
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days
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
      expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days
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
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      isExpiring: true,
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
      expiresAt: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days
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
      expiresAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days
      isNew: true,
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
      expiresAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days
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
      expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
      isExpiring: true,
    },
  ]);

  // Check for expiring offers and notify
  const checkExpiringOffers = useCallback(async () => {
    const now = new Date();
    const expiringThreshold = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const offer of offers) {
      if (offer.expiresAt) {
        const timeUntilExpiry = offer.expiresAt.getTime() - now.getTime();
        const hoursLeft = Math.floor(timeUntilExpiry / (60 * 60 * 1000));
        
        if (timeUntilExpiry > 0 && timeUntilExpiry <= expiringThreshold && !offer.isExpiring) {
          // Mark as expiring and notify
          setOffers(prev => prev.map(o => 
            o.id === offer.id ? { ...o, isExpiring: true } : o
          ));
          
          await notifications.notifyOfferExpiring(offer.title, hoursLeft);
        }
      }
    }
  }, [offers, notifications]);
  
  // Simulate new offer notifications
  const addNewOffer = useCallback(async (offer: Omit<Offer, 'id' | 'isNew'>) => {
    const newOffer: Offer = {
      ...offer,
      id: `offer-${Date.now()}`,
      isNew: true,
    };
    
    setOffers(prev => [newOffer, ...prev]);
    
    // Trigger notification for new offer
    await notifications.notifyOfferAvailable(newOffer.title, newOffer.discount);
    
    console.log('New offer added with notification:', newOffer.title);
  }, [notifications]);
  
  // Redeem offer with NCOP
  const redeemOffer = useCallback(async (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (!offer) return false;
    
    // This would typically integrate with the wallet system
    // For now, we'll just trigger a notification
    await notifications.createNotification(
      'Oferta Canjeada',
      `Has canjeado ${offer.title} por ${offer.ncopPrice} NCOP`,
      'ncop_exchanged',
      'offers',
      { offerId, offerTitle: offer.title, ncopPrice: offer.ncopPrice },
      'high'
    );
    
    console.log('Offer redeemed:', offer.title);
    return true;
  }, [offers, notifications]);
  
  // Check for expiring offers periodically
  useEffect(() => {
    checkExpiringOffers();
    
    // Check every hour
    const interval = setInterval(checkExpiringOffers, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [checkExpiringOffers]);
  
  // Filter offers by category
  const getOffersByCategory = useCallback((categoryId: string) => {
    return offers.filter(offer => offer.category === categoryId);
  }, [offers]);
  
  // Get new offers
  const getNewOffers = useCallback(() => {
    return offers.filter(offer => offer.isNew);
  }, [offers]);
  
  // Get expiring offers
  const getExpiringOffers = useCallback(() => {
    return offers.filter(offer => offer.isExpiring);
  }, [offers]);

  return {
    offers,
    categories,
    addNewOffer,
    redeemOffer,
    getOffersByCategory,
    getNewOffers,
    getExpiringOffers,
    checkExpiringOffers,
  };
};