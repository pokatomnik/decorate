import { type Nullable } from "./Nullable.ts";

type MemoizedState<T> = Nullable<Readonly<{ value: T }>>;

interface ComputedField<T> {
  memoizationKey: unknown;
  memoizedState: MemoizedState<T>;
}

/**
 * Decorator for getter memoization. Memoized previosly computed value.
 * Can have an argument to get the memoization key, getter will be
 * recomputing the value when key changed.
 * @param getMemoKey get memoization key from the instance
 * @returns Decorator for getter memoization
 */
export function MemoizedGetter<TThis extends object, TValue>(
  getMemoKey: (self: TThis) => unknown = () => null
) {
  const instanceAssociatedFields = new InstanceAssociatedDataMap<
    TThis,
    FieldsStorage<ComputedField<TValue>>
  >(
    () =>
      new FieldsStorage<ComputedField<TValue>>(() => ({
        memoizationKey: Symbol("lastKey"),
        memoizedState: null,
      }))
  );

  return function (
    target: () => TValue,
    context: ClassGetterDecoratorContext<TThis, TValue>
  ) {
    const fieldName = context.name;
    return function (this: TThis) {
      const instanceFields = instanceAssociatedFields.getByInstance(this);
      const currentFieldData = instanceFields.getByFieldName(fieldName);

      const newKey = getMemoKey(this);
      if (
        currentFieldData.memoizedState &&
        currentFieldData.memoizationKey === newKey
      ) {
        return currentFieldData.memoizedState.value;
      }
      const newValue = target.call(this);
      currentFieldData.memoizationKey = newKey;
      currentFieldData.memoizedState = { value: newValue };
      return newValue;
    };
  };
}

class FieldsStorage<TValueType> {
  readonly #fields = new Map<string | symbol, TValueType>();

  readonly #defaultDataFabric: () => TValueType;

  public constructor(defaultDataFabric: () => TValueType) {
    this.#defaultDataFabric = defaultDataFabric;
  }

  public getByFieldName(fieldName: string | symbol) {
    const existingField = this.#fields.get(fieldName);
    if (existingField) {
      return existingField;
    }
    const newField = this.#defaultDataFabric();
    this.#fields.set(fieldName, newField);
    return newField;
  }
}

class InstanceAssociatedDataMap<TInstanceType extends object, TValueType> {
  readonly #data = new WeakMap<TInstanceType, TValueType>();

  readonly #defaultDataFabric: () => TValueType;

  public constructor(defaultDataFabric: () => TValueType) {
    this.#defaultDataFabric = defaultDataFabric;
  }

  public getByInstance(instance: TInstanceType) {
    const existingData = this.#data.get(instance);
    if (existingData) {
      return existingData;
    }
    const newData = this.#defaultDataFabric();
    this.#data.set(instance, newData);
    return newData;
  }
}
