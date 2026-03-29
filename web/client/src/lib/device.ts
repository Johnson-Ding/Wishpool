const DEVICE_KEY = "wishpool_device_id";

export function getOrCreateDeviceId() {
  const existing = localStorage.getItem(DEVICE_KEY);
  if (existing) return existing;

  const next = crypto.randomUUID();
  localStorage.setItem(DEVICE_KEY, next);
  return next;
}
