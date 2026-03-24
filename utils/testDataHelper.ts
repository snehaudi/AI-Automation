export function generateUniqueName(prefix: string): string {
  const timestamp = new Date().getTime();
  const randomSuffix = Math.floor(Math.random() * 1000);
  return `${prefix}_${timestamp}_${randomSuffix}`;
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
