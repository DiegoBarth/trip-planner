import { apiGet } from '@/api/client';

export function verifyEmailAuthorization(email: string) {
  return apiGet({
    action: 'verifyEmailAuthorization',
    email
  });
}