/**
 * Remove undefined values from an object recursively
 * Firestore doesn't accept undefined values
 */
function removeUndefinedValues(obj) {
  if (obj === null || obj === undefined) {
    return null;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => removeUndefinedValues(item))
      .filter(item => item !== undefined);
  }

  if (typeof obj === 'object' && obj.constructor === Object) {
    const cleaned = {};
    
    Object.keys(obj).forEach(key => {
      const value = obj[key];
      
      if (value !== undefined) {
        if (typeof value === 'object' && value !== null) {
          const cleanedValue = removeUndefinedValues(value);
          // Only add if the cleaned object has keys
          if (cleanedValue !== null && 
              ((Array.isArray(cleanedValue) && cleanedValue.length > 0) ||
               (typeof cleanedValue === 'object' && Object.keys(cleanedValue).length > 0))) {
            cleaned[key] = cleanedValue;
          } else if (cleanedValue !== null && typeof cleanedValue !== 'object') {
            cleaned[key] = cleanedValue;
          }
        } else {
          cleaned[key] = value;
        }
      }
    });
    
    return cleaned;
  }

  return obj;
}

/**
 * Prepare data for Firestore by removing undefined values and converting types
 */
function prepareForFirestore(data) {
  const cleaned = removeUndefinedValues(data);
  
  // Additional conversions if needed
  if (cleaned && typeof cleaned === 'object') {
    // Convert Date objects to ISO strings
    Object.keys(cleaned).forEach(key => {
      if (cleaned[key] instanceof Date) {
        cleaned[key] = cleaned[key].toISOString();
      }
    });
  }
  
  return cleaned;
}

module.exports = {
  removeUndefinedValues,
  prepareForFirestore
};