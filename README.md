# Object Collider

[![Greenkeeper badge](https://badges.greenkeeper.io/FireBlinkLTD/object-collider.svg)](https://greenkeeper.io/)
[![CircleCI](https://circleci.com/gh/FireBlinkLTD/object-collider.svg?style=svg)](https://circleci.com/gh/FireBlinkLTD/object-collider)
[![codecov](https://codecov.io/gh/FireBlinkLTD/object-collider/branch/master/graph/badge.svg)](https://codecov.io/gh/FireBlinkLTD/object-collider)


Merge plain old objects without source modifications and optionally provide custom merge behavior per specific child path.

## Why yet another object merge library?

The main reason is to have flexible way of overriding default merge behavior for any object property branches individually, originally as a part of [fbl](https://fbl.fireblink.com) rutine automation tool.

Best way to understand what that means is to review the example below.

Let's assume we need to merge following objects.

```typescript
const obj1 = {
    parent: {
        child: {
            field: [1, 2, 3]
        }
    }
};
```

```typescript
const obj2 = {
    parent: {
        child: {
            field: [4, 5, 6]
        }
    }
};
```
The default behaviour of this library is to concatenate array items at the same path, so following script ... 

```typescript
import { collide } from 'object-collider';

const result = collide(obj1, obj2);
```

... will produce `result` with the following structure:

```yaml
{
    parent:
        child: {
            field: [1, 2, 3, 4, 5, 6]
        }
}
```

However this might not be what app needs. Modifiers are here for the rescue:

```typescript
import { collide } from 'object-collider';

const result = collide(obj1, obj2, {
    '$.parent.child.field': (arr1, arr2) => {
        // just return second array to override all values
        return arr2;
    }
});
```

## Merge Behaviour

`collide` function creates cloned values of passed arguments to avoid any unexpected modifications.

### Objects

Library will recurcivelly travel over the object fields tree till and will merge each leaf individually. 

App will stop recursion on basic types (limited set of primitive JS types), `null`, `undefined` or array.

### Basic Types

If value has type of `string`, `number` or `boolean` it will be merged directly into first merge argument object.

### Arrays

By default arrays will be concatenated. Note, if array contains objects, these object will not be merged. If you need to merge objects provide custom modifier function for array path and call `collide` per each set of object you need to merge.

### Other Types

Library is not designed to merge non-plain objects, so any other types will probably cause merge to fail.

## Paths

Library is using dot separated sytax to identify merge path, starting with `$` that identifies root of the path.

Note: you're allowed to replace the prefix (`$`) with any other by providing it as a 4th argument of `collide` function.

## Unsafe Merge

In some cases you may need to modify the existing object, so you can do that with `collideUnsafe` function:

```typescript
import { collideUnsafe } from 'object-collider';

// obj1 will get modified directly
collideUnsafe(obj1, obj2);
```
