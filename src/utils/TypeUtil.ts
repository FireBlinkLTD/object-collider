const BASIC_TYPES = ['number', 'string', 'boolean'];

/**
 * Check if value represents a basic type (number, string or boolean)
 * @param value
 */
export function isBasicType(value: any): boolean {
    const type = typeof value;
    
    return BASIC_TYPES.indexOf(type) >= 0;    
}

/**
 * Check if value is null or undefined
 * @param value
 */
export function isMissing(value: any): boolean {
    return value === null || value === undefined;
}

/**
 * Check if value is object
 * @param value
 */
export function isObject(value: any): boolean {
    return !isMissing(value) && typeof value === 'object' && !Array.isArray(value);
}

export function isArray(value: any): boolean {
    return value != null && Array.isArray(value);
}
