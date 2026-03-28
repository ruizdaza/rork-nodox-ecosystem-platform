import { useState, useMemo } from 'react';
import { SupportTicket, SupportMessage, SupportStats } from '@/types/crm';

const mockTickets: SupportTicket[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'Ana María López',
    customerEmail: 'ana.lopez@email.com',
    subject: 'Problema con la reserva de cita',
    description: 'No puedo reservar una cita para mañana, la aplicación me muestra error',
    category: 'technical',
    priority: 'high',
    status: 'in_progress',
    assignedTo: 'support-1',
    createdAt: '2024-01-20T09:30:00Z',
    updatedAt: '2024-01-20T10:15:00Z',
    messages: [
      {
        id: '1',
        ticketId: '1',
        senderId: '1',
        senderName: 'Ana María López',
        senderType: 'customer',
        message: 'No puedo reservar una cita para mañana, la aplicación me muestra error',
        createdAt: '2024-01-20T09:30:00Z',
        isInternal: false
      },
      {
        id: '2',
        ticketId: '1',
        senderId: 'support-1',
        senderName: 'Carlos Soporte',
        senderType: 'support',
        message: 'Hola Ana, estamos revisando el problema. ¿Podrías decirnos qué mensaje de error específico aparece?',
        createdAt: '2024-01-20T10:15:00Z',
        isInternal: false
      }
    ],
    tags: ['reservas', 'app-error']
  },
  {
    id: '2',
    customerName: 'Carlos Mendoza',
    customerEmail: 'carlos.mendoza@email.com',
    subject: 'Consulta sobre productos',
    description: '¿Tienen productos para cabello graso? Me gustaría saber qué recomiendan',
    category: 'general',
    priority: 'medium',
    status: 'open',
    createdAt: '2024-01-20T14:20:00Z',
    updatedAt: '2024-01-20T14:20:00Z',
    messages: [
      {
        id: '3',
        ticketId: '2',
        senderId: '2',
        senderName: 'Carlos Mendoza',
        senderType: 'customer',
        message: '¿Tienen productos para cabello graso? Me gustaría saber qué recomiendan',
        createdAt: '2024-01-20T14:20:00Z',
        isInternal: false
      }
    ],
    tags: ['productos', 'consulta']
  },
  {
    id: '3',
    customerName: 'Laura Pérez',
    customerEmail: 'laura.perez@email.com',
    subject: 'Solicitud de reembolso',
    description: 'El servicio no cumplió mis expectativas, solicito reembolso',
    category: 'billing',
    priority: 'high',
    status: 'waiting_customer',
    assignedTo: 'support-2',
    createdAt: '2024-01-19T16:45:00Z',
    updatedAt: '2024-01-20T08:30:00Z',
    messages: [
      {
        id: '4',
        ticketId: '3',
        senderId: '3',
        senderName: 'Laura Pérez',
        senderType: 'customer',
        message: 'El servicio no cumplió mis expectativas, solicito reembolso',
        createdAt: '2024-01-19T16:45:00Z',
        isInternal: false
      },
      {
        id: '5',
        ticketId: '3',
        senderId: 'support-2',
        senderName: 'María Soporte',
        senderType: 'support',
        message: 'Lamento escuchar sobre tu experiencia. Para procesar el reembolso necesito que me proporciones más detalles sobre qué específicamente no cumplió tus expectativas.',
        createdAt: '2024-01-20T08:30:00Z',
        isInternal: false
      }
    ],
    tags: ['reembolso', 'insatisfacción']
  },
  {
    id: '4',
    customerName: 'Roberto Silva',
    customerEmail: 'roberto.silva@email.com',
    subject: 'Sugerencia de mejora',
    description: 'Sería genial si pudieran agregar notificaciones push para recordar las citas',
    category: 'feature_request',
    priority: 'low',
    status: 'resolved',
    assignedTo: 'support-1',
    createdAt: '2024-01-18T11:20:00Z',
    updatedAt: '2024-01-19T15:45:00Z',
    resolvedAt: '2024-01-19T15:45:00Z',
    messages: [
      {
        id: '6',
        ticketId: '4',
        senderId: '4',
        senderName: 'Roberto Silva',
        senderType: 'customer',
        message: 'Sería genial si pudieran agregar notificaciones push para recordar las citas',
        createdAt: '2024-01-18T11:20:00Z',
        isInternal: false
      },
      {
        id: '7',
        ticketId: '4',
        senderId: 'support-1',
        senderName: 'Carlos Soporte',
        senderType: 'support',
        message: 'Excelente sugerencia Roberto. He enviado tu idea al equipo de desarrollo para consideración en futuras actualizaciones.',
        createdAt: '2024-01-19T15:45:00Z',
        isInternal: false
      }
    ],
    tags: ['mejora', 'notificaciones']
  }
];

export const useSupport = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<SupportTicket['status'] | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<SupportTicket['category'] | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<SupportTicket['priority'] | 'all'>('all');
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const filteredTickets = useMemo(() => {
    let filtered = tickets;

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(ticket => 
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filterStatus);
    }

    // Apply category filter
    if (filterCategory !== 'all') {
      filtered = filtered.filter(ticket => ticket.category === filterCategory);
    }

    // Apply priority filter
    if (filterPriority !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === filterPriority);
    }

    return filtered.sort((a, b) => {
      // Sort by priority first (urgent > high > medium > low)
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by creation date (newest first)
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [tickets, searchQuery, filterStatus, filterCategory, filterPriority]);

  const supportStats: SupportStats = useMemo(() => {
    const openTickets = tickets.filter(t => ['open', 'in_progress', 'waiting_customer'].includes(t.status));
    
    const resolvedTickets = tickets.filter(t => t.status === 'resolved' && t.resolvedAt);
    const averageResolutionTime = resolvedTickets.length > 0 
      ? resolvedTickets.reduce((sum, ticket) => {
          const created = new Date(ticket.createdAt).getTime();
          const resolved = new Date(ticket.resolvedAt!).getTime();
          return sum + (resolved - created);
        }, 0) / resolvedTickets.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    const ticketsByCategory = tickets.reduce((acc, ticket) => {
      const existing = acc.find(item => item.category === ticket.category);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ category: ticket.category, count: 1 });
      }
      return acc;
    }, [] as { category: string; count: number }[]);

    const ticketsByPriority = tickets.reduce((acc, ticket) => {
      const existing = acc.find(item => item.priority === ticket.priority);
      if (existing) {
        existing.count++;
      } else {
        acc.push({ priority: ticket.priority, count: 1 });
      }
      return acc;
    }, [] as { priority: string; count: number }[]);

    const recentTickets = [...tickets]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalTickets: tickets.length,
      openTickets: openTickets.length,
      averageResponseTime: 2.5, // Mock value in hours
      averageResolutionTime,
      customerSatisfactionScore: 4.2, // Mock value out of 5
      ticketsByCategory,
      ticketsByPriority,
      recentTickets
    };
  }, [tickets]);

  const createTicket = (ticketData: Omit<SupportTicket, 'id' | 'createdAt' | 'updatedAt' | 'messages'>) => {
    const newTicket: SupportTicket = {
      ...ticketData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: Date.now().toString(),
          ticketId: Date.now().toString(),
          senderId: ticketData.customerId || 'anonymous',
          senderName: ticketData.customerName,
          senderType: 'customer',
          message: ticketData.description,
          createdAt: new Date().toISOString(),
          isInternal: false
        }
      ]
    };
    
    setTickets(prev => [...prev, newTicket]);
    console.log('Support ticket created:', newTicket);
    return newTicket;
  };

  const updateTicket = (id: string, updates: Partial<SupportTicket>) => {
    setTickets(prev => prev.map(t => 
      t.id === id 
        ? { 
            ...t, 
            ...updates, 
            updatedAt: new Date().toISOString(),
            resolvedAt: updates.status === 'resolved' ? new Date().toISOString() : t.resolvedAt
          } 
        : t
    ));
    console.log('Support ticket updated:', id, updates);
  };

  const addMessage = (ticketId: string, messageData: Omit<SupportMessage, 'id' | 'ticketId' | 'createdAt'>) => {
    const newMessage: SupportMessage = {
      ...messageData,
      id: Date.now().toString(),
      ticketId,
      createdAt: new Date().toISOString()
    };

    setTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            messages: [...ticket.messages, newMessage],
            updatedAt: new Date().toISOString()
          }
        : ticket
    ));
    
    console.log('Message added to ticket:', ticketId, newMessage);
  };

  const assignTicket = (ticketId: string, assigneeId: string) => {
    updateTicket(ticketId, { 
      assignedTo: assigneeId,
      status: 'in_progress'
    });
  };

  const closeTicket = (ticketId: string) => {
    updateTicket(ticketId, { 
      status: 'closed',
      resolvedAt: new Date().toISOString()
    });
  };

  const reopenTicket = (ticketId: string) => {
    updateTicket(ticketId, { 
      status: 'open',
      resolvedAt: undefined
    });
  };

  const getTicketById = (id: string): SupportTicket | undefined => {
    return tickets.find(t => t.id === id);
  };

  const getTicketsByCustomer = (customerId: string): SupportTicket[] => {
    return tickets.filter(t => t.customerId === customerId);
  };

  return {
    tickets: filteredTickets,
    allTickets: tickets,
    supportStats,
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
    filterCategory,
    setFilterCategory,
    filterPriority,
    setFilterPriority,
    selectedTicket,
    setSelectedTicket,
    createTicket,
    updateTicket,
    addMessage,
    assignTicket,
    closeTicket,
    reopenTicket,
    getTicketById,
    getTicketsByCustomer
  };
};