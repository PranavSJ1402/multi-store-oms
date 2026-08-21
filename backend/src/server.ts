import { app } from './app';
import { env } from './config/env';
import { seedAdmin } from './modules/auth/authService';
import { initSocket } from './sockets/socket';
import http from 'http';

const server = http.createServer(app);

// Initialize Socket.IO
export const io = initSocket(server);

server.listen(env.PORT, async () => {
  console.log(`Server running on port ${env.PORT}`);
  // Seed default admin account on first boot (no-op if already exists)
  await seedAdmin();
});

// trigger restart
// force restart 2
