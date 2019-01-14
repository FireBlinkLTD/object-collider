import { MergeModificationFunctionType } from '../types';

/**
 * Merge modifiers
 */
export interface IMergeModifiers {
    [path: string]: MergeModificationFunctionType;
}
