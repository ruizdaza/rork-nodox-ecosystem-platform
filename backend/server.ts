// Export the Hono app instance for deployment (Vercel/Render/etc.)
import app from './hono';
import { serve } from '@hono/node-server';

// Start server if run directly
if (require.main === module) {
  const port = Number(process.env.PORT) || 3000;
  console.log(`Server is running on port ${port}`);

  serve({
    fetch: app.fetch,
    port
  });
}

export default app;
