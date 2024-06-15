import { AnyEvent } from 'parser/core/Events';
import type { CooldownInfo } from '../SpellUsable';
import CombatLogParser from 'parser/core/CombatLogParser';
import { formatDuration } from 'common/format';

interface Props {
  cdInfo: CooldownInfo;
  event: AnyEvent;
  parser: CombatLogParser;
}

export default function SpellUsableDebugDescription({ cdInfo, event, parser }: Props): JSX.Element {
  return (
    <dl>
      <dt>Cooldown Started</dt>
      <dd>
        {formatDuration(cdInfo.overallStart - parser.fight.start_time)} (
        {formatDuration(event.timestamp - cdInfo.overallStart)} before this event)
      </dd>
      {cdInfo.maxCharges && (
        <>
          <dt>Most Recent Charge Started</dt>
          <dd>
            {formatDuration(cdInfo.chargeStart - parser.fight.start_time)} (
            {formatDuration(event.timestamp - cdInfo.chargeStart)} before this event)
          </dd>
          <dt>Max Charges</dt>
          <dd>{cdInfo.maxCharges}</dd>
        </>
      )}
      <dt>Expected Cooldown End</dt>
      <dd>
        {formatDuration(cdInfo.expectedEnd - parser.fight.start_time)} (
        {formatDuration(cdInfo.expectedEnd - event.timestamp, 2)} after this event)
      </dd>
      <dt>Current Expected Cooldown</dt>
      <dd>{formatDuration(cdInfo.currentRechargeDuration)}</dd>
    </dl>
  );
}
