import type { Condition } from '../index';

export default function describe<T>(
  cnd: Condition<T>,
  desc: Condition<T>['describe'],
  prefix?: string,
): Condition<T> {
  return {
    ...cnd,
    describe: desc,
    prefix: prefix,
  };
}
