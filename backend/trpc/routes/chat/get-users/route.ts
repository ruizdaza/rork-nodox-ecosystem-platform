import { z } from 'zod';
import { protectedProcedure } from '../../../create-context';

export const getUsersProcedure = protectedProcedure
  .input(
    z.object({
      role: z.enum(['user', 'ally', 'admin', 'all']).optional().default('all'),
      search: z.string().optional(),
    })
  )
  .query(async ({ input, ctx }) => {
    console.log('[tRPC] get-users called:', input);
    
    // En producción, esto consultaría la base de datos
    // Filtrando usuarios por role y search query
    
    const mockUsers = [
      {
        id: 'admin-1',
        name: 'Admin Principal',
        email: 'admin@nodox.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop',
        isOnline: true,
        roles: ['admin'],
        isAlly: false,
      },
      {
        id: 'ally-1',
        name: 'Peluquería Bella',
        email: 'bella@example.com',
        avatar: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop',
        isOnline: true,
        roles: ['ally'],
        isAlly: true,
      },
      {
        id: 'user-1',
        name: 'Juan Pérez',
        email: 'juan@example.com',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
        isOnline: false,
        roles: ['user'],
        isAlly: false,
      },
    ];
    
    let filteredUsers = mockUsers;
    
    if (input.role !== 'all') {
      filteredUsers = mockUsers.filter(user => user.roles.includes(input.role));
    }
    
    if (input.search) {
      const searchLower = input.search.toLowerCase();
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      );
    }
    
    return {
      success: true,
      users: filteredUsers,
    };
  });