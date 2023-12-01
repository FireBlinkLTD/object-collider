import { suite, test } from '@testdeck/mocha';
import { collide, collideUnsafe } from '../../src/utils/CollideUtil';
import * as assert from 'assert';

@suite()
class CollideUtilTestSuite {
  @test()
  async testCollideWithoutModifiers(): Promise<void> {
    const result = collide(
      {
        array: [1, 2],
        obj: {
          n: 'something',
          a: true,
          c: 'yes',
          array: [11, 12],
        },
        override: 11,
      },
      {
        array: [3, 4],
        obj: {
          b: false,
          d: 'd',
          e: 1,
          n: null,
          array: [12, 13, 14],
        },
        override: 111,
      },
    );

    assert.deepStrictEqual(result, {
      array: [1, 2, 3, 4],
      obj: {
        a: true,
        b: false,
        c: 'yes',
        d: 'd',
        e: 1,
        n: null,
        array: [11, 12, 13, 14],
      },
      override: 111,
    });
  }

  @test()
  async testCollideUnsafeWithoutModifiers(): Promise<void> {
    const obj1 = {
      array: [1, 2],
      obj: {
        n: 'something',
        a: true,
        c: 'yes',
        array: [11, 12],
      },
      override: 11,
    };

    collideUnsafe(obj1, {
      array: [3, 4],
      obj: {
        b: false,
        d: 'd',
        e: 1,
        n: null,
        array: [12, 13, 14],
      },
      override: 111,
    });

    assert.deepStrictEqual(obj1, {
      array: [1, 2, 3, 4],
      obj: {
        a: true,
        b: false,
        c: 'yes',
        d: 'd',
        e: 1,
        n: null,
        array: [11, 12, 13, 14],
      },
      override: 111,
    });
  }

  @test()
  async testCollideWithModifiers(): Promise<void> {
    const result = collide(
      {
        array: [1, 2],
        obj: {
          a: true,
          c: 'yes',
          array: [11, 12],
        },
        override: 11,
      },
      {
        array: [3, 4],
        obj: {
          b: false,
          array: [13, 14],
        },
        override: 111,
      },
      {
        '$.array': (a: unknown[], b: unknown[]) => {
          b.push(...a);

          return b;
        },
        '$.obj': (a: unknown, b: unknown) => Object.assign(a, b),
        '$.override': (a: unknown) => a,
      },
    );

    assert.deepStrictEqual(result, {
      array: [3, 4, 1, 2],
      obj: {
        a: true,
        b: false,
        c: 'yes',
        array: [13, 14],
      },
      override: 11,
    });
  }

  @test()
  async testCollideWithModifiersAndCustomPath(): Promise<void> {
    const result = collide(
      {
        array: [1, 2],
        obj: {
          a: true,
          c: 'yes',
          array: [11, 12],
        },
        override: 11,
      },
      {
        array: [3, 4],
        obj: {
          b: false,
          array: [13, 14],
        },
        override: 111,
      },
      {
        '#.custom.array': (a: unknown[], b: unknown[]) => {
          b.push(...a);

          return b;
        },
        '#.custom.obj': (a: unknown, b: unknown) => Object.assign(a, b),
        '#.custom.override': (a: unknown) => a,
      },
      '#.custom',
    );

    assert.deepStrictEqual(result, {
      array: [3, 4, 1, 2],
      obj: {
        a: true,
        b: false,
        c: 'yes',
        array: [13, 14],
      },
      override: 11,
    });
  }

  @test()
  async testRootObjectCollideWithModifiers(): Promise<void> {
    const result = collide(
      {
        a: 11,
      },
      {
        a: 111,
      },
      {
        $: (a: { a: number }, b: { a: number }) => {
          return {
            a: a.a * 1000 + b.a,
          };
        },
      },
    );

    assert.deepStrictEqual(result, {
      a: 11111,
    });
  }

  @test()
  async testRootArrayCollideWithModifiers(): Promise<void> {
    const result = collide([11], [111], {
      $: (a: number[], b: number[]) => {
        return [a[0] * 1000 + b[0]];
      },
    });

    assert.deepStrictEqual(result, [11111]);
  }

  @test()
  async testWithMissingTarget(): Promise<void> {
    const result = collide(
      {
        test: true,
      },
      undefined,
    );

    assert.deepStrictEqual(result, {
      test: true,
    });
  }

  @test()
  async testWithEmptySource(): Promise<void> {
    const result = collide(null, {
      test: true,
    });

    assert.deepStrictEqual(result, {
      test: true,
    });
  }

  @test()
  async testBasicsWithModifiers(): Promise<void> {
    const result = collide(1, 2, {
      $: (a: number, b: number) => {
        return a + b;
      },
    });

    assert.strictEqual(result, 3);
  }

  @test()
  async invalidTypes(): Promise<void> {
    this.expectToThrow(
      () => {
        collide({ a: { b: true } }, { a: true });
      },
      'Unable to collide. Collide value at path $.a is not an object.'
    );

    this.expectToThrow(
      () => {
        collide({ a: [1, 2] }, { a: true });
      },
      'Unable to collide. Collide value at path $.a is not an array.'
    );
  }

  @test()
  async testWithPrototypePollution(): Promise<void> {
    const collideWith = JSON.parse(`{
            "__proto__": {
                "vulnerable": "yes"
            },
            "array": [3, 4]
        }`);

    const result = collide(
      {
        array: [1, 2],
      },
      collideWith,
    );

    assert.deepStrictEqual(result, {
      array: [1, 2, 3, 4],
    });
  }

  /**
   * Expect function to throw error message
   * @param fn
   * @param errorMsg
   */
  private expectToThrow(fn: () => void, errorMsg: string): void {
    let error;
    try {
      fn();
    } catch (err) {
      error = err;
    }

    assert.strictEqual(error && error.message, errorMsg);
  }
}
