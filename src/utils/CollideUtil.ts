import { isArray, isMissing, isBasicType, isObject } from './TypeUtil';
import { ICollideModifiers } from '../interfaces';

/**
 * collide 2 arguments
 * @param arg1 first argument to collide into (note: original object won't be modified directly)
 * @param arg2 second argument to collide from
 * @param modifiers
 * @param startPath the entry path to start modifier path generation. Default value: $
 * @returns collide result
 */
export function collide(arg1: unknown, arg2: unknown, modifiers?: ICollideModifiers, startPath = '$'): unknown {
    const arg1Clone = isMissing(arg1) ? arg1 : JSON.parse(JSON.stringify(arg1));
    const arg2Clone = isMissing(arg2) ? arg2 : JSON.parse(JSON.stringify(arg2));

    return collideUnsafe(arg1Clone, arg2Clone, modifiers, startPath);
}

/**
 * Collide unsafe (arg1 may be modified directly)
 * @param arg1 first argument to collide into (note: original object will be modified directly)
 * @param arg2 second argument to collide from
 * @param modifiers
 * @param startPath the entry path to start modifier path generation. Default value: $
 * @returns collide result
 */
export function collideUnsafe(arg1: unknown, arg2: unknown, modifiers?: ICollideModifiers, startPath = '$'): unknown {
    if (arg2 === undefined) {
        return arg1;
    }

    if (isMissing(arg1)) {
        return arg2;
    }

    if (isBasicType(arg1)) {
        return collideBasic(arg1, arg2, startPath, modifiers);
    }

    if (isArray(arg1)) {
        return collideArrays(<unknown[]> arg1, <unknown[]> arg2, startPath, modifiers);
    }

    return collideObjects(<Record<string, unknown>> arg1,<Record<string, unknown>> arg2, startPath, modifiers);
}

/**
 * collide basic value types
 * @param arg1
 * @param arg2
 * @param path
 * @param modifiers
 */
function collideBasic<T>(arg1: T, arg2: T, path: string, modifiers?: ICollideModifiers): T {
    if (modifiers && modifiers[path]) {
        return <T> modifiers[path](arg1, arg2);
    }

    return arg2;
}

/**
 * collide objects
 * @param obj1
 * @param obj2
 * @param path
 * @param modifiers
 */
function collideObjects(obj1: Record<string, unknown>, obj2: Record<string, unknown>, path: string, modifiers?: ICollideModifiers): Record<string, unknown> {
    if (!isObject(obj2)) {
        throw new Error(`Unable to collide. Collide value at path ${path} is not an object.`);
    }

    if (modifiers && modifiers[path]) {
        return <Record<string, unknown>> modifiers[path](obj1, obj2);
    }

    for (const key of Object.keys(obj2)) {
        const subPath = path + '.' + key;
        if (key !== '__proto__') {
            if (obj1[key] === undefined) {
                obj1[key] = obj2[key];
            } else {
                if (modifiers && modifiers[subPath]) {
                    obj1[key] = modifiers[subPath](obj1[key], obj2[key]);
                } else {
                    obj1[key] = collideUnsafe(obj1[key], obj2[key], modifiers, subPath);
                }
            }
        }
    }

    return obj1;
}

/**
 * collide arrays. Default behaviour to push values of arr2 into arr1.
 * @param arr1
 * @param arr2
 * @param path
 * @param modifiers
 */
function collideArrays<T>(arr1: T[], arr2: T[], path: string, modifiers?: ICollideModifiers): T[] {
    if (!isArray(arr2)) {
        throw new Error(`Unable to collide. Collide value at path ${path} is not an array.`);
    }

    if (modifiers && modifiers[path]) {
        return <T[]> modifiers[path](arr1, arr2);
    } else {
        for (const item of arr2) {
            if (arr1.indexOf(item) < 0) {
                arr1.push(item);
            }
        }
    }

    return arr1;
}
