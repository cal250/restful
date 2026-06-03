process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "postgresql://test:test@localhost:5435/test";
process.env.JWT_SECRET = "test-secret-that-is-at-least-thirty-two-characters";
process.env.JWT_EXPIRES_IN = "1h";
process.env.FRONTEND_URL = "http://localhost:5173";
