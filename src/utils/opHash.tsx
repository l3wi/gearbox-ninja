export const generateNewHash = (prefix: string) =>
  prefix + Date.now().toString();
