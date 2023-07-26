import { MessageDescriptor } from '@lingui/core';

// This is kind of ugly but I generated it, so I'm keeping it for now.
export const isMessageDescriptor = (obj: unknown): obj is MessageDescriptor => {
  const typedObj = obj as MessageDescriptor;
  return (
    ((typedObj !== null && typeof typedObj === 'object') || typeof typedObj === 'function') &&
    (typeof typedObj['id'] === 'undefined' || typeof typedObj['id'] === 'string') &&
    (typeof typedObj['comment'] === 'undefined' || typeof typedObj['comment'] === 'string') &&
    (typeof typedObj['message'] === 'undefined' || typeof typedObj['message'] === 'string') &&
    (typeof typedObj['context'] === 'undefined' || typeof typedObj['context'] === 'string') &&
    (typeof typedObj['values'] === 'undefined' ||
      (((typedObj['values'] !== null && typeof typedObj['values'] === 'object') ||
        typeof typedObj['values'] === 'function') &&
        Object.entries<any>(typedObj['values']).every(([key, _value]) => typeof key === 'string')))
  );
};
