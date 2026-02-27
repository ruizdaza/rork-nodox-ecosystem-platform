import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
// import { auth as firebaseAuth } from "@/lib/firebase-server"; // Import auth from firebase client (Note: In a real backend, you'd use firebase-admin)
// NOTE: Since this code runs in a "backend" context (likely Next.js API routes or similar in a real deployment),
// but here it seems to be part of the same bundle or running in an environment where we might not have full firebase-admin access easily setup without service account keys.
// For this environment, we will assume the client passes a valid ID token and we would verify it.
// However, `firebase/auth` is client SDK. For backend verification we need `firebase-admin`.
// Given the constraints and the setup, I will simulate token verification or use a basic check if possible.
// IF this is running in a serverless function where we can use `firebase-admin`, we should.
// For now, I'll update it to expect a user object if we can, or keep the mock but closer to reality.

// Actually, since this is likely running in a purely client-side simulation or a mixed environment,
// I will keep the structure but add comments on how to integrate `firebase-admin`.

interface User {
  id: string;
  email?: string;
  name?: string;
  type?: 'user' | 'ally' | 'admin';
}

// Context creation function
export const createContext = async (opts: FetchCreateContextFnOptions) => {
  // Extract user from authorization header or session
  const authHeader = opts.req.headers.get('authorization');
  const userIdHeader = opts.req.headers.get('x-user-id'); // Read explicit UID for this env
  
  let user: User | null = null;
  
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');

      // PRODUCTION TODO: Use firebase-admin to verify the ID token
      // const decodedToken = await admin.auth().verifyIdToken(token);
      // user = { id: decodedToken.uid, email: decodedToken.email, ... };

      // SIMULATION LOGIC:
      // In this environment without Admin SDK keys, we cannot verify the signature of `token`.
      // The client now sends `X-User-Id` which contains the UID.
      // We will trust `X-User-Id` ONLY because we have validated the presence of a Bearer token (even if unverified).
      // This bridges the gap between Client SDK (which has the UID) and Server Context (which needs it).
      // WARN: This is NOT secure for production without Admin SDK verification of the token itself.

      if (token === "mock-token") {
         user = {
          id: 'user-' + Math.random().toString(36).substr(2, 9),
          email: 'user@example.com',
          name: 'Test User',
          type: 'user',
        };
      } else if (userIdHeader) {
         // Trusting the header for ID synchronization in this specific dev/demo env
         user = {
          id: userIdHeader,
          email: 'user@real.com', // Would come from DB or token claim
          type: 'user',
        };
      } else {
        // Fallback if header missing but token present (shouldn't happen with updated client)
         user = {
          id: token, // Fallback to token string if no ID header (legacy behavior)
          email: 'user@real.com',
          type: 'user',
        };
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
