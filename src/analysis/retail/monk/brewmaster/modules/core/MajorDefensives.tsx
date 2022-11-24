import Spell from 'common/SPELLS/Spell';
import talents from 'common/TALENTS/monk';
import { Talent } from 'common/TALENTS/types';
import { Section, SubSection, useInfo } from 'interface/guide';
import Explanation from 'interface/guide/components/Explanation';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AddStaggerEvent,
  AnyEvent,
  ApplyBuffEvent,
  DamageEvent,
  EventType,
  RemoveBuffEvent,
  RemoveStaggerEvent,
} from 'parser/core/Events';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { ReactNode } from 'react';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatDuration, formatNumber } from 'common/format';
import BoringValue from 'parser/ui/BoringValueText';
import { SpellLink, Tooltip } from 'interface';
import EventFilter from 'parser/core/EventFilter';
import SPELLS from 'common/SPELLS';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import styled from '@emotion/styled';

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

const MAJOR_DEFENSIVES = [
  talents.CELESTIAL_BREW_TALENT,
  talents.FORTIFYING_BREW_TALENT,
  talents.DAMPEN_HARM_TALENT,
  talents.DIFFUSE_MAGIC_TALENT,
  talents.ZEN_MEDITATION_TALENT,
];

export class ZenMeditation extends MajorDefensive {
  constructor(options: Options) {
    super({ talent: talents.ZEN_MEDITATION_TALENT }, options);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    if (this.defensiveActive && !event.sourceIsFriendly) {
      this.recordMitigation({
        event,
        mitigatedAmount: absoluteMitigation(event, 0.6),
      });
    }
  }
}

export class FortifyingBrew extends MajorDefensive {
  private fortBrewStaggerPool: number = 0;
  private hasGaiPlins = false;

  constructor(options: Options) {
    super(
      { talent: talents.FORTIFYING_BREW_TALENT, buffSpell: SPELLS.FORTIFYING_BREW_BRM_BUFF },
      options,
    );

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);

    if (this.selectedCombatant.hasTalent(talents.FORTIFYING_BREW_DETERMINATION_TALENT)) {
      this.addEventListener(new EventFilter(EventType.AddStagger), this.recordStagger);
      this.addEventListener(new EventFilter(EventType.RemoveStagger), this.recordPurify);

      this.hasGaiPlins = this.selectedCombatant.hasTalent(talents.GAI_PLINS_IMPERIAL_BREW_TALENT);
    }
  }

  private recordDamage(event: DamageEvent) {
    if (this.defensiveActive && !event.sourceIsFriendly) {
      this.recordMitigation({
        event,
        mitigatedAmount: absoluteMitigation(event, 0.2),
      });
    }
  }

  private recordStagger(event: AddStaggerEvent) {
    if (this.defensiveActive) {
      this.fortBrewStaggerPool += 0.15 * event.amount;
    }
  }

  private recordPurify(event: RemoveStaggerEvent) {
    // we don't use a fixed 50% for this because it could be mitigated by Staggering Strikes or one of the other related talents.
    const purifyRatio = event.amount / (event.amount + event.newPooledDamage);
    const purifyAmount = Math.ceil(purifyRatio * this.fortBrewStaggerPool);

    if (this.defensiveActive && event.trigger?.ability.guid !== SPELLS.STAGGER_TAKEN.id) {
      this.recordMitigation({
        event,
        mitigatedAmount: purifyAmount * (this.hasGaiPlins ? 1.25 : 1),
      });
    }

    this.fortBrewStaggerPool = Math.max(0, this.fortBrewStaggerPool - purifyAmount);
  }

  mitigationSegments(mit: Mitigation): MitigationSegment[] {
    const damage = mit.mitigated
      .filter((event) => event.event.type === EventType.Damage)
      .map((event) => event.mitigatedAmount)
      .reduce((a, b) => a + b, 0);

    const purifyBase = mit.mitigated
      .filter((event) => event.event.type === EventType.RemoveStagger)
      .map((event) => event.mitigatedAmount)
      .reduce((a, b) => a + b, 0);

    let purify = purifyBase;
    let gaiPlins = 0;
    if (this.hasGaiPlins) {
      purify = purifyBase / 1.25;
      gaiPlins = purifyBase - purify;
    }

    return [
      {
        amount: damage,
        color: color(MAGIC_SCHOOLS.ids.PHYSICAL),
        tooltip: (
          <>
            Base <SpellLink id={talents.FORTIFYING_BREW_TALENT} />
          </>
        ),
      },
      {
        amount: purify,
        color: 'rgb(112, 181, 112)',
        tooltip: <SpellLink id={talents.FORTIFYING_BREW_DETERMINATION_TALENT} />,
      },
      {
        amount: gaiPlins,
        color: color(MAGIC_SCHOOLS.ids.HOLY),
        tooltip: <SpellLink id={talents.GAI_PLINS_IMPERIAL_BREW_TALENT} />,
      },
    ].filter((seg) => seg.amount > 0);
  }
}

export default function MajorDefensivesSection(): JSX.Element | null {
  const info = useInfo();

  if (!info) {
    return null;
  }

  return (
    <Section title="Major Defensives">
      <Explanation>
        In Dragonflight, Brewmaster Monk has gained multiple major defensive cooldowns. Using these
        effectively is critical for your survival, especially while undergeared.
      </Explanation>
      <SubSection>
        {MAJOR_DEFENSIVES.map(
          (talent) =>
            info.combatant.hasTalent(talent) && (
              <CastEfficiencyBar
                spellId={talent.id}
                gapHighlightMode={GapHighlight.FullCooldown}
                useThresholds
                key={talent.id}
              />
            ),
        )}
      </SubSection>
    </Section>
  );
}
