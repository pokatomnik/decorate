import { ClassMethod } from "./ClassMethod.ts";

export function BoundMethod<
  TThis extends object,
  TArgs extends ReadonlyArray<unknown>,
  TReturn
>(
  _target: ClassMethod<TThis, TReturn, TArgs>,
  context: ClassMethodDecoratorContext<
    TThis,
    ClassMethod<TThis, TReturn, TArgs>
  >
) {
  const methodName = String(context.name);
  context.addInitializer(function () {
    // deno-lint-ignore no-explicit-any, no-this-alias
    const self: any = this;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const method = self[methodName];

    if (context.private) {
      throw new Error(
        `'bound' cannot decorate private properties like ${methodName}.`
      );
    }

    if (typeof method === "function") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      self[methodName] = method.bind(this);
    }
  });
}
