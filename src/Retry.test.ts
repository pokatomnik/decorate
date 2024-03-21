import { assertEquals, assertRejects } from "testing";
import { Retry } from "./Retry.ts";

Deno.test("Retry - success on 3rd attempt with no conditions", async () => {
  class ProbablyFail {
    private willBeThrowing = makeFailingFunc(3);

    @Retry(3)
    public invoke() {
      return this.willBeThrowing();
    }
  }
  const probablyFail = new ProbablyFail();
  const result = await probablyFail.invoke();
  assertEquals(result, "succcess");
});

Deno.test("Retry - success on 3rd attempt with conditions", async () => {
  class ProbablyFail {
    private willBeThrowing = makeFailingFunc(3);

    @Retry(3, (e) => e instanceof SpecificError)
    public invoke() {
      return this.willBeThrowing();
    }
  }
  const probablyFail = new ProbablyFail();
  const result = await probablyFail.invoke();
  assertEquals(result, "succcess");
});

Deno.test("Retry - throws on number of attemps exceeded", async () => {
  class ProbablyFail {
    private willBeThrowing = makeFailingFunc(3);

    @Retry(2, (e) => e instanceof SpecificError)
    public invoke() {
      return this.willBeThrowing();
    }
  }
  const probablyFail = new ProbablyFail();
  await assertRejects(async () => {
    await probablyFail.invoke();
  }, SpecificError);
});

class SpecificError extends Error {}

const makeFailingFunc = (max: number) => {
  let attempt = 0;
  return () => {
    ++attempt;
    if (max === attempt) {
      return Promise.resolve("succcess");
    } else {
      return Promise.reject(new SpecificError());
    }
  };
};
