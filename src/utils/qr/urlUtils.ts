
/**
 * Ensures a URL is absolute by adding the current origin if needed
 */
export const ensureAbsoluteUrl = (url: string): string => {
  // If the URL is already absolute (starts with http:// or https://), return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If the URL starts with a slash, it's a root-relative URL
  if (url.startsWith('/')) {
    return `${window.location.origin}${url}`;
  }
  
  // If the URL doesn't start with a slash, treat it as relative to current path
  return `${window.location.origin}/${url}`;
};
