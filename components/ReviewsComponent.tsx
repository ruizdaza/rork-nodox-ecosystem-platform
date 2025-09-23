import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { 
  Star, 
  ThumbsUp, 
  MessageCircle, 
  MoreHorizontal,
  Send,
  X,
} from 'lucide-react-native';
import { useReviews } from '@/hooks/use-reviews';
import { useNodoX } from '@/hooks/use-nodox-store';
import { Review, ReviewStats } from '@/types/marketplace';

interface ReviewsComponentProps {
  productId: string;
  sellerId?: string;
  canReview?: boolean;
}

export default function ReviewsComponent({ 
  productId, 
  sellerId, 
  canReview = false 
}: ReviewsComponentProps) {
  const { user } = useNodoX();
  const { 
    getProductReviews, 
    getReviewStats, 
    addReview, 
    markHelpful, 
    addSellerResponse,
    isLoading 
  } = useReviews();

  const [showAddReview, setShowAddReview] = useState(false);
  const [showResponse, setShowResponse] = useState<string | null>(null);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
  });
  const [responseText, setResponseText] = useState('');

  const reviews = getProductReviews(productId);
  const stats = getReviewStats(productId);

  const handleAddReview = async () => {
    if (!newReview.title.trim() || !newReview.comment.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const success = await addReview({
      productId,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      rating: newReview.rating,
      title: newReview.title,
      comment: newReview.comment,
      verified: true,
    });

    if (success) {
      setShowAddReview(false);
      setNewReview({ rating: 5, title: '', comment: '' });
      Alert.alert('Éxito', 'Tu reseña ha sido publicada');
    } else {
      Alert.alert('Error', 'No se pudo publicar la reseña');
    }
  };

  const handleMarkHelpful = async (reviewId: string) => {
    await markHelpful(reviewId);
  };

  const handleAddResponse = async (reviewId: string) => {
    if (!responseText.trim()) {
      Alert.alert('Error', 'Por favor escribe una respuesta');
      return;
    }

    const success = await addSellerResponse(reviewId, {
      sellerId: user.id,
      sellerName: user.name,
      message: responseText,
    });

    if (success) {
      setShowResponse(null);
      setResponseText('');
      Alert.alert('Éxito', 'Respuesta publicada');
    } else {
      Alert.alert('Error', 'No se pudo publicar la respuesta');
    }
  };

  const renderStars = (rating: number, size: number = 16) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            color={star <= rating ? '#fbbf24' : '#e5e7eb'}
            fill={star <= rating ? '#fbbf24' : 'transparent'}
          />
        ))}
      </View>
    );
  };

  const renderRatingSelector = () => {
    return (
      <View style={styles.ratingSelector}>
        <Text style={styles.ratingLabel}>Calificación:</Text>
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity
              key={star}
              onPress={() => setNewReview(prev => ({ ...prev, rating: star }))}
            >
              <Star
                size={24}
                color={star <= newReview.rating ? '#fbbf24' : '#e5e7eb'}
                fill={star <= newReview.rating ? '#fbbf24' : 'transparent'}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderReviewStats = () => {
    if (stats.totalReviews === 0) return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.overallRating}>
          <Text style={styles.ratingNumber}>{stats.averageRating}</Text>
          {renderStars(Math.round(stats.averageRating), 20)}
          <Text style={styles.reviewCount}>({stats.totalReviews} reseñas)</Text>
        </View>
        
        <View style={styles.ratingDistribution}>
          {Object.entries(stats.ratingDistribution)
            .reverse()
            .map(([rating, count]) => (
              <View key={rating} style={styles.distributionRow}>
                <Text style={styles.distributionRating}>{rating}</Text>
                <Star size={12} color="#fbbf24" fill="#fbbf24" />
                <View style={styles.distributionBar}>
                  <View
                    style={[
                      styles.distributionBarFill,
                      { 
                        width: stats.totalReviews > 0 
                          ? `${(count / stats.totalReviews) * 100}%` 
                          : '0%' 
                      },
                    ]}
                  />
                </View>
                <Text style={styles.distributionCount}>{count}</Text>
              </View>
            ))}
        </View>
      </View>
    );
  };

  const renderReview = (review: Review) => {
    const isOwner = review.userId === user.id;
    const canRespond = sellerId === user.id && !review.response;

    return (
      <View key={review.id} style={styles.reviewCard}>
        <View style={styles.reviewHeader}>
          <View style={styles.reviewerInfo}>
            <View style={styles.reviewerAvatar}>
              <Text style={styles.reviewerInitial}>
                {review.userName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.reviewerName}>{review.userName}</Text>
              <View style={styles.reviewMeta}>
                {renderStars(review.rating, 14)}
                <Text style={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
                {review.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>Verificado</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          <TouchableOpacity style={styles.moreButton}>
            <MoreHorizontal size={16} color="#64748b" />
          </TouchableOpacity>
        </View>

        <Text style={styles.reviewTitle}>{review.title}</Text>
        <Text style={styles.reviewComment}>{review.comment}</Text>

        <View style={styles.reviewActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleMarkHelpful(review.id)}
          >
            <ThumbsUp size={14} color="#64748b" />
            <Text style={styles.actionText}>Útil ({review.helpful})</Text>
          </TouchableOpacity>
          
          {canRespond && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowResponse(review.id)}
            >
              <MessageCircle size={14} color="#2563eb" />
              <Text style={[styles.actionText, { color: '#2563eb' }]}>Responder</Text>
            </TouchableOpacity>
          )}
        </View>

        {review.response && (
          <View style={styles.sellerResponse}>
            <View style={styles.responseHeader}>
              <Text style={styles.responseLabel}>Respuesta del vendedor:</Text>
              <Text style={styles.responseDate}>
                {new Date(review.response.createdAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.responseText}>{review.response.message}</Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reseñas y Calificaciones</Text>
        {canReview && (
          <TouchableOpacity
            style={styles.addReviewButton}
            onPress={() => setShowAddReview(true)}
          >
            <Text style={styles.addReviewText}>Escribir Reseña</Text>
          </TouchableOpacity>
        )}
      </View>

      {renderReviewStats()}

      <ScrollView style={styles.reviewsList} showsVerticalScrollIndicator={false}>
        {reviews.map(renderReview)}
        {reviews.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No hay reseñas aún</Text>
            <Text style={styles.emptySubtext}>
              Sé el primero en compartir tu experiencia
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Add Review Modal */}
      <Modal
        visible={showAddReview}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Escribir Reseña</Text>
            <TouchableOpacity onPress={() => setShowAddReview(false)}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {renderRatingSelector()}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Título</Text>
              <TextInput
                style={styles.textInput}
                value={newReview.title}
                onChangeText={(text) => setNewReview(prev => ({ ...prev, title: text }))}
                placeholder="Resumen de tu experiencia"
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Comentario</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={newReview.comment}
                onChangeText={(text) => setNewReview(prev => ({ ...prev, comment: text }))}
                placeholder="Comparte los detalles de tu experiencia"
                multiline
                numberOfLines={4}
                maxLength={500}
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleAddReview}
              disabled={isLoading}
            >
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Publicando...' : 'Publicar Reseña'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>

      {/* Response Modal */}
      <Modal
        visible={showResponse !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Responder Reseña</Text>
            <TouchableOpacity onPress={() => setShowResponse(null)}>
              <X size={24} color="#64748b" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tu respuesta</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={responseText}
                onChangeText={setResponseText}
                placeholder="Responde a esta reseña de manera profesional"
                multiline
                numberOfLines={4}
                maxLength={300}
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={() => showResponse && handleAddResponse(showResponse)}
              disabled={isLoading}
            >
              <Send size={16} color="#ffffff" />
              <Text style={styles.submitButtonText}>
                {isLoading ? 'Enviando...' : 'Enviar Respuesta'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addReviewButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addReviewText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  statsContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  overallRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  ratingNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  reviewCount: {
    fontSize: 14,
    color: '#64748b',
  },
  ratingDistribution: {
    gap: 4,
  },
  distributionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  distributionRating: {
    fontSize: 12,
    color: '#64748b',
    width: 8,
  },
  distributionBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  distributionBarFill: {
    height: '100%',
    backgroundColor: '#fbbf24',
  },
  distributionCount: {
    fontSize: 12,
    color: '#64748b',
    width: 20,
    textAlign: 'right',
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewsList: {
    flex: 1,
  },
  reviewCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  reviewerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  reviewerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 2,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#64748b',
  },
  verifiedBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10b981',
  },
  moreButton: {
    padding: 4,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  sellerResponse: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#2563eb',
  },
  responseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  responseLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2563eb',
  },
  responseDate: {
    fontSize: 10,
    color: '#64748b',
  },
  responseText: {
    fontSize: 13,
    color: '#374151',
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  ratingSelector: {
    marginBottom: 20,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});