export default () => ({
    nodeEnv: process.env.NODE_ENV,
    postgresHost: process.env.POSTGRES_HOST,
    postgresPort: process.env.POSTGRES_PORT,
    postgresUser: process.env.POSTGRES_USER,
    postgresPassword: process.env.POSTGRES_PASSWORD,
    popplerBinariesPath: process.env.POPPLER_BIN_PATH,
    openaiApiKey: process.env.OPENAI_API_KEY,
    logLevel: process.env.LOG_LEVEL?.split(',').map((l) => l.trim()) || [
      'log',
      'warn',
      'error',
    ],
  });