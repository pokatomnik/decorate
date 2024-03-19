import { BoundMethod } from "./BoundMethod.ts";
import { assertEquals } from "testing";

Deno.test("BoundMethod - binds class methods", () => {
  class Test {
    private foo = 42;
    @BoundMethod
    public getFoo() {
      return this.foo;
    }
  }

  const test = new Test();
  const getFoo = test.getFoo;
  const foo = getFoo();
  assertEquals(foo, 42);
});
