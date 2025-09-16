import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Search, Filter, MapPin, Star } from "lucide-react-native";
import { useOffers } from "@/hooks/use-offers";
import NodoXLogo from "@/components/NodoXLogo";

export default function OffersScreen() {
  const { offers, categories } = useOffers();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredOffers = offers.filter(offer => {
    const matchesCategory = selectedCategory === "all" || offer.category === selectedCategory;
    const matchesSearch = offer.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         offer.business.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <NodoXLogo size="small" showText={false} />
          <Text style={styles.headerTitle}>Ofertas de Aliados</Text>
        </View>
        <TouchableOpacity style={styles.filterButton}>
          <Filter color="#64748b" size={20} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search color="#64748b" size={20} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar ofertas o negocios..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <View style={styles.categoriesGrid}>
          <TouchableOpacity
            style={[
              styles.categoryChip,
              selectedCategory === "all" && styles.categoryChipActive
            ]}
            onPress={() => setSelectedCategory("all")}
          >
            <Text style={[
              styles.categoryText,
              selectedCategory === "all" && styles.categoryTextActive
            ]}>
              Todas
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Offers List */}
      <ScrollView showsVerticalScrollIndicator={false} style={styles.offersList}>
        {filteredOffers.map((offer) => (
          <TouchableOpacity key={offer.id} style={styles.offerCard}>
            <Image source={{ uri: offer.image }} style={styles.offerImage} />
            <View style={styles.offerContent}>
              <View style={styles.offerHeader}>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <View style={styles.ratingContainer}>
                  <Star color="#fbbf24" size={14} fill="#fbbf24" />
                  <Text style={styles.rating}>{offer.rating}</Text>
                </View>
              </View>
              <Text style={styles.businessName}>{offer.business}</Text>
              <View style={styles.locationContainer}>
                <MapPin color="#64748b" size={12} />
                <Text style={styles.location}>{offer.location}</Text>
              </View>
              <Text style={styles.description}>{offer.description}</Text>
              <View style={styles.offerFooter}>
                <View style={styles.discountContainer}>
                  <Text style={styles.discount}>{offer.discount}</Text>
                  <Text style={styles.originalPrice}>{offer.originalPrice}</Text>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.ncopPrice}>{offer.ncopPrice} NCOP</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  filterButton: {
    padding: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1e293b",
  },
  categoriesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
  },
  categoryChip: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: "30%",
    alignItems: "center",
    flexGrow: 1,
    maxWidth: "32%",
  },
  categoryChipActive: {
    backgroundColor: "#2563eb",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
    textAlign: "center",
  },
  categoryTextActive: {
    color: "#ffffff",
  },
  offersList: {
    flex: 1,
    paddingTop: 16,
  },
  offerCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offerImage: {
    width: "100%",
    height: 160,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  offerContent: {
    padding: 16,
  },
  offerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  offerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  businessName: {
    fontSize: 14,
    color: "#2563eb",
    fontWeight: "500",
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 8,
  },
  location: {
    fontSize: 12,
    color: "#64748b",
  },
  description: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 18,
    marginBottom: 12,
  },
  offerFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  discountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  discount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#10b981",
  },
  originalPrice: {
    fontSize: 12,
    color: "#64748b",
    textDecorationLine: "line-through",
  },
  priceContainer: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  ncopPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },
});