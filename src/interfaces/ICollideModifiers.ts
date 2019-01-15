import { CollideModificationFunctionType } from '../types';

/**
 * Merge modifiers
 */
export interface ICollideModifiers {
    [path: string]: CollideModificationFunctionType;
}
