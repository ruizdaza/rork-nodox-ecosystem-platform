import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { 
  Star, 
  Gift, 
  TrendingUp, 
  Users, 
  ShoppingBag,
  ChevronRight,
  Zap,
  Store,
  ArrowLeft,
  Plus,
  BarChart3,
  Calendar,
  CreditCard,
  Settings,
  Package,
  Clock,
  DollarSign,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  QrCode,
  Megaphone,
  UserPlus,
  Sparkles,
} from "lucide-react-native";
import { useNodoX, formatNcopValue, ncopToCop } from "@/hooks/use-nodox-store";
import { useRouter } from "expo-router";
import NodoXLogo from "@/components/NodoXLogo";

const RolePanelsCard = () => {
  const { user, switchToAllyView } = useNodoX();
  const router = useRouter();
  
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Mis Roles y Paneles</Text>
      
      {/* Panel de Aliado */}
      {user.roles.includes("ally") && (
        <TouchableOpacity 
          style={styles.roleCard}
          onPress={switchToAllyView}
        >
          <LinearGradient
            colors={["#8b5cf6", "#a855f7"]}
            style={styles.roleGradient}
          >
            <Store color="#ffffff" size={28} />
            <View style={styles.roleContent}>
              <Text style={styles.roleTitle}>Panel de Aliado</Text>
              <Text style={styles.roleSubtitle}>Gestiona tu negocio y ventas</Text>
            </View>
            <ChevronRight color="#ffffff" size={20} />
          </LinearGradient>
        </TouchableOpacity>
      )}
      
      {/* Panel de Artista */}
      {user.roles.includes("artist") && (
        <TouchableOpacity style={styles.roleCard}>
          <LinearGradient
            colors={["#10b981", "#059669"]}
            style={styles.roleGradient}
          >
            <Sparkles color="#ffffff" size={28} />
            <View style={styles.roleContent}>
              <Text style={styles.roleTitle}>Panel de Artista</Text>
              <Text style={styles.roleSubtitle}>Crea y vende contenido digital</Text>
            </View>
            <ChevronRight color="#ffffff" size={20} />
          </LinearGradient>
        </TouchableOpacity>
      )}
      
      {/* Panel Conecta */}
      {user.roles.includes("referrer") && (
        <TouchableOpacity 
          style={styles.roleCard}
          onPress={() => router.push('/referral-dashboard')}
        >
          <LinearGradient
            colors={["#f59e0b", "#d97706"]}
            style={styles.roleGradient}
          >
            <UserPlus color="#ffffff" size={28} />
            <View style={styles.roleContent}>
              <Text style={styles.roleTitle}>NodoX Conecta</Text>
              <Text style={styles.roleSubtitle}>Programa de referidos</Text>
            </View>
            <ChevronRight color="#ffffff" size={20} />
          </LinearGradient>
        </TouchableOpacity>
      )}
      
      {/* Panel de Admin */}
      {user.roles.includes("admin") && (
        <TouchableOpacity style={styles.roleCard}>
          <LinearGradient
            colors={["#ef4444", "#dc2626"]}
            style={styles.roleGradient}
          >
            <Settings color="#ffffff" size={28} />
            <View style={styles.roleContent}>
              <Text style={styles.roleTitle}>Panel de Administración</Text>
              <Text style={styles.roleSubtitle}>Gestión completa del sistema</Text>
            </View>
            <ChevronRight color="#ffffff" size={20} />
          </LinearGradient>
        </TouchableOpacity>
      )}
      
      {/* Solicitar nuevos roles */}
      <View style={styles.requestRolesContainer}>
        <Text style={styles.requestRolesTitle}>¿Quieres acceder a más funciones?</Text>
        
        {!user.roles.includes("ally") && (
          <TouchableOpacity style={styles.requestButton}>
            <Store color="#8b5cf6" size={20} />
            <Text style={styles.requestButtonText}>Solicitar Panel de Aliado</Text>
            <ChevronRight color="#64748b" size={16} />
          </TouchableOpacity>
        )}
        
        {!user.roles.includes("artist") && (
          <TouchableOpacity style={styles.requestButton}>
            <Sparkles color="#10b981" size={20} />
            <Text style={styles.requestButtonText}>Solicitar Panel de Artista</Text>
            <ChevronRight color="#64748b" size={16} />
          </TouchableOpacity>
        )}
        
        {!user.roles.includes("referrer") && (
          <TouchableOpacity 
            style={styles.requestButton}
            onPress={() => router.push('/referral-dashboard')}
          >
            <UserPlus color="#f59e0b" size={20} />
            <Text style={styles.requestButtonText}>Unirse a NodoX Conecta</Text>
            <ChevronRight color="#64748b" size={16} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const AllyDashboard = () => {
  const { 
    user, 
    allyMetrics, 
    products, 
    services,
    appointments, 
    campaigns,
    copBalance,
    switchToUserView,
    addProduct,
    updateProduct,
    deleteProduct,
    addService,
    updateService,
    deleteService,
    addStaffMember,
    updateAppointmentStatus,
    activateCampaign,
    generateAdCopy,
  } = useNodoX();

  const [activeTab, setActiveTab] = useState<"overview" | "products" | "services" | "calendar" | "pos" | "analytics" | "marketing" | "team">("overview");
  const [showProductModal, setShowProductModal] = useState<boolean>(false);
  const [showServiceModal, setShowServiceModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [editingService, setEditingService] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    ncopPrice: "",
    category: "",
    stock: "",
    isService: false,
    duration: "",
  });
  const [serviceForm, setServiceForm] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
  });
  const [posCart, setPosCart] = useState<any[]>([]);
  const [showQR, setShowQR] = useState<boolean>(false);
  const [adCopyText, setAdCopyText] = useState<string>("");
  const [selectedProductForAd, setSelectedProductForAd] = useState<any>(null);

  const resetProductForm = () => {
    setProductForm({
      name: "",
      description: "",
      price: "",
      ncopPrice: "",
      category: "",
      stock: "",
      isService: false,
      duration: "",
    });
    setEditingProduct(null);
  };

  const resetServiceForm = () => {
    setServiceForm({
      name: "",
      description: "",
      price: "",
      duration: "",
      category: "",
    });
    setEditingService(null);
  };

  const handleSaveProduct = () => {
    if (!productForm.name || !productForm.price) {
      Alert.alert("Error", "Nombre y precio son obligatorios");
      return;
    }

    const productData = {
      name: productForm.name,
      description: productForm.description,
      price: parseFloat(productForm.price),
      ncopPrice: productForm.ncopPrice ? parseFloat(productForm.ncopPrice) : undefined,
      category: productForm.category,
      images: ["https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"],
      stock: productForm.isService ? 0 : parseInt(productForm.stock) || 0,
      isActive: true,
      isService: productForm.isService,
      duration: productForm.isService ? parseInt(productForm.duration) || 30 : undefined,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }

    setShowProductModal(false);
    resetProductForm();
  };

  const handleSaveService = () => {
    if (!serviceForm.name || !serviceForm.price) {
      Alert.alert("Error", "Nombre y precio son obligatorios");
      return;
    }

    const serviceData = {
      name: serviceForm.name,
      description: serviceForm.description,
      price: parseFloat(serviceForm.price),
      duration: parseInt(serviceForm.duration) || 30,
      category: serviceForm.category,
      staff: [],
      isActive: true,
    };

    if (editingService) {
      updateService(editingService.id, serviceData);
    } else {
      addService(serviceData);
    }

    setShowServiceModal(false);
    resetServiceForm();
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      ncopPrice: product.ncopPrice?.toString() || "",
      category: product.category,
      stock: product.stock.toString(),
      isService: product.isService,
      duration: product.duration?.toString() || "",
    });
    setShowProductModal(true);
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setServiceForm({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category,
    });
    setShowServiceModal(true);
  };

  const handleDeleteService = (serviceId: string) => {
    Alert.alert(
      "Eliminar Servicio",
      "¿Estás seguro de que quieres eliminar este servicio?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => deleteService(serviceId) },
      ]
    );
  };

  const handleDeleteProduct = (productId: string) => {
    Alert.alert(
      "Eliminar Producto",
      "¿Estás seguro de que quieres eliminar este producto?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: () => deleteProduct(productId) },
      ]
    );
  };

  const addToCart = (product: any) => {
    const existingItem = posCart.find(item => item.id === product.id);
    if (existingItem) {
      setPosCart(prev => prev.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setPosCart(prev => [...prev, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setPosCart(prev => prev.filter(item => item.id !== productId));
  };

  const getTotalCart = () => {
    return posCart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const generatePOSQR = () => {
    if (posCart.length === 0) {
      Alert.alert("Error", "Agrega productos al carrito primero");
      return;
    }
    setShowQR(true);
  };

  const handleGenerateAdCopy = async (product: any) => {
    setSelectedProductForAd(product);
    const copy = await generateAdCopy(product.name, user.name);
    setAdCopyText(copy);
  };

  const handleActivateCampaign = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    Alert.alert(
      "Activar Campaña",
      `¿Deseas activar ${campaign.name} por ${campaign.price.toLocaleString()} COP durante ${campaign.duration} días?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Activar",
          onPress: () => {
            const success = activateCampaign(campaignId);
            if (success) {
              Alert.alert("Éxito", `Campaña ${campaign.name} activada correctamente`);
            } else {
              Alert.alert("Error", "Saldo insuficiente para activar la campaña");
            }
          },
        },
      ]
    );
  };

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <DollarSign color="#10b981" size={24} />
          <Text style={styles.metricValue}>${allyMetrics.monthlyRevenue.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Ingresos del Mes</Text>
        </View>
        <View style={styles.metricCard}>
          <Users color="#2563eb" size={24} />
          <Text style={styles.metricValue}>{allyMetrics.uniqueClients}</Text>
          <Text style={styles.metricLabel}>Clientes Únicos</Text>
        </View>
        <View style={styles.metricCard}>
          <TrendingUp color="#8b5cf6" size={24} />
          <Text style={styles.metricValue}>${allyMetrics.averageTicket.toLocaleString()}</Text>
          <Text style={styles.metricLabel}>Ticket Promedio</Text>
        </View>
        <View style={styles.metricCard}>
          <ShoppingBag color="#f59e0b" size={24} />
          <Text style={styles.metricValue}>{allyMetrics.totalOrders}</Text>
          <Text style={styles.metricLabel}>Órdenes Totales</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Productos Más Vendidos</Text>
        {allyMetrics.topProducts.map((product, index) => (
          <View key={index} style={styles.topProductItem}>
            <Text style={styles.topProductName}>{product.name}</Text>
            <Text style={styles.topProductSales}>{product.sales} ventas</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próximas Citas</Text>
        {appointments.slice(0, 3).map((appointment) => (
          <View key={appointment.id} style={styles.appointmentItem}>
            <View style={styles.appointmentInfo}>
              <Text style={styles.appointmentClient}>{appointment.clientName}</Text>
              <Text style={styles.appointmentTime}>{appointment.date} - {appointment.time}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: appointment.status === "confirmed" ? "#10b981" : "#f59e0b" }]}>
              <Text style={styles.statusText}>{appointment.status === "confirmed" ? "Confirmada" : "Pendiente"}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderServices = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mis Servicios</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowServiceModal(true)}
        >
          <Plus color="#ffffff" size={20} />
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {services.map((service) => (
        <View key={service.id} style={styles.serviceCard}>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{service.name}</Text>
            <Text style={styles.serviceDescription}>{service.description}</Text>
            <Text style={styles.servicePrice}>${service.price.toLocaleString()}</Text>
            <View style={styles.serviceMeta}>
              <Text style={styles.serviceCategory}>{service.category}</Text>
              <Text style={styles.serviceDuration}>{service.duration} min</Text>
            </View>
            <Text style={styles.serviceStaff}>Personal: {service.staff.length} miembro(s)</Text>
          </View>
          <View style={styles.serviceActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => updateService(service.id, { isActive: !service.isActive })}
            >
              {service.isActive ? <Eye color="#10b981" size={20} /> : <EyeOff color="#64748b" size={20} />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEditService(service)}
            >
              <Edit color="#2563eb" size={20} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteService(service.id)}
            >
              <Trash2 color="#ef4444" size={20} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleGenerateAdCopy(service)}
            >
              <Sparkles color="#8b5cf6" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderProducts = () => (
    <ScrollView style={styles.tabContent}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Mis Productos</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => setShowProductModal(true)}
        >
          <Plus color="#ffffff" size={20} />
          <Text style={styles.addButtonText}>Agregar</Text>
        </TouchableOpacity>
      </View>

      {products.map((product) => (
        <View key={product.id} style={styles.productCard}>
          <Image source={{ uri: product.images[0] }} style={styles.productImage} />
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
            <Text style={styles.productPrice}>${product.price.toLocaleString()}</Text>
            {product.ncopPrice && (
              <Text style={styles.productNcop}>{product.ncopPrice} NCOP (${ncopToCop(product.ncopPrice).toLocaleString()})</Text>
            )}
            <View style={styles.productMeta}>
              <Text style={styles.productCategory}>{product.category}</Text>
              {!product.isService && (
                <Text style={styles.productStock}>Stock: {product.stock}</Text>
              )}
            </View>
          </View>
          <View style={styles.productActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => updateProduct(product.id, { isActive: !product.isActive })}
            >
              {product.isActive ? <Eye color="#10b981" size={20} /> : <EyeOff color="#64748b" size={20} />}
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleEditProduct(product)}
            >
              <Edit color="#2563eb" size={20} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleDeleteProduct(product.id)}
            >
              <Trash2 color="#ef4444" size={20} />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleGenerateAdCopy(product)}
            >
              <Sparkles color="#8b5cf6" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const renderCalendar = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Agenda de Citas</Text>
      {appointments.map((appointment) => (
        <View key={appointment.id} style={styles.appointmentCard}>
          <View style={styles.appointmentHeader}>
            <Text style={styles.appointmentClient}>{appointment.clientName}</Text>
            <View style={[styles.statusBadge, { 
              backgroundColor: 
                appointment.status === "confirmed" ? "#10b981" :
                appointment.status === "pending" ? "#f59e0b" :
                appointment.status === "completed" ? "#2563eb" : "#ef4444"
            }]}>
              <Text style={styles.statusText}>
                {appointment.status === "confirmed" ? "Confirmada" :
                 appointment.status === "pending" ? "Pendiente" :
                 appointment.status === "completed" ? "Completada" : "Cancelada"}
              </Text>
            </View>
          </View>
          <Text style={styles.appointmentDetails}>{appointment.date} a las {appointment.time}</Text>
          <Text style={styles.appointmentAmount}>${appointment.amount.toLocaleString()}</Text>
          {appointment.notes && (
            <Text style={styles.appointmentNotes}>Notas: {appointment.notes}</Text>
          )}
          {appointment.status === "pending" && (
            <View style={styles.appointmentActions}>
              <TouchableOpacity 
                style={[styles.appointmentButton, { backgroundColor: "#10b981" }]}
                onPress={() => updateAppointmentStatus(appointment.id, "confirmed")}
              >
                <Text style={styles.appointmentButtonText}>Confirmar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.appointmentButton, { backgroundColor: "#ef4444" }]}
                onPress={() => updateAppointmentStatus(appointment.id, "cancelled")}
              >
                <Text style={styles.appointmentButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          )}
          {appointment.status === "confirmed" && (
            <TouchableOpacity 
              style={[styles.appointmentButton, { backgroundColor: "#2563eb" }]}
              onPress={() => updateAppointmentStatus(appointment.id, "completed")}
            >
              <Text style={styles.appointmentButtonText}>Marcar como Completada</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const renderPOS = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Terminal Punto de Venta</Text>
      
      <View style={styles.posSection}>
        <Text style={styles.posSubtitle}>Productos Disponibles</Text>
        <View style={styles.posProductGrid}>
          {products.filter(p => p.isActive && !p.isService).map((product) => (
            <TouchableOpacity 
              key={product.id} 
              style={styles.posProductCard}
              onPress={() => addToCart(product)}
            >
              <Text style={styles.posProductName}>{product.name}</Text>
              <Text style={styles.posProductPrice}>${product.price.toLocaleString()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.posSection}>
        <Text style={styles.posSubtitle}>Carrito de Compras</Text>
        {posCart.length === 0 ? (
          <Text style={styles.emptyCart}>Carrito vacío</Text>
        ) : (
          <>
            {posCart.map((item) => (
              <View key={item.id} style={styles.cartItem}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <Text style={styles.cartItemQuantity}>x{item.quantity}</Text>
                <Text style={styles.cartItemPrice}>${(item.price * item.quantity).toLocaleString()}</Text>
                <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                  <Trash2 color="#ef4444" size={16} />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.cartTotal}>
              <Text style={styles.cartTotalText}>Total: ${getTotalCart().toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.generateQRButton} onPress={generatePOSQR}>
              <QrCode color="#ffffff" size={20} />
              <Text style={styles.generateQRText}>Generar QR de Pago</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );

  const renderAnalytics = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Analíticas y CRM</Text>
      
      <View style={styles.analyticsSection}>
        <Text style={styles.analyticsSubtitle}>Demografía de Clientes</Text>
        <View style={styles.demographicsGrid}>
          <View style={styles.demographicCard}>
            <Text style={styles.demographicTitle}>Por Edad</Text>
            {allyMetrics.clientDemographics.ageGroups.map((group, index) => (
              <View key={index} style={styles.demographicItem}>
                <Text style={styles.demographicLabel}>{group.range}</Text>
                <Text style={styles.demographicValue}>{group.percentage}%</Text>
              </View>
            ))}
          </View>
          <View style={styles.demographicCard}>
            <Text style={styles.demographicTitle}>Por Género</Text>
            <View style={styles.demographicItem}>
              <Text style={styles.demographicLabel}>Masculino</Text>
              <Text style={styles.demographicValue}>{allyMetrics.clientDemographics.genderDistribution.male}%</Text>
            </View>
            <View style={styles.demographicItem}>
              <Text style={styles.demographicLabel}>Femenino</Text>
              <Text style={styles.demographicValue}>{allyMetrics.clientDemographics.genderDistribution.female}%</Text>
            </View>
            <View style={styles.demographicItem}>
              <Text style={styles.demographicLabel}>Otro</Text>
              <Text style={styles.demographicValue}>{allyMetrics.clientDemographics.genderDistribution.other}%</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderMarketing = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Marketing y Campañas</Text>
      
      <View style={styles.marketingSection}>
        <Text style={styles.marketingSubtitle}>Campañas Disponibles</Text>
        {campaigns.map((campaign) => (
          <View key={campaign.id} style={styles.campaignCard}>
            <View style={styles.campaignHeader}>
              <Text style={styles.campaignName}>{campaign.name}</Text>
              <Text style={styles.campaignPrice}>${campaign.price.toLocaleString()}</Text>
            </View>
            <Text style={styles.campaignDuration}>Duración: {campaign.duration} días</Text>
            <TouchableOpacity 
              style={styles.campaignButton}
              onPress={() => handleActivateCampaign(campaign.id)}
            >
              <Megaphone color="#ffffff" size={16} />
              <Text style={styles.campaignButtonText}>Activar Campaña</Text>
            </TouchableOpacity>
          </View>
        ))}
      </View>

      {selectedProductForAd && (
        <View style={styles.adCopySection}>
          <Text style={styles.adCopyTitle}>Texto Publicitario Generado</Text>
          <View style={styles.adCopyContainer}>
            <Text style={styles.adCopyText}>{adCopyText}</Text>
          </View>
          <TouchableOpacity 
            style={styles.copyButton}
            onPress={() => {
              Alert.alert("Copiado", "Texto copiado al portapapeles");
              setSelectedProductForAd(null);
            }}
          >
            <Text style={styles.copyButtonText}>Copiar Texto</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );

  const renderTeam = () => (
    <ScrollView style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Gestión de Equipo</Text>
      
      <View style={styles.teamSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.teamSubtitle}>Miembros del Equipo</Text>
          <TouchableOpacity style={styles.addButton}>
            <UserPlus color="#ffffff" size={20} />
            <Text style={styles.addButtonText}>Invitar</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.teamMemberCard}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face" }} 
            style={styles.teamMemberAvatar} 
          />
          <View style={styles.teamMemberInfo}>
            <Text style={styles.teamMemberName}>Ana Rodríguez</Text>
            <Text style={styles.teamMemberRole}>Estilista Principal</Text>
            <Text style={styles.teamMemberSpecialties}>Especialidades: Cortes, Peinados</Text>
          </View>
          <View style={styles.teamMemberActions}>
            <TouchableOpacity style={styles.teamActionButton}>
              <Settings color="#64748b" size={16} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={switchToUserView}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <NodoXLogo size="small" showText={false} />
          <Store color="#2563eb" size={24} />
          <Text style={styles.headerTitle}>Panel de Aliado</Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: "overview", label: "Resumen", icon: BarChart3 },
            { key: "products", label: "Productos", icon: Package },
            { key: "services", label: "Servicios", icon: Clock },
            { key: "calendar", label: "Agenda", icon: Calendar },
            { key: "pos", label: "POS", icon: CreditCard },
            { key: "analytics", label: "Analíticas", icon: TrendingUp },
            { key: "marketing", label: "Marketing", icon: Megaphone },
            { key: "team", label: "Equipo", icon: Users },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.activeTab]}
              onPress={() => setActiveTab(tab.key as any)}
            >
              <tab.icon 
                color={activeTab === tab.key ? "#2563eb" : "#64748b"} 
                size={20} 
              />
              <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {activeTab === "overview" && renderOverview()}
      {activeTab === "products" && renderProducts()}
      {activeTab === "services" && renderServices()}
      {activeTab === "calendar" && renderCalendar()}
      {activeTab === "pos" && renderPOS()}
      {activeTab === "analytics" && renderAnalytics()}
      {activeTab === "marketing" && renderMarketing()}
      {activeTab === "team" && renderTeam()}

      {/* Service Modal */}
      <Modal visible={showServiceModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { setShowServiceModal(false); resetServiceForm(); }}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingService ? "Editar Servicio" : "Nuevo Servicio"}
            </Text>
            <TouchableOpacity onPress={handleSaveService}>
              <Text style={styles.modalSave}>Guardar</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre *</Text>
              <TextInput
                style={styles.formInput}
                value={serviceForm.name}
                onChangeText={(text) => setServiceForm(prev => ({ ...prev, name: text }))}
                placeholder="Nombre del servicio"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descripción</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={serviceForm.description}
                onChangeText={(text) => setServiceForm(prev => ({ ...prev, description: text }))}
                placeholder="Descripción del servicio"
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Precio COP *</Text>
                <TextInput
                  style={styles.formInput}
                  value={serviceForm.price}
                  onChangeText={(text) => setServiceForm(prev => ({ ...prev, price: text }))}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Duración (min)</Text>
                <TextInput
                  style={styles.formInput}
                  value={serviceForm.duration}
                  onChangeText={(text) => setServiceForm(prev => ({ ...prev, duration: text }))}
                  placeholder="30"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Categoría</Text>
              <TextInput
                style={styles.formInput}
                value={serviceForm.category}
                onChangeText={(text) => setServiceForm(prev => ({ ...prev, category: text }))}
                placeholder="Categoría del servicio"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Product Modal */}
      <Modal visible={showProductModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => { setShowProductModal(false); resetProductForm(); }}>
              <Text style={styles.modalCancel}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingProduct ? "Editar Producto" : "Nuevo Producto"}
            </Text>
            <TouchableOpacity onPress={handleSaveProduct}>
              <Text style={styles.modalSave}>Guardar</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre *</Text>
              <TextInput
                style={styles.formInput}
                value={productForm.name}
                onChangeText={(text) => setProductForm(prev => ({ ...prev, name: text }))}
                placeholder="Nombre del producto"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Descripción</Text>
              <TextInput
                style={[styles.formInput, styles.textArea]}
                value={productForm.description}
                onChangeText={(text) => setProductForm(prev => ({ ...prev, description: text }))}
                placeholder="Descripción del producto"
                multiline
                numberOfLines={3}
              />
            </View>
            
            <View style={styles.formRow}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Precio COP *</Text>
                <TextInput
                  style={styles.formInput}
                  value={productForm.price}
                  onChangeText={(text) => setProductForm(prev => ({ ...prev, price: text }))}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Precio NCOP (1 NCOP = $100 COP)</Text>
                <TextInput
                  style={styles.formInput}
                  value={productForm.ncopPrice}
                  onChangeText={(text) => setProductForm(prev => ({ ...prev, ncopPrice: text }))}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Categoría</Text>
              <TextInput
                style={styles.formInput}
                value={productForm.category}
                onChangeText={(text) => setProductForm(prev => ({ ...prev, category: text }))}
                placeholder="Categoría del producto"
              />
            </View>
            
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>¿Es un servicio?</Text>
              <TouchableOpacity 
                style={[styles.switch, productForm.isService && styles.switchActive]}
                onPress={() => setProductForm(prev => ({ ...prev, isService: !prev.isService }))}
              >
                <View style={[styles.switchThumb, productForm.isService && styles.switchThumbActive]} />
              </TouchableOpacity>
            </View>
            
            {!productForm.isService && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Stock</Text>
                <TextInput
                  style={styles.formInput}
                  value={productForm.stock}
                  onChangeText={(text) => setProductForm(prev => ({ ...prev, stock: text }))}
                  placeholder="0"
                  keyboardType="numeric"
                />
              </View>
            )}
            
            {productForm.isService && (
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Duración (minutos)</Text>
                <TextInput
                  style={styles.formInput}
                  value={productForm.duration}
                  onChangeText={(text) => setProductForm(prev => ({ ...prev, duration: text }))}
                  placeholder="30"
                  keyboardType="numeric"
                />
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* QR Modal */}
      <Modal visible={showQR} animationType="fade" transparent>
        <View style={styles.qrModalOverlay}>
          <View style={styles.qrModalContent}>
            <Text style={styles.qrTitle}>Código QR de Pago</Text>
            <View style={styles.qrPlaceholder}>
              <QrCode color="#1e293b" size={120} />
              <Text style={styles.qrAmount}>Total: ${getTotalCart().toLocaleString()}</Text>
            </View>
            <Text style={styles.qrInstructions}>
              El cliente debe escanear este código para realizar el pago
            </Text>
            <TouchableOpacity 
              style={styles.qrCloseButton}
              onPress={() => { setShowQR(false); setPosCart([]); }}
            >
              <Text style={styles.qrCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default function HomeScreen() {
  const router = useRouter();
  const { user, ncopBalance, recentActivity, currentView } = useNodoX();

  if (currentView === "ally" && user.isAlly) {
    return <AllyDashboard />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>¡Hola, {user.name}!</Text>
            <Text style={styles.subtitle}>Bienvenido a NodoX</Text>
          </View>
          <View style={styles.membershipBadge}>
            <Star color="#fbbf24" size={16} />
            <Text style={styles.membershipText}>NodePass</Text>
          </View>
        </View>

        {/* NCOP Balance Card */}
        <LinearGradient
          colors={["#2563eb", "#3b82f6"]}
          style={styles.balanceCard}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Tu saldo NCOP</Text>
            <Zap color="#ffffff" size={20} />
          </View>
          <Text style={styles.balanceAmount}>{ncopBalance.toLocaleString()}</Text>
          <Text style={styles.balanceEquivalent}>${ncopToCop(ncopBalance).toLocaleString()} COP</Text>
          <Text style={styles.balanceSubtext}>Puntos de fidelidad disponibles</Text>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acciones rápidas</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/exchange-ncop')}
            >
              <Gift color="#2563eb" size={24} />
              <Text style={styles.actionText}>Canjear NCOP</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionCard}>
              <TrendingUp color="#10b981" size={24} />
              <Text style={styles.actionText}>Ganar puntos</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => router.push('/referral-dashboard')}
            >
              <Users color="#8b5cf6" size={24} />
              <Text style={styles.actionText}>Referir amigos</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Role Panels */}
        <RolePanelsCard />

        {/* Featured Offers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Ofertas destacadas</Text>
            <TouchableOpacity style={styles.seeAllButton}>
              <Text style={styles.seeAllText}>Ver todas</Text>
              <ChevronRight color="#64748b" size={16} />
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.offerCard}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop" }}
                style={styles.offerImage}
              />
              <View style={styles.offerContent}>
                <Text style={styles.offerTitle}>Restaurante El Sabor</Text>
                <Text style={styles.offerDiscount}>20% de descuento</Text>
                <Text style={styles.offerPrice}>50 NCOP</Text>
                <Text style={styles.offerPriceEquivalent}>$5.000 COP</Text>
              </View>
            </View>
            <View style={styles.offerCard}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop" }}
                style={styles.offerImage}
              />
              <View style={styles.offerContent}>
                <Text style={styles.offerTitle}>Tienda Fashion</Text>
                <Text style={styles.offerDiscount}>15% de descuento</Text>
                <Text style={styles.offerPrice}>30 NCOP</Text>
                <Text style={styles.offerPriceEquivalent}>$3.000 COP</Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actividad reciente</Text>
          {recentActivity.map((activity, index) => (
            <View key={index} style={styles.activityItem}>
              <View style={[styles.activityIcon, { backgroundColor: activity.color }]}>
                <activity.icon color="#ffffff" size={16} />
              </View>
              <View style={styles.activityContent}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDate}>{activity.date}</Text>
              </View>
              <Text style={[styles.activityAmount, { color: activity.amount > 0 ? "#10b981" : "#ef4444" }]}>
                {activity.amount > 0 ? "+" : ""}{activity.amount} NCOP (${ncopToCop(Math.abs(activity.amount)).toLocaleString()})
              </Text>
            </View>
          ))}
        </View>
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
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  membershipBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  membershipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400e",
  },
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#e2e8f0",
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 2,
  },
  balanceEquivalent: {
    fontSize: 14,
    color: "#cbd5e1",
    marginBottom: 4,
  },
  balanceSubtext: {
    fontSize: 12,
    color: "#cbd5e1",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
    textAlign: "center",
  },
  offerCard: {
    width: 200,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginLeft: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  offerImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  offerContent: {
    padding: 12,
  },
  offerTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  offerDiscount: {
    fontSize: 12,
    color: "#10b981",
    fontWeight: "500",
    marginBottom: 4,
  },
  offerPrice: {
    fontSize: 12,
    color: "#2563eb",
    fontWeight: "600",
  },
  offerPriceEquivalent: {
    fontSize: 10,
    color: "#64748b",
    marginTop: 2,
  },
  activityItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
  },
  activityDate: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  activityAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
  // Ally Dashboard Styles
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 16,
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  tabBar: {
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 12,
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    gap: 6,
  },
  activeTab: {
    backgroundColor: "#eff6ff",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  activeTabText: {
    color: "#2563eb",
  },
  tabContent: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
  },
  metricLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  topProductItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 8,
  },
  topProductName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
  },
  topProductSales: {
    fontSize: 14,
    color: "#64748b",
  },
  appointmentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 8,
  },
  appointmentInfo: {
    flex: 1,
  },
  appointmentClient: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  appointmentTime: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#ffffff",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  productCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
    marginBottom: 2,
  },
  productNcop: {
    fontSize: 12,
    color: "#2563eb",
    marginBottom: 4,
  },
  productMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productCategory: {
    fontSize: 10,
    color: "#64748b",
  },
  productStock: {
    fontSize: 10,
    color: "#64748b",
  },
  productActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
  },
  appointmentCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  appointmentDetails: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 4,
  },
  appointmentAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10b981",
    marginBottom: 8,
  },
  appointmentNotes: {
    fontSize: 12,
    color: "#64748b",
    fontStyle: "italic",
    marginBottom: 12,
  },
  appointmentActions: {
    flexDirection: "row",
    gap: 8,
  },
  appointmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  appointmentButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  posSection: {
    marginBottom: 24,
  },
  posSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  posProductGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
  },
  posProductCard: {
    width: "45%",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  posProductName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 4,
  },
  posProductPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },
  emptyCart: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    paddingVertical: 20,
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 8,
    gap: 12,
  },
  cartItemName: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
  },
  cartItemQuantity: {
    fontSize: 12,
    color: "#64748b",
  },
  cartItemPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },
  cartTotal: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cartTotalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  generateQRButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    marginHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
    gap: 8,
  },
  generateQRText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  analyticsSection: {
    marginBottom: 24,
  },
  analyticsSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  demographicsGrid: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  demographicCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demographicTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  demographicItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  demographicLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  demographicValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
  },
  marketingSection: {
    marginBottom: 24,
  },
  marketingSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  campaignCard: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  campaignHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  campaignName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  campaignPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
  },
  campaignDuration: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 12,
  },
  campaignButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563eb",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: "center",
    gap: 6,
  },
  campaignButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  adCopySection: {
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  adCopyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  adCopyContainer: {
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  adCopyText: {
    fontSize: 14,
    color: "#1e293b",
    lineHeight: 20,
  },
  copyButton: {
    backgroundColor: "#8b5cf6",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  copyButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ffffff",
  },
  teamSection: {
    marginBottom: 24,
  },
  teamSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  teamMemberCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamMemberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  teamMemberInfo: {
    flex: 1,
  },
  teamMemberName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  teamMemberRole: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 2,
  },
  teamMemberSpecialties: {
    fontSize: 10,
    color: "#64748b",
  },
  teamMemberActions: {
    flexDirection: "row",
    gap: 8,
  },
  teamActionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f1f5f9",
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  modalCancel: {
    fontSize: 16,
    color: "#64748b",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
  },
  modalSave: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "#1e293b",
    backgroundColor: "#ffffff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  formRow: {
    flexDirection: "row",
    gap: 12,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  switch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#e2e8f0",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  switchActive: {
    backgroundColor: "#2563eb",
  },
  switchThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#ffffff",
    alignSelf: "flex-start",
  },
  switchThumbActive: {
    alignSelf: "flex-end",
  },
  // QR Modal Styles
  qrModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  qrModalContent: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginHorizontal: 20,
    maxWidth: 300,
  },
  qrTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 20,
  },
  qrPlaceholder: {
    alignItems: "center",
    marginBottom: 20,
  },
  qrAmount: {
    fontSize: 16,
    fontWeight: "600",
    color: "#10b981",
    marginTop: 12,
  },
  qrInstructions: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 20,
  },
  qrCloseButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  qrCloseText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
  },
  // Service Styles
  serviceCard: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 12,
    color: "#64748b",
    marginBottom: 4,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10b981",
    marginBottom: 4,
  },
  serviceMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  serviceCategory: {
    fontSize: 10,
    color: "#64748b",
  },
  serviceDuration: {
    fontSize: 10,
    color: "#64748b",
  },
  serviceStaff: {
    fontSize: 10,
    color: "#8b5cf6",
  },
  serviceActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  // Role Panels
  roleCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  roleGradient: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },
  roleContent: {
    flex: 1,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 2,
  },
  roleSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.8)",
  },
  requestRolesContainer: {
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  requestRolesTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  requestButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  requestButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
});