import { User, Chat, ChatAction, ChatPermission, UserRole, PermissionRule } from '@/types/chat';

// Reglas de permisos por rol y tipo de chat
const PERMISSION_RULES: PermissionRule[] = [
  // Administradores - Acceso completo
  {
    role: 'admin',
    permissions: ['read', 'write', 'delete', 'moderate', 'admin'],
    chatTypes: ['individual', 'group', 'support', 'ally_client'],
  },
  
  // Aliados - Permisos específicos según el tipo de chat
  {
    role: 'ally',
    permissions: ['read', 'write', 'delete', 'moderate'],
    chatTypes: ['ally_client', 'support'],
    conditions: {
      isAlly: true,
      allyStatus: ['approved', 'temp_approved'],
    },
  },
  {
    role: 'ally',
    permissions: ['read', 'write'],
    chatTypes: ['individual', 'group'],
    conditions: {
      isParticipant: true,
      isAlly: true,
      allyStatus: ['approved', 'temp_approved'],
    },
  },
  
  // Referidores - Permisos limitados
  {
    role: 'referrer',
    permissions: ['read', 'write'],
    chatTypes: ['individual', 'group', 'support'],
    conditions: {
      isParticipant: true,
    },
  },
  
  // Usuarios regulares - Permisos básicos
  {
    role: 'user',
    permissions: ['read', 'write'],
    chatTypes: ['individual', 'group', 'support'],
    conditions: {
      isParticipant: true,
    },
  },
];

// Validaciones de seguridad para chat
export class ChatSecurityValidator {
  private static instance: ChatSecurityValidator;
  
  static getInstance(): ChatSecurityValidator {
    if (!ChatSecurityValidator.instance) {
      ChatSecurityValidator.instance = new ChatSecurityValidator();
    }
    return ChatSecurityValidator.instance;
  }
  
  // Validar si un usuario tiene un permiso específico en un chat
  hasPermission(
    user: User,
    chat: Chat,
    permission: ChatPermission,
    targetUserId?: string
  ): boolean {
    console.log(`[Security] Checking permission '${permission}' for user ${user.id} in chat ${chat.id}`);
    
    // Verificar si el usuario está bloqueado
    if (this.isUserBlocked(user, chat)) {
      console.log(`[Security] User ${user.id} is blocked`);
      return false;
    }
    
    // Verificar reglas específicas del chat
    if (!this.validateChatRules(user, chat, permission)) {
      console.log(`[Security] Chat rules validation failed for user ${user.id}`);
      return false;
    }
    
    // Buscar reglas aplicables
    const applicableRules = this.getApplicableRules(user, chat);
    
    for (const rule of applicableRules) {
      if (rule.permissions.includes(permission)) {
        // Verificar condiciones adicionales
        if (this.validateRuleConditions(user, chat, rule, targetUserId)) {
          console.log(`[Security] Permission '${permission}' granted via rule for role '${rule.role}'`);
          return true;
        }
      }
    }
    
    console.log(`[Security] Permission '${permission}' denied for user ${user.id}`);
    return false;
  }
  
  // Validar una acción específica del chat
  validateAction(user: User, chat: Chat, action: ChatAction): boolean {
    console.log(`[Security] Validating action '${action.type}' for user ${user.id}`);
    
    switch (action.type) {
      case 'send_message':
        return this.hasPermission(user, chat, 'write');
        
      case 'delete_message':
        // Los usuarios pueden eliminar sus propios mensajes, moderadores pueden eliminar cualquiera
        return action.userId === user.id || this.hasPermission(user, chat, 'moderate');
        
      case 'edit_message':
        // Solo el autor puede editar sus mensajes
        return action.userId === user.id && this.hasPermission(user, chat, 'write');
        
      case 'add_participant':
      case 'remove_participant':
        return this.hasPermission(user, chat, 'moderate');
        
      case 'moderate_chat':
        return this.hasPermission(user, chat, 'moderate');
        
      case 'archive_chat':
        return this.hasPermission(user, chat, 'admin') || 
               (chat.type === 'individual' && chat.participants.includes(user.id));
        
      default:
        console.log(`[Security] Unknown action type: ${action.type}`);
        return false;
    }
  }
  
  // Verificar si un usuario está bloqueado
  private isUserBlocked(user: User, chat: Chat): boolean {
    if (user.isBlocked) return true;
    
    // Verificar si está bloqueado por algún participante del chat
    if (user.blockedBy) {
      const blockedByParticipant = chat.participants.some(participantId => 
        user.blockedBy?.includes(participantId)
      );
      if (blockedByParticipant) return true;
    }
    
    return false;
  }
  
  // Validar reglas específicas del chat
  private validateChatRules(user: User, chat: Chat, permission: ChatPermission): boolean {
    const settings = chat.settings;
    if (!settings) return true;
    
    // Si solo los admins pueden enviar mensajes
    if (settings.onlyAdminsCanMessage && permission === 'write') {
      return chat.admins?.includes(user.id) || user.roles.includes('admin');
    }
    
    return true;
  }
  
  // Obtener reglas aplicables para un usuario y chat
  private getApplicableRules(user: User, chat: Chat): PermissionRule[] {
    return PERMISSION_RULES.filter(rule => {
      // Verificar si el usuario tiene el rol
      if (!user.roles.includes(rule.role)) return false;
      
      // Verificar si la regla aplica al tipo de chat
      if (!rule.chatTypes.includes(chat.type)) return false;
      
      return true;
    });
  }
  
  // Validar condiciones adicionales de una regla
  private validateRuleConditions(
    user: User,
    chat: Chat,
    rule: PermissionRule,
    targetUserId?: string
  ): boolean {
    if (!rule.conditions) return true;
    
    const conditions = rule.conditions;
    
    // Verificar si debe ser participante
    if (conditions.isParticipant && !chat.participants.includes(user.id)) {
      return false;
    }
    
    // Verificar si debe ser propietario (para chats individuales, ambos son "propietarios")
    if (conditions.isOwner) {
      if (chat.type === 'individual') {
        return chat.participants.includes(user.id);
      } else {
        return chat.admins?.includes(user.id) || false;
      }
    }
    
    // Verificar condiciones de aliado
    if (conditions.isAlly && !user.isAlly) {
      return false;
    }
    
    if (conditions.allyStatus && user.allyStatus) {
      if (!conditions.allyStatus.includes(user.allyStatus)) {
        return false;
      }
    }
    
    return true;
  }
  
  // Obtener permisos efectivos de un usuario en un chat
  getUserPermissions(user: User, chat: Chat): ChatPermission[] {
    const permissions: Set<ChatPermission> = new Set();
    
    if (this.isUserBlocked(user, chat)) {
      return [];
    }
    
    const applicableRules = this.getApplicableRules(user, chat);
    
    for (const rule of applicableRules) {
      if (this.validateRuleConditions(user, chat, rule)) {
        rule.permissions.forEach(permission => permissions.add(permission));
      }
    }
    
    return Array.from(permissions);
  }
  
  // Validar contenido del mensaje
  validateMessageContent(content: string, messageType: string): { isValid: boolean; reason?: string } {
    // Validaciones básicas de contenido
    if (!content || content.trim().length === 0) {
      return { isValid: false, reason: 'El mensaje no puede estar vacío' };
    }
    
    if (content.length > 4000) {
      return { isValid: false, reason: 'El mensaje es demasiado largo (máximo 4000 caracteres)' };
    }
    
    // Filtro básico de contenido inapropiado
    const inappropriateWords = ['spam', 'scam', 'phishing']; // Lista básica
    const lowerContent = content.toLowerCase();
    
    for (const word of inappropriateWords) {
      if (lowerContent.includes(word)) {
        return { isValid: false, reason: 'El mensaje contiene contenido inapropiado' };
      }
    }
    
    return { isValid: true };
  }
  
  // Crear chat con validaciones de seguridad
  canCreateChat(
    creator: User,
    chatType: Chat['type'],
    participants: string[],
    users: Record<string, User>
  ): { canCreate: boolean; reason?: string } {
    console.log(`[Security] Validating chat creation by user ${creator.id}`);
    
    // Verificar si el creador puede crear este tipo de chat
    switch (chatType) {
      case 'support':
        if (!creator.roles.includes('admin') && !creator.roles.includes('ally')) {
          return { canCreate: false, reason: 'No tienes permisos para crear chats de soporte' };
        }
        break;
        
      case 'ally_client':
        if (!creator.isAlly || !['approved', 'temp_approved'].includes(creator.allyStatus || '')) {
          return { canCreate: false, reason: 'Solo los aliados aprobados pueden crear chats con clientes' };
        }
        break;
        
      case 'group':
        if (participants.length > 50) {
          return { canCreate: false, reason: 'Los grupos no pueden tener más de 50 participantes' };
        }
        break;
    }
    
    // Verificar que los participantes no estén bloqueados
    for (const participantId of participants) {
      const participant = users[participantId];
      if (participant && this.isUserBlocked(participant, { participants } as Chat)) {
        return { canCreate: false, reason: 'Uno o más participantes están bloqueados' };
      }
    }
    
    return { canCreate: true };
  }
}

// Middleware de autorización para acciones de chat
export const chatAuthMiddleware = {
  // Middleware para envío de mensajes
  validateSendMessage: (user: User, chat: Chat, content: string, messageType: string) => {
    const validator = ChatSecurityValidator.getInstance();
    
    // Verificar permisos de escritura
    if (!validator.hasPermission(user, chat, 'write')) {
      throw new Error('No tienes permisos para enviar mensajes en este chat');
    }
    
    // Validar contenido del mensaje
    const contentValidation = validator.validateMessageContent(content, messageType);
    if (!contentValidation.isValid) {
      throw new Error(contentValidation.reason || 'Contenido del mensaje inválido');
    }
    
    console.log(`[Auth] Message send validated for user ${user.id}`);
    return true;
  },
  
  // Middleware para eliminación de mensajes
  validateDeleteMessage: (user: User, chat: Chat, messageAuthorId: string) => {
    const validator = ChatSecurityValidator.getInstance();
    
    const action: ChatAction = {
      type: 'delete_message',
      chatId: chat.id,
      userId: messageAuthorId,
    };
    
    if (!validator.validateAction(user, chat, action)) {
      throw new Error('No tienes permisos para eliminar este mensaje');
    }
    
    console.log(`[Auth] Message deletion validated for user ${user.id}`);
    return true;
  },
  
  // Middleware para moderación de chat
  validateModerateChat: (user: User, chat: Chat) => {
    const validator = ChatSecurityValidator.getInstance();
    
    if (!validator.hasPermission(user, chat, 'moderate')) {
      throw new Error('No tienes permisos de moderación en este chat');
    }
    
    console.log(`[Auth] Chat moderation validated for user ${user.id}`);
    return true;
  },
  
  // Middleware para acceso a chat
  validateChatAccess: (user: User, chat: Chat) => {
    const validator = ChatSecurityValidator.getInstance();
    
    if (!validator.hasPermission(user, chat, 'read')) {
      throw new Error('No tienes acceso a este chat');
    }
    
    console.log(`[Auth] Chat access validated for user ${user.id}`);
    return true;
  },
};

// Utilidades de seguridad para chat
export const chatSecurityUtils = {
  // Sanitizar contenido de mensaje
  sanitizeMessageContent: (content: string): string => {
    return content
      .trim()
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remover scripts
      .replace(/<[^>]*>/g, '') // Remover HTML tags
      .substring(0, 4000); // Limitar longitud
  },
  
  // Generar ID seguro para mensajes
  generateSecureMessageId: (): string => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `msg-${timestamp}-${random}`;
  },
  
  // Validar formato de archivo
  validateFileType: (fileName: string, allowedTypes: string[]): boolean => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    return extension ? allowedTypes.includes(extension) : false;
  },
  
  // Validar tamaño de archivo
  validateFileSize: (fileSize: number, maxSizeMB: number): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return fileSize <= maxSizeBytes;
  },
};

// Security validation utilities
export const ValidationUtils = {
  // Sanitize text input to prevent XSS and injection attacks
  sanitizeText: (input: string, maxLength: number = 1000): string => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/[<>"'&]/g, '') // Remove potentially dangerous characters
      .trim()
      .slice(0, maxLength);
  },

  // Validate and sanitize numeric input
  sanitizeNumeric: (input: string, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number => {
    if (typeof input !== 'string') return 0;
    const sanitized = input.replace(/[^0-9.]/g, '');
    const num = parseFloat(sanitized) || 0;
    return Math.max(min, Math.min(max, num));
  },

  // Validate phone number format
  validatePhone: (phone: string): boolean => {
    if (typeof phone !== 'string') return false;
    const cleaned = phone.trim();
    return /^[+]?[0-9\s\-()]{7,15}$/.test(cleaned);
  },

  // Validate email format
  validateEmail: (email: string): boolean => {
    if (typeof email !== 'string') return false;
    const cleaned = email.trim().toLowerCase();
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned);
  },

  // Validate postal code
  validatePostalCode: (code: string): boolean => {
    if (typeof code !== 'string') return false;
    const cleaned = code.trim();
    return /^[0-9]{5,10}$/.test(cleaned);
  },

  // Validate required field
  validateRequired: (value: string, minLength: number = 1): boolean => {
    if (typeof value !== 'string') return false;
    return value.trim().length >= minLength;
  },

  // Validate name (only letters, spaces, and common name characters)
  validateName: (name: string): boolean => {
    if (typeof name !== 'string') return false;
    const cleaned = name.trim();
    return /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]{2,50}$/.test(cleaned);
  },

  // Validate address
  validateAddress: (address: string): boolean => {
    if (typeof address !== 'string') return false;
    const cleaned = address.trim();
    return cleaned.length >= 5 && cleaned.length <= 200;
  },

  // Validate city name
  validateCity: (city: string): boolean => {
    if (typeof city !== 'string') return false;
    const cleaned = city.trim();
    return /^[a-zA-ZÀ-ÿ\u00f1\u00d1\s'-]{2,50}$/.test(cleaned);
  },

  // Rate limiting for API calls
  createRateLimiter: (maxCalls: number, windowMs: number) => {
    const calls: number[] = [];
    
    return (): boolean => {
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Remove old calls outside the window
      while (calls.length > 0 && calls[0] < windowStart) {
        calls.shift();
      }
      
      // Check if we're within the limit
      if (calls.length >= maxCalls) {
        return false;
      }
      
      // Add current call
      calls.push(now);
      return true;
    };
  },

  // Validate payment amounts
  validatePaymentAmount: (amount: number, balance: number): { valid: boolean; error?: string } => {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return { valid: false, error: 'Cantidad inválida' };
    }
    
    if (amount <= 0) {
      return { valid: false, error: 'La cantidad debe ser mayor a cero' };
    }
    
    if (amount > balance) {
      return { valid: false, error: 'Saldo insuficiente' };
    }
    
    if (amount > 1000000) { // Max transaction limit
      return { valid: false, error: 'Cantidad excede el límite máximo' };
    }
    
    return { valid: true };
  },

  // Validate cart integrity
  validateCart: (cart: any): { valid: boolean; error?: string } => {
    if (!cart || typeof cart !== 'object') {
      return { valid: false, error: 'Carrito inválido' };
    }
    
    if (!Array.isArray(cart.items) || cart.items.length === 0) {
      return { valid: false, error: 'Carrito vacío' };
    }
    
    if (typeof cart.total !== 'number' || cart.total <= 0) {
      return { valid: false, error: 'Total del carrito inválido' };
    }
    
    if (typeof cart.ncopTotal !== 'number' || cart.ncopTotal < 0) {
      return { valid: false, error: 'Total NCOP inválido' };
    }
    
    // Validate each item
    for (const item of cart.items) {
      if (!item.product || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return { valid: false, error: 'Producto inválido en el carrito' };
      }
    }
    
    return { valid: true };
  },

  // Debounce function for input validation
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: ReturnType<typeof setTimeout>;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Secure random string generator
  generateSecureId: (length: number = 16): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Log security events
  logSecurityEvent: (event: string, details: any = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      event,
      details: typeof details === 'object' ? details : { message: details },
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    };
    
    console.warn('[SECURITY]', logEntry);
    
    // In production, send to monitoring service
    if (!__DEV__) {
      // sendToMonitoringService(logEntry);
    }
  },
};

// Error handling utilities
export const ErrorUtils = {
  // Classify error types
  classifyError: (error: any): 'network' | 'validation' | 'security' | 'system' | 'unknown' => {
    if (!error) return 'unknown';
    
    const message = error.message?.toLowerCase() || '';
    
    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network';
    }
    
    if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
      return 'validation';
    }
    
    if (message.includes('unauthorized') || message.includes('forbidden') || message.includes('security')) {
      return 'security';
    }
    
    if (error.name === 'TypeError' || error.name === 'ReferenceError') {
      return 'system';
    }
    
    return 'unknown';
  },

  // Get user-friendly error message
  getUserFriendlyMessage: (error: any): string => {
    const errorType = ErrorUtils.classifyError(error);
    
    switch (errorType) {
      case 'network':
        return 'Error de conexión. Verifica tu internet e intenta nuevamente.';
      case 'validation':
        return 'Por favor verifica que todos los campos estén correctamente completados.';
      case 'security':
        return 'Error de seguridad. Por favor contacta al soporte.';
      case 'system':
        return 'Error del sistema. La aplicación se reiniciará automáticamente.';
      default:
        return 'Ha ocurrido un error inesperado. Intenta nuevamente.';
    }
  },

  // Safe error logging
  logError: (error: any, context: string = 'unknown') => {
    const errorInfo = {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      context,
      timestamp: new Date().toISOString(),
      type: ErrorUtils.classifyError(error),
    };
    
    console.error('[ERROR]', errorInfo);
    
    // In production, send to error tracking service
    if (!__DEV__) {
      // sendToErrorTrackingService(errorInfo);
    }
  },

  // Create safe async wrapper
  safeAsync: <T>(
    asyncFn: () => Promise<T>,
    fallback?: T
  ): Promise<T | undefined> => {
    return asyncFn().catch((error) => {
      ErrorUtils.logError(error, 'safeAsync');
      return fallback;
    });
  },

  // Retry mechanism with exponential backoff
  retryWithBackoff: async <T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> => {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  },
};

export default ChatSecurityValidator;