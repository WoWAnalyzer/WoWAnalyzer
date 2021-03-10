export const IGNORE_SPEC_NOT_SUPPORTED_WARNING = 'IGNORE_SPEC_NOT_SUPPORTED_WARNING';
export function ignoreSpecNotSupportedWarning(specId: number) {
  return {
    type: IGNORE_SPEC_NOT_SUPPORTED_WARNING,
    payload: specId,
  };
}
