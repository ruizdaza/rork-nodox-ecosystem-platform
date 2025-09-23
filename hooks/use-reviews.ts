import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback } from 'react';
import { Review, ReviewStats, SellerResponse } from '@/types/marketplace';

const mockReviews: Review[] = [
  {
    id: '1',
    productId: '1',
    userId: '2',
    userName: 'Carlos Mendoza',
    userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    title: 'Excelente servicio',
    comment: 'El corte quedó perfecto, muy profesional y el ambiente es muy agradable. Definitivamente regresaré.',
    helpful: 12,
    verified: true,
    createdAt: '2024-01-20T10:30:00Z',
  },
  {
    id: '2',
    productId: '1',
    userId: '3',
    userName: 'Laura Pérez',
    userAvatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    rating: 4,
    title: 'Muy buena atención',
    comment: 'Me gustó mucho el resultado, aunque tuve que esperar un poco más de lo esperado.',
    helpful: 8,
    verified: true,
    createdAt: '2024-01-18T14:15:00Z',
    response: {
      id: '1',
      sellerId: '1',
      sellerName: 'Salón Belleza Total',
      message: 'Gracias por tu reseña Laura. Trabajaremos en mejorar los tiempos de espera.',
      createdAt: '2024-01-19T09:00:00Z',
    },
  },
  {
    id: '3',
    productId: '2',
    userId: '4',
    userName: 'Ana Rodríguez',
    userAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
    rating: 5,
    title: 'Producto excelente',
    comment: 'El shampoo es de muy buena calidad, mi cabello se siente suave y brillante.',
    helpful: 15,
    verified: true,
    createdAt: '2024-01-15T16:45:00Z',
  },
];

export const [ReviewProvider, useReviews] = createContextHook(() => {
  const [reviews, setReviews] = useState<Review[]>(mockReviews);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getProductReviews = useCallback((productId: string): Review[] => {
    return reviews.filter(review => review.productId === productId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reviews]);

  const getReviewStats = useCallback((productId: string): ReviewStats => {
    const productReviews = getProductReviews(productId);
    
    if (productReviews.length === 0) {
      return {
        averageRating: 0,
        totalReviews: 0,
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const totalRating = productReviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / productReviews.length;

    const ratingDistribution = productReviews.reduce(
      (dist, review) => {
        dist[review.rating as keyof typeof dist]++;
        return dist;
      },
      { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    );

    return {
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: productReviews.length,
      ratingDistribution,
    };
  }, [getProductReviews]);

  const addReview = useCallback(async (review: Omit<Review, 'id' | 'createdAt' | 'helpful'>): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newReview: Review = {
        ...review,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        helpful: 0,
      };
      
      setReviews(prev => [newReview, ...prev]);
      console.log('Review added:', newReview);
      return true;
    } catch (error) {
      console.error('Error adding review:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateReview = useCallback(async (reviewId: string, updates: Partial<Review>): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, ...updates, updatedAt: new Date().toISOString() }
          : review
      ));
      
      console.log('Review updated:', reviewId, updates);
      return true;
    } catch (error) {
      console.error('Error updating review:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deleteReview = useCallback(async (reviewId: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setReviews(prev => prev.filter(review => review.id !== reviewId));
      console.log('Review deleted:', reviewId);
      return true;
    } catch (error) {
      console.error('Error deleting review:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markHelpful = useCallback(async (reviewId: string): Promise<boolean> => {
    try {
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, helpful: review.helpful + 1 }
          : review
      ));
      
      console.log('Review marked as helpful:', reviewId);
      return true;
    } catch (error) {
      console.error('Error marking review as helpful:', error);
      return false;
    }
  }, []);

  const addSellerResponse = useCallback(async (
    reviewId: string, 
    response: Omit<SellerResponse, 'id' | 'createdAt'>
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newResponse: SellerResponse = {
        ...response,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, response: newResponse }
          : review
      ));
      
      console.log('Seller response added:', reviewId, newResponse);
      return true;
    } catch (error) {
      console.error('Error adding seller response:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getUserReviews = useCallback((userId: string): Review[] => {
    return reviews.filter(review => review.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [reviews]);

  return {
    reviews,
    isLoading,
    getProductReviews,
    getReviewStats,
    addReview,
    updateReview,
    deleteReview,
    markHelpful,
    addSellerResponse,
    getUserReviews,
  };
});