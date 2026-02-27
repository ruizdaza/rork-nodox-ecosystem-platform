import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { auth as adminAuth } from "@/lib/firebase-server";

interface User {
  id: string;
  email?: string;
  name?: string;
  type?: 'user' | 'ally' | 'admin';
}

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  const authHeader = opts.req.headers.get('authorization');
  let user: User | null = null;
  
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');

      // Strict Production Auth: Only verify with Admin SDK
      try {
          const decodedToken = await adminAuth.verifyIdToken(token);
          user = {
              id: decodedToken.uid,
              email: decodedToken.email,
              type: 'user', // Can extract role from custom claims
          };
      } catch (verifyError) {
          console.error('Token verification failed:', verifyError);
          // Fallback only for LOCAL DEVELOPMENT without Admin Keys
          // This block ensures we can develop without keys but it WON'T work in production
          // because NODE_ENV should be 'production'
          if (process.env.NODE_ENV !== 'production' && !process.env.FIREBASE_PRIVATE_KEY) {
               console.warn("⚠️ Using insecure token decoding for DEV only due to missing Admin Keys");
               const base64Url = token.split('.')[1];
               if (base64Url) {
                   const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                   const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
                      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
                   }).join(''));
                   const decoded = JSON.parse(jsonPayload);
                   if(decoded.sub) {
                       user = { id: decoded.sub, email: decoded.email, type: 'user' };
                   }
               }
          }
      }

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

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

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
