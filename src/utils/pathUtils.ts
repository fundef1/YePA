export const getAssetPath = (path: string) => {
  // In development, use paths as-is
  if (process.env.NODE_ENV === 'development') {
    return path;
  }
  // In production, prepend the base path
  return `/YePA${path.startsWith('/') ? '' : '/'}${path}`;
};