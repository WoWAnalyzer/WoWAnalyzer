import { Trans } from '@lingui/react/macro';
import { formatDuration } from 'common/format';
import Icon from 'interface/Icon';
import SpellLink from 'interface/SpellLink';
import Tooltip from 'interface/Tooltip';
import { EventType } from 'parser/core/Events';
import AurasModule from 'parser/core/modules/Auras';
import { useCallback, useRef } from 'react';

import './Auras.scss';

interface Props {
  start: number;
  secondWidth: number;
  parser: {
    eventHistory: {
      type: string;
    }[];
    toPlayer: (event: any) => boolean;
  };
  auras: AurasModule;
  style?: React.CSSProperties;
  visibleAuras?: Set<number>;
}
const Auras = ({ start, secondWidth, parser, auras, style, visibleAuras }: Props) => {
  const appliedRef = useRef<Record<number, any>>({});
  const levelsRef = useRef<Array<number | undefined>>([]);
  const maxLevelRef = useRef(0);

  const getOffsetLeft = useCallback(
    (timestamp: number) => ((timestamp - start) / 1000) * secondWidth,
    [start, secondWidth],
  );

  const getLevel = () => {
    let lvl = 0;
    while (levelsRef.current[lvl] !== undefined) lvl++;
    return lvl;
  };

  // TODO: Fabricate removebuff events for buffs that expired after the fight

  const isApplicable = (event: any, isDebuff: boolean) => {
    if (!parser.toPlayer(event)) return false;

    const spellId = event.ability.guid;
    const buff = auras.getAura(spellId);
    if (!buff || !buff.timelineHighlight) return false;

    if (visibleAuras && !visibleAuras.has(spellId)) return false;

    return true;
  };

  const renderIcon = (
    event: any,
    {
      className = '',
      style = {},
      children,
    }: { className?: string; style?: React.CSSProperties; children?: React.ReactNode } = {},
  ) => {
    const left = getOffsetLeft(event.timestamp);

    return (
      <SpellLink
        key={`cast-${left}-${event.ability.guid}`}
        spell={event.ability.guid}
        icon={false}
        className={`cast ${className}`}
        style={{ left, ...style }}
      >
        <Icon icon={event.ability.abilityIcon.replace('.jpg', '')} alt={event.ability.name} />
        {children}
      </SpellLink>
    );
  };

  const renderApplyAura = (event: any) => {
    const spellId = event.ability.guid;
    const level = getLevel();

    appliedRef.current[spellId] = event;
    levelsRef.current[level] = spellId;
    maxLevelRef.current = Math.max(maxLevelRef.current, level);

    return renderIcon(event, {
      className: 'hoist',
      style: { '--level': level } as React.CSSProperties,
      children: <div className="time-indicator" />,
    });
  };

  const renderRemoveAura = (event: any) => {
    const applied = appliedRef.current[event.ability.guid];
    if (!applied) return null;

    const left = getOffsetLeft(applied.timestamp);
    const duration = event.timestamp - applied.timestamp;
    const fightDuration = applied.timestamp - start;

    const level = levelsRef.current.indexOf(event.ability.guid);
    levelsRef.current[level] = undefined;
    delete appliedRef.current[event.ability.guid];

    return (
      <Tooltip
        key={`buff-${left}-${event.ability.guid}`}
        content={
          <Trans id="interface.report.results.timeline.buffs.tooltip.gainedAbilityForXSec">
            {formatDuration(fightDuration, 3)}: gained {event.ability.name} for{' '}
            {(duration / 1000).toFixed(2)}s
          </Trans>
        }
      >
        <div
          className="aura hoist"
          style={
            {
              left,
              width: (duration / 1000) * secondWidth,
              '--level': level,
            } as React.CSSProperties
          }
          data-effect="float"
        />
      </Tooltip>
    );
  };

  const renderLeftOverAuras = (event: { timestamp: number; ability: { guid: number } }) => {
    return Object.keys(appliedRef.current).map((id) =>
      renderRemoveAura({
        ...appliedRef.current[+id],
        timestamp: event.timestamp,
      }),
    );
  };

  const renderEvent = (event: any) => {
    switch (event.type) {
      case EventType.ApplyBuff:
        return isApplicable(event, false) ? renderApplyAura(event) : null;

      case EventType.RemoveBuff:
        return isApplicable(event, false) ? renderRemoveAura(event) : null;

      case EventType.ApplyDebuff:
        return isApplicable(event, true) ? renderApplyAura(event) : null;

      case EventType.RemoveDebuff:
        return isApplicable(event, true) ? renderRemoveAura(event) : null;

      case EventType.FightEnd:
        return renderLeftOverAuras(event);

      default:
        return null;
    }
  };
  const rendered = parser.eventHistory.map(renderEvent);

  return (
    <div
      className="auras"
      style={
        {
          '--levels': maxLevelRef.current + 1,
          ...style,
        } as React.CSSProperties
      }
    >
      {rendered}
    </div>
  );
};

export default Auras;
