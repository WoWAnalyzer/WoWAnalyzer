import type { Condition } from '../index';

export default function describe<T>(
  cnd: Condition<T>,
  desc: Condition<T>['describe'],
): Condition<T> {
  return {
    ...cnd,
    describe: desc,
  };
}
