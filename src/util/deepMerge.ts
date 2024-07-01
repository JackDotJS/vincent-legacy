/**
 * this was adapted almost directly from an older, vanilla JS project of mine
 * TODO: this could probably be refactored to better utilize typescript features
 */

const isObject = (item: any) => {
  return (item && typeof item === `object` && !Array.isArray(item));
};

const merge = (target: any, ...sources: any): any => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {    
    for (const key in source) {
      if (!isObject(source[key])) {
        Object.assign(target, { [key]: source[key] });
        continue;
      }

      if (!target[key]) { 
        Object.assign(target, { [key]: {} });
        continue;
      }

      target[key] = Object.assign({}, target[key]);

      merge(target[key], source[key]);
    }
  }

  return merge(target, ...sources);
};

// entrypoint functions

/**
 * Clones source and target objects before merging.
 */
export const deepMerge = (target: any, ...sources: any): any => {
  const clonedTarget = structuredClone(target);
  const clonedSources = [];

  for (const source of sources) {
    clonedSources.push(structuredClone(source));
  }

  return merge(clonedTarget, ...clonedSources);
};

/**
 * Modifies source and target objects in place.
 */
export const deepMergeInPlace = (target: any, ...sources: any): any => {
  return merge(target, ...sources);
};