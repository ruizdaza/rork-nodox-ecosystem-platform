import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  Animated,
  Platform,
  Dimensions
} from 'react-native';
import { 
  Search, 
  Mic, 
  MicOff, 
  X, 
  Clock, 
  TrendingUp,
  Sparkles,
  Filter
} from 'lucide-react-native';
import { useSmartSearch } from '@/hooks/use-smart-search';
import { SearchSuggestion } from '@/types/search';

interface SmartSearchBarProps {
  onSearch: (query: string) => void;
  onFilterPress?: () => void;
  placeholder?: string;
  showVoiceSearch?: boolean;
  showFilters?: boolean;
}

const { width } = Dimensions.get('window');

export default function SmartSearchBar({
  onSearch,
  onFilterPress,
  placeholder = "Buscar productos...",
  showVoiceSearch = true,
  showFilters = true
}: SmartSearchBarProps) {
  const {
    query,
    suggestions,
    isVoiceSearching,
    setQuery,
    getSuggestions,
    startVoiceSearch,
    stopVoiceSearch,
    search,
    searchHistory,
    clearSearchHistory
  } = useSmartSearch();
  
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const inputRef = useRef<TextInput>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const suggestionAnim = useRef(new Animated.Value(0)).current;

  // Voice search pulse animation
  useEffect(() => {
    if (isVoiceSearching) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isVoiceSearching, pulseAnim]);

  // Suggestions animation
  useEffect(() => {
    if (showSuggestions) {
      Animated.timing(suggestionAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(suggestionAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [showSuggestions, suggestionAnim]);

  const handleQueryChange = async (text: string) => {
    setQuery(text);
    
    if (text.trim().length > 0) {
      await getSuggestions(text);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      search(searchQuery);
      onSearch(searchQuery);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSuggestionPress = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const handleVoiceSearch = async () => {
    if (isVoiceSearching) {
      stopVoiceSearch();
    } else {
      try {
        await startVoiceSearch();
      } catch (error) {
        console.error('Voice search error:', error);
      }
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (query.trim().length === 0 && searchHistory.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const renderSuggestion = ({ item }: { item: SearchSuggestion }) => {
    const getIcon = () => {
      switch (item.type) {
        case 'product':
          return <Search color="#64748b" size={16} />;
        case 'category':
          return <Filter color="#64748b" size={16} />;
        case 'query':
          return <TrendingUp color="#64748b" size={16} />;
        default:
          return <Search color="#64748b" size={16} />;
      }
    };

    return (
      <TouchableOpacity
        style={styles.suggestionItem}
        onPress={() => handleSuggestionPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.suggestionIcon}>
          {getIcon()}
        </View>
        <View style={styles.suggestionContent}>
          <Text style={styles.suggestionText}>{item.text}</Text>
          {item.count && (
            <Text style={styles.suggestionCount}>{item.count} resultados</Text>
          )}
        </View>
        {item.type === 'product' && (
          <View style={styles.aiTag}>
            <Sparkles color="#2563eb" size={12} />
            <Text style={styles.aiTagText}>AI</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const renderHistoryItem = (historyQuery: string, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.historyItem}
      onPress={() => {
        setQuery(historyQuery);
        handleSearch(historyQuery);
      }}
      activeOpacity={0.7}
    >
      <Clock color="#64748b" size={16} />
      <Text style={styles.historyText}>{historyQuery}</Text>
    </TouchableOpacity>
  );

  const displayData = query.trim().length > 0 ? suggestions : [];
  const showHistory = query.trim().length === 0 && searchHistory.length > 0 && isFocused;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <View style={[styles.searchBar, isFocused && styles.searchBarFocused]}>
          <Search color="#64748b" size={20} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder={placeholder}
            value={query}
            onChangeText={handleQueryChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={() => handleSearch(query)}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
          />
          
          {query.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                setQuery('');
                setShowSuggestions(false);
              }}
            >
              <X color="#64748b" size={18} />
            </TouchableOpacity>
          )}
          
          {showVoiceSearch && (
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[
                  styles.voiceButton,
                  isVoiceSearching && styles.voiceButtonActive
                ]}
                onPress={handleVoiceSearch}
                disabled={Platform.OS === 'web' && !('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)}
              >
                {isVoiceSearching ? (
                  <MicOff color="#ffffff" size={18} />
                ) : (
                  <Mic color={isVoiceSearching ? "#ffffff" : "#64748b"} size={18} />
                )}
              </TouchableOpacity>
            </Animated.View>
          )}
        </View>
        
        {showFilters && onFilterPress && (
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={onFilterPress}
          >
            <Filter color="#2563eb" size={20} />
          </TouchableOpacity>
        )}
      </View>

      {(showSuggestions || showHistory) && (
        <Animated.View 
          style={[
            styles.suggestionsContainer,
            {
              opacity: suggestionAnim,
              transform: [{
                translateY: suggestionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-10, 0],
                })
              }]
            }
          ]}
        >
          {showHistory && (
            <View style={styles.historySection}>
              <View style={styles.historySectionHeader}>
                <Text style={styles.historySectionTitle}>Búsquedas recientes</Text>
                <TouchableOpacity onPress={clearSearchHistory}>
                  <Text style={styles.clearHistoryText}>Limpiar</Text>
                </TouchableOpacity>
              </View>
              {searchHistory.slice(0, 5).map(renderHistoryItem)}
            </View>
          )}
          
          {displayData.length > 0 && (
            <FlatList
              data={displayData}
              renderItem={renderSuggestion}
              keyExtractor={(item) => item.id}
              style={styles.suggestionsList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          )}
        </Animated.View>
      )}
      
      {isVoiceSearching && (
        <View style={styles.voiceStatus}>
          <View style={styles.voiceStatusContent}>
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <Mic color="#2563eb" size={24} />
            </Animated.View>
            <Text style={styles.voiceStatusText}>Escuchando...</Text>
            <Text style={styles.voiceStatusSubtext}>Habla ahora</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  searchBarFocused: {
    borderColor: '#2563eb',
    backgroundColor: '#ffffff',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  clearButton: {
    padding: 4,
  },
  voiceButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  voiceButtonActive: {
    backgroundColor: '#ef4444',
  },
  filterButton: {
    backgroundColor: '#eff6ff',
    borderRadius: 12,
    padding: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 300,
    zIndex: 1001,
  },
  suggestionsList: {
    maxHeight: 250,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 12,
  },
  suggestionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  suggestionCount: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  aiTagText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#2563eb',
  },
  historySection: {
    paddingVertical: 8,
  },
  historySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  historySectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
  },
  clearHistoryText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '500',
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 12,
  },
  historyText: {
    fontSize: 16,
    color: '#374151',
  },
  voiceStatus: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1002,
  },
  voiceStatusContent: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  voiceStatusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  voiceStatusSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
});