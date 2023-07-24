import { CastEvent } from './Events';

export const addInefficenetCastReason = (event: CastEvent, reason?: React.ReactNode) => {
  const meta = (event.meta = event.meta || {});
  meta.isInefficientCast = true;
  if (!reason) {
    return;
  }
  meta.inefficientCastReason = (
    <>
      {meta.inefficientCastReason ? (
        <>
          {meta.inefficientCastReason}
          <br />
        </>
      ) : null}
      {reason}
    </>
  );
};

export const addEnhancedCastReason = (event: CastEvent, reason?: React.ReactNode) => {
  const meta = (event.meta = event.meta || {});
  meta.isEnhancedCast = true;
  if (!reason) {
    return;
  }
  meta.enhancedCastReason = (
    <>
      {meta.enhancedCastReason ? (
        <>
          {meta.enhancedCastReason}
          <br />
        </>
      ) : null}
      {reason}
    </>
  );
};
