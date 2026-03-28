import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

interface User {
  id: string;
  email?: string;
  name?: string;
  type?: 'user' | 'ally' | 'admin';
}

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  // Extract user from authorization header or session
  // This is a simplified example - in production you'd validate JWT tokens, etc.
  const authHeader = opts.req.headers.get('authorization');
  
  let user: User | null = null;
  
  if (authHeader) {
    // Mock user extraction - in production, validate JWT and extract user info
    try {
      const token = authHeader.replace('Bearer ', '');
      // For now, we'll create a mock user
      // In production, you'd decode and validate the JWT
      user = {
        id: 'user-' + Math.random().toString(36).substr(2, 9),
        email: 'user@example.com',
        name: 'Test User',
        type: 'user',
      };
    } catch (error) {
      console.error('Auth error:', error);
    }
  }
  
  return {
    req: opts.req,
    user,
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You must be logged in to access this resource',
    });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  });
});