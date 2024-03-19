import { assertEquals } from "testing";
import { MemoizedGetter } from "./MemoizedGetter.ts";

Deno.test("MemoizedGetter - memoizes correctly", () => {
  class Foo {
    public computationTimes = 0;

    public constructor(private _value: string) {}

    @MemoizedGetter((self) => self._value)
    public get value() {
      ++this.computationTimes;
      return this._value;
    }

    public set value(value: string) {
      this._value = value;
    }
  }

  // Check if computed fields were memoized in accordance with different instances
  const foo1 = new Foo("a");
  foo1.value; // compute for the 1st time
  foo1.value = "b";
  foo1.value; // compute for the 2nd time
  assertEquals(foo1.computationTimes, 2);
  assertEquals(foo1.value, "b");
  foo1.value; // compute for the 3rd time
  assertEquals(foo1.computationTimes, 2);
  assertEquals(foo1.value, "b");

  const foo2 = new Foo("x");
  foo2.value; // compute for the 1st time
  foo2.value = "y";
  foo2.value; // compute for the 2nd time
  assertEquals(foo2.computationTimes, 2);
  assertEquals(foo2.value, "y");
  foo2.value; // do not compute for the 3rd time
  assertEquals(foo2.computationTimes, 2);
  assertEquals(foo2.value, "y");

  // Check if there no side effects in the first instance
  foo1.value;
  assertEquals(foo1.computationTimes, 2);
  assertEquals(foo1.value, "b");
});

Deno.test(
  "MemoizedGetter - memoizes correctly with no memoization key provider",
  () => {
    class Foo {
      public computationTimes = 0;

      public constructor(private _value: string) {}

      @MemoizedGetter()
      public get value() {
        ++this.computationTimes;
        return this._value;
      }

      public set value(value: string) {
        this._value = value;
      }
    }

    // Check if all fields were memoized in accordance with different instances
    const foo1 = new Foo("a");
    foo1.value; // compute for the 1st time
    foo1.value = "b";
    foo1.value; // do not compute for the 2nd time
    assertEquals(foo1.computationTimes, 1);
    assertEquals(foo1.value, "a");
    foo1.value; // do not compute for the 3rd time
    assertEquals(foo1.computationTimes, 1);
    assertEquals(foo1.value, "a");

    const foo2 = new Foo("x");
    foo2.value; // compute for the 1st time
    foo2.value = "y";
    foo2.value; // do not compute for the 2nd time
    assertEquals(foo2.computationTimes, 1);
    assertEquals(foo2.value, "x");
    foo2.value; // do not compute for the 3rd time
    assertEquals(foo2.computationTimes, 1);
    assertEquals(foo2.value, "x");

    // Check if there no side effects in the first instance
    foo1.value;
    assertEquals(foo1.computationTimes, 1);
    assertEquals(foo1.value, "a");
  }
);
