import createContextHook from "@nkzw/create-context-hook";
import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Gift, ShoppingBag, Users, TrendingUp } from "lucide-react-native";
import { InputValidator, ValidationUtils, ErrorUtils } from '@/utils/security';
import { useNotifications } from './use-notifications';
import { useAuth, User as AuthUser } from "./use-auth"; // Import useAuth
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase-client";

// Keep existing interfaces but align User with AuthUser where possible or extend it
interface User extends AuthUser {
  phone?: string;
  // ... other fields that might be specific to this store if not in AuthUser
}

// ... (Rest of interfaces: Product, Service, etc. - kept as is)
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

interface AllyRequest {
  id: string;
  userId: string;
  businessName: string;
  businessType: string;
  businessDescription: string;
  businessAddress: string;
  businessPhone: string;
  businessEmail: string;
  taxId: string;
  legalRepresentative: string;
  requestDate: string;
  status: "none" | "pending" | "temp_approved" | "approved" | "rejected";
  reviewedBy?: string;
  reviewDate?: string;
  rejectionReason?: string;
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
  const { user: authUser } = useAuth(); // Use the authenticated user
  const notifications = useNotifications();

  // Initialize user state with authUser if available, otherwise default/empty
  const [user, setUser] = useState<User>(authUser ? { ...authUser, phone: "" } : {
    id: "guest",
    name: "Invitado",
    email: "",
    avatar: "",
    membershipType: "free",
    joinDate: new Date().toISOString(),
    roles: ["user"],
    isAlly: false,
    allyStatus: "none",
  });

  // Sync with authUser when it changes
  useEffect(() => {
    if (authUser) {
      setUser(prev => ({ ...prev, ...authUser }));
    }
  }, [authUser]);

  const [currentView, setCurrentView] = useState<"user" | "ally">("user");

  // Mock data - eventually migrate to Firestore
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

  const [allyRequests, setAllyRequests] = useState<AllyRequest[]>([]);

  const [ncopBalance, setNcopBalance] = useState<number>(0);
  const [copBalance, setCopBalance] = useState<number>(0);
  const [monthlyEarnings, setMonthlyEarnings] = useState<number>(0);

  // Real-time listener for Wallet Balance from Firestore
  useEffect(() => {
    if (authUser?.id) {
      const walletRef = doc(db, "wallets", authUser.id);
      const unsubscribe = onSnapshot(walletRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setNcopBalance(data.ncopBalance || 0);
          setCopBalance(data.copBalance || 0);
          setMonthlyEarnings(data.monthlyEarnings || 0);
        } else {
            // Default/Initial values if wallet doc doesn't exist
            setNcopBalance(2450);
            setCopBalance(150000);
            setMonthlyEarnings(850);
        }
      });
      return () => unsubscribe();
    }
  }, [authUser]);


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

  // TODO: Migrate these to use Firestore setDoc/updateDoc
  const updateNcopBalance = (newBalance: number) => {
    setNcopBalance(newBalance);
    // saveUserData(newBalance, copBalance, monthlyEarnings);
  };

  const updateCopBalance = (newBalance: number) => {
    setCopBalance(newBalance);
    // saveUserData(ncopBalance, newBalance, monthlyEarnings);
  };

  const addNcop = async (amount: number, source: string = 'Sistema') => {
    const newBalance = ncopBalance + amount;
    updateNcopBalance(newBalance);
    
    // Trigger automatic notification
    await notifications.notifyNCOPEarned(amount, source);
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

  const addAppointment = (appointmentData: Omit<Appointment, 'id' | 'clientId' | 'amount'>) => {
    const service = services.find(s => s.id === appointmentData.serviceId);
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now().toString(),
      clientId: user.id,
      amount: service?.price || 0,
    };
    
    setAppointments(prev => [...prev, newAppointment]);
    console.log('Appointment added:', newAppointment);
  };

  const updateAppointmentStatus = async (id: string, status: Appointment["status"]) => {
    const appointment = appointments.find(a => a.id === id);
    if (!appointment) return;
    
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    
    // Trigger automatic notifications based on status
    const service = services.find(s => s.id === appointment.serviceId);
    if (service) {
      if (status === 'confirmed') {
        await notifications.notifyAppointmentConfirmed(
          service.name,
          appointment.date,
          appointment.time
        );
      } else if (status === 'cancelled') {
        await notifications.createNotification(
          'Cita Cancelada',
          `Tu cita para ${service.name} el ${appointment.date} ha sido cancelada`,
          'appointment_cancelled',
          'appointments',
          { serviceName: service.name, date: appointment.date, time: appointment.time },
          'high'
        );
      }
    }
    
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
      setTimeout(async () => {
        if (ncopBalance >= amount) {
          const newBalance = ncopBalance - amount;
          updateNcopBalance(newBalance);
          
          // Trigger automatic notification
          await notifications.notifyPaymentSent(amount, recipient, 'NCOP');
          
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
      setTimeout(async () => {
        if (copBalance >= amount) {
          const newBalance = copBalance - amount;
          updateCopBalance(newBalance);
          
          // Trigger automatic notification
          await notifications.notifyPaymentSent(amount, recipient, 'COP');
          
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
      setTimeout(async () => {
        try {
          const newCopBalance = copBalance + amount;
          const ncopBonus = Math.floor(amount * 0.05 / NCOP_TO_COP_RATE);
          const newNcopBalance = ncopBalance + ncopBonus;
          
          updateCopBalance(newCopBalance);
          setNcopBalance(newNcopBalance);
          // saveUserData(newNcopBalance, newCopBalance, monthlyEarnings);
          
          // Trigger automatic notifications
          await notifications.notifyRechargeSuccess(amount, method);
          if (ncopBonus > 0) {
            await notifications.notifyNCOPEarned(ncopBonus, 'Bonus por recarga');
          }
          
          console.log(`Recharged ${amount} COP via ${method}, bonus: ${ncopBonus} NCOP`);
          resolve();
        } catch (error) {
          reject(error);
        }
      }, 2000);
    });
  };

  const exchangeNCOP = async (amount: number, description: string) => {
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
      
      // Trigger automatic notification
      await notifications.createNotification(
        'NCOP Canjeados',
        `Has canjeado ${amount} NCOP por ${description}`,
        'ncop_exchanged',
        'wallet',
        { amount, description },
        'normal'
      );
      
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

  const submitAllyRequest = async (requestData: Omit<AllyRequest, "id" | "userId" | "requestDate" | "status">): Promise<boolean> => {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const newRequest: AllyRequest = {
          ...requestData,
          id: Date.now().toString(),
          userId: user.id,
          requestDate: new Date().toISOString(),
          status: "pending",
        };
        
        setAllyRequests(prev => [...prev, newRequest]);
        
        // Update user status to pending
        setUser(prev => ({
          ...prev,
          allyStatus: "pending",
          allyRequestDate: new Date().toISOString(),
        }));
        
        // Trigger automatic notification
        await notifications.createNotification(
          'Solicitud de Aliado Enviada',
          'Tu solicitud para convertirte en aliado ha sido enviada y está siendo revisada',
          'system_update',
          'system',
          { requestId: newRequest.id },
          'normal'
        );
        
        console.log('Ally request submitted:', newRequest);
        resolve(true);
      }, 1500);
    });
  };

  const approveAllyRequest = async (requestId: string, tempAccess: boolean = true) => {
    const request = allyRequests.find(r => r.id === requestId);
    if (!request) return false;

    const now = new Date();
    const tempExpiry = new Date(now.getTime() + (48 * 60 * 60 * 1000)); // 48 hours
    
    setAllyRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { ...r, status: tempAccess ? "temp_approved" : "approved", reviewDate: now.toISOString() }
        : r
    ));

    if (request.userId === user.id) {
      setUser(prev => ({
        ...prev,
        allyStatus: tempAccess ? "temp_approved" : "approved",
        allyApprovalDate: now.toISOString(),
        allyTempAccessExpiry: tempAccess ? tempExpiry.toISOString() : undefined,
        roles: tempAccess || prev.roles.includes("ally") ? prev.roles : [...prev.roles, "ally"],
        isAlly: true,
      }));
      
      // Trigger automatic notification
      await notifications.createNotification(
        tempAccess ? 'Acceso Temporal de Aliado Aprobado' : 'Solicitud de Aliado Aprobada',
        tempAccess 
          ? 'Tu solicitud ha sido aprobada temporalmente por 48 horas. ¡Comienza a vender!'
          : '¡Felicidades! Tu solicitud de aliado ha sido aprobada permanentemente',
        'system_update',
        'system',
        { requestId, tempAccess, expiryTime: tempAccess ? tempExpiry.toISOString() : null },
        'high'
      );
    }

    console.log(`Ally request ${tempAccess ? 'temporarily' : 'permanently'} approved:`, requestId);
    return true;
  };

  const rejectAllyRequest = async (requestId: string, reason: string) => {
    const request = allyRequests.find(r => r.id === requestId);
    if (!request) return false;

    setAllyRequests(prev => prev.map(r => 
      r.id === requestId 
        ? { ...r, status: "rejected", reviewDate: new Date().toISOString(), rejectionReason: reason }
        : r
    ));

    if (request.userId === user.id) {
      setUser(prev => ({
        ...prev,
        allyStatus: "rejected",
      }));
      
      // Trigger automatic notification
      await notifications.createNotification(
        'Solicitud de Aliado Rechazada',
        `Tu solicitud de aliado ha sido rechazada. Motivo: ${reason}`,
        'system_update',
        'system',
        { requestId, reason },
        'normal'
      );
    }

    console.log('Ally request rejected:', requestId, reason);
    return true;
  };

  const checkTempAccessExpiry = () => {
    if (user.allyStatus === "temp_approved" && user.allyTempAccessExpiry) {
      const now = new Date();
      const expiry = new Date(user.allyTempAccessExpiry);
      
      if (now > expiry) {
        setUser(prev => ({
          ...prev,
          allyStatus: "pending",
          allyTempAccessExpiry: undefined,
          roles: prev.roles.filter(role => role !== "ally"),
          isAlly: false,
        }));
        console.log('Temporary ally access expired');
        return true;
      }
    }
    return false;
  };

  const getTempAccessTimeRemaining = (): number => {
    if (user.allyStatus === "temp_approved" && user.allyTempAccessExpiry) {
      const now = new Date();
      const expiry = new Date(user.allyTempAccessExpiry);
      return Math.max(0, expiry.getTime() - now.getTime());
    }
    return 0;
  };

  // Simulate receiving payments (for demo purposes)
  const simulatePaymentReceived = async (amount: number, from: string, currency: 'COP' | 'NCOP') => {
    if (currency === 'COP') {
      const newBalance = copBalance + amount;
      updateCopBalance(newBalance);
    } else {
      const newBalance = ncopBalance + amount;
      updateNcopBalance(newBalance);
    }
    
    // Trigger automatic notification
    await notifications.notifyPaymentReceived(amount, from, currency);
    console.log(`Simulated payment received: ${amount} ${currency} from ${from}`);
  };
  
  // Check for low balance and notify
  const checkLowBalance = useCallback(async () => {
    const lowCopThreshold = 50000; // 50,000 COP
    const lowNcopThreshold = 100; // 100 NCOP
    
    if (copBalance < lowCopThreshold && copBalance > 0) {
      await notifications.notifyLowBalance('COP', copBalance);
    }
    
    if (ncopBalance < lowNcopThreshold && ncopBalance > 0) {
      await notifications.notifyLowBalance('NCOP', ncopBalance);
    }
  }, [copBalance, ncopBalance, notifications]);
  
  // Check temp access expiry on load
  useEffect(() => {
    checkTempAccessExpiry();
    checkLowBalance();
    
    // Set up interval to check expiry every minute
    const interval = setInterval(() => {
      checkTempAccessExpiry();
      checkLowBalance();
    }, 60000);
    return () => clearInterval(interval);
  }, [user.allyStatus, user.allyTempAccessExpiry, checkLowBalance]);

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
    allyRequests,
    addProduct,
    updateProduct,
    deleteProduct,
    addService,
    updateService,
    deleteService,
    addStaffMember,
    addAppointment,
    updateAppointmentStatus,
    activateCampaign,
    generateAdCopy,
    updateUserSettings,
    submitAllyRequest,
    approveAllyRequest,
    rejectAllyRequest,
    checkTempAccessExpiry,
    getTempAccessTimeRemaining,
    // Utility functions
    formatNcopBalance,
    formatNcopValue,
    ncopToCop,
    copToNcop,
    // Simulation functions
    simulatePaymentReceived,
    checkLowBalance,
  };
});
