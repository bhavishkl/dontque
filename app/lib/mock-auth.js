
import { mockSession } from './mock-auth-client';

export * from './mock-auth-client';

// Server-side Session Helper
export function getServerSession() {
  return Promise.resolve(mockSession);
}

export default {
  getServerSession,
}
