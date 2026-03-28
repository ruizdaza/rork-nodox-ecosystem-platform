import { useState, useMemo } from 'react';
import { Customer, CustomerInteraction, CustomerSegment, CRMStats } from '@/types/crm';

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Ana María López',
    email: 'ana.lopez@email.com',
    phone: '+57 300 123 4567',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    joinDate: '2023-08-15',
    lastVisit: '2024-01-20',
    totalSpent: 450000,
    totalOrders: 18,
    averageOrderValue: 25000,
    preferredServices: ['Corte de Cabello', 'Manicure'],
    notes: 'Cliente VIP, prefiere citas en la mañana',
    status: 'vip',
    birthDate: '1985-03-12',
    address: 'Calle 123 #45-67, Bogotá',
    loyaltyPoints: 1200,
    tags: ['VIP', 'Frecuente', 'Referidor']
  },
  {
    id: '2',
    name: 'Carlos Mendoza',
    email: 'carlos.mendoza@email.com',
    phone: '+57 301 234 5678',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    joinDate: '2023-11-20',
    lastVisit: '2024-01-18',
    totalSpent: 180000,
    totalOrders: 8,
    averageOrderValue: 22500,
    preferredServices: ['Corte de Cabello'],
    notes: 'Siempre puntual, cliente regular',
    status: 'active',
    loyaltyPoints: 450,
    tags: ['Regular', 'Puntual']
  },
  {
    id: '3',
    name: 'Laura Pérez',
    email: 'laura.perez@email.com',
    phone: '+57 302 345 6789',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    joinDate: '2024-01-10',
    lastVisit: '2024-01-15',
    totalSpent: 75000,
    totalOrders: 3,
    averageOrderValue: 25000,
    preferredServices: ['Tratamiento Capilar'],
    notes: 'Cliente nueva, muy interesada en tratamientos',
    status: 'active',
    loyaltyPoints: 150,
    tags: ['Nuevo', 'Tratamientos']
  }
];

const mockInteractions: CustomerInteraction[] = [
  {
    id: '1',
    customerId: '1',
    type: 'appointment',
    date: '2024-01-20T10:00:00Z',
    description: 'Cita completada - Corte y peinado',
    outcome: 'Cliente satisfecha, programó próxima cita',
    createdBy: 'staff-1'
  },
  {
    id: '2',
    customerId: '2',
    type: 'call',
    date: '2024-01-19T14:30:00Z',
    description: 'Llamada de seguimiento post-servicio',
    outcome: 'Cliente muy satisfecho, recomendará el servicio',
    createdBy: 'staff-1'
  },
  {
    id: '3',
    customerId: '3',
    type: 'message',
    date: '2024-01-18T16:45:00Z',
    description: 'Consulta sobre productos para el cabello',
    outcome: 'Información enviada, cliente interesada',
    followUpDate: '2024-01-25',
    createdBy: 'staff-2'
  }
];

const mockSegments: CustomerSegment[] = [
  {
    id: '1',
    name: 'Clientes VIP',
    description: 'Clientes con alto valor y frecuencia',
    criteria: {
      totalSpent: { min: 300000 },
      orderCount: { min: 10 }
    },
    customerCount: 12
  },
  {
    id: '2',
    name: 'Clientes Nuevos',
    description: 'Clientes registrados en los últimos 30 días',
    criteria: {
      lastVisit: { days: 30 }
    },
    customerCount: 8
  },
  {
    id: '3',
    name: 'Clientes Inactivos',
    description: 'Clientes sin visitas en los últimos 60 días',
    criteria: {
      lastVisit: { days: 60 }
    },
    customerCount: 5
  }
];

export const useCRM = () => {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [interactions, setInteractions] = useState<CustomerInteraction[]>(mockInteractions);
  const [segments, setSegments] = useState<CustomerSegment[]>(mockSegments);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'lastVisit' | 'totalSpent'>('name');

  const filteredCustomers = useMemo(() => {
    let filtered = customers;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        customer.phone.includes(searchQuery)
      );
    }

    // Apply segment filter
    if (selectedSegment !== 'all') {
      const segment = segments.find(s => s.id === selectedSegment);
      if (segment) {
        filtered = filtered.filter(customer => {
          const { criteria } = segment;
          
          if (criteria.totalSpent?.min && customer.totalSpent < criteria.totalSpent.min) return false;
          if (criteria.totalSpent?.max && customer.totalSpent > criteria.totalSpent.max) return false;
          if (criteria.orderCount?.min && customer.totalOrders < criteria.orderCount.min) return false;
          if (criteria.orderCount?.max && customer.totalOrders > criteria.orderCount.max) return false;
          
          if (criteria.lastVisit?.days) {
            const daysSinceLastVisit = customer.lastVisit 
              ? Math.floor((Date.now() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24))
              : Infinity;
            
            if (segment.name.includes('Nuevos') && daysSinceLastVisit > criteria.lastVisit.days) return false;
            if (segment.name.includes('Inactivos') && daysSinceLastVisit < criteria.lastVisit.days) return false;
          }
          
          return true;
        });
      }
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'lastVisit':
          if (!a.lastVisit && !b.lastVisit) return 0;
          if (!a.lastVisit) return 1;
          if (!b.lastVisit) return -1;
          return new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime();
        case 'totalSpent':
          return b.totalSpent - a.totalSpent;
        default:
          return 0;
      }
    });

    return filtered;
  }, [customers, searchQuery, selectedSegment, sortBy, segments]);

  const crmStats: CRMStats = useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const newCustomersThisMonth = customers.filter(c => 
      new Date(c.joinDate) >= thirtyDaysAgo
    ).length;
    
    const activeCustomers = customers.filter(c => {
      if (!c.lastVisit) return false;
      const daysSinceLastVisit = Math.floor((now.getTime() - new Date(c.lastVisit).getTime()) / (1000 * 60 * 60 * 24));
      return daysSinceLastVisit <= 30;
    }).length;
    
    const topCustomers = [...customers]
      .sort((a, b) => b.totalSpent - a.totalSpent)
      .slice(0, 5);
    
    const recentInteractions = [...interactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    return {
      totalCustomers: customers.length,
      activeCustomers,
      newCustomersThisMonth,
      customerRetentionRate: activeCustomers / customers.length * 100,
      averageCustomerLifetime: customers.reduce((sum, c) => {
        const daysSinceJoin = Math.floor((now.getTime() - new Date(c.joinDate).getTime()) / (1000 * 60 * 60 * 24));
        return sum + daysSinceJoin;
      }, 0) / customers.length,
      topCustomers,
      recentInteractions
    };
  }, [customers, interactions]);

  const addCustomer = (customerData: Omit<Customer, 'id' | 'joinDate' | 'totalSpent' | 'totalOrders' | 'averageOrderValue' | 'loyaltyPoints'>) => {
    const newCustomer: Customer = {
      ...customerData,
      id: Date.now().toString(),
      joinDate: new Date().toISOString(),
      totalSpent: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      loyaltyPoints: 0
    };
    
    setCustomers(prev => [...prev, newCustomer]);
    console.log('Customer added:', newCustomer);
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    console.log('Customer updated:', id, updates);
  };

  const addInteraction = (interactionData: Omit<CustomerInteraction, 'id' | 'date'>) => {
    const newInteraction: CustomerInteraction = {
      ...interactionData,
      id: Date.now().toString(),
      date: new Date().toISOString()
    };
    
    setInteractions(prev => [...prev, newInteraction]);
    console.log('Interaction added:', newInteraction);
  };

  const getCustomerInteractions = (customerId: string) => {
    return interactions
      .filter(i => i.customerId === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  const createSegment = (segmentData: Omit<CustomerSegment, 'id' | 'customerCount'>) => {
    const newSegment: CustomerSegment = {
      ...segmentData,
      id: Date.now().toString(),
      customerCount: 0 // Will be calculated based on criteria
    };
    
    setSegments(prev => [...prev, newSegment]);
    console.log('Segment created:', newSegment);
  };

  return {
    customers: filteredCustomers,
    allCustomers: customers,
    interactions,
    segments,
    crmStats,
    searchQuery,
    setSearchQuery,
    selectedSegment,
    setSelectedSegment,
    sortBy,
    setSortBy,
    addCustomer,
    updateCustomer,
    addInteraction,
    getCustomerInteractions,
    createSegment
  };
};