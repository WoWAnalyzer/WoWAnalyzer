import styled from '@emotion/styled';
import { formatDuration, formatNumber } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import { Talent } from 'common/TALENTS/types';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import { SpellLink, Tooltip } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AnyEvent, ApplyBuffEvent, DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ReactNode } from 'react';

export type MitigatedEvent = {
  event: AnyEvent;
  mitigatedAmount: number;
};

export type DefensiveOptions = {
  talent: Talent;
  buffSpell?: Spell;
};

export type Mitigation = {
  start: ApplyBuffEvent;
  end: RemoveBuffEvent;
  mitigated: MitigatedEvent[];
  amount: number;
};

export type MitigationSegment = {
  amount: number;
  color: string;
  tooltip: ReactNode;
};

export function absoluteMitigation(event: DamageEvent, mitPct: number): number {
  const actualAmount = event.amount + (event.absorbed ?? 0) + (event.overkill ?? 0);
  const priorAmount = actualAmount * (1 / (1 - mitPct));
  return priorAmount - actualAmount;
}

const MitigationTooltipBody = 'div';
const MitigationSegmentContainer = styled.div`
  height: 1em;
  text-align: left;
`;
const MitigationRowContainer = styled.div`
  display: grid;
  grid-template-columns: 2em 2em 1fr;
  gap: 1em;
  align-items: center;
  min-width: 150px;

  line-height: 1em;
  text-align: right;

  padding-bottom: 0.5em;
`;

// we use content-box sizing with a border because that makes the hitbox bigger, so it is easier to read the tooltips.
const MitigationTooltipSegment = styled.div<{ color: string; width: number }>`
  background-color: ${(props) => props.color};
  width: ${(props) => Math.max(2, props.width * 95)}%;
  height: 100%;
  display: inline-block;
  box-sizing: content-box;
  border-left: 1px solid #000;
`;

const MitigationRow = ({
  mitigation,
  segments,
  maxValue,
  fightStart,
}: {
  mitigation: Mitigation;
  segments: MitigationSegment[];
  maxValue: number;
  fightStart: number;
}) => {
  return (
    <MitigationRowContainer>
      <div>{formatDuration(mitigation.start.timestamp - fightStart)}</div>
      <div>{formatNumber(mitigation.amount)}</div>
      <MitigationSegmentContainer>
        {segments.map((seg, ix) => (
          <Tooltip
            content={
              <>
                {seg.tooltip} - {formatNumber(seg.amount)}
              </>
            }
            key={ix}
          >
            <MitigationTooltipSegment color={seg.color} width={seg.amount / maxValue} />
          </Tooltip>
        ))}
      </MitigationSegmentContainer>
    </MitigationRowContainer>
  );
};

export class MajorDefensive extends Analyzer {
  private lastApply?: ApplyBuffEvent;
  private currentMitigation?: MitigatedEvent[];

  private mitigations: Mitigation[] = [];

  private talent: Talent;
  private buff: Spell;

  constructor({ talent, buffSpell }: DefensiveOptions, options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(talent);
    this.talent = talent;
    this.buff = buffSpell ?? talent;

    this.addEventListener(Events.applybuff.spell(this.buff).by(SELECTED_PLAYER), this.onApply);
    this.addEventListener(Events.removebuff.spell(this.buff).by(SELECTED_PLAYER), this.onRemove);
  }

  protected recordMitigation(mitigation: MitigatedEvent) {
    this.currentMitigation?.push(mitigation);
  }

  private onApply(event: ApplyBuffEvent) {
    this.lastApply = event;
    this.currentMitigation = [];
  }

  private onRemove(event: RemoveBuffEvent) {
    if (!this.lastApply || !this.currentMitigation) {
      // no apply, nothing we can do. probably looking at a slice of a log
      return;
    }

    this.mitigations.push({
      start: this.lastApply,
      end: event,
      mitigated: this.currentMitigation,
      amount: this.currentMitigation
        .map((event) => event.mitigatedAmount)
        .reduce((a, b) => a + b, 0),
    });
    this.lastApply = undefined;
    this.currentMitigation = undefined;
  }

  get defensiveActive(): boolean {
    return this.lastApply !== undefined;
  }

  mitigationSegments(mit: Mitigation): MitigationSegment[] {
    return [
      {
        amount: mit.amount,
        color: color(MAGIC_SCHOOLS.ids.PHYSICAL),
        tooltip: 'Damage Mitigated',
      },
    ];
  }

  statistic(): ReactNode {
    const tooltip = (
      <MitigationTooltipBody>
        <MitigationRowContainer>
          <strong>Time</strong>
          <strong>Mit.</strong>
        </MitigationRowContainer>
        {this.mitigations.map((mit) => (
          <MitigationRow
            mitigation={mit}
            segments={this.mitigationSegments(mit)}
            fightStart={this.owner.fight.start_time}
            maxValue={Math.max.apply(
              null,
              this.mitigations.map((mit) => mit.amount),
            )}
            key={mit.start.timestamp}
          />
        ))}
      </MitigationTooltipBody>
    );
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible" tooltip={tooltip}>
        <BoringValue
          label={
            <>
              <SpellLink id={this.talent} /> Damage Mitigated
            </>
          }
        >
          <img alt="Damage Mitigated" src="/img/shield.png" className="icon" />{' '}
          {formatNumber(
            this.mitigations
              .flatMap((mit) => mit.mitigated.map((event) => event.mitigatedAmount))
              .reduce((a, b) => a + b, 0),
          )}
        </BoringValue>
      </Statistic>
    );
  }
}
