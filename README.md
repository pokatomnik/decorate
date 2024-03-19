# Decorate

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
