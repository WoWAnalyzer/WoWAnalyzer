import { MessageDescriptor } from '@lingui/core';

// This is kind of ugly but I generated it, so I'm keeping it for now.
export const isMessageDescriptor = (obj: unknown): obj is MessageDescriptor => {
  if (typeof obj !== 'object' || obj === null) {
    return false;
  }

  const requiredProperties = ['id'];
  const optionalProperties = ['comment', 'message', 'values'];

  for (const prop of requiredProperties) {
    if (!(prop in obj) || typeof (obj as Record<string, unknown>)[prop] !== 'string') {
      return false;
    }
  }

  for (const prop of optionalProperties) {
    if (prop in obj) {
      if (prop === 'values') {
        const value = (obj as Record<string, unknown>)[prop];
        if (!(value instanceof Object || Array.isArray((obj as Record<string, unknown>)[prop]))) {
          return false;
        }
      } else if (typeof (obj as Record<string, unknown>)[prop] !== 'string') {
        return false;
      }
    }
  }

  return true;
};
