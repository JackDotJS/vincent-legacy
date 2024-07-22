/**
 * Recursively checks for equality between two objects.
 * @param a First object.
 * @param b Second object.
 * @returns A boolean value indicating if both objects are the same.
 */
export const deepEquals = (a: unknown, b: unknown): boolean => {
  if (a == null || b == null) return (a === b);

  const equalKeyLength: boolean = (Object.keys(a).length === Object.keys(b).length);
  let recursiveCompare: boolean;

  if (typeof a === `object` && typeof b === `object`) {
    recursiveCompare = Object.keys(a).every((key: string) => {
      return deepEquals(a[key], b[key]);
    });
  } else {
    recursiveCompare = (a === b);
  }
  
  return (equalKeyLength && recursiveCompare);
};