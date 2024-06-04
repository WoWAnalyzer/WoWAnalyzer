/* This eslint-disable is here because this is the blessed way to modify event.meta */
/* eslint-disable wowanalyzer/event-meta-inefficient-cast */
import { MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react';
import { ReactNode } from 'react';
import { isMessageDescriptor } from 'localization/isMessageDescriptor';

import type { BeginChannelEvent, CastEvent, EventMeta } from './Events';

function MetaCastReason({
  originalReason,
  reason,
}: {
  originalReason: ReactNode;
  reason: ReactNode | MessageDescriptor;
}) {
  const { i18n } = useLingui();

  return (
    <>
      {originalReason ? (
        <>
          {originalReason}
          <br />
        </>
      ) : null}
      {isMessageDescriptor(reason) ? i18n._(reason) : reason}
    </>
  );
}

export function addInefficientCastReason(
  event: BeginChannelEvent | CastEvent,
  reason?: ReactNode | MessageDescriptor,
) {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_assignment
  event.meta ??= {};
  event.meta.isInefficientCast = true;
  if (!reason) {
    return;
  }
  event.meta.inefficientCastReason = (
    <MetaCastReason originalReason={event.meta.inefficientCastReason} reason={reason} />
  );
}

export function addEnhancedCastReason(
  event: BeginChannelEvent | CastEvent,
  reason?: ReactNode | MessageDescriptor,
) {
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing_assignment
  event.meta ??= {};
  event.meta.isEnhancedCast = true;
  if (!reason) {
    return;
  }
  event.meta.enhancedCastReason = (
    <MetaCastReason originalReason={event.meta.enhancedCastReason} reason={reason} />
  );
}

export function replace(event: BeginChannelEvent | CastEvent, meta: EventMeta) {
  event.meta = meta;
}
