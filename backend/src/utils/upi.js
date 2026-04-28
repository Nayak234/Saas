import { env } from '../config/env.js';

export function generateUPILink(amount) {
  if (!amount || Number(amount) <= 0) {
    throw new Error('Amount must be greater than zero');
  }
  return `${env.upiBase}${encodeURIComponent(Number(amount).toFixed(2))}`;
}
