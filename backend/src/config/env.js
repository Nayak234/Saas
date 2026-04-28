import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || 'dev_secret',
  openAIApiKey: process.env.OPENAI_API_KEY,
  frontendUrl: process.env.FRONTEND_URL || '*',
  upiBase: process.env.UPI_BASE || 'upi://pay?pa=PPQR01.UTGOQA@iob&pn=Aatreyee%20Enterprise&am='
};
