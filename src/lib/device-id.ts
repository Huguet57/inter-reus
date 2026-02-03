'use client';

const DEVICE_ID_KEY = 'qr-game-device-id';

export function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') {
    return '';
  }
  
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

export function getDeviceId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(DEVICE_ID_KEY);
}
