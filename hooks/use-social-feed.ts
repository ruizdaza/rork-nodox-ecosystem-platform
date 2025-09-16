import { useState, useCallback } from "react";

interface User {
  id: string;
  name: string;
  avatar: string;
  verified?: boolean;
}

interface Comment {
  id: string;
  user: User;
  content: string;
  timestamp: string;
  likes: number;
  liked?: boolean;
}

interface Post {
  id: string;
  user: User;
  content: string;
  image?: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
  liked?: boolean;
}

export const useSocialFeed = () => {
  const [posts, setPosts] = useState<Post[]>([
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
      comments: [
        {
          id: "c1",
          user: {
            id: "u1",
            name: "María García",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
          },
          content: "¡Se ve delicioso! ¿Cuál fue tu plato favorito?",
          timestamp: "Hace 1 hora",
          likes: 3,
          liked: false,
        },
        {
          id: "c2",
          user: {
            id: "u2",
            name: "Pedro Ruiz",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          },
          content: "Yo también fui la semana pasada, excelente servicio",
          timestamp: "Hace 30 min",
          likes: 1,
          liked: true,
        },
      ],
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
      comments: [
        {
          id: "c3",
          user: {
            id: "u3",
            name: "Luis Morales",
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          },
          content: "¡Bienvenida a la comunidad! 🎉",
          timestamp: "Hace 2 horas",
          likes: 5,
          liked: false,
        },
      ],
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
      comments: [
        {
          id: "c4",
          user: {
            id: "u4",
            name: "Carmen Vega",
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
          },
          content: "¿Cómo haces para referir tantos amigos? ¡Comparte el secreto!",
          timestamp: "Hace 12 horas",
          likes: 2,
          liked: false,
        },
      ],
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
      comments: [
        {
          id: "c5",
          user: {
            id: "u5",
            name: "Andrés Castro",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
          },
          content: "Totalmente de acuerdo, es súper fácil de usar",
          timestamp: "Hace 1 día",
          likes: 4,
          liked: true,
        },
      ],
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
      comments: [
        {
          id: "c6",
          user: {
            id: "u6",
            name: "Isabella Herrera",
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
          },
          content: "¡Felicidades! Yo también estoy considerando el premium",
          timestamp: "Hace 2 días",
          likes: 6,
          liked: false,
        },
      ],
      liked: false,
    },
  ]);

  const toggleLike = useCallback((postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            liked: !post.liked,
            likes: post.liked ? post.likes - 1 : post.likes + 1,
          };
        }
        return post;
      })
    );
  }, []);

  const toggleCommentLike = useCallback((postId: string, commentId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.map(comment => {
              if (comment.id === commentId) {
                return {
                  ...comment,
                  liked: !comment.liked,
                  likes: comment.liked ? comment.likes - 1 : comment.likes + 1,
                };
              }
              return comment;
            }),
          };
        }
        return post;
      })
    );
  }, []);

  const addComment = useCallback((postId: string, content: string) => {
    const newComment: Comment = {
      id: `c${Date.now()}`,
      user: {
        id: "current-user",
        name: "Tú",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
      },
      content,
      timestamp: "Ahora",
      likes: 0,
      liked: false,
    };

    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, newComment],
          };
        }
        return post;
      })
    );
  }, []);

  return {
    posts,
    toggleLike,
    toggleCommentLike,
    addComment,
  };
};