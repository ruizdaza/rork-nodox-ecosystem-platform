import { User, Chat, ChatAction, ChatPermission, UserRole, PermissionRule } from '@/types/chat';

// Sistema de Moderación de Contenido
export interface ModerationRule {
  id: string;
  name: string;
  type: 'spam' | 'profanity' | 'harassment' | 'inappropriate' | 'phishing' | 'custom';
  pattern?: RegExp;
  keywords?: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: 'warn' | 'filter' | 'block' | 'report' | 'auto_delete';
  enabled: boolean;
  description: string;
}

export interface ModerationResult {
  isAllowed: boolean;
  violations: {
    ruleId: string;
    ruleName: string;
    type: string;
    severity: string;
    action: string;
    matchedContent?: string;
  }[];
  filteredContent?: string;
  requiresReview: boolean;
  autoAction?: 'delete' | 'block_user' | 'report_admin';
}

export interface ModerationStats {
  totalMessages: number;
  blockedMessages: number;
  filteredMessages: number;
  reportedMessages: number;
  spamDetected: number;
  profanityDetected: number;
  lastUpdated: Date;
}

export class ContentModerator {
  private static instance: ContentModerator;
  private moderationRules: ModerationRule[];
  private stats: ModerationStats;
  private userViolations: Record<string, { count: number; lastViolation: Date; violations: string[] }>;

  private constructor() {
    this.moderationRules = this.initializeModerationRules();
    this.stats = this.initializeStats();
    this.userViolations = {};
  }

  public static getInstance(): ContentModerator {
    if (!ContentModerator.instance) {
      ContentModerator.instance = new ContentModerator();
    }
    return ContentModerator.instance;
  }

  private initializeModerationRules(): ModerationRule[] {
    return [
      {
        id: 'spam-detection',
        name: 'Detección de Spam',
        type: 'spam',
        pattern: /(.{1,50})\1{3,}/gi, // Texto repetitivo
        severity: 'medium',
        action: 'filter',
        enabled: true,
        description: 'Detecta mensajes con contenido repetitivo o spam'
      },
      {
        id: 'profanity-filter',
        name: 'Filtro de Profanidad',
        type: 'profanity',
        keywords: [
          'maldito', 'idiota', 'estúpido', 'imbécil', 'pendejo', 'cabrón',
          'puto', 'puta', 'joder', 'mierda', 'coño', 'carajo'
        ],
        severity: 'medium',
        action: 'filter',
        enabled: true,
        description: 'Filtra palabras ofensivas y profanidad'
      },
      {
        id: 'harassment-detection',
        name: 'Detección de Acoso',
        type: 'harassment',
        keywords: [
          'te voy a matar', 'voy a encontrarte', 'eres una basura',
          'no vales nada', 'deberías morirte', 'te odio'
        ],
        severity: 'high',
        action: 'block',
        enabled: true,
        description: 'Detecta mensajes de acoso o amenazas'
      },
      {
        id: 'phishing-detection',
        name: 'Detección de Phishing',
        type: 'phishing',
        pattern: /(haz\s+clic\s+aquí|click\s+here|gana\s+dinero\s+fácil|premio\s+gratis|oferta\s+limitada)/gi,
        severity: 'high',
        action: 'block',
        enabled: true,
        description: 'Detecta intentos de phishing y estafas'
      },
      {
        id: 'excessive-caps',
        name: 'Mayúsculas Excesivas',
        type: 'spam',
        pattern: /^[A-Z\s!?]{20,}$/,
        severity: 'low',
        action: 'warn',
        enabled: true,
        description: 'Detecta mensajes con exceso de mayúsculas'
      },
      {
        id: 'url-spam',
        name: 'Spam de URLs',
        type: 'spam',
        pattern: /(https?:\/\/[^\s]+){3,}/gi,
        severity: 'medium',
        action: 'filter',
        enabled: true,
        description: 'Detecta mensajes con múltiples URLs sospechosas'
      },
      {
        id: 'personal-info',
        name: 'Información Personal',
        type: 'inappropriate',
        pattern: /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b|\b\d{3}[-\s]?\d{2}[-\s]?\d{4}\b/g,
        severity: 'medium',
        action: 'filter',
        enabled: true,
        description: 'Detecta números de tarjetas de crédito o documentos'
      }
    ];
  }

  private initializeStats(): ModerationStats {
    return {
      totalMessages: 0,
      blockedMessages: 0,
      filteredMessages: 0,
      reportedMessages: 0,
      spamDetected: 0,
      profanityDetected: 0,
      lastUpdated: new Date()
    };
  }

  public moderateContent(content: string, userId: string, chatType: Chat['type']): ModerationResult {
    const result: ModerationResult = {
      isAllowed: true,
      violations: [],
      requiresReview: false
    };

    let filteredContent = content;
    this.stats.totalMessages++;

    // Aplicar reglas de moderación
    for (const rule of this.moderationRules) {
      if (!rule.enabled) continue;

      let hasViolation = false;
      let matchedContent = '';

      // Verificar patrones regex
      if (rule.pattern) {
        const matches = content.match(rule.pattern);
        if (matches) {
          hasViolation = true;
          matchedContent = matches[0];
        }
      }

      // Verificar palabras clave
      if (rule.keywords) {
        const lowerContent = content.toLowerCase();
        for (const keyword of rule.keywords) {
          if (lowerContent.includes(keyword.toLowerCase())) {
            hasViolation = true;
            matchedContent = keyword;
            break;
          }
        }
      }

      if (hasViolation) {
        result.violations.push({
          ruleId: rule.id,
          ruleName: rule.name,
          type: rule.type,
          severity: rule.severity,
          action: rule.action,
          matchedContent
        });

        // Aplicar acciones según la regla
        switch (rule.action) {
          case 'warn':
            // Solo advertir, permitir el mensaje
            break;
          case 'filter':
            filteredContent = this.filterContent(filteredContent, rule, matchedContent);
            this.stats.filteredMessages++;
            break;
          case 'block':
            result.isAllowed = false;
            this.stats.blockedMessages++;
            break;
          case 'report':
            result.requiresReview = true;
            this.stats.reportedMessages++;
            break;
          case 'auto_delete':
            result.isAllowed = false;
            result.autoAction = 'delete';
            break;
        }

        // Actualizar estadísticas por tipo
        if (rule.type === 'spam') this.stats.spamDetected++;
        if (rule.type === 'profanity') this.stats.profanityDetected++;

        // Registrar violación del usuario
        this.recordUserViolation(userId, rule.id);
      }
    }

    // Verificar si el usuario tiene demasiadas violaciones
    if (this.shouldBlockUser(userId)) {
      result.isAllowed = false;
      result.autoAction = 'block_user';
    }

    // Si el contenido fue filtrado, asignarlo al resultado
    if (filteredContent !== content) {
      result.filteredContent = filteredContent;
    }

    this.stats.lastUpdated = new Date();
    console.log('[ContentModerator] Content moderated:', {
      original: content.substring(0, 50),
      filtered: filteredContent?.substring(0, 50),
      violations: result.violations.length,
      isAllowed: result.isAllowed
    });

    return result;
  }

  private filterContent(content: string, rule: ModerationRule, matchedContent: string): string {
    let filtered = content;

    switch (rule.type) {
      case 'profanity':
        // Reemplazar palabras ofensivas con asteriscos
        if (rule.keywords) {
          for (const keyword of rule.keywords) {
            const regex = new RegExp(keyword, 'gi');
            filtered = filtered.replace(regex, '*'.repeat(keyword.length));
          }
        }
        break;
      case 'spam':
        // Reducir texto repetitivo
        if (rule.pattern) {
          filtered = filtered.replace(rule.pattern, (match) => {
            const parts = match.split(/(.{1,50})\1+/);
            return parts[1] || match.substring(0, 50);
          });
        }
        break;
      case 'inappropriate':
        // Censurar información personal
        if (rule.pattern) {
          filtered = filtered.replace(rule.pattern, '[INFORMACIÓN CENSURADA]');
        }
        break;
      default:
        // Para otros tipos, simplemente marcar como filtrado
        filtered = `[CONTENIDO FILTRADO: ${rule.name}]`;
    }

    return filtered;
  }

  private recordUserViolation(userId: string, ruleId: string): void {
    if (!this.userViolations[userId]) {
      this.userViolations[userId] = {
        count: 0,
        lastViolation: new Date(),
        violations: []
      };
    }

    this.userViolations[userId].count++;
    this.userViolations[userId].lastViolation = new Date();
    this.userViolations[userId].violations.push(ruleId);
  }

  private shouldBlockUser(userId: string): boolean {
    const userViolations = this.userViolations[userId];
    if (!userViolations) return false;

    // Bloquear si tiene más de 5 violaciones en las últimas 24 horas
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    if (userViolations.count >= 5 && userViolations.lastViolation > oneDayAgo) {
      return true;
    }

    // Bloquear si tiene más de 10 violaciones en total
    if (userViolations.count >= 10) {
      return true;
    }

    return false;
  }

  public getModerationStats(): ModerationStats {
    return { ...this.stats };
  }

  public getUserViolations(userId: string) {
    return this.userViolations[userId] || { count: 0, lastViolation: new Date(), violations: [] };
  }

  public updateRule(ruleId: string, updates: Partial<ModerationRule>): boolean {
    const ruleIndex = this.moderationRules.findIndex(rule => rule.id === ruleId);
    if (ruleIndex === -1) return false;

    this.moderationRules[ruleIndex] = { ...this.moderationRules[ruleIndex], ...updates };
    console.log('[ContentModerator] Rule updated:', ruleId);
    return true;
  }

  public addCustomRule(rule: Omit<ModerationRule, 'id'>): string {
    const ruleId = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newRule: ModerationRule = { ...rule, id: ruleId };
    this.moderationRules.push(newRule);
    console.log('[ContentModerator] Custom rule added:', ruleId);
    return ruleId;
  }

  public getRules(): ModerationRule[] {
    return [...this.moderationRules];
  }

  public resetUserViolations(userId: string): void {
    delete this.userViolations[userId];
    console.log('[ContentModerator] User violations reset:', userId);
  }
}

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
  private contentModerator: ContentModerator;
  
  private constructor() {
    this.contentModerator = ContentModerator.getInstance();
  }
  
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
  
  // Validar contenido del mensaje con moderación avanzada
  validateMessageContent(content: string, messageType: string, userId: string, chatType: Chat['type']): { isValid: boolean; reason?: string; filteredContent?: string } {
    // Validaciones básicas de contenido
    if (!content || content.trim().length === 0) {
      return { isValid: false, reason: 'El mensaje no puede estar vacío' };
    }
    
    if (content.length > 4000) {
      return { isValid: false, reason: 'El mensaje es demasiado largo (máximo 4000 caracteres)' };
    }
    
    // Aplicar moderación de contenido
    const moderationResult = this.contentModerator.moderateContent(content, userId, chatType);
    
    if (!moderationResult.isAllowed) {
      const violationNames = moderationResult.violations.map(v => v.ruleName).join(', ');
      return { isValid: false, reason: `Mensaje bloqueado por: ${violationNames}` };
    }
    
    // Si hay contenido filtrado, devolverlo
    if (moderationResult.filteredContent) {
      return { 
        isValid: true, 
        filteredContent: moderationResult.filteredContent 
      };
    }
    
    return { isValid: true };
  }
  
  // Obtener estadísticas de moderación
  getModerationStats(): ModerationStats {
    return this.contentModerator.getModerationStats();
  }
  
  // Obtener violaciones de un usuario
  getUserViolations(userId: string) {
    return this.contentModerator.getUserViolations(userId);
  }
  
  // Actualizar regla de moderación
  updateModerationRule(ruleId: string, updates: Partial<ModerationRule>): boolean {
    return this.contentModerator.updateRule(ruleId, updates);
  }
  
  // Agregar regla personalizada
  addCustomModerationRule(rule: Omit<ModerationRule, 'id'>): string {
    return this.contentModerator.addCustomRule(rule);
  }
  
  // Obtener todas las reglas de moderación
  getModerationRules(): ModerationRule[] {
    return this.contentModerator.getRules();
  }
  
  // Resetear violaciones de un usuario
  resetUserViolations(userId: string): void {
    this.contentModerator.resetUserViolations(userId);
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
  // Middleware para envío de mensajes con moderación
  validateSendMessage: (user: User, chat: Chat, content: string, messageType: string) => {
    const validator = ChatSecurityValidator.getInstance();
    
    // Verificar permisos de escritura
    if (!validator.hasPermission(user, chat, 'write')) {
      throw new Error('No tienes permisos para enviar mensajes en este chat');
    }
    
    // Validar contenido del mensaje con moderación
    const contentValidation = validator.validateMessageContent(content, messageType, user.id, chat.type);
    if (!contentValidation.isValid) {
      throw new Error(contentValidation.reason || 'Contenido del mensaje inválido');
    }
    
    console.log(`[Auth] Message send validated for user ${user.id}`);
    return { isValid: true, filteredContent: contentValidation.filteredContent };
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
  // Sanitizar contenido de mensaje con moderación
  sanitizeMessageContent: (content: string, userId: string, chatType: Chat['type']): string => {
    if (!content || typeof content !== 'string') {
      return '';
    }
    
    // Aplicar moderación de contenido
    const moderator = ContentModerator.getInstance();
    const moderationResult = moderator.moderateContent(content, userId, chatType);
    
    if (!moderationResult.isAllowed) {
      throw new Error(`Mensaje bloqueado por violación de políticas: ${moderationResult.violations.map(v => v.ruleName).join(', ')}`);
    }
    
    // Usar contenido filtrado si está disponible
    let sanitized = moderationResult.filteredContent || content;
    
    // Remover scripts y HTML peligroso
    sanitized = sanitized
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
    
    // Limitar longitud
    if (sanitized.length > 1000) {
      sanitized = sanitized.substring(0, 1000) + '...';
    }
    
    // Escapar caracteres especiales para prevenir XSS
    sanitized = sanitized
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
    
    // Log si hubo violaciones pero el mensaje fue permitido
    if (moderationResult.violations.length > 0) {
      console.log('[ChatSecurity] Content moderated with violations:', {
        userId,
        violations: moderationResult.violations.length,
        filtered: moderationResult.filteredContent !== undefined
      });
    }
    
    return sanitized.trim();
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

// Enhanced Input Validation System
export class InputValidator {
  private static instance: InputValidator;
  
  static getInstance(): InputValidator {
    if (!InputValidator.instance) {
      InputValidator.instance = new InputValidator();
    }
    return InputValidator.instance;
  }
  
  // SQL Injection prevention patterns
  private sqlInjectionPatterns = [
    /('|(\-\-)|(;)|(\||\|)|(\*|\*))/i,
    /(union|select|insert|delete|update|drop|create|alter|exec|execute)/i,
    /(script|javascript|vbscript|onload|onerror|onclick)/i,
  ];
  
  // XSS prevention patterns
  private xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /<iframe[^>]*>.*?<\/iframe>/gi,
    /<object[^>]*>.*?<\/object>/gi,
    /<embed[^>]*>.*?<\/embed>/gi,
    /javascript:/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
  ];
  
  // Comprehensive input sanitization
  sanitizeInput(input: any, options: {
    type: 'text' | 'html' | 'numeric' | 'email' | 'phone' | 'url';
    maxLength?: number;
    allowHtml?: boolean;
    strictMode?: boolean;
  }): { sanitized: string; isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    let sanitized = '';
    
    // Type validation
    if (typeof input !== 'string') {
      if (input === null || input === undefined) {
        return { sanitized: '', isValid: false, errors: ['Campo requerido'] };
      }
      input = String(input);
    }
    
    // Basic sanitization
    sanitized = input.trim();
    
    // Length validation
    const maxLength = options.maxLength || 1000;
    if (sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
      errors.push(`Texto truncado a ${maxLength} caracteres`);
    }
    
    // SQL Injection detection
    if (options.strictMode !== false) {
      for (const pattern of this.sqlInjectionPatterns) {
        if (pattern.test(sanitized)) {
          errors.push('Contenido potencialmente peligroso detectado');
          ValidationUtils.logSecurityEvent('SQL_INJECTION_ATTEMPT', { input: sanitized });
          break;
        }
      }
    }
    
    // XSS prevention
    if (!options.allowHtml) {
      for (const pattern of this.xssPatterns) {
        if (pattern.test(sanitized)) {
          sanitized = sanitized.replace(pattern, '');
          errors.push('Contenido HTML/JavaScript removido por seguridad');
          ValidationUtils.logSecurityEvent('XSS_ATTEMPT', { input: sanitized });
        }
      }
    }
    
    // Type-specific validation
    switch (options.type) {
      case 'text':
        sanitized = this.sanitizeText(sanitized);
        break;
      case 'numeric':
        const numResult = this.sanitizeNumeric(sanitized);
        sanitized = numResult.toString();
        if (isNaN(numResult)) {
          errors.push('Valor numérico inválido');
        }
        break;
      case 'email':
        if (!this.validateEmail(sanitized)) {
          errors.push('Formato de email inválido');
        }
        break;
      case 'phone':
        if (!this.validatePhone(sanitized)) {
          errors.push('Formato de teléfono inválido');
        }
        break;
      case 'url':
        if (!this.validateUrl(sanitized)) {
          errors.push('URL inválida');
        }
        break;
    }
    
    return {
      sanitized,
      isValid: errors.length === 0,
      errors
    };
  }
  
  // Enhanced text sanitization
  private sanitizeText(input: string): string {
    return input
      .replace(/[<>"'&]/g, (match) => {
        const entities: Record<string, string> = {
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#x27;',
          '&': '&amp;'
        };
        return entities[match] || match;
      })
      .replace(/\s+/g, ' ')
      .trim();
  }
  
  // Enhanced numeric sanitization
  private sanitizeNumeric(input: string): number {
    const cleaned = input.replace(/[^0-9.-]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  
  // URL validation
  private validateUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }
  
  // Enhanced email validation
  private validateEmail(email: string): boolean {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email) && email.length <= 254;
  }
  
  // Enhanced phone validation
  private validatePhone(phone: string): boolean {
    const cleaned = phone.replace(/[^0-9+]/g, '');
    return /^\+?[1-9]\d{6,14}$/.test(cleaned);
  }
  
  // Batch validation for forms
  validateForm(formData: Record<string, any>, validationRules: Record<string, {
    type: 'text' | 'html' | 'numeric' | 'email' | 'phone' | 'url';
    required?: boolean;
    maxLength?: number;
    minLength?: number;
    pattern?: RegExp;
    custom?: (value: any) => { valid: boolean; error?: string };
  }>): { isValid: boolean; errors: Record<string, string[]>; sanitized: Record<string, any> } {
    const errors: Record<string, string[]> = {};
    const sanitized: Record<string, any> = {};
    let isValid = true;
    
    for (const [field, rules] of Object.entries(validationRules)) {
      const value = formData[field];
      const fieldErrors: string[] = [];
      
      // Required field validation
      if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        fieldErrors.push('Este campo es requerido');
        isValid = false;
        continue;
      }
      
      if (value) {
        // Sanitize input
        const sanitizationResult = this.sanitizeInput(value, {
          type: rules.type,
          maxLength: rules.maxLength,
          strictMode: true
        });
        
        sanitized[field] = sanitizationResult.sanitized;
        fieldErrors.push(...sanitizationResult.errors);
        
        if (!sanitizationResult.isValid) {
          isValid = false;
        }
        
        // Length validation
        if (rules.minLength && sanitizationResult.sanitized.length < rules.minLength) {
          fieldErrors.push(`Mínimo ${rules.minLength} caracteres`);
          isValid = false;
        }
        
        // Pattern validation
        if (rules.pattern && !rules.pattern.test(sanitizationResult.sanitized)) {
          fieldErrors.push('Formato inválido');
          isValid = false;
        }
        
        // Custom validation
        if (rules.custom) {
          const customResult = rules.custom(sanitizationResult.sanitized);
          if (!customResult.valid) {
            fieldErrors.push(customResult.error || 'Validación personalizada falló');
            isValid = false;
          }
        }
      } else {
        sanitized[field] = '';
      }
      
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors;
      }
    }
    
    return { isValid, errors, sanitized };
  }
}

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

  // Validate and sanitize numeric input with enhanced security
  sanitizeNumeric: (input: string, min: number = 0, max: number = Number.MAX_SAFE_INTEGER): number => {
    if (typeof input !== 'string') return 0;
    
    // Remove potentially dangerous characters
    const sanitized = input.replace(/[^0-9.-]/g, '');
    
    // Prevent scientific notation and other edge cases
    if (sanitized.includes('e') || sanitized.includes('E')) {
      ValidationUtils.logSecurityEvent('NUMERIC_INJECTION_ATTEMPT', { input });
      return 0;
    }
    
    const num = parseFloat(sanitized) || 0;
    
    // Additional bounds checking
    if (!isFinite(num) || isNaN(num)) {
      return 0;
    }
    
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

  // Enhanced payment amount validation with security checks
  validatePaymentAmount: (amount: number, balance: number, userId?: string): { valid: boolean; error?: string } => {
    // Type and basic validation
    if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
      ValidationUtils.logSecurityEvent('INVALID_PAYMENT_AMOUNT', { amount, userId });
      return { valid: false, error: 'Cantidad inválida' };
    }
    
    // Precision check (prevent floating point manipulation)
    const decimalPlaces = (amount.toString().split('.')[1] || '').length;
    if (decimalPlaces > 2) {
      return { valid: false, error: 'Máximo 2 decimales permitidos' };
    }
    
    // Range validation
    if (amount <= 0) {
      return { valid: false, error: 'La cantidad debe ser mayor a cero' };
    }
    
    if (amount < 100) { // Minimum transaction
      return { valid: false, error: 'Cantidad mínima: $100' };
    }
    
    if (amount > balance) {
      ValidationUtils.logSecurityEvent('INSUFFICIENT_BALANCE_ATTEMPT', { amount, balance, userId });
      return { valid: false, error: 'Saldo insuficiente' };
    }
    
    // Daily/transaction limits
    if (amount > 1000000) {
      ValidationUtils.logSecurityEvent('EXCESSIVE_AMOUNT_ATTEMPT', { amount, userId });
      return { valid: false, error: 'Cantidad excede el límite máximo ($1,000,000)' };
    }
    
    // Suspicious amount patterns
    if (amount === 999999 || amount === 1000000 || amount.toString().match(/^(1|9)+$/)) {
      ValidationUtils.logSecurityEvent('SUSPICIOUS_AMOUNT_PATTERN', { amount, userId });
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

  // Enhanced security event logging with threat classification
  logSecurityEvent: (event: string, details: any = {}) => {
    const timestamp = new Date().toISOString();
    const severity = ValidationUtils.classifyThreatLevel(event);
    
    const logEntry = {
      timestamp,
      event,
      severity,
      details: typeof details === 'object' ? details : { message: details },
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      sessionId: ValidationUtils.getSessionId(),
      ipHash: ValidationUtils.getIpHash(),
    };
    
    // Log based on severity
    if (severity === 'critical') {
      console.error('[SECURITY CRITICAL]', logEntry);
    } else if (severity === 'high') {
      console.warn('[SECURITY HIGH]', logEntry);
    } else {
      console.info('[SECURITY]', logEntry);
    }
    
    // Store in local security log for pattern analysis
    ValidationUtils.storeSecurityEvent(logEntry);
    
    // In production, send to monitoring service immediately for high/critical
    if (!__DEV__ && ['high', 'critical'].includes(severity)) {
      // sendToSecurityMonitoring(logEntry);
    }
  },
  
  // Classify threat level based on event type
  classifyThreatLevel: (event: string): 'low' | 'medium' | 'high' | 'critical' => {
    const criticalEvents = ['SQL_INJECTION_ATTEMPT', 'XSS_ATTEMPT', 'PRIVILEGE_ESCALATION'];
    const highEvents = ['EXCESSIVE_AMOUNT_ATTEMPT', 'BRUTE_FORCE_ATTEMPT', 'SUSPICIOUS_PATTERN'];
    const mediumEvents = ['INVALID_PAYMENT_AMOUNT', 'RATE_LIMIT_EXCEEDED', 'UNAUTHORIZED_ACCESS'];
    
    if (criticalEvents.some(e => event.includes(e))) return 'critical';
    if (highEvents.some(e => event.includes(e))) return 'high';
    if (mediumEvents.some(e => event.includes(e))) return 'medium';
    return 'low';
  },
  
  // Get or generate session ID
  getSessionId: (): string => {
    if (typeof window !== 'undefined') {
      let sessionId = sessionStorage.getItem('nodox_session_id');
      if (!sessionId) {
        sessionId = ValidationUtils.generateSecureId(32);
        sessionStorage.setItem('nodox_session_id', sessionId);
      }
      return sessionId;
    }
    return 'server-session';
  },
  
  // Get hashed IP (privacy-preserving)
  getIpHash: (): string => {
    // In a real app, this would be provided by the backend
    return 'ip-hash-placeholder';
  },
  
  // Store security events locally for pattern analysis
  storeSecurityEvent: (event: any) => {
    try {
      if (typeof localStorage !== 'undefined') {
        const key = 'nodox_security_events';
        const stored = localStorage.getItem(key);
        const events = stored ? JSON.parse(stored) : [];
        
        events.push(event);
        
        // Keep only last 100 events
        if (events.length > 100) {
          events.splice(0, events.length - 100);
        }
        
        localStorage.setItem(key, JSON.stringify(events));
      }
    } catch (error) {
      console.error('Failed to store security event:', error);
    }
  },
  
  // Analyze security patterns
  analyzeSecurityPatterns: (): { suspiciousActivity: boolean; recommendations: string[] } => {
    try {
      if (typeof localStorage === 'undefined') {
        return { suspiciousActivity: false, recommendations: [] };
      }
      
      const stored = localStorage.getItem('nodox_security_events');
      if (!stored) {
        return { suspiciousActivity: false, recommendations: [] };
      }
      
      const events = JSON.parse(stored);
      const recentEvents = events.filter((e: any) => {
        const eventTime = new Date(e.timestamp).getTime();
        const oneHourAgo = Date.now() - (60 * 60 * 1000);
        return eventTime > oneHourAgo;
      });
      
      const recommendations: string[] = [];
      let suspiciousActivity = false;
      
      // Check for repeated security events
      if (recentEvents.length > 10) {
        suspiciousActivity = true;
        recommendations.push('Actividad de seguridad elevada detectada');
      }
      
      // Check for critical events
      const criticalEvents = recentEvents.filter((e: any) => e.severity === 'critical');
      if (criticalEvents.length > 0) {
        suspiciousActivity = true;
        recommendations.push('Eventos críticos de seguridad detectados');
      }
      
      // Check for patterns
      const eventTypes = recentEvents.map((e: any) => e.event);
      const uniqueTypes = new Set(eventTypes);
      if (eventTypes.length > uniqueTypes.size * 3) {
        suspiciousActivity = true;
        recommendations.push('Patrón de eventos repetitivos detectado');
      }
      
      return { suspiciousActivity, recommendations };
    } catch (error) {
      console.error('Failed to analyze security patterns:', error);
      return { suspiciousActivity: false, recommendations: [] };
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