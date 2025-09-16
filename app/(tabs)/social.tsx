import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Platform,
  Modal,
  TextInput,
  KeyboardAvoidingView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal,
  Camera,
  Plus,
  Search,
  Pin,
  X,
  Send,
  Image as ImageIcon,
  Smile,
  Users
} from "lucide-react-native";
import { useSocialFeed } from "@/hooks/use-social-feed";
import { useChat } from "@/hooks/use-chat";
import { Chat } from "@/types/chat";
import NodoXLogo from "@/components/NodoXLogo";

const formatTime = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  
  return date.toLocaleDateString('es-ES', { 
    day: '2-digit', 
    month: '2-digit' 
  });
};

const ChatItem = ({ chat }: { chat: Chat }) => {
  const { getChatName, getChatParticipants, setActiveChat } = useChat();
  const chatName = getChatName(chat);
  const participants = getChatParticipants(chat);
  const avatar = participants[0]?.avatar;
  const isOnline = participants.some(p => p.isOnline);

  const handlePress = () => {
    setActiveChat(chat.id);
    router.push('/conversation');
  };

  return (
    <TouchableOpacity style={styles.chatItem} onPress={handlePress}>
      <View style={styles.avatarContainer}>
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.chatAvatar} />
        ) : (
          <View style={[styles.chatAvatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {chatName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        {isOnline && <View style={styles.onlineIndicator} />}
        {chat.isPinned && (
          <View style={styles.pinnedIndicator}>
            <Pin size={12} color="#2563eb" />
          </View>
        )}
      </View>

      <View style={styles.chatContent}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatName} numberOfLines={1}>
            {chatName}
          </Text>
          <Text style={styles.timestamp}>
            {chat.lastMessage ? formatTime(chat.lastMessage.timestamp) : ''}
          </Text>
        </View>

        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {chat.lastMessage?.senderId === 'current-user' && 'Tú: '}
            {chat.lastMessage?.content || 'Sin mensajes'}
          </Text>
          {chat.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function SocialScreen() {
  const [activeTab, setActiveTab] = useState<"feed" | "chat">("feed");
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<string>("");
  const [showCreatePost, setShowCreatePost] = useState<boolean>(false);
  const [postText, setPostText] = useState<string>("");
  const [postImage, setPostImage] = useState<string>("");
  const { posts, toggleLike, toggleCommentLike, addComment, addPost } = useSocialFeed();
  const { chats, isLoading } = useChat();

  const selectedPostData = posts.find(post => post.id === selectedPost);

  const handleAddComment = () => {
    if (commentText.trim() && selectedPost) {
      addComment(selectedPost, commentText.trim());
      setCommentText("");
    }
  };

  const handleCloseComments = () => {
    setSelectedPost(null);
    setCommentText("");
  };

  const handleCreatePost = () => {
    if (postText.trim()) {
      addPost(postText.trim(), postImage || undefined);
      setPostText("");
      setPostImage("");
      setShowCreatePost(false);
    }
  };

  const handleCloseCreatePost = () => {
    setShowCreatePost(false);
    setPostText("");
    setPostImage("");
  };

  const sortedChats = React.useMemo(() => {
    return [...chats].sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    });
  }, [chats]);

  const renderFeed = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Stories */}
      <View style={styles.storiesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.addStory}>
            <View style={styles.addStoryIcon}>
              <Plus color="#2563eb" size={20} />
            </View>
            <Text style={styles.storyText}>Tu historia</Text>
          </TouchableOpacity>
          
          {[1, 2, 3, 4, 5].map((i) => (
            <TouchableOpacity key={i} style={styles.story}>
              <Image
                source={{ uri: `https://images.unsplash.com/photo-${1500000000000 + i}?w=150&h=150&fit=crop&crop=face` }}
                style={styles.storyImage}
              />
              <Text style={styles.storyText}>Usuario {i}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Posts */}
      {posts.map((post) => (
        <View key={post.id} style={styles.postCard}>
          <View style={styles.postHeader}>
            <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
              <View style={styles.userNameContainer}>
                <Text style={styles.userName}>{post.user.name}</Text>
                {post.user.verified && (
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>✓</Text>
                  </View>
                )}
              </View>
              <Text style={styles.postTime}>{post.timestamp}</Text>
            </View>
            <TouchableOpacity>
              <MoreHorizontal color="#64748b" size={20} />
            </TouchableOpacity>
          </View>

          <Text style={styles.postContent}>{post.content}</Text>

          {post.image && (
            <Image source={{ uri: post.image }} style={styles.postImage} />
          )}

          <View style={styles.postActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => toggleLike(post.id)}
            >
              <Heart 
                color={post.liked ? "#ef4444" : "#64748b"} 
                size={20} 
                fill={post.liked ? "#ef4444" : "none"}
              />
              <Text style={[styles.actionText, post.liked && styles.likedText]}>
                {post.likes}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => setSelectedPost(post.id)}
            >
              <MessageCircle color="#64748b" size={20} />
              <Text style={styles.actionText}>{post.comments.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Share color="#64748b" size={20} />
              <Text style={styles.actionText}>Compartir</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderChat = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando chats...</Text>
        </View>
      );
    }

    return (
      <View style={styles.chatContainer}>
        <View style={styles.searchContainer}>
          <TouchableOpacity style={styles.searchInput}>
            <Search size={16} color="#64748b" />
            <Text style={styles.searchText}>Buscar conversaciones...</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.contactsButton}
            onPress={() => router.push('/contacts')}
          >
            <Users size={20} color="#2563eb" />
          </TouchableOpacity>
        </View>

        <FlatList
          data={sortedChats}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ChatItem chat={item} />}
          style={styles.chatList}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.chatListContent}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <NodoXLogo size="small" showText={false} />
          <Text style={styles.headerTitle}>Momentos</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Camera color="#64748b" size={24} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => setShowCreatePost(true)}
          >
            <Plus color="#64748b" size={24} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "feed" && styles.activeTab]}
          onPress={() => setActiveTab("feed")}
        >
          <Text style={[styles.tabText, activeTab === "feed" && styles.activeTabText]}>Feed</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "chat" && styles.activeTab]}
          onPress={() => setActiveTab("chat")}
        >
          <Text style={[styles.tabText, activeTab === "chat" && styles.activeTabText]}>Mensajes</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {activeTab === "feed" ? renderFeed() : renderChat()}

      {/* Create Post Modal */}
      <Modal
        visible={showCreatePost}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView 
            style={styles.modalContent}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            {/* Create Post Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleCloseCreatePost}
              >
                <X color="#64748b" size={24} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Crear publicación</Text>
              <TouchableOpacity 
                style={[styles.publishButton, !postText.trim() && styles.publishButtonDisabled]}
                onPress={handleCreatePost}
                disabled={!postText.trim()}
              >
                <Text style={[styles.publishButtonText, !postText.trim() && styles.publishButtonTextDisabled]}>
                  Publicar
                </Text>
              </TouchableOpacity>
            </View>

            {/* User Info */}
            <View style={styles.createPostUser}>
              <Image 
                source={{ uri: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face" }} 
                style={styles.avatar} 
              />
              <View>
                <Text style={styles.userName}>Tú</Text>
                <Text style={styles.postVisibility}>Público</Text>
              </View>
            </View>

            {/* Post Content Input */}
            <ScrollView style={styles.createPostContent} showsVerticalScrollIndicator={false}>
              <TextInput
                style={styles.postTextInput}
                placeholder="¿Qué quieres compartir en Momentos?"
                value={postText}
                onChangeText={setPostText}
                multiline
                maxLength={1000}
                textAlignVertical="top"
              />
              
              {/* Image Preview */}
              {postImage ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: postImage }} style={styles.imagePreview} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => setPostImage("")}
                  >
                    <X color="#ffffff" size={16} />
                  </TouchableOpacity>
                </View>
              ) : null}
            </ScrollView>

            {/* Post Options */}
            <View style={styles.postOptions}>
              <TouchableOpacity 
                style={styles.postOption}
                onPress={() => setPostImage("https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop")}
              >
                <ImageIcon color="#10b981" size={24} />
                <Text style={styles.postOptionText}>Foto</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.postOption}>
                <Smile color="#f59e0b" size={24} />
                <Text style={styles.postOptionText}>Sentimiento</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      {/* Comments Modal */}
      <Modal
        visible={selectedPost !== null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <KeyboardAvoidingView 
            style={styles.modalContent}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comentarios</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleCloseComments}
              >
                <X color="#64748b" size={24} />
              </TouchableOpacity>
            </View>

            {/* Original Post */}
            {selectedPostData && (
              <View style={styles.originalPost}>
                <View style={styles.postHeader}>
                  <Image source={{ uri: selectedPostData.user.avatar }} style={styles.avatar} />
                  <View style={styles.userInfo}>
                    <View style={styles.userNameContainer}>
                      <Text style={styles.userName}>{selectedPostData.user.name}</Text>
                      {selectedPostData.user.verified && (
                        <View style={styles.verifiedBadge}>
                          <Text style={styles.verifiedText}>✓</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.postTime}>{selectedPostData.timestamp}</Text>
                  </View>
                </View>
                <Text style={styles.postContent}>{selectedPostData.content}</Text>
                {selectedPostData.image && (
                  <Image source={{ uri: selectedPostData.image }} style={styles.modalPostImage} />
                )}
              </View>
            )}

            {/* Comments List */}
            <ScrollView style={styles.commentsList} showsVerticalScrollIndicator={false}>
              {selectedPostData?.comments.map((comment) => (
                <View key={comment.id} style={styles.commentItem}>
                  <Image source={{ uri: comment.user.avatar }} style={styles.commentAvatar} />
                  <View style={styles.commentContent}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentUserName}>{comment.user.name}</Text>
                      <Text style={styles.commentTime}>{comment.timestamp}</Text>
                    </View>
                    <Text style={styles.commentText}>{comment.content}</Text>
                    <TouchableOpacity 
                      style={styles.commentLikeButton}
                      onPress={() => selectedPost && toggleCommentLike(selectedPost, comment.id)}
                    >
                      <Heart 
                        color={comment.liked ? "#ef4444" : "#64748b"} 
                        size={14} 
                        fill={comment.liked ? "#ef4444" : "none"}
                      />
                      <Text style={[styles.commentLikeText, comment.liked && styles.likedText]}>
                        {comment.likes}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Add Comment */}
            <View style={styles.addCommentContainer}>
              <TextInput
                style={styles.commentInput}
                placeholder="Escribe un comentario..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
                maxLength={500}
              />
              <TouchableOpacity 
                style={[styles.sendButton, !commentText.trim() && styles.sendButtonDisabled]}
                onPress={handleAddComment}
                disabled={!commentText.trim()}
              >
                <Send 
                  color={commentText.trim() ? "#2563eb" : "#94a3b8"} 
                  size={20} 
                />
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1e293b",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#2563eb",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#64748b",
  },
  activeTabText: {
    color: "#2563eb",
    fontWeight: "600",
  },
  // Feed Styles
  storiesContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginBottom: 8,
  },
  addStory: {
    alignItems: "center",
    marginLeft: 20,
    marginRight: 12,
  },
  addStoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#2563eb",
    borderStyle: "dashed",
  },
  story: {
    alignItems: "center",
    marginRight: 12,
  },
  storyImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: "#2563eb",
  },
  storyText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    maxWidth: 60,
  },
  postCard: {
    backgroundColor: "#ffffff",
    marginBottom: 8,
    paddingVertical: 16,
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    justifyContent: "center",
    alignItems: "center",
  },
  verifiedText: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "bold",
  },
  postTime: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  postContent: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  postImage: {
    width: "100%",
    height: 200,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  likedText: {
    color: "#ef4444",
  },
  // Chat Styles
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#64748b",
  },
  chatContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  searchContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    alignItems: "center",
    gap: 12,
  },
  searchInput: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  contactsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  searchText: {
    fontSize: 16,
    color: "#64748b",
  },
  chatList: {
    flex: 1,
  },
  chatListContent: {
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  chatAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  avatarPlaceholder: {
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#64748b",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#10b981",
    borderWidth: 3,
    borderColor: "#ffffff",
  },
  pinnedIndicator: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  chatName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 13,
    color: "#64748b",
  },
  messageRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 15,
    color: "#64748b",
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#ffffff",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  originalPost: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginBottom: 8,
  },
  modalPostImage: {
    width: "100%",
    height: 160,
    marginTop: 12,
  },
  commentsList: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  commentItem: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 8,
  },
  commentUserName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  commentTime: {
    fontSize: 12,
    color: "#64748b",
  },
  commentText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 18,
    marginBottom: 8,
  },
  commentLikeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  commentLikeText: {
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  addCommentContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    gap: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    maxHeight: 100,
    backgroundColor: "#f8fafc",
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  // Create Post Modal Styles
  publishButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  publishButtonDisabled: {
    backgroundColor: "#e2e8f0",
  },
  publishButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  publishButtonTextDisabled: {
    color: "#94a3b8",
  },
  createPostUser: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    gap: 12,
  },
  postVisibility: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  createPostContent: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  postTextInput: {
    fontSize: 16,
    color: "#1e293b",
    lineHeight: 24,
    paddingHorizontal: 20,
    paddingVertical: 20,
    minHeight: 120,
  },
  imagePreviewContainer: {
    position: "relative",
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden",
  },
  imagePreview: {
    width: "100%",
    height: 200,
  },
  removeImageButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  postOptions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    gap: 24,
  },
  postOption: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  postOptionText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
});