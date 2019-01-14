import { isArray, isMissing, isBasicType, isObject } from './TypeUtil';
import { IMergeModifiers } from '../interfaces';
import { BasicType } from '../types';

/**
 * Merge 2 arguments
 * @param arg1 first argument to merge into (note: original object won't be modified directly)
 * @param arg2 second argument to merge from
 * @param modifiers
 * @param startPath the entry path to start modifier path generation. Default value: $
 * @returns merge result
 */
export function collide(arg1: any, arg2: any, modifiers?: IMergeModifiers, startPath = '$'): any {
    const arg1Clone = isMissing(arg1) ? arg1 : JSON.parse(JSON.stringify(arg1));
    const arg2Clone = isMissing(arg2) ? arg2 : JSON.parse(JSON.stringify(arg2));

    return mergeUnknown(arg1Clone, arg2Clone, startPath, modifiers);
}

/**
 * Merge unknown types
 * @param arg1 first argument to merge into
 * @param arg2 second argument to merge from
 * @param path
 * @param modifiers
 */
function mergeUnknown(arg1: any, arg2: any, path: string, modifiers?: IMergeModifiers): any {
    if (arg2 === undefined) {
        return arg1;
    }

    if (isMissing(arg1)) {
        return arg2;
    }

    if (isBasicType(arg1)) {
        return mergeBasic(arg1, arg2, path, modifiers);
    }

    if (isArray(arg1)) {
        return mergeArrays(arg1, arg2, path, modifiers);
    }

    return mergeObjects(arg1, arg2, path, modifiers);
}

/**
 * Merge basic value types
 * @param arg1
 * @param arg2
 * @param path
 * @param modifiers
 */
function mergeBasic(arg1: BasicType, arg2: BasicType, path: string, modifiers?: IMergeModifiers): any {
    if (modifiers && modifiers[path]) {
        return modifiers[path](arg1, arg2);
    }

    return arg2;
}

/**
 * Merge objects
 * @param obj1
 * @param obj2
 * @param path
 * @param modifiers
 */
function mergeObjects(obj1: any, obj2: any, path: string, modifiers?: IMergeModifiers): any {
    if (!isObject(obj2)) {
        throw new Error(`Unable to merge. Merge value at path ${path} is not an object.`);
    }

    if (modifiers && modifiers[path]) {
        return modifiers[path](obj1, obj2);
    }

    for (const key of Object.keys(obj2)) {
        const subPath = path + '.' + key;

        if (obj1[key] === undefined) {
            obj1[key] = obj2[key];
        } else {
            if (modifiers && modifiers[subPath]) {
                obj1[key] = modifiers[subPath](obj1[key], obj2[key]);
            } else {
                obj1[key] = mergeUnknown(obj1[key], obj2[key], subPath, modifiers);
            }
        }
    }

    return obj1;
}

/**
 * Merge arrays. Default behaviour to push values of arr2 into arr1.
 * @param arr1
 * @param arr2
 * @param path
 * @param modifiers
 */
function mergeArrays(arr1: any[], arr2: any[], path: string, modifiers?: IMergeModifiers): any {
    if (!isArray(arr2)) {
        throw new Error(`Unable to merge. Merge value at path ${path} is not an array.`);
    }

    if (modifiers && modifiers[path]) {
        return modifiers[path](arr1, arr2);
    } else {
        for (const item of arr2) {
            if (arr1.indexOf(item) < 0) {
                arr1.push(item);
            }
        }
    }

    return arr1;
}
