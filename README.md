# Decorate

[![Test](https://github.com/pokatomnik/decorate/actions/workflows/deno.yml/badge.svg)](https://github.com/pokatomnik/decorate/actions/workflows/deno.yml)

A simple set of useful ES Decorators for [Deno](https://deno.com/)

## `BoundMethod`

```typescript
class SomeClass {
  private value = 42;

  @BoundMethod
  public getValue() {
    return this.value;
  }
}

const getValue = new SomeClass().getValue;

console.log(getValue()); // 42
```

## `MemoizedGetter`

```typescript
class SomeClass {
  private _value = 0;

  private version = 0;

  @MemoizedGetter((instance) => instance.version)
  public get value() {
    return this._value;
  }

  public setValue(newValue: number) {
    this._value = newValue;
  }
}

const instance = new SomeClass();
console.log(instance.value); // 0
instance.setValue(42);
console.log(instance.value); // again, 0, because version is the same
```

## Retry

```typescript
class ProbablyFail {
  /**
   * Tries three times to fetch data before giving up (throws last Error)
   */
  @Retry(3)
  public async invoke() {
    return await fetchDataFromServer("https://example.com");
  }
}
```
