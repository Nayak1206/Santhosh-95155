// server/index.js
import 'dotenv/config';
import { initDb } from './src/config/db.js';
import { runMigrations } from './src/db/migrations.js';
import { seedData } from './src/db/seed.js';
import app from './src/app.js';

async function startServer() {
  try {
    // 1. Init DB connection
    initDb();

    // 2. Run migrations (CREATE TABLE IF NOT EXISTS)
    console.log('Running migrations...');
    await runMigrations();

    // 3. Seed demo data if DB is empty
    console.log('Checking for seed data...');
    await seedData();

    // 4. Start auto-submit background job (every 30 seconds)
    // Dynamic import to avoid issues if the file doesn't exist yet (though we should create it)
    try {
      const { startAutoSubmitJob } = await import('./src/services/attemptService.js');
      startAutoSubmitJob();
    } catch (err) {
      console.warn('⚠️ Could not start auto-submit job:', err.message);
    }

    // 5. Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
