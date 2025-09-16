import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Gift, ShoppingBag, Users, TrendingUp } from "lucide-react-native";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  membershipType: "free" | "premium";
  joinDate: string;
  roles: UserRole[];
  isAlly: boolean;
}

type UserRole = "user" | "ally" | "artist" | "referrer" | "admin";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  ncopPrice?: number;
  category: string;
  images: string[];
  stock: number;
  isActive: boolean;
  isService: boolean;
  duration?: number;
  createdAt: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
  staff: StaffMember[];
  isActive: boolean;
  createdAt: string;
}

interface StaffMember {
  id: string;
  name: string;
  avatar?: string;
  specialties: string[];
  schedule: Schedule[];
}

interface Schedule {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

interface Appointment {
  id: string;
  serviceId: string;
  staffId: string;
  clientId: string;
  clientName: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  amount: number;
  notes?: string;
}

interface AllyMetrics {
  totalRevenue: number;
  monthlyRevenue: number;
  uniqueClients: number;
  averageTicket: number;
  totalOrders: number;
  topProducts: { name: string; sales: number }[];
  clientDemographics: {
    ageGroups: { range: string; percentage: number }[];
    genderDistribution: { male: number; female: number; other: number };
  };
}

interface Campaign {
  id: string;
  name: string;
  type: "featured" | "promoted" | "banner";
  price: number;
  duration: number;
  isActive: boolean;
  startDate: string;
  endDate: string;
}

interface Activity {
  id: string;
  title: string;
  date: string;
  amount: number;
  icon: any;
  color: string;
}

interface Transaction {
  id: string;
  type: "earned" | "spent" | "exchange";
  description: string;
  amount: number;
  date: string;
}

const STORAGE_KEY = "nodox_user_data";

// NCOP to COP conversion rate: 1 NCOP = 100 COP
export const NCOP_TO_COP_RATE = 100;

// Utility functions for NCOP conversion
export const ncopToCop = (ncop: number): number => ncop * NCOP_TO_COP_RATE;
export const copToNcop = (cop: number): number => Math.floor(cop / NCOP_TO_COP_RATE);
export const formatNcopValue = (ncop: number): string => `${ncop.toLocaleString()} NCOP (${ncopToCop(ncop).toLocaleString()})`;
export const formatNcopBalance = (ncop: number): string => `${ncop.toLocaleString()} NCOP`;

export const [NodoXProvider, useNodoX] = createContextHook(() => {
  const [user, setUser] = useState<User>({
    id: "1",
    name: "María González",
    email: "maria.gonzalez@email.com",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    membershipType: "premium",
    joinDate: "2024-01-15",
    roles: ["user", "ally", "referrer"],
    isAlly: true,
  });

  const [currentView, setCurrentView] = useState<"user" | "ally">("user");
  const [products, setProducts] = useState<Product[]>([
    {
      id: "1",
      name: "Corte de Cabello Clásico",
      description: "Corte profesional con lavado y peinado incluido",
      price: 25000,
      ncopPrice: 250,
      category: "Servicios de Belleza",
      images: ["https://images.unsplash.com/photo-1562004760-aceed7bb0fe3?w=400&h=300&fit=crop"],
      stock: 0,
      isActive: true,
      isService: true,
      duration: 45,
      createdAt: "2024-01-10",
    },
    {
      id: "2",
      name: "Shampoo Premium",
      description: "Shampoo profesional para todo tipo de cabello",
      price: 35000,
      ncopPrice: 350,
      category: "Productos de Belleza",
      images: ["https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=300&fit=crop"],
      stock: 25,
      isActive: true,
      isService: false,
      createdAt: "2024-01-08",
    },
  ]);

  const [services, setServices] = useState<Service[]>([
    {
      id: "1",
      name: "Corte de Cabello",
      description: "Corte profesional personalizado",
      price: 25000,
      duration: 45,
      category: "Peluquería",
      staff: [
        {
          id: "1",
          name: "Ana Rodríguez",
          avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face",
          specialties: ["Cortes", "Peinados"],
          schedule: [
            { dayOfWeek: 1, startTime: "09:00", endTime: "18:00", isAvailable: true },
            { dayOfWeek: 2, startTime: "09:00", endTime: "18:00", isAvailable: true },
            { dayOfWeek: 3, startTime: "09:00", endTime: "18:00", isAvailable: true },
            { dayOfWeek: 4, startTime: "09:00", endTime: "18:00", isAvailable: true },
            { dayOfWeek: 5, startTime: "09:00", endTime: "18:00", isAvailable: true },
          ],
        },
      ],
      isActive: true,
      createdAt: "2024-01-10",
    },
  ]);

  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      serviceId: "1",
      staffId: "1",
      clientId: "2",
      clientName: "Carlos Mendoza",
      date: "2024-01-25",
      time: "10:00",
      status: "confirmed",
      amount: 25000,
      notes: "Cliente regular",
    },
    {
      id: "2",
      serviceId: "1",
      staffId: "1",
      clientId: "3",
      clientName: "Laura Pérez",
      date: "2024-01-25",
      time: "14:30",
      status: "pending",
      amount: 25000,
    },
  ]);

  const [allyMetrics] = useState<AllyMetrics>({
    totalRevenue: 2450000,
    monthlyRevenue: 850000,
    uniqueClients: 156,
    averageTicket: 32500,
    totalOrders: 89,
    topProducts: [
      { name: "Corte de Cabello", sales: 45 },
      { name: "Shampoo Premium", sales: 23 },
      { name: "Tratamiento Capilar", sales: 18 },
    ],
    clientDemographics: {
      ageGroups: [
        { range: "18-25", percentage: 25 },
        { range: "26-35", percentage: 35 },
        { range: "36-45", percentage: 28 },
        { range: "46+", percentage: 12 },
      ],
      genderDistribution: { male: 45, female: 52, other: 3 },
    },
  });

  const [campaigns] = useState<Campaign[]>([
    {
      id: "1",
      name: "Aliado Destacado",
      type: "featured",
      price: 50000,
      duration: 7,
      isActive: false,
      startDate: "",
      endDate: "",
    },
    {
      id: "2",
      name: "Promoción Premium",
      type: "promoted",
      price: 75000,
      duration: 14,
      isActive: false,
      startDate: "",
      endDate: "",
    },
  ]);

  const [ncopBalance, setNcopBalance] = useState<number>(2450);
  const [copBalance, setCopBalance] = useState<number>(150000);
  const [monthlyEarnings, setMonthlyEarnings] = useState<number>(850);
  const [ncopHistoryState, setNcopHistory] = useState<Transaction[]>([
    {
      id: "1",
      type: "earned",
      description: "Compra en Restaurante El Sabor",
      amount: 120,
      date: "15 Ene 2024",
    },
    {
      id: "2",
      type: "spent",
      description: "Canje descuento Tienda Fashion",
      amount: 300,
      date: "14 Ene 2024",
    },
    {
      id: "3",
      type: "earned",
      description: "Referido exitoso",
      amount: 500,
      date: "12 Ene 2024",
    },
    {
      id: "4",
      type: "earned",
      description: "Liberación mensual",
      amount: 200,
      date: "08 Ene 2024",
    },
    {
      id: "5",
      type: "spent",
      description: "Canje descuento Café Central",
      amount: 150,
      date: "05 Ene 2024",
    },
  ]);

  const recentActivity: Activity[] = [
    {
      id: "1",
      title: "Compra en Restaurante El Sabor",
      date: "Hace 2 horas",
      amount: 120,
      icon: ShoppingBag,
      color: "#10b981",
    },
    {
      id: "2",
      title: "Canje de descuento",
      date: "Ayer",
      amount: -300,
      icon: Gift,
      color: "#ef4444",
    },
    {
      id: "3",
      title: "Referido exitoso - Ana López",
      date: "Hace 3 días",
      amount: 500,
      icon: Users,
      color: "#8b5cf6",
    },
    {
      id: "4",
      title: "Liberación mensual",
      date: "Hace 1 semana",
      amount: 200,
      icon: TrendingUp,
      color: "#2563eb",
    },
  ];



  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setNcopBalance(data.ncopBalance || 2450);
        setCopBalance(data.copBalance || 150000);
        setMonthlyEarnings(data.monthlyEarnings || 850);
      }
    } catch (error) {
      console.log("Error loading user data:", error);
    }
  };

  const saveUserData = async (ncopBal: number, copBal: number, earnings: number) => {
    try {
      const data = {
        ncopBalance: ncopBal,
        copBalance: copBal,
        monthlyEarnings: earnings,
      };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.log("Error saving user data:", error);
    }
  };

  const updateNcopBalance = (newBalance: number) => {
    setNcopBalance(newBalance);
    saveUserData(newBalance, copBalance, monthlyEarnings);
  };

  const updateCopBalance = (newBalance: number) => {
    setCopBalance(newBalance);
    saveUserData(ncopBalance, newBalance, monthlyEarnings);
  };

  const addNcop = (amount: number) => {
    const newBalance = ncopBalance + amount;
    updateNcopBalance(newBalance);
  };

  const spendNcop = (amount: number) => {
    if (ncopBalance >= amount) {
      const newBalance = ncopBalance - amount;
      updateNcopBalance(newBalance);
      return true;
    }
    return false;
  };

  const switchToAllyView = () => {
    setCurrentView("ally");
  };

  const switchToUserView = () => {
    setCurrentView("user");
  };

  const addProduct = (product: Omit<Product, "id" | "createdAt">) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setProducts(prev => [...prev, newProduct]);
    console.log('Product added:', newProduct);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
    console.log('Product updated:', id, updates);
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    console.log('Product deleted:', id);
  };

  const updateAppointmentStatus = (id: string, status: Appointment["status"]) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    console.log('Appointment status updated:', id, status);
  };

  const addService = (service: Omit<Service, "id" | "createdAt">) => {
    const newService: Service = {
      ...service,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setServices(prev => [...prev, newService]);
    console.log('Service added:', newService);
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    console.log('Service updated:', id, updates);
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    console.log('Service deleted:', id);
  };

  const addStaffMember = (serviceId: string, staff: StaffMember) => {
    setServices(prev => prev.map(s => 
      s.id === serviceId 
        ? { ...s, staff: [...s.staff, staff] }
        : s
    ));
    console.log('Staff member added to service:', serviceId, staff);
  };

  const activateCampaign = (campaignId: string) => {
    const campaign = campaigns.find(c => c.id === campaignId);
    if (campaign && copBalance >= campaign.price) {
      const newCopBalance = copBalance - campaign.price;
      updateCopBalance(newCopBalance);
      console.log(`Campaign ${campaign.name} activated for ${campaign.price} COP`);
      return true;
    }
    return false;
  };

  const sendNCOP = async (recipient: string, amount: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (ncopBalance >= amount) {
          const newBalance = ncopBalance - amount;
          updateNcopBalance(newBalance);
          console.log(`Sent ${amount} NCOP to ${recipient}`);
          resolve();
        } else {
          reject(new Error("Insufficient NCOP balance"));
        }
      }, 1500);
    });
  };

  const sendCOP = async (recipient: string, amount: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (copBalance >= amount) {
          const newBalance = copBalance - amount;
          updateCopBalance(newBalance);
          console.log(`Sent ${amount} COP to ${recipient}`);
          resolve();
        } else {
          reject(new Error("Insufficient COP balance"));
        }
      }, 1500);
    });
  };

  const rechargeCOP = async (amount: number, method: "PSE" | "CARD"): Promise<void> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const newCopBalance = copBalance + amount;
          const ncopBonus = Math.floor(amount * 0.05 / NCOP_TO_COP_RATE);
          const newNcopBalance = ncopBalance + ncopBonus;
          
          updateCopBalance(newCopBalance);
          setNcopBalance(newNcopBalance);
          saveUserData(newNcopBalance, newCopBalance, monthlyEarnings);
          
          console.log(`Recharged ${amount} COP via ${method}, bonus: ${ncopBonus} NCOP`);
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 2000);
    });
  };

  const exchangeNCOP = (amount: number, description: string) => {
    if (ncopBalance >= amount) {
      const newBalance = ncopBalance - amount;
      updateNcopBalance(newBalance);
      
      // Add transaction to history
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        description: `Canje: ${description}`,
        amount: -amount,
        date: new Date().toISOString(),
        type: "exchange",
      };
      
      setNcopHistory(prev => [newTransaction, ...prev]);
      console.log(`Exchanged ${amount} NCOP for ${description}`);
      return true;
    }
    return false;
  };

  const generateAdCopy = async (productName: string, businessName: string): Promise<string> => {
    const prompts = [
      `🌟 ¡Descubre ${productName} en ${businessName}! La calidad que mereces a un precio increíble. ¡No te lo pierdas! 💫`,
      `✨ ${productName} disponible en ${businessName} 🔥 ¡Aprovecha esta oportunidad única! Tu satisfacción es nuestra prioridad 💯`,
      `🎯 ${businessName} te trae ${productName} con la mejor calidad del mercado ⭐ ¡Ven y compruébalo tú mismo! 🚀`,
      `💎 En ${businessName} encontrarás ${productName} que superará tus expectativas ✨ ¡Visítanos hoy mismo! 🌟`,
    ];
    
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  const updateUserSettings = (newSettings: any) => {
    // Here you would typically call an API to update user settings
    console.log('Updating user settings:', newSettings);
    // For now, we'll just log the settings update
    // In a real app, you'd merge these settings with the user object
  };

  return {
    user,
    ncopBalance,
    copBalance,
    monthlyEarnings,
    recentActivity,
    ncopHistory: ncopHistoryState,
    addNcop,
    spendNcop,
    updateNcopBalance,
    updateCopBalance,
    sendNCOP,
    sendCOP,
    rechargeCOP,
    exchangeNCOP,
    currentView,
    switchToAllyView,
    switchToUserView,
    products,
    services,
    appointments,
    allyMetrics,
    campaigns,
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
    updateUserSettings,
  };
});