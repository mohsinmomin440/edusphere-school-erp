import app from './app';
import { connectDB } from './config/database';
import { getAuthSecret } from './config/jwt';

const PORT = Number(process.env.PORT) || 4000;

const startServer = async () => {
  // Validate JWT security configuration on startup
  getAuthSecret();

  await connectDB();

  app.listen(PORT, () => {
    console.log(`🚀 API listening on http://localhost:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
