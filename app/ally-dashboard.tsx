import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Stack, useRouter } from "expo-router";
import {
  ArrowLeft,
  BarChart3,
  Package,
  Calendar,
  Users,
  CreditCard,
  Megaphone,
  Settings,
  Store,
  Clock,
  UserCheck,
  Stethoscope,
  Scissors,
  Sparkles,
  Heart,
  PawPrint,
  Plus,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  Search,
  Filter,
  ShoppingCart,
  Tag,
  Image,
  AlertCircle,
  Minus,
  X,
  Calculator,
  Receipt,
  Printer,
  Smartphone,
  Banknote,
  Wallet,
  QrCode,
  CheckCircle,
  XCircle,
  DollarSign,
  Hash,
  Percent,
  PieChart,
  LineChart,
  Activity,
  Target,
  Award,
  MapPin,
  Star,
  Download,
  FileText,
  RefreshCw,
  TrendingUp,
  TrendingDown,
} from "lucide-react-native";
import { useNodoX } from "@/hooks/use-nodox-store";
import NodoXLogo from "@/components/NodoXLogo";
const { width } = Dimensions.get("window");

type AllyView = 
  | "overview" 
  | "products" 
  | "services" 
  | "appointments" 
  | "staff" 
  | "pos" 
  | "analytics" 
  | "marketing" 
  | "crm"
  | "erp"
  | "cms"
  | "settings";

export default function AllyDashboard() {
  const router = useRouter();
  const { 
    switchToUserView, 
    allyMetrics, 
    services, 
    appointments, 
    products,
    addProduct,
    updateProduct,
    deleteProduct 
  } = useNodoX();
  const [currentView, setCurrentView] = useState<AllyView>("overview");
  const [productSearchQuery, setProductSearchQuery] = useState<string>("");
  const [productFilter, setProductFilter] = useState<"all" | "products" | "services" | "active" | "inactive">("all");
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  
  // POS State
  const [posCart, setPosCart] = useState<Array<{id: string, name: string, price: number, quantity: number, isService?: boolean}>>([]);
  const [posCustomer, setPosCustomer] = useState<string>("");
  const [posDiscount, setPosDiscount] = useState<number>(0);
  const [posPaymentMethod, setPosPaymentMethod] = useState<"cash" | "card" | "ncop" | "transfer">("cash");
  const [posShowPayment, setPosShowPayment] = useState<boolean>(false);
  const [posAmountReceived, setPosAmountReceived] = useState<string>("");
  const [posTransactionComplete, setPosTransactionComplete] = useState<boolean>(false);
  const [posLastTransaction, setPosLastTransaction] = useState<any>(null);
  
  // Analytics State
  const [analyticsTimeRange, setAnalyticsTimeRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [analyticsView, setAnalyticsView] = useState<"overview" | "sales" | "products" | "customers" | "staff">("overview");

  const menuItems = [
    { id: "overview", icon: BarChart3, title: "Resumen", color: "#2563eb" },
    { id: "products", icon: Package, title: "Productos", color: "#059669" },
    { id: "services", icon: Stethoscope, title: "Servicios", color: "#7c3aed" },
    { id: "appointments", icon: Calendar, title: "Citas", color: "#dc2626" },
    { id: "staff", icon: Users, title: "Personal", color: "#ea580c" },
    { id: "crm", icon: Users, title: "CRM Clientes", color: "#0891b2" },
    { id: "erp", icon: Package, title: "ERP Sistema", color: "#059669" },
    { id: "pos", icon: CreditCard, title: "Terminal POS", color: "#0891b2" },
    { id: "analytics", icon: BarChart3, title: "Analíticas", color: "#7c2d12" },
    { id: "marketing", icon: Megaphone, title: "Marketing", color: "#be185d" },
    { id: "cms", icon: FileText, title: "CMS Contenido", color: "#7c3aed" },
    { id: "settings", icon: Settings, title: "Configuración", color: "#374151" },
  ];

  const serviceCategories = [
    { icon: Stethoscope, title: "Médico", color: "#dc2626" },
    { icon: Scissors, title: "Peluquería", color: "#7c3aed" },
    { icon: Sparkles, title: "Estética", color: "#ec4899" },
    { icon: Heart, title: "Spa", color: "#059669" },
    { icon: PawPrint, title: "Veterinario", color: "#ea580c" },
  ];

  const renderOverview = () => (
    <ScrollView style={styles.content}>
      {/* Business Header */}
      <View style={styles.businessHeader}>
        <View style={styles.businessInfo}>
          <Store color="#2563eb" size={24} />
          <View style={styles.businessDetails}>
            <Text style={styles.businessName}>Clínica Dental Sonrisa</Text>
            <Text style={styles.businessCategory}>Servicios Médicos</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.switchButton}
          onPress={switchToUserView}
        >
          <Text style={styles.switchButtonText}>Vista Cliente</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${allyMetrics.monthlyRevenue.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Ingresos del mes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{appointments.length}</Text>
          <Text style={styles.statLabel}>Citas pendientes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{allyMetrics.uniqueClients}</Text>
          <Text style={styles.statLabel}>Clientes únicos</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${allyMetrics.averageTicket.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Ticket promedio</Text>
        </View>
      </View>

      {/* Today's Appointments */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Citas de hoy</Text>
        {appointments.slice(0, 3).map((appointment) => (
          <View key={appointment.id} style={styles.appointmentCard}>
            <View style={styles.appointmentTime}>
              <Clock color="#2563eb" size={16} />
              <Text style={styles.timeText}>{appointment.time}</Text>
            </View>
            <View style={styles.appointmentInfo}>
              <Text style={styles.clientName}>{appointment.clientName}</Text>
              <Text style={styles.serviceNameInCard}>
                {services.find(s => s.id === appointment.serviceId)?.name}
              </Text>
            </View>
            <View style={[styles.statusBadge, 
              { backgroundColor: appointment.status === 'confirmed' ? '#dcfce7' : '#fef3c7' }
            ]}>
              <Text style={[styles.statusText, 
                { color: appointment.status === 'confirmed' ? '#166534' : '#92400e' }
              ]}>
                {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => setCurrentView("services")}
          >
            <Stethoscope color="#7c3aed" size={24} />
            <Text style={styles.quickActionText}>Gestionar Servicios</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => setCurrentView("appointments")}
          >
            <Calendar color="#dc2626" size={24} />
            <Text style={styles.quickActionText}>Ver Calendario</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.quickAction}
            onPress={() => setCurrentView("staff")}
          >
            <Users color="#ea580c" size={24} />
            <Text style={styles.quickActionText}>Gestionar Personal</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderServices = () => (
    <ScrollView style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Gestión de Servicios</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/add-service')}
        >
          <Text style={styles.addButtonText}>+ Agregar Servicio</Text>
        </TouchableOpacity>
      </View>

      {/* Service Categories */}
      <View style={styles.categoriesContainer}>
        <Text style={styles.subsectionTitle}>Categorías de servicios</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoriesRow}>
            {serviceCategories.map((category) => (
              <TouchableOpacity key={category.title} style={styles.categoryCard}>
                <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                  <category.icon color={category.color} size={24} />
                </View>
                <Text style={styles.categoryTitle}>{category.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Services List */}
      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Mis servicios</Text>
        {services.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <View style={styles.serviceInfo}>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDescription}>{service.description}</Text>
              <View style={styles.serviceDetails}>
                <Text style={styles.servicePrice}>${service.price.toLocaleString()}</Text>
                <Text style={styles.serviceDuration}>{service.duration} min</Text>
                <Text style={styles.serviceStaff}>{service.staff.length} profesionales</Text>
              </View>
            </View>
            <View style={styles.serviceActions}>
              <TouchableOpacity style={styles.editButton}>
                <Text style={styles.editButtonText}>Editar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderAppointments = () => (
    <ScrollView style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Gestión de Citas</Text>
        <TouchableOpacity 
          style={styles.calendarButton}
          onPress={() => router.push('/appointment-calendar')}
        >
          <Calendar color="#2563eb" size={16} />
          <Text style={styles.calendarButtonText}>Ver Calendario</Text>
        </TouchableOpacity>
      </View>

      {/* Appointment Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtersRow}>
            <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
              <Text style={[styles.filterChipText, styles.filterChipTextActive]}>Todas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>Pendientes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>Confirmadas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterChip}>
              <Text style={styles.filterChipText}>Completadas</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      {/* Appointments List */}
      <View style={styles.section}>
        {appointments.map((appointment) => {
          const service = services.find(s => s.id === appointment.serviceId);
          const staff = service?.staff.find(s => s.id === appointment.staffId);
          
          return (
            <View key={appointment.id} style={styles.appointmentDetailCard}>
              <View style={styles.appointmentHeader}>
                <View style={styles.appointmentDateTime}>
                  <Text style={styles.appointmentDate}>{appointment.date}</Text>
                  <Text style={styles.appointmentTime}>{appointment.time}</Text>
                </View>
                <View style={[styles.statusBadge, 
                  { backgroundColor: appointment.status === 'confirmed' ? '#dcfce7' : '#fef3c7' }
                ]}>
                  <Text style={[styles.statusText, 
                    { color: appointment.status === 'confirmed' ? '#166534' : '#92400e' }
                  ]}>
                    {appointment.status === 'confirmed' ? 'Confirmada' : 'Pendiente'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.appointmentBody}>
                <Text style={styles.appointmentClient}>{appointment.clientName}</Text>
                <Text style={styles.appointmentService}>{service?.name}</Text>
                <Text style={styles.appointmentStaff}>Con: {staff?.name}</Text>
                {appointment.notes && (
                  <Text style={styles.appointmentNotes}>Notas: {appointment.notes}</Text>
                )}
              </View>
              
              <View style={styles.appointmentActions}>
                <TouchableOpacity style={styles.confirmButton}>
                  <UserCheck color="#059669" size={16} />
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.rescheduleButton}>
                  <Clock color="#ea580c" size={16} />
                  <Text style={styles.rescheduleButtonText}>Reprogramar</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );

  const renderPOS = () => {
    const subtotal = posCart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountAmount = subtotal * (posDiscount / 100);
    const total = subtotal - discountAmount;
    const change = posAmountReceived ? parseFloat(posAmountReceived) - total : 0;

    const addToCart = (product: any) => {
      const existingItem = posCart.find(item => item.id === product.id);
      if (existingItem) {
        setPosCart(posCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setPosCart([...posCart, {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          isService: product.isService
        }]);
      }
    };

    const removeFromCart = (productId: string) => {
      setPosCart(posCart.filter(item => item.id !== productId));
    };

    const updateQuantity = (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId);
        return;
      }
      setPosCart(posCart.map(item => 
        item.id === productId 
          ? { ...item, quantity }
          : item
      ));
    };

    const processPayment = () => {
      const transaction = {
        id: Date.now().toString(),
        items: posCart,
        customer: posCustomer,
        subtotal,
        discount: discountAmount,
        total,
        paymentMethod: posPaymentMethod,
        amountReceived: parseFloat(posAmountReceived),
        change,
        timestamp: new Date().toISOString(),
        receiptNumber: `REC-${Date.now()}`
      };
      
      setPosLastTransaction(transaction);
      setPosTransactionComplete(true);
      
      // Clear cart and reset form
      setTimeout(() => {
        setPosCart([]);
        setPosCustomer("");
        setPosDiscount(0);
        setPosAmountReceived("");
        setPosShowPayment(false);
        setPosTransactionComplete(false);
      }, 3000);
    };

    const clearCart = () => {
      setPosCart([]);
      setPosCustomer("");
      setPosDiscount(0);
      setPosAmountReceived("");
      setPosShowPayment(false);
    };

    if (posTransactionComplete && posLastTransaction) {
      return (
        <View style={styles.posContainer}>
          <View style={styles.posSuccessScreen}>
            <CheckCircle color="#059669" size={64} />
            <Text style={styles.posSuccessTitle}>¡Venta Completada!</Text>
            <Text style={styles.posSuccessSubtitle}>Recibo #{posLastTransaction.receiptNumber}</Text>
            
            <View style={styles.posReceiptPreview}>
              <Text style={styles.posReceiptTitle}>RECIBO DE VENTA</Text>
              <Text style={styles.posReceiptBusiness}>Clínica Dental Sonrisa</Text>
              <Text style={styles.posReceiptDate}>{new Date(posLastTransaction.timestamp).toLocaleString()}</Text>
              
              <View style={styles.posReceiptDivider} />
              
              {posLastTransaction.items.map((item: any) => (
                <View key={item.id} style={styles.posReceiptItem}>
                  <Text style={styles.posReceiptItemName}>{item.name}</Text>
                  <Text style={styles.posReceiptItemDetails}>
                    {item.quantity} x ${item.price.toLocaleString()} = ${(item.quantity * item.price).toLocaleString()}
                  </Text>
                </View>
              ))}
              
              <View style={styles.posReceiptDivider} />
              
              <View style={styles.posReceiptTotals}>
                <View style={styles.posReceiptTotalRow}>
                  <Text style={styles.posReceiptTotalLabel}>Subtotal:</Text>
                  <Text style={styles.posReceiptTotalValue}>${posLastTransaction.subtotal.toLocaleString()}</Text>
                </View>
                {posLastTransaction.discount > 0 && (
                  <View style={styles.posReceiptTotalRow}>
                    <Text style={styles.posReceiptTotalLabel}>Descuento:</Text>
                    <Text style={styles.posReceiptTotalValue}>-${posLastTransaction.discount.toLocaleString()}</Text>
                  </View>
                )}
                <View style={[styles.posReceiptTotalRow, styles.posReceiptFinalTotal]}>
                  <Text style={styles.posReceiptFinalTotalLabel}>TOTAL:</Text>
                  <Text style={styles.posReceiptFinalTotalValue}>${posLastTransaction.total.toLocaleString()}</Text>
                </View>
                <View style={styles.posReceiptTotalRow}>
                  <Text style={styles.posReceiptTotalLabel}>Recibido:</Text>
                  <Text style={styles.posReceiptTotalValue}>${posLastTransaction.amountReceived.toLocaleString()}</Text>
                </View>
                <View style={styles.posReceiptTotalRow}>
                  <Text style={styles.posReceiptTotalLabel}>Cambio:</Text>
                  <Text style={styles.posReceiptTotalValue}>${posLastTransaction.change.toLocaleString()}</Text>
                </View>
              </View>
            </View>
            
            <View style={styles.posReceiptActions}>
              <TouchableOpacity style={styles.posPrintButton}>
                <Printer color="#ffffff" size={16} />
                <Text style={styles.posPrintButtonText}>Imprimir Recibo</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.posEmailButton}>
                <Text style={styles.posEmailButtonText}>Enviar por Email</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.posContainer}>
        <View style={styles.posLayout}>
          {/* Products Section */}
          <View style={styles.posProductsSection}>
            <View style={styles.posHeader}>
              <Text style={styles.posSectionTitle}>Productos y Servicios</Text>
              <View style={styles.posSearchContainer}>
                <Search color="#64748b" size={16} />
                <Text style={styles.posSearchInput}>Buscar productos...</Text>
              </View>
            </View>
            
            <ScrollView style={styles.posProductsList}>
              <View style={styles.posProductsGrid}>
                {products.filter(p => p.isActive).map((product) => (
                  <TouchableOpacity 
                    key={product.id} 
                    style={styles.posProductCard}
                    onPress={() => addToCart(product)}
                  >
                    <View style={styles.posProductImage}>
                      {product.isService ? (
                        <Stethoscope color="#7c3aed" size={24} />
                      ) : (
                        <Package color="#2563eb" size={24} />
                      )}
                    </View>
                    <Text style={styles.posProductName} numberOfLines={2}>{product.name}</Text>
                    <Text style={styles.posProductPrice}>${product.price.toLocaleString()}</Text>
                    {product.ncopPrice && (
                      <Text style={styles.posProductNcop}>{product.ncopPrice} NCOP</Text>
                    )}
                    {!product.isService && (
                      <Text style={styles.posProductStock}>Stock: {product.stock}</Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>
          
          {/* Cart Section */}
          <View style={styles.posCartSection}>
            <View style={styles.posCartHeader}>
              <Text style={styles.posSectionTitle}>Carrito de Compras</Text>
              {posCart.length > 0 && (
                <TouchableOpacity onPress={clearCart} style={styles.posClearButton}>
                  <X color="#dc2626" size={16} />
                  <Text style={styles.posClearButtonText}>Limpiar</Text>
                </TouchableOpacity>
              )}
            </View>
            
            {/* Customer Info */}
            <View style={styles.posCustomerSection}>
              <Text style={styles.posCustomerLabel}>Cliente (opcional):</Text>
              <View style={styles.posCustomerInput}>
                <Text 
                  style={styles.posCustomerInputText}
                  onPress={() => console.log('Customer input would be implemented')}
                >
                  {posCustomer || "Ingrese nombre del cliente..."}
                </Text>
              </View>
            </View>
            
            {/* Cart Items */}
            <ScrollView style={styles.posCartItems}>
              {posCart.length === 0 ? (
                <View style={styles.posEmptyCart}>
                  <ShoppingCart color="#94a3b8" size={48} />
                  <Text style={styles.posEmptyCartText}>Carrito vacío</Text>
                  <Text style={styles.posEmptyCartSubtext}>Selecciona productos para agregar</Text>
                </View>
              ) : (
                posCart.map((item) => (
                  <View key={item.id} style={styles.posCartItem}>
                    <View style={styles.posCartItemInfo}>
                      <Text style={styles.posCartItemName}>{item.name}</Text>
                      <Text style={styles.posCartItemPrice}>${item.price.toLocaleString()}</Text>
                    </View>
                    <View style={styles.posCartItemControls}>
                      <TouchableOpacity 
                        style={styles.posQuantityButton}
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus color="#64748b" size={16} />
                      </TouchableOpacity>
                      <Text style={styles.posQuantityText}>{item.quantity}</Text>
                      <TouchableOpacity 
                        style={styles.posQuantityButton}
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus color="#64748b" size={16} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.posRemoveButton}
                        onPress={() => removeFromCart(item.id)}
                      >
                        <Trash2 color="#dc2626" size={16} />
                      </TouchableOpacity>
                    </View>
                    <Text style={styles.posCartItemTotal}>
                      ${(item.price * item.quantity).toLocaleString()}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
            
            {/* Discount Section */}
            {posCart.length > 0 && (
              <View style={styles.posDiscountSection}>
                <Text style={styles.posDiscountLabel}>Descuento (%):</Text>
                <View style={styles.posDiscountControls}>
                  <TouchableOpacity 
                    style={styles.posDiscountButton}
                    onPress={() => setPosDiscount(Math.max(0, posDiscount - 5))}
                  >
                    <Minus color="#64748b" size={16} />
                  </TouchableOpacity>
                  <Text style={styles.posDiscountValue}>{posDiscount}%</Text>
                  <TouchableOpacity 
                    style={styles.posDiscountButton}
                    onPress={() => setPosDiscount(Math.min(100, posDiscount + 5))}
                  >
                    <Plus color="#64748b" size={16} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            
            {/* Totals */}
            {posCart.length > 0 && (
              <View style={styles.posTotalsSection}>
                <View style={styles.posTotalRow}>
                  <Text style={styles.posTotalLabel}>Subtotal:</Text>
                  <Text style={styles.posTotalValue}>${subtotal.toLocaleString()}</Text>
                </View>
                {posDiscount > 0 && (
                  <View style={styles.posTotalRow}>
                    <Text style={styles.posTotalLabel}>Descuento ({posDiscount}%):</Text>
                    <Text style={styles.posTotalValue}>-${discountAmount.toLocaleString()}</Text>
                  </View>
                )}
                <View style={[styles.posTotalRow, styles.posFinalTotal]}>
                  <Text style={styles.posFinalTotalLabel}>TOTAL:</Text>
                  <Text style={styles.posFinalTotalValue}>${total.toLocaleString()}</Text>
                </View>
              </View>
            )}
            
            {/* Payment Section */}
            {posCart.length > 0 && !posShowPayment && (
              <TouchableOpacity 
                style={styles.posCheckoutButton}
                onPress={() => setPosShowPayment(true)}
              >
                <CreditCard color="#ffffff" size={20} />
                <Text style={styles.posCheckoutButtonText}>Procesar Pago</Text>
              </TouchableOpacity>
            )}
            
            {posShowPayment && (
              <View style={styles.posPaymentSection}>
                <Text style={styles.posPaymentTitle}>Método de Pago</Text>
                
                <View style={styles.posPaymentMethods}>
                  {[
                    { id: "cash", icon: Banknote, label: "Efectivo", color: "#059669" },
                    { id: "card", icon: CreditCard, label: "Tarjeta", color: "#2563eb" },
                    { id: "ncop", icon: DollarSign, label: "NCOP", color: "#7c3aed" },
                    { id: "transfer", icon: Smartphone, label: "Transferencia", color: "#ea580c" },
                  ].map((method) => (
                    <TouchableOpacity
                      key={method.id}
                      style={[
                        styles.posPaymentMethod,
                        posPaymentMethod === method.id && styles.posPaymentMethodActive
                      ]}
                      onPress={() => setPosPaymentMethod(method.id as any)}
                    >
                      <method.icon 
                        color={posPaymentMethod === method.id ? "#ffffff" : method.color} 
                        size={20} 
                      />
                      <Text style={[
                        styles.posPaymentMethodText,
                        posPaymentMethod === method.id && styles.posPaymentMethodTextActive
                      ]}>
                        {method.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                {posPaymentMethod === "cash" && (
                  <View style={styles.posCashSection}>
                    <Text style={styles.posCashLabel}>Monto Recibido:</Text>
                    <View style={styles.posCashInput}>
                      <DollarSign color="#64748b" size={16} />
                      <Text 
                        style={styles.posCashInputText}
                        onPress={() => console.log('Amount input would be implemented')}
                      >
                        {posAmountReceived || "0.00"}
                      </Text>
                    </View>
                    {posAmountReceived && parseFloat(posAmountReceived) >= total && (
                      <View style={styles.posChangeSection}>
                        <Text style={styles.posChangeLabel}>Cambio:</Text>
                        <Text style={styles.posChangeValue}>${change.toLocaleString()}</Text>
                      </View>
                    )}
                  </View>
                )}
                
                <View style={styles.posPaymentActions}>
                  <TouchableOpacity 
                    style={styles.posCancelPaymentButton}
                    onPress={() => setPosShowPayment(false)}
                  >
                    <Text style={styles.posCancelPaymentButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.posConfirmPaymentButton,
                      (posPaymentMethod === "cash" && (!posAmountReceived || parseFloat(posAmountReceived) < total)) && styles.posConfirmPaymentButtonDisabled
                    ]}
                    onPress={processPayment}
                    disabled={posPaymentMethod === "cash" && (!posAmountReceived || parseFloat(posAmountReceived) < total)}
                  >
                    <CheckCircle color="#ffffff" size={16} />
                    <Text style={styles.posConfirmPaymentButtonText}>Confirmar Pago</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    );
  };

  const renderProducts = () => {
    const filteredProducts = products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(productSearchQuery.toLowerCase());
      
      const matchesFilter = (() => {
        switch (productFilter) {
          case "products": return !product.isService;
          case "services": return product.isService;
          case "active": return product.isActive;
          case "inactive": return !product.isActive;
          default: return true;
        }
      })();
      
      return matchesSearch && matchesFilter;
    });

    const productCategories = [...new Set(products.map(p => p.category))];
    const totalProducts = products.filter(p => !p.isService).length;
    const totalServices = products.filter(p => p.isService).length;
    const activeProducts = products.filter(p => p.isActive).length;
    const lowStockProducts = products.filter(p => !p.isService && p.stock < 5).length;

    return (
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.productHeader}>
          <View style={styles.productHeaderLeft}>
            <NodoXLogo size="small" showText={false} />
            <Text style={styles.sectionTitle}>Gestión de Productos</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddProductModal(true)}
          >
            <Plus color="#ffffff" size={16} />
            <Text style={styles.addButtonText}>Agregar Producto</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.productStatsGrid}>
          <View style={styles.productStatCard}>
            <Package color="#2563eb" size={20} />
            <Text style={styles.productStatValue}>{totalProducts}</Text>
            <Text style={styles.productStatLabel}>Productos</Text>
          </View>
          <View style={styles.productStatCard}>
            <Stethoscope color="#7c3aed" size={20} />
            <Text style={styles.productStatValue}>{totalServices}</Text>
            <Text style={styles.productStatLabel}>Servicios</Text>
          </View>
          <View style={styles.productStatCard}>
            <Eye color="#059669" size={20} />
            <Text style={styles.productStatValue}>{activeProducts}</Text>
            <Text style={styles.productStatLabel}>Activos</Text>
          </View>
          <View style={styles.productStatCard}>
            <AlertCircle color="#dc2626" size={20} />
            <Text style={styles.productStatValue}>{lowStockProducts}</Text>
            <Text style={styles.productStatLabel}>Stock Bajo</Text>
          </View>
        </View>

        {/* Search and Filters */}
        <View style={styles.searchFilterContainer}>
          <View style={styles.searchContainer}>
            <Search color="#64748b" size={16} />
            <Text 
              style={styles.searchInput}
              onPress={() => console.log('Search functionality would be implemented here')}
            >
              {productSearchQuery || "Buscar productos..."}
            </Text>
          </View>
          <TouchableOpacity style={styles.filterButton}>
            <Filter color="#64748b" size={16} />
          </TouchableOpacity>
        </View>

        {/* Filter Chips */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.filtersRow}>
              {[
                { key: "all", label: "Todos" },
                { key: "products", label: "Productos" },
                { key: "services", label: "Servicios" },
                { key: "active", label: "Activos" },
                { key: "inactive", label: "Inactivos" },
              ].map((filter) => (
                <TouchableOpacity 
                  key={filter.key}
                  style={[
                    styles.filterChip, 
                    productFilter === filter.key && styles.filterChipActive
                  ]}
                  onPress={() => setProductFilter(filter.key as any)}
                >
                  <Text style={[
                    styles.filterChipText,
                    productFilter === filter.key && styles.filterChipTextActive
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Categories Overview */}
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Categorías</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.categoriesRow}>
              {productCategories.map((category) => {
                const categoryCount = products.filter(p => p.category === category).length;
                return (
                  <TouchableOpacity key={category} style={styles.categoryCard}>
                    <View style={styles.categoryIcon}>
                      <Tag color="#2563eb" size={20} />
                    </View>
                    <Text style={styles.categoryTitle}>{category}</Text>
                    <Text style={styles.categoryCount}>{categoryCount} items</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Products List */}
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Productos y Servicios ({filteredProducts.length})</Text>
          {filteredProducts.map((product) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productImageContainer}>
                {product.images && product.images.length > 0 ? (
                  <View style={styles.productImagePlaceholder}>
                    <Image color="#94a3b8" size={24} />
                  </View>
                ) : (
                  <View style={styles.productImagePlaceholder}>
                    <Package color="#94a3b8" size={24} />
                  </View>
                )}
              </View>
              
              <View style={styles.productInfo}>
                <View style={styles.productItemHeader}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <View style={styles.productBadges}>
                    {product.isService && (
                      <View style={styles.serviceBadge}>
                        <Text style={styles.serviceBadgeText}>Servicio</Text>
                      </View>
                    )}
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: product.isActive ? '#dcfce7' : '#fef3c7' }
                    ]}>
                      <Text style={[
                        styles.statusText,
                        { color: product.isActive ? '#166534' : '#92400e' }
                      ]}>
                        {product.isActive ? 'Activo' : 'Inactivo'}
                      </Text>
                    </View>
                  </View>
                </View>
                
                <Text style={styles.productDescription} numberOfLines={2}>
                  {product.description}
                </Text>
                
                <View style={styles.productDetails}>
                  <Text style={styles.productPrice}>
                    ${product.price.toLocaleString()}
                  </Text>
                  {product.ncopPrice && (
                    <Text style={styles.productNcopPrice}>
                      {product.ncopPrice} NCOP
                    </Text>
                  )}
                  {!product.isService && (
                    <Text style={[
                      styles.productStock,
                      { color: product.stock < 5 ? '#dc2626' : '#64748b' }
                    ]}>
                      Stock: {product.stock}
                    </Text>
                  )}
                  {product.isService && product.duration && (
                    <Text style={styles.productDuration}>
                      {product.duration} min
                    </Text>
                  )}
                </View>
                
                <Text style={styles.productCategory}>{product.category}</Text>
              </View>
              
              <View style={styles.productActions}>
                <TouchableOpacity 
                  style={styles.productActionButton}
                  onPress={() => setEditingProduct(product)}
                >
                  <Edit3 color="#2563eb" size={16} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.productActionButton}
                  onPress={() => updateProduct(product.id, { isActive: !product.isActive })}
                >
                  {product.isActive ? (
                    <EyeOff color="#ea580c" size={16} />
                  ) : (
                    <Eye color="#059669" size={16} />
                  )}
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.productActionButton}
                  onPress={() => {
                    console.log('Delete product:', product.id);
                    deleteProduct(product.id);
                  }}
                >
                  <Trash2 color="#dc2626" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          
          {filteredProducts.length === 0 && (
            <View style={styles.emptyState}>
              <Package color="#94a3b8" size={48} />
              <Text style={styles.emptyStateText}>No se encontraron productos</Text>
              <Text style={styles.emptyStateSubtext}>
                {productSearchQuery || productFilter !== "all" 
                  ? "Intenta ajustar los filtros de búsqueda"
                  : "Agrega tu primer producto para comenzar"
                }
              </Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.subsectionTitle}>Acciones rápidas</Text>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={styles.quickActionCard}
              onPress={() => setShowAddProductModal(true)}
            >
              <Plus color="#2563eb" size={24} />
              <Text style={styles.quickActionCardText}>Nuevo Producto</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <ShoppingCart color="#059669" size={24} />
              <Text style={styles.quickActionCardText}>Ver Ventas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <BarChart3 color="#7c3aed" size={24} />
              <Text style={styles.quickActionCardText}>Reportes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionCard}>
              <Tag color="#ea580c" size={24} />
              <Text style={styles.quickActionCardText}>Categorías</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderStaff = () => (
    <ScrollView style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Gestión de Personal</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/hr-management')}
        >
          <Text style={styles.addButtonText}>Ver Sistema Completo</Text>
        </TouchableOpacity>
      </View>

      {/* HR Info Card */}
      <View style={styles.section}>
        <View style={styles.crmInfoCard}>
          <Users color="#ea580c" size={32} />
          <Text style={styles.crmInfoTitle}>Sistema de Gestión de Personal</Text>
          <Text style={styles.crmInfoText}>
            • Gestión de empleados{"\n"}
            • Control de asistencia{"\n"}
            • Evaluaciones de desempeño{"\n"}
            • Nómina y pagos{"\n"}
            • Horarios y turnos{"\n"}
            • Departamentos y estructura organizacional
          </Text>
          <TouchableOpacity 
            style={styles.primaryActionButton}
            onPress={() => router.push('/hr-management')}
          >
            <Text style={styles.primaryActionButtonText}>Abrir Gestión de Personal</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Staff List */}
      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Personal del Negocio</Text>
        {services.flatMap(service => service.staff).map((staff) => (
          <View key={staff.id} style={styles.staffCard}>
            <View style={styles.staffInfo}>
              <View style={styles.staffAvatar}>
                {staff.avatar ? (
                  <Text style={styles.staffInitials}>
                    {staff.name.split(' ').map((n: string) => n[0]).join('')}
                  </Text>
                ) : (
                  <Users color="#64748b" size={24} />
                )}
              </View>
              <View style={styles.staffDetails}>
                <Text style={styles.staffName}>{staff.name}</Text>
                <Text style={styles.staffSpecialties}>
                  {staff.specialties.join(', ')}
                </Text>
                <Text style={styles.staffSchedule}>
                  Horario: {staff.schedule.length} días configurados
                </Text>
              </View>
            </View>
            <View style={styles.staffActions}>
              <TouchableOpacity style={styles.scheduleButton}>
                <Calendar color="#2563eb" size={16} />
                <Text style={styles.scheduleButtonText}>Horario</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  const renderAnalytics = () => {
    // Mock data for analytics
    const salesData = {
      "7d": { revenue: 15420, transactions: 45, avgTicket: 342, growth: 12.5 },
      "30d": { revenue: 68500, transactions: 187, avgTicket: 366, growth: 8.3 },
      "90d": { revenue: 195300, transactions: 542, avgTicket: 360, growth: 15.7 },
      "1y": { revenue: 847200, transactions: 2341, avgTicket: 362, growth: 22.1 }
    };

    const topProducts = [
      { name: "Limpieza Dental", sales: 45, revenue: 22500, growth: 15.2 },
      { name: "Blanqueamiento", sales: 23, revenue: 18400, growth: 8.7 },
      { name: "Ortodoncia", sales: 12, revenue: 36000, growth: 25.3 },
      { name: "Extracción", sales: 18, revenue: 9000, growth: -5.2 },
      { name: "Endodoncia", sales: 8, revenue: 12000, growth: 12.1 }
    ];

    const customerMetrics = {
      total: 1247,
      new: 89,
      returning: 158,
      retention: 78.5,
      satisfaction: 4.7
    };

    const staffPerformance = services.flatMap(service => service.staff).map(staff => ({
      ...staff,
      appointments: Math.floor(Math.random() * 50) + 20,
      revenue: Math.floor(Math.random() * 15000) + 5000,
      rating: (Math.random() * 1.5 + 3.5).toFixed(1),
      efficiency: Math.floor(Math.random() * 30) + 70
    }));

    const currentData = salesData[analyticsTimeRange];

    const renderAnalyticsOverview = () => (
      <View>
        {/* Key Metrics */}
        <View style={styles.analyticsMetricsGrid}>
          <View style={styles.analyticsMetricCard}>
            <View style={styles.analyticsMetricHeader}>
              <DollarSign color="#059669" size={20} />
              <View style={[styles.analyticsGrowthBadge, { backgroundColor: currentData.growth > 0 ? '#dcfce7' : '#fef2f2' }]}>
                <TrendingUp color={currentData.growth > 0 ? '#059669' : '#dc2626'} size={12} />
                <Text style={[styles.analyticsGrowthText, { color: currentData.growth > 0 ? '#059669' : '#dc2626' }]}>
                  {currentData.growth > 0 ? '+' : ''}{currentData.growth}%
                </Text>
              </View>
            </View>
            <Text style={styles.analyticsMetricValue}>${currentData.revenue.toLocaleString()}</Text>
            <Text style={styles.analyticsMetricLabel}>Ingresos Totales</Text>
          </View>

          <View style={styles.analyticsMetricCard}>
            <View style={styles.analyticsMetricHeader}>
              <ShoppingCart color="#2563eb" size={20} />
              <View style={styles.analyticsGrowthBadge}>
                <Activity color="#2563eb" size={12} />
                <Text style={styles.analyticsGrowthText}>{currentData.transactions}</Text>
              </View>
            </View>
            <Text style={styles.analyticsMetricValue}>{currentData.transactions}</Text>
            <Text style={styles.analyticsMetricLabel}>Transacciones</Text>
          </View>

          <View style={styles.analyticsMetricCard}>
            <View style={styles.analyticsMetricHeader}>
              <Target color="#7c3aed" size={20} />
              <View style={styles.analyticsGrowthBadge}>
                <DollarSign color="#7c3aed" size={12} />
              </View>
            </View>
            <Text style={styles.analyticsMetricValue}>${currentData.avgTicket}</Text>
            <Text style={styles.analyticsMetricLabel}>Ticket Promedio</Text>
          </View>

          <View style={styles.analyticsMetricCard}>
            <View style={styles.analyticsMetricHeader}>
              <Users color="#ea580c" size={20} />
              <View style={styles.analyticsGrowthBadge}>
                <Star color="#ea580c" size={12} />
                <Text style={styles.analyticsGrowthText}>{customerMetrics.satisfaction}</Text>
              </View>
            </View>
            <Text style={styles.analyticsMetricValue}>{customerMetrics.total}</Text>
            <Text style={styles.analyticsMetricLabel}>Clientes Totales</Text>
          </View>
        </View>

        {/* Revenue Chart Placeholder */}
        <View style={styles.analyticsChartCard}>
          <View style={styles.analyticsChartHeader}>
            <Text style={styles.analyticsChartTitle}>Tendencia de Ingresos</Text>
            <View style={styles.analyticsChartLegend}>
              <View style={styles.analyticsLegendItem}>
                <View style={[styles.analyticsLegendDot, { backgroundColor: '#2563eb' }]} />
                <Text style={styles.analyticsLegendText}>Ingresos</Text>
              </View>
              <View style={styles.analyticsLegendItem}>
                <View style={[styles.analyticsLegendDot, { backgroundColor: '#059669' }]} />
                <Text style={styles.analyticsLegendText}>Transacciones</Text>
              </View>
            </View>
          </View>
          <View style={styles.analyticsChartPlaceholder}>
            <LineChart color="#64748b" size={48} />
            <Text style={styles.analyticsChartPlaceholderText}>Gráfico de tendencias</Text>
            <Text style={styles.analyticsChartPlaceholderSubtext}>Visualización de datos en tiempo real</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.analyticsQuickStats}>
          <View style={styles.analyticsQuickStatItem}>
            <Clock color="#2563eb" size={16} />
            <Text style={styles.analyticsQuickStatValue}>2.3h</Text>
            <Text style={styles.analyticsQuickStatLabel}>Tiempo promedio por cita</Text>
          </View>
          <View style={styles.analyticsQuickStatItem}>
            <MapPin color="#059669" size={16} />
            <Text style={styles.analyticsQuickStatValue}>95%</Text>
            <Text style={styles.analyticsQuickStatLabel}>Tasa de asistencia</Text>
          </View>
          <View style={styles.analyticsQuickStatItem}>
            <RefreshCw color="#7c3aed" size={16} />
            <Text style={styles.analyticsQuickStatValue}>68%</Text>
            <Text style={styles.analyticsQuickStatLabel}>Clientes recurrentes</Text>
          </View>
          <View style={styles.analyticsQuickStatItem}>
            <Award color="#ea580c" size={16} />
            <Text style={styles.analyticsQuickStatValue}>4.8</Text>
            <Text style={styles.analyticsQuickStatLabel}>Calificación promedio</Text>
          </View>
        </View>
      </View>
    );

    const renderSalesAnalytics = () => (
      <View>
        {/* Sales Performance */}
        <View style={styles.analyticsSalesGrid}>
          <View style={styles.analyticsSalesCard}>
            <Text style={styles.analyticsSalesCardTitle}>Ventas por Método de Pago</Text>
            <View style={styles.analyticsPaymentMethods}>
              <View style={styles.analyticsPaymentMethod}>
                <View style={styles.analyticsPaymentMethodInfo}>
                  <CreditCard color="#2563eb" size={16} />
                  <Text style={styles.analyticsPaymentMethodName}>Tarjeta</Text>
                </View>
                <Text style={styles.analyticsPaymentMethodValue}>45%</Text>
              </View>
              <View style={styles.analyticsPaymentMethod}>
                <View style={styles.analyticsPaymentMethodInfo}>
                  <Banknote color="#059669" size={16} />
                  <Text style={styles.analyticsPaymentMethodName}>Efectivo</Text>
                </View>
                <Text style={styles.analyticsPaymentMethodValue}>32%</Text>
              </View>
              <View style={styles.analyticsPaymentMethod}>
                <View style={styles.analyticsPaymentMethodInfo}>
                  <DollarSign color="#7c3aed" size={16} />
                  <Text style={styles.analyticsPaymentMethodName}>NCOP</Text>
                </View>
                <Text style={styles.analyticsPaymentMethodValue}>18%</Text>
              </View>
              <View style={styles.analyticsPaymentMethod}>
                <View style={styles.analyticsPaymentMethodInfo}>
                  <Smartphone color="#ea580c" size={16} />
                  <Text style={styles.analyticsPaymentMethodName}>Transferencia</Text>
                </View>
                <Text style={styles.analyticsPaymentMethodValue}>5%</Text>
              </View>
            </View>
          </View>

          <View style={styles.analyticsSalesCard}>
            <Text style={styles.analyticsSalesCardTitle}>Horarios de Mayor Venta</Text>
            <View style={styles.analyticsTimeSlots}>
              {[
                { time: "9:00 - 11:00", percentage: 25, amount: "$12,500" },
                { time: "11:00 - 13:00", percentage: 35, amount: "$17,850" },
                { time: "14:00 - 16:00", percentage: 30, amount: "$15,300" },
                { time: "16:00 - 18:00", percentage: 10, amount: "$5,100" }
              ].map((slot, index) => (
                <View key={index} style={styles.analyticsTimeSlot}>
                  <Text style={styles.analyticsTimeSlotTime}>{slot.time}</Text>
                  <View style={styles.analyticsTimeSlotBar}>
                    <View style={[styles.analyticsTimeSlotFill, { width: `${slot.percentage}%` }]} />
                  </View>
                  <Text style={styles.analyticsTimeSlotAmount}>{slot.amount}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Monthly Comparison */}
        <View style={styles.analyticsComparisonCard}>
          <Text style={styles.analyticsComparisonTitle}>Comparación Mensual</Text>
          <View style={styles.analyticsComparisonGrid}>
            {[
              { month: "Enero", revenue: 45200, growth: 12.3 },
              { month: "Febrero", revenue: 52100, growth: 15.2 },
              { month: "Marzo", revenue: 48900, growth: -6.1 },
              { month: "Abril", revenue: 58700, growth: 20.0 }
            ].map((month, index) => (
              <View key={index} style={styles.analyticsComparisonItem}>
                <Text style={styles.analyticsComparisonMonth}>{month.month}</Text>
                <Text style={styles.analyticsComparisonRevenue}>${month.revenue.toLocaleString()}</Text>
                <View style={[styles.analyticsComparisonGrowth, { backgroundColor: month.growth > 0 ? '#dcfce7' : '#fef2f2' }]}>
                  {month.growth > 0 ? (
                    <TrendingUp color="#059669" size={12} />
                  ) : (
                    <TrendingDown color="#dc2626" size={12} />
                  )}
                  <Text style={[styles.analyticsComparisonGrowthText, { color: month.growth > 0 ? '#059669' : '#dc2626' }]}>
                    {month.growth > 0 ? '+' : ''}{month.growth}%
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>
    );

    const renderProductAnalytics = () => (
      <View>
        {/* Top Products */}
        <View style={styles.analyticsTopProductsCard}>
          <Text style={styles.analyticsTopProductsTitle}>Productos/Servicios Más Vendidos</Text>
          {topProducts.map((product, index) => (
            <View key={index} style={styles.analyticsTopProductItem}>
              <View style={styles.analyticsTopProductRank}>
                <Text style={styles.analyticsTopProductRankText}>{index + 1}</Text>
              </View>
              <View style={styles.analyticsTopProductInfo}>
                <Text style={styles.analyticsTopProductName}>{product.name}</Text>
                <Text style={styles.analyticsTopProductStats}>
                  {product.sales} ventas • ${product.revenue.toLocaleString()}
                </Text>
              </View>
              <View style={[styles.analyticsTopProductGrowth, { backgroundColor: product.growth > 0 ? '#dcfce7' : '#fef2f2' }]}>
                {product.growth > 0 ? (
                  <TrendingUp color="#059669" size={12} />
                ) : (
                  <TrendingDown color="#dc2626" size={12} />
                )}
                <Text style={[styles.analyticsTopProductGrowthText, { color: product.growth > 0 ? '#059669' : '#dc2626' }]}>
                  {product.growth > 0 ? '+' : ''}{product.growth}%
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Product Categories Performance */}
        <View style={styles.analyticsCategoriesCard}>
          <Text style={styles.analyticsCategoriesTitle}>Rendimiento por Categoría</Text>
          <View style={styles.analyticsCategoriesGrid}>
            {[
              { category: "Preventivo", revenue: 28500, percentage: 42, color: "#2563eb" },
              { category: "Estético", revenue: 19200, percentage: 28, color: "#7c3aed" },
              { category: "Restaurativo", revenue: 15800, percentage: 23, color: "#059669" },
              { category: "Quirúrgico", revenue: 4900, percentage: 7, color: "#ea580c" }
            ].map((cat, index) => (
              <View key={index} style={styles.analyticsCategoryItem}>
                <View style={styles.analyticsCategoryHeader}>
                  <View style={[styles.analyticsCategoryDot, { backgroundColor: cat.color }]} />
                  <Text style={styles.analyticsCategoryName}>{cat.category}</Text>
                </View>
                <Text style={styles.analyticsCategoryRevenue}>${cat.revenue.toLocaleString()}</Text>
                <Text style={styles.analyticsCategoryPercentage}>{cat.percentage}% del total</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );

    const renderCustomerAnalytics = () => (
      <View>
        {/* Customer Overview */}
        <View style={styles.analyticsCustomerOverview}>
          <View style={styles.analyticsCustomerMetric}>
            <Users color="#2563eb" size={24} />
            <Text style={styles.analyticsCustomerMetricValue}>{customerMetrics.total}</Text>
            <Text style={styles.analyticsCustomerMetricLabel}>Total Clientes</Text>
          </View>
          <View style={styles.analyticsCustomerMetric}>
            <UserCheck color="#059669" size={24} />
            <Text style={styles.analyticsCustomerMetricValue}>{customerMetrics.new}</Text>
            <Text style={styles.analyticsCustomerMetricLabel}>Nuevos este mes</Text>
          </View>
          <View style={styles.analyticsCustomerMetric}>
            <RefreshCw color="#7c3aed" size={24} />
            <Text style={styles.analyticsCustomerMetricValue}>{customerMetrics.returning}</Text>
            <Text style={styles.analyticsCustomerMetricLabel}>Recurrentes</Text>
          </View>
          <View style={styles.analyticsCustomerMetric}>
            <Star color="#ea580c" size={24} />
            <Text style={styles.analyticsCustomerMetricValue}>{customerMetrics.satisfaction}</Text>
            <Text style={styles.analyticsCustomerMetricLabel}>Satisfacción</Text>
          </View>
        </View>

        {/* Customer Segments */}
        <View style={styles.analyticsSegmentsCard}>
          <Text style={styles.analyticsSegmentsTitle}>Segmentación de Clientes</Text>
          <View style={styles.analyticsSegmentsList}>
            {[
              { segment: "VIP (>$5000/año)", count: 45, percentage: 3.6, color: "#7c3aed" },
              { segment: "Frecuentes (4+ visitas/año)", count: 187, percentage: 15.0, color: "#2563eb" },
              { segment: "Regulares (2-3 visitas/año)", count: 623, percentage: 49.9, color: "#059669" },
              { segment: "Ocasionales (1 visita/año)", count: 392, percentage: 31.5, color: "#ea580c" }
            ].map((segment, index) => (
              <View key={index} style={styles.analyticsSegmentItem}>
                <View style={styles.analyticsSegmentInfo}>
                  <View style={[styles.analyticsSegmentDot, { backgroundColor: segment.color }]} />
                  <Text style={styles.analyticsSegmentName}>{segment.segment}</Text>
                </View>
                <View style={styles.analyticsSegmentStats}>
                  <Text style={styles.analyticsSegmentCount}>{segment.count}</Text>
                  <Text style={styles.analyticsSegmentPercentage}>{segment.percentage}%</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Customer Retention */}
        <View style={styles.analyticsRetentionCard}>
          <Text style={styles.analyticsRetentionTitle}>Retención de Clientes</Text>
          <View style={styles.analyticsRetentionChart}>
            <PieChart color="#64748b" size={64} />
            <View style={styles.analyticsRetentionStats}>
              <Text style={styles.analyticsRetentionValue}>{customerMetrics.retention}%</Text>
              <Text style={styles.analyticsRetentionLabel}>Tasa de retención</Text>
            </View>
          </View>
          <View style={styles.analyticsRetentionBreakdown}>
            <View style={styles.analyticsRetentionItem}>
              <Text style={styles.analyticsRetentionItemLabel}>Clientes que regresan</Text>
              <Text style={styles.analyticsRetentionItemValue}>78.5%</Text>
            </View>
            <View style={styles.analyticsRetentionItem}>
              <Text style={styles.analyticsRetentionItemLabel}>Tiempo promedio entre visitas</Text>
              <Text style={styles.analyticsRetentionItemValue}>4.2 meses</Text>
            </View>
          </View>
        </View>
      </View>
    );

    const renderStaffAnalytics = () => (
      <View>
        {/* Staff Performance */}
        <View style={styles.analyticsStaffCard}>
          <Text style={styles.analyticsStaffTitle}>Rendimiento del Personal</Text>
          {staffPerformance.map((staff, index) => (
            <View key={staff.id} style={styles.analyticsStaffItem}>
              <View style={styles.analyticsStaffInfo}>
                <View style={styles.analyticsStaffAvatar}>
                  <Text style={styles.analyticsStaffInitials}>
                    {staff.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <View style={styles.analyticsStaffDetails}>
                  <Text style={styles.analyticsStaffName}>{staff.name}</Text>
                  <Text style={styles.analyticsStaffSpecialty}>{staff.specialties[0]}</Text>
                </View>
              </View>
              <View style={styles.analyticsStaffMetrics}>
                <View style={styles.analyticsStaffMetric}>
                  <Calendar color="#2563eb" size={14} />
                  <Text style={styles.analyticsStaffMetricValue}>{staff.appointments}</Text>
                  <Text style={styles.analyticsStaffMetricLabel}>Citas</Text>
                </View>
                <View style={styles.analyticsStaffMetric}>
                  <DollarSign color="#059669" size={14} />
                  <Text style={styles.analyticsStaffMetricValue}>${(staff.revenue / 1000).toFixed(1)}k</Text>
                  <Text style={styles.analyticsStaffMetricLabel}>Ingresos</Text>
                </View>
                <View style={styles.analyticsStaffMetric}>
                  <Star color="#ea580c" size={14} />
                  <Text style={styles.analyticsStaffMetricValue}>{staff.rating}</Text>
                  <Text style={styles.analyticsStaffMetricLabel}>Rating</Text>
                </View>
                <View style={styles.analyticsStaffMetric}>
                  <Activity color="#7c3aed" size={14} />
                  <Text style={styles.analyticsStaffMetricValue}>{staff.efficiency}%</Text>
                  <Text style={styles.analyticsStaffMetricLabel}>Eficiencia</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Staff Schedule Efficiency */}
        <View style={styles.analyticsScheduleCard}>
          <Text style={styles.analyticsScheduleTitle}>Eficiencia de Horarios</Text>
          <View style={styles.analyticsScheduleGrid}>
            {[
              { day: "Lun", efficiency: 95, appointments: 12 },
              { day: "Mar", efficiency: 88, appointments: 10 },
              { day: "Mié", efficiency: 92, appointments: 11 },
              { day: "Jue", efficiency: 85, appointments: 9 },
              { day: "Vie", efficiency: 90, appointments: 10 },
              { day: "Sáb", efficiency: 78, appointments: 7 }
            ].map((day, index) => (
              <View key={index} style={styles.analyticsScheduleDay}>
                <Text style={styles.analyticsScheduleDayName}>{day.day}</Text>
                <View style={styles.analyticsScheduleBar}>
                  <View style={[styles.analyticsScheduleFill, { height: `${day.efficiency}%` }]} />
                </View>
                <Text style={styles.analyticsScheduleEfficiency}>{day.efficiency}%</Text>
                <Text style={styles.analyticsScheduleAppointments}>{day.appointments} citas</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    );

    return (
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.analyticsHeader}>
          <View style={styles.analyticsHeaderLeft}>
            <BarChart3 color="#2563eb" size={24} />
            <Text style={styles.sectionTitle}>Analíticas Avanzadas</Text>
          </View>
          <View style={styles.analyticsHeaderRight}>
            <TouchableOpacity style={styles.analyticsExportButton}>
              <Download color="#64748b" size={16} />
              <Text style={styles.analyticsExportButtonText}>Exportar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.analyticsReportButton}>
              <FileText color="#2563eb" size={16} />
              <Text style={styles.analyticsReportButtonText}>Generar Reporte</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Time Range Selector */}
        <View style={styles.analyticsTimeRangeContainer}>
          <Text style={styles.analyticsTimeRangeLabel}>Período:</Text>
          <View style={styles.analyticsTimeRangeButtons}>
            {[
              { key: "7d", label: "7 días" },
              { key: "30d", label: "30 días" },
              { key: "90d", label: "90 días" },
              { key: "1y", label: "1 año" }
            ].map((range) => (
              <TouchableOpacity
                key={range.key}
                style={[
                  styles.analyticsTimeRangeButton,
                  analyticsTimeRange === range.key && styles.analyticsTimeRangeButtonActive
                ]}
                onPress={() => setAnalyticsTimeRange(range.key as any)}
              >
                <Text style={[
                  styles.analyticsTimeRangeButtonText,
                  analyticsTimeRange === range.key && styles.analyticsTimeRangeButtonTextActive
                ]}>
                  {range.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* View Selector */}
        <View style={styles.analyticsViewSelector}>
          {[
            { key: "overview", label: "Resumen", icon: BarChart3 },
            { key: "sales", label: "Ventas", icon: DollarSign },
            { key: "products", label: "Productos", icon: Package },
            { key: "customers", label: "Clientes", icon: Users },
            { key: "staff", label: "Personal", icon: UserCheck }
          ].map((view) => (
            <TouchableOpacity
              key={view.key}
              style={[
                styles.analyticsViewButton,
                analyticsView === view.key && styles.analyticsViewButtonActive
              ]}
              onPress={() => setAnalyticsView(view.key as any)}
            >
              <view.icon 
                color={analyticsView === view.key ? "#ffffff" : "#64748b"} 
                size={16} 
              />
              <Text style={[
                styles.analyticsViewButtonText,
                analyticsView === view.key && styles.analyticsViewButtonTextActive
              ]}>
                {view.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Analytics Content */}
        <View style={styles.analyticsContent}>
          {analyticsView === "overview" && renderAnalyticsOverview()}
          {analyticsView === "sales" && renderSalesAnalytics()}
          {analyticsView === "products" && renderProductAnalytics()}
          {analyticsView === "customers" && renderCustomerAnalytics()}
          {analyticsView === "staff" && renderStaffAnalytics()}
        </View>
      </ScrollView>
    );
  };

  const renderCRM = () => (
    <ScrollView style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>CRM - Gestión de Clientes</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/crm-dashboard')}
        >
          <Text style={styles.addButtonText}>Ver CRM Completo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Panel de CRM Integrado</Text>
        <View style={styles.crmInfoCard}>
          <Users color="#0891b2" size={32} />
          <Text style={styles.crmInfoTitle}>Sistema CRM Completo</Text>
          <Text style={styles.crmInfoText}>
            • Gestión completa de clientes{"\n"}
            • Historial de interacciones{"\n"}
            • Segmentación de clientes{"\n"}
            • Seguimiento de oportunidades{"\n"}
            • Automatización de marketing{"\n"}
            • Análisis de satisfacción
          </Text>
          <TouchableOpacity 
            style={styles.primaryActionButton}
            onPress={() => router.push('/crm-dashboard')}
          >
            <Text style={styles.primaryActionButtonText}>Abrir CRM Completo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  const renderERP = () => (
    <ScrollView style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>ERP - Sistema Empresarial</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/erp-inventory')}
        >
          <Text style={styles.addButtonText}>Abrir ERP Completo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.crmInfoCard}>
          <Package color="#059669" size={32} />
          <Text style={styles.crmInfoTitle}>Sistema ERP Completo</Text>
          <Text style={styles.crmInfoText}>
            • Gestión completa de inventario{"\n"}
            • Control de stock y alertas{"\n"}
            • Gestión de proveedores{"\n"}
            • Órdenes de compra{"\n"}
            • Movimientos de inventario{"\n"}
            • Recepción de mercancía{"\n"}
            • Reportes y analíticas{"\n"}
            • Valoración de inventario
          </Text>
          <TouchableOpacity 
            style={styles.primaryActionButton}
            onPress={() => router.push('/erp-inventory')}
          >
            <Text style={styles.primaryActionButtonText}>Abrir Sistema ERP</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Módulos ERP Disponibles</Text>
        
        <View style={styles.erpModulesGrid}>
          <View style={styles.erpModuleCard}>
            <Package color="#059669" size={32} />
            <Text style={styles.erpModuleTitle}>Inventario</Text>
            <Text style={styles.erpModuleDescription}>
              Control de stock, alertas de bajo inventario, movimientos
            </Text>
            <Text style={styles.erpModuleStatus}>✓ Activo</Text>
          </View>

          <View style={styles.erpModuleCard}>
            <Users color="#2563eb" size={32} />
            <Text style={styles.erpModuleTitle}>Proveedores</Text>
            <Text style={styles.erpModuleDescription}>
              Gestión de proveedores, órdenes de compra, pagos
            </Text>
            <Text style={styles.erpModuleStatus}>✓ Activo</Text>
          </View>

          <View style={styles.erpModuleCard}>
            <Receipt color="#7c3aed" size={32} />
            <Text style={styles.erpModuleTitle}>Compras</Text>
            <Text style={styles.erpModuleDescription}>
              Órdenes de compra, recepción, facturación
            </Text>
            <Text style={styles.erpModuleStatus}>✓ Activo</Text>
          </View>

          <View style={styles.erpModuleCard}>
            <Calculator color="#ea580c" size={32} />
            <Text style={styles.erpModuleTitle}>Contabilidad</Text>
            <Text style={styles.erpModuleDescription}>
              Libro diario, balance, estados financieros
            </Text>
            <Text style={styles.erpModuleStatus}>⚠ Próximamente</Text>
          </View>
        </View>

        <View style={styles.erpStatsSection}>
          <Text style={styles.subsectionTitle}>Inventario Actual</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{products.filter(p => !p.isService).length}</Text>
              <Text style={styles.statLabel}>Productos</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {products.filter(p => !p.isService).reduce((sum, p) => sum + (p.stock || 0), 0)}
              </Text>
              <Text style={styles.statLabel}>Unidades en stock</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>
                {products.filter(p => !p.isService && (p.stock || 0) < 5).length}
              </Text>
              <Text style={styles.statLabel}>Stock bajo</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>$
                {products.filter(p => !p.isService).reduce((sum, p) => sum + (p.price * (p.stock || 0)), 0).toLocaleString()}
              </Text>
              <Text style={styles.statLabel}>Valor inventario</Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderCMS = () => (
    <ScrollView style={styles.content}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>CMS - Gestión de Contenido</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subsectionTitle}>Gestión de Contenido del Negocio</Text>
        
        <View style={styles.cmsModulesGrid}>
          <TouchableOpacity style={styles.cmsModuleCard}>
            <Store color="#2563eb" size={32} />
            <Text style={styles.cmsModuleTitle}>Perfil del Negocio</Text>
            <Text style={styles.cmsModuleDescription}>
              Información, horarios, ubicación, imágenes
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cmsModuleCard}>
            <Image color="#059669" size={32} />
            <Text style={styles.cmsModuleTitle}>Galería</Text>
            <Text style={styles.cmsModuleDescription}>
              Fotos de trabajos, instalaciones, equipo
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cmsModuleCard}>
            <Star color="#7c3aed" size={32} />
            <Text style={styles.cmsModuleTitle}>Reseñas</Text>
            <Text style={styles.cmsModuleDescription}>
              Gestión de reseñas y testimonios
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cmsModuleCard}>
            <FileText color="#ea580c" size={32} />
            <Text style={styles.cmsModuleTitle}>Blog/Noticias</Text>
            <Text style={styles.cmsModuleDescription}>
              Artículos, promociones, novedades
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cmsModuleCard}>
            <Tag color="#dc2626" size={32} />
            <Text style={styles.cmsModuleTitle}>Promociones</Text>
            <Text style={styles.cmsModuleDescription}>
              Ofertas especiales y descuentos
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cmsModuleCard}>
            <Settings color="#64748b" size={32} />
            <Text style={styles.cmsModuleTitle}>Configuración</Text>
            <Text style={styles.cmsModuleDescription}>
              Ajustes generales del perfil público
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.cmsPreviewSection}>
          <Text style={styles.subsectionTitle}>Vista Previa del Perfil</Text>
          <View style={styles.cmsPreviewCard}>
            <View style={styles.businessHeader}>
              <View style={styles.businessInfo}>
                <Store color="#2563eb" size={24} />
                <View style={styles.businessDetails}>
                  <Text style={styles.businessName}>Clínica Dental Sonrisa</Text>
                  <Text style={styles.businessCategory}>Servicios Médicos</Text>
                </View>
              </View>
            </View>
            <Text style={styles.cmsPreviewText}>
              Tu perfil público es visible para todos los usuarios de NodoX
            </Text>
            <TouchableOpacity style={styles.secondaryActionButton}>
              <Text style={styles.secondaryActionButtonText}>Ver Perfil Público</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    switch (currentView) {
      case "overview":
        return renderOverview();
      case "services":
        return renderServices();
      case "appointments":
        return renderAppointments();
      case "staff":
        return renderStaff();
      case "products":
        return renderProducts();
      case "crm":
        return renderCRM();
      case "erp":
        return renderERP();
      case "pos":
        return renderPOS();
      case "analytics":
        return renderAnalytics();
      case "cms":
        return renderCMS();
      case "marketing":
        return (
          <View style={styles.comingSoon}>
            <Megaphone color="#64748b" size={48} />
            <Text style={styles.comingSoonText}>Herramientas de Marketing</Text>
            <Text style={styles.comingSoonSubtext}>Próximamente disponible</Text>
          </View>
        );
      case "settings":
        return (
          <View style={styles.comingSoon}>
            <Settings color="#64748b" size={48} />
            <Text style={styles.comingSoonText}>Configuración</Text>
            <Text style={styles.comingSoonSubtext}>Próximamente disponible</Text>
          </View>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{
          headerShown: true,
          title: "Panel de Aliado",
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <ArrowLeft color="#1e293b" size={24} />
            </TouchableOpacity>
          ),
        }} 
      />
      
      <View style={styles.layout}>
        {/* Sidebar */}
        <View style={styles.sidebar}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {menuItems.map((item) => {
              const isActive = currentView === item.id;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => setCurrentView(item.id as AllyView)}
                >
                  <item.icon 
                    color={isActive ? "#ffffff" : item.color} 
                    size={20} 
                  />
                  <Text style={[styles.menuItemText, isActive && styles.menuItemTextActive]}>
                    {item.title}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {renderContent()}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  layout: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 240,
    backgroundColor: "#ffffff",
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 8,
    borderRadius: 8,
    gap: 12,
  },
  menuItemActive: {
    backgroundColor: "#2563eb",
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  menuItemTextActive: {
    color: "#ffffff",
  },
  mainContent: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  businessHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  businessInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  businessDetails: {
    flex: 1,
  },
  businessName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  businessCategory: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  switchButton: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  switchButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    flex: 1,
    minWidth: (width - 64) / 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#ffffff",
  },
  appointmentCard: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  appointmentTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginRight: 16,
  },
  timeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563eb",
  },
  appointmentInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  serviceNameInCard: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
  },
  quickAction: {
    backgroundColor: "#ffffff",
    flex: 1,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    marginTop: 8,
    textAlign: "center",
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  categoriesRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 4,
  },
  categoryCard: {
    alignItems: "center",
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    minWidth: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
  },
  serviceCard: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  serviceDetails: {
    flexDirection: "row",
    gap: 16,
  },
  servicePrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },
  serviceDuration: {
    fontSize: 14,
    color: "#64748b",
  },
  serviceStaff: {
    fontSize: 14,
    color: "#64748b",
  },
  serviceActions: {
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#475569",
  },
  calendarButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  calendarButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2563eb",
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filtersRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 4,
  },
  filterChip: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: "#2563eb",
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
  },
  filterChipTextActive: {
    color: "#ffffff",
  },
  appointmentDetailCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  appointmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  appointmentDateTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  appointmentDate: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  appointmentBody: {
    marginBottom: 12,
  },
  appointmentClient: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  appointmentService: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  appointmentStaff: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  appointmentNotes: {
    fontSize: 14,
    color: "#64748b",
    fontStyle: "italic",
    marginTop: 4,
  },
  appointmentActions: {
    flexDirection: "row",
    gap: 8,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  confirmButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#059669",
  },
  rescheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fed7aa",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  rescheduleButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#ea580c",
  },
  staffCard: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  staffInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  staffAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  staffInitials: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
  },
  staffDetails: {
    flex: 1,
  },
  staffName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  staffSpecialties: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 2,
  },
  staffSchedule: {
    fontSize: 12,
    color: "#94a3b8",
  },
  staffActions: {
    flexDirection: "row",
    gap: 8,
  },
  scheduleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  scheduleButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2563eb",
  },
  comingSoon: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  comingSoonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
    marginBottom: 8,
  },
  comingSoonSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
  // Product Management Styles
  productStatsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  productStatCard: {
    backgroundColor: "#ffffff",
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productStatValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 8,
    marginBottom: 4,
  },
  productStatLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  searchFilterContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#64748b",
  },
  filterButton: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  categoryCount: {
    fontSize: 11,
    color: "#94a3b8",
    marginTop: 2,
  },
  productCard: {
    backgroundColor: "#ffffff",
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  productImageContainer: {
    marginRight: 12,
  },
  productImagePlaceholder: {
    width: 60,
    height: 60,
    backgroundColor: "#f1f5f9",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  productInfo: {
    flex: 1,
  },
  productItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
    marginRight: 8,
  },
  productBadges: {
    flexDirection: "row",
    gap: 4,
  },
  serviceBadge: {
    backgroundColor: "#ede9fe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  serviceBadgeText: {
    fontSize: 10,
    fontWeight: "500",
    color: "#7c3aed",
  },
  productDescription: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
    lineHeight: 20,
  },
  productDetails: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "600",
    color: "#059669",
  },
  productNcopPrice: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productStock: {
    fontSize: 12,
    fontWeight: "500",
  },
  productDuration: {
    fontSize: 12,
    color: "#64748b",
  },
  productCategory: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 4,
  },
  productActions: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  productActionButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f8fafc",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
    lineHeight: 20,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    backgroundColor: "#ffffff",
    flex: 1,
    minWidth: (width - 64) / 2,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionCardText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    marginTop: 8,
    textAlign: "center",
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  productHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  // POS Styles
  posContainer: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  posLayout: {
    flex: 1,
    flexDirection: "row",
    gap: 20,
    padding: 20,
  },
  posProductsSection: {
    flex: 2,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  posCartSection: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  posHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  posSectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  posSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
    minWidth: 200,
  },
  posSearchInput: {
    fontSize: 14,
    color: "#64748b",
  },
  posProductsList: {
    flex: 1,
  },
  posProductsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  posProductCard: {
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    minWidth: 120,
    maxWidth: 140,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  posProductImage: {
    width: 48,
    height: 48,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  posProductName: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 4,
    minHeight: 32,
  },
  posProductPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#059669",
    marginBottom: 2,
  },
  posProductNcop: {
    fontSize: 10,
    color: "#2563eb",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    marginBottom: 2,
  },
  posProductStock: {
    fontSize: 10,
    color: "#64748b",
  },
  posCartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  posClearButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fef2f2",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  posClearButtonText: {
    fontSize: 12,
    color: "#dc2626",
    fontWeight: "500",
  },
  posCustomerSection: {
    marginBottom: 16,
  },
  posCustomerLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  posCustomerInput: {
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  posCustomerInputText: {
    fontSize: 14,
    color: "#64748b",
  },
  posCartItems: {
    flex: 1,
    marginBottom: 16,
  },
  posEmptyCart: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  posEmptyCartText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 12,
    marginBottom: 4,
  },
  posEmptyCartSubtext: {
    fontSize: 14,
    color: "#94a3b8",
    textAlign: "center",
  },
  posCartItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  posCartItemInfo: {
    flex: 1,
  },
  posCartItemName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  posCartItemPrice: {
    fontSize: 12,
    color: "#64748b",
  },
  posCartItemControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  posQuantityButton: {
    backgroundColor: "#ffffff",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  posQuantityText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    minWidth: 20,
    textAlign: "center",
  },
  posRemoveButton: {
    backgroundColor: "#fef2f2",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 4,
  },
  posCartItemTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#059669",
    minWidth: 60,
    textAlign: "right",
  },
  posDiscountSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  posDiscountLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#92400e",
  },
  posDiscountControls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  posDiscountButton: {
    backgroundColor: "#ffffff",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f59e0b",
  },
  posDiscountValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#92400e",
    minWidth: 40,
    textAlign: "center",
  },
  posTotalsSection: {
    backgroundColor: "#f1f5f9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  posTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  posTotalLabel: {
    fontSize: 14,
    color: "#64748b",
  },
  posTotalValue: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
  },
  posFinalTotal: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0,
  },
  posFinalTotalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  posFinalTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#059669",
  },
  posCheckoutButton: {
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  posCheckoutButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
  },
  posPaymentSection: {
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  posPaymentTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 12,
  },
  posPaymentMethods: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 16,
  },
  posPaymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 6,
    minWidth: 100,
  },
  posPaymentMethodActive: {
    backgroundColor: "#2563eb",
    borderColor: "#2563eb",
  },
  posPaymentMethodText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  posPaymentMethodTextActive: {
    color: "#ffffff",
  },
  posCashSection: {
    marginBottom: 16,
  },
  posCashLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  posCashInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    gap: 8,
  },
  posCashInputText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    flex: 1,
  },
  posChangeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#dcfce7",
    padding: 12,
    borderRadius: 6,
    marginTop: 8,
  },
  posChangeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#166534",
  },
  posChangeValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
  },
  posPaymentActions: {
    flexDirection: "row",
    gap: 8,
  },
  posCancelPaymentButton: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: "center",
  },
  posCancelPaymentButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  posConfirmPaymentButton: {
    flex: 2,
    backgroundColor: "#059669",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 6,
    gap: 6,
  },
  posConfirmPaymentButtonDisabled: {
    backgroundColor: "#94a3b8",
  },
  posConfirmPaymentButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  // Success Screen Styles
  posSuccessScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#ffffff",
    margin: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  posSuccessTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#059669",
    marginTop: 16,
    marginBottom: 8,
  },
  posSuccessSubtitle: {
    fontSize: 16,
    color: "#64748b",
    marginBottom: 24,
  },
  posReceiptPreview: {
    backgroundColor: "#f8fafc",
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    width: "100%",
    maxWidth: 300,
    marginBottom: 24,
  },
  posReceiptTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "center",
    marginBottom: 4,
  },
  posReceiptBusiness: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 2,
  },
  posReceiptDate: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: 16,
  },
  posReceiptDivider: {
    height: 1,
    backgroundColor: "#e2e8f0",
    marginVertical: 12,
  },
  posReceiptItem: {
    marginBottom: 8,
  },
  posReceiptItemName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 2,
  },
  posReceiptItemDetails: {
    fontSize: 12,
    color: "#64748b",
  },
  posReceiptTotals: {
    marginTop: 8,
  },
  posReceiptTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  posReceiptTotalLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  posReceiptTotalValue: {
    fontSize: 12,
    fontWeight: "500",
    color: "#1e293b",
  },
  posReceiptFinalTotal: {
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    marginTop: 8,
    marginBottom: 8,
  },
  posReceiptFinalTotalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e293b",
  },
  posReceiptFinalTotalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#059669",
  },
  posReceiptActions: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
    maxWidth: 300,
  },
  posPrintButton: {
    flex: 1,
    backgroundColor: "#2563eb",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  posPrintButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#ffffff",
  },
  posEmailButton: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  posEmailButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748b",
  },
  // Analytics Styles
  analyticsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  analyticsHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  analyticsHeaderRight: {
    flexDirection: "row",
    gap: 8,
  },
  analyticsExportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  analyticsExportButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  analyticsReportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  analyticsReportButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#2563eb",
  },
  analyticsTimeRangeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 12,
  },
  analyticsTimeRangeLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  analyticsTimeRangeButtons: {
    flexDirection: "row",
    gap: 8,
  },
  analyticsTimeRangeButton: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  analyticsTimeRangeButtonActive: {
    backgroundColor: "#2563eb",
  },
  analyticsTimeRangeButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  analyticsTimeRangeButtonTextActive: {
    color: "#ffffff",
  },
  analyticsViewSelector: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 8,
    padding: 4,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  analyticsViewButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    gap: 6,
  },
  analyticsViewButtonActive: {
    backgroundColor: "#2563eb",
  },
  analyticsViewButtonText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
  },
  analyticsViewButtonTextActive: {
    color: "#ffffff",
  },
  analyticsContent: {
    flex: 1,
  },
  analyticsMetricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  analyticsMetricCard: {
    backgroundColor: "#ffffff",
    flex: 1,
    minWidth: (width - 64) / 2,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsMetricHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  analyticsGrowthBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  analyticsGrowthText: {
    fontSize: 10,
    fontWeight: "600",
  },
  analyticsMetricValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  analyticsMetricLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  analyticsChartCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsChartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  analyticsChartTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  analyticsChartLegend: {
    flexDirection: "row",
    gap: 16,
  },
  analyticsLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  analyticsLegendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  analyticsLegendText: {
    fontSize: 12,
    color: "#64748b",
  },
  analyticsChartPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  analyticsChartPlaceholderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#64748b",
    marginTop: 12,
    marginBottom: 4,
  },
  analyticsChartPlaceholderSubtext: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
  },
  analyticsQuickStats: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  analyticsQuickStatItem: {
    backgroundColor: "#ffffff",
    flex: 1,
    minWidth: (width - 84) / 2,
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  analyticsQuickStatValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 6,
    marginBottom: 2,
  },
  analyticsQuickStatLabel: {
    fontSize: 10,
    color: "#64748b",
    textAlign: "center",
  },
  analyticsSalesGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },
  analyticsSalesCard: {
    backgroundColor: "#ffffff",
    flex: 1,
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsSalesCardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 12,
  },
  analyticsPaymentMethods: {
    gap: 8,
  },
  analyticsPaymentMethod: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  analyticsPaymentMethodInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  analyticsPaymentMethodName: {
    fontSize: 12,
    color: "#374151",
  },
  analyticsPaymentMethodValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
  },
  analyticsTimeSlots: {
    gap: 8,
  },
  analyticsTimeSlot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  analyticsTimeSlotTime: {
    fontSize: 11,
    color: "#64748b",
    minWidth: 80,
  },
  analyticsTimeSlotBar: {
    flex: 1,
    height: 6,
    backgroundColor: "#f1f5f9",
    borderRadius: 3,
    overflow: "hidden",
  },
  analyticsTimeSlotFill: {
    height: "100%",
    backgroundColor: "#2563eb",
  },
  analyticsTimeSlotAmount: {
    fontSize: 11,
    fontWeight: "600",
    color: "#1e293b",
    minWidth: 50,
    textAlign: "right",
  },
  analyticsComparisonCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsComparisonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  analyticsComparisonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  analyticsComparisonItem: {
    backgroundColor: "#f8fafc",
    flex: 1,
    minWidth: (width - 104) / 2,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  analyticsComparisonMonth: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748b",
    marginBottom: 4,
  },
  analyticsComparisonRevenue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 6,
  },
  analyticsComparisonGrowth: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  analyticsComparisonGrowthText: {
    fontSize: 10,
    fontWeight: "600",
  },
  analyticsTopProductsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsTopProductsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  analyticsTopProductItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  analyticsTopProductRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  analyticsTopProductRankText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  analyticsTopProductInfo: {
    flex: 1,
  },
  analyticsTopProductName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 2,
  },
  analyticsTopProductStats: {
    fontSize: 12,
    color: "#64748b",
  },
  analyticsTopProductGrowth: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  analyticsTopProductGrowthText: {
    fontSize: 10,
    fontWeight: "600",
  },
  analyticsCategoriesCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsCategoriesTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  analyticsCategoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  analyticsCategoryItem: {
    backgroundColor: "#f8fafc",
    flex: 1,
    minWidth: (width - 104) / 2,
    padding: 12,
    borderRadius: 8,
  },
  analyticsCategoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 6,
  },
  analyticsCategoryDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  analyticsCategoryName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  analyticsCategoryRevenue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 2,
  },
  analyticsCategoryPercentage: {
    fontSize: 11,
    color: "#64748b",
  },
  analyticsCustomerOverview: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  analyticsCustomerMetric: {
    backgroundColor: "#ffffff",
    flex: 1,
    minWidth: (width - 84) / 2,
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsCustomerMetricValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 8,
    marginBottom: 4,
  },
  analyticsCustomerMetricLabel: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  analyticsSegmentsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsSegmentsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  analyticsSegmentsList: {
    gap: 8,
  },
  analyticsSegmentItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  analyticsSegmentInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 8,
  },
  analyticsSegmentDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  analyticsSegmentName: {
    fontSize: 12,
    color: "#374151",
    flex: 1,
  },
  analyticsSegmentStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  analyticsSegmentCount: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
  },
  analyticsSegmentPercentage: {
    fontSize: 11,
    color: "#64748b",
  },
  analyticsRetentionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsRetentionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  analyticsRetentionChart: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 16,
  },
  analyticsRetentionStats: {
    alignItems: "center",
  },
  analyticsRetentionValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  analyticsRetentionLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  analyticsRetentionBreakdown: {
    gap: 8,
  },
  analyticsRetentionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  analyticsRetentionItemLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  analyticsRetentionItemValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
  },
  analyticsStaffCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsStaffTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  analyticsStaffItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    gap: 12,
  },
  analyticsStaffInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  analyticsStaffAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    justifyContent: "center",
    alignItems: "center",
  },
  analyticsStaffInitials: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748b",
  },
  analyticsStaffDetails: {
    flex: 1,
  },
  analyticsStaffName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1e293b",
    marginBottom: 2,
  },
  analyticsStaffSpecialty: {
    fontSize: 12,
    color: "#64748b",
  },
  analyticsStaffMetrics: {
    flexDirection: "row",
    gap: 16,
  },
  analyticsStaffMetric: {
    alignItems: "center",
    minWidth: 50,
  },
  analyticsStaffMetricValue: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 2,
    marginBottom: 1,
  },
  analyticsStaffMetricLabel: {
    fontSize: 9,
    color: "#94a3b8",
    textAlign: "center",
  },
  analyticsScheduleCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsScheduleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  analyticsScheduleGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 8,
  },
  analyticsScheduleDay: {
    alignItems: "center",
    flex: 1,
  },
  analyticsScheduleDayName: {
    fontSize: 11,
    fontWeight: "500",
    color: "#64748b",
    marginBottom: 8,
  },
  analyticsScheduleBar: {
    width: 20,
    height: 80,
    backgroundColor: "#f1f5f9",
    borderRadius: 10,
    justifyContent: "flex-end",
    overflow: "hidden",
    marginBottom: 8,
  },
  analyticsScheduleFill: {
    backgroundColor: "#2563eb",
    borderRadius: 10,
    minHeight: 4,
  },
  analyticsScheduleEfficiency: {
    fontSize: 10,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 2,
  },
  analyticsScheduleAppointments: {
    fontSize: 9,
    color: "#94a3b8",
  },
  // CRM Styles
  crmInfoCard: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  crmInfoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  crmInfoText: {
    fontSize: 14,
    color: "#64748b",
    lineHeight: 22,
    marginBottom: 20,
    textAlign: "left",
  },
  primaryActionButton: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 200,
  },
  primaryActionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    textAlign: "center",
  },
  secondaryActionButton: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  secondaryActionButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#475569",
    textAlign: "center",
  },
  // ERP Styles
  erpModulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  erpModuleCard: {
    backgroundColor: "#ffffff",
    flex: 1,
    minWidth: "48%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  erpModuleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 12,
    marginBottom: 8,
    textAlign: "center",
  },
  erpModuleDescription: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 18,
  },
  erpModuleStatus: {
    fontSize: 12,
    fontWeight: "500",
    color: "#059669",
  },
  erpStatsSection: {
    marginTop: 24,
  },
  // CMS Styles
  cmsModulesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  cmsModuleCard: {
    backgroundColor: "#ffffff",
    flex: 1,
    minWidth: "48%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cmsModuleTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 12,
    marginBottom: 6,
    textAlign: "center",
  },
  cmsModuleDescription: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
    lineHeight: 16,
  },
  cmsPreviewSection: {
    marginTop: 24,
  },
  cmsPreviewCard: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cmsPreviewText: {
    fontSize: 14,
    color: "#64748b",
    marginVertical: 16,
    textAlign: "center",
  },
});