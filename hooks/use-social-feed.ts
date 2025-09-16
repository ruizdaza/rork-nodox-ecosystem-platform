import { useState } from "react";

interface User {
  id: string;
  name: string;
  avatar: string;
  verified?: boolean;
}

interface Post {
  id: string;
  user: User;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: number;
  liked?: boolean;
}

export const useSocialFeed = () => {
  const [posts] = useState<Post[]>([
    {
      id: "1",
      user: {
        id: "1",
        name: "Carlos Mendoza",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        verified: true,
      },
      content: "¡Acabo de canjear mis NCOP por un delicioso almuerzo en Restaurante El Sabor! La experiencia fue increíble y el descuento del 20% me ayudó mucho. ¡Gracias NodoX! 🍽️",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop",
      timestamp: "Hace 2 horas",
      likes: 24,
      comments: 8,
      liked: false,
    },
    {
      id: "2",
      user: {
        id: "2",
        name: "Ana López",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        verified: false,
      },
      content: "¡Mi primera semana en NodoX y ya he ganado 300 NCOP! Me encanta cómo puedo obtener puntos simplemente comprando en mis lugares favoritos. La comunidad es muy acogedora 💙",
      timestamp: "Hace 4 horas",
      likes: 18,
      comments: 5,
      liked: true,
    },
    {
      id: "3",
      user: {
        id: "3",
        name: "Roberto Silva",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        verified: true,
      },
      content: "Referí a 3 amigos esta semana y obtuve 1,500 NCOP extra. ¡Es genial poder compartir los beneficios de NodePass con las personas que más quiero!",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=300&fit=crop",
      timestamp: "Ayer",
      likes: 31,
      comments: 12,
      liked: false,
    },
    {
      id: "4",
      user: {
        id: "4",
        name: "Lucía Ramírez",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        verified: false,
      },
      content: "La nueva función de códigos QR es súper práctica. Solo escaneo en el punto de venta y automáticamente se aplican mis descuentos NodePass. ¡Tecnología que simplifica la vida! 📱",
      timestamp: "Hace 2 días",
      likes: 27,
      comments: 9,
      liked: true,
    },
    {
      id: "5",
      user: {
        id: "5",
        name: "Diego Torres",
        avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        verified: true,
      },
      content: "Celebrando mi primer mes como miembro premium de NodePass. Los beneficios exclusivos y la liberación mensual de NCOP realmente valen la pena. ¡Gracias por crear esta increíble plataforma! 🎉",
      image: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=400&h=300&fit=crop",
      timestamp: "Hace 3 días",
      likes: 42,
      comments: 15,
      liked: false,
    },
  ]);

  return {
    posts,
  };
};