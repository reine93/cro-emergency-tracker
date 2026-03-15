import type { RegisterExpoPushTokenRequest, RegisterExpoPushTokenResponse } from '@cro/shared';
import { requestJson } from './client';

function assertRegisterResponse(
  payload: unknown,
): asserts payload is RegisterExpoPushTokenResponse {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Invalid response shape: expected object.');
  }

  const candidate = payload as Partial<RegisterExpoPushTokenResponse>;
  if (candidate.ok !== true || typeof candidate.registeredAt !== 'string') {
    throw new Error('Invalid response shape: expected register response.');
  }
}

export async function registerExpoPushToken(
  payload: RegisterExpoPushTokenRequest,
): Promise<RegisterExpoPushTokenResponse> {
  const response = await requestJson<unknown>('/api/notifications/expo/register', {
    method: 'POST',
    body: payload,
  });

  assertRegisterResponse(response);
  return response;
}
