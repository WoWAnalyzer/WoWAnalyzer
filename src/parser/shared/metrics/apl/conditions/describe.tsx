import type { Condition } from '../index';

/**
 * Replaces the inner condition's default description with a custom one defined in `desc`
 * @param cnd Inner condition
 * @param desc Callback function that returns a description for the inner condition
 * @param prefix When undefined, the default prefix is 'when' which may not be gramatically in the context of the overridden description
 */
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
