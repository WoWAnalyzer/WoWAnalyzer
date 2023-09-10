import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { SpellLink, TooltipElement } from 'interface';
import {
  absoluteMitigation,
  buff,
  MajorDefensiveBuff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  DamageEvent,
  ResourceChangeEvent,
  DrainEvent,
  HealEvent,
} from 'parser/core/Events';
import BoringValue from 'parser/ui/BoringValueText';
import FooterChart, { Spec } from 'parser/ui/FooterChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ReactNode } from 'react';

type Hit = {
  amount: number;
  preAmount: number;
  relativeAmount: number;
  preRelativeAmount: number;
  drPercent: number;
  timestamp: number;
};

class DampenHarm extends MajorDefensiveBuff {
  currentMaxHP = 0;

  hitsMitigated: Hit[] = [];

  constructor(options: Options) {
    super(talents.DAMPEN_HARM_TALENT, buff(talents.DAMPEN_HARM_TALENT), options);

    this.active = this.selectedCombatant.hasTalent(talents.DAMPEN_HARM_TALENT);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.updateMaxHP);
    this.addEventListener(Events.resourcechange.by(SELECTED_PLAYER), this.updateMaxHP);
    this.addEventListener(Events.drain.to(SELECTED_PLAYER), this.updateMaxHP);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.updateMaxHP);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.damageReduction);
  }

  damageReduction(event: DamageEvent) {
    if (event.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      return;
    }
    if (!this.defensiveActive(event)) {
      return;
    }
    const maxHP = event.maxHitPoints || this.currentMaxHP;
    if (maxHP === 0) {
      return;
    }

    const h = event.amount || 0;
    const a = event.absorbed || 0;
    const o = event.overkill || 0;
    const hitSize = h + a + o;
    // the formula is:
    // dr = 1 - (0.2 + 0.3 * preHitSize / maxHp)
    // hitSize = preHitSize * dr
    //
    // we want to solve for dr, which requires finding preHitSize. plugging this into a solver because i cba to triple check my math, we have:
    //
    // preHitSize ~= 1/3 (4 * maxHp ± sqrt((2 * maxHp) * (8 * maxHp - 15 * hitSize)))
    const preHitSize =
      (4 * maxHP - Math.sqrt(2 * maxHP * Math.max(0, 8 * maxHP - 15 * hitSize))) / 3;
    const drdh = Math.min(0.5, 0.2 + (0.3 * preHitSize) / maxHP);

    this.hitsMitigated.push({
      amount: hitSize,
      preAmount: preHitSize,
      relativeAmount: hitSize / maxHP,
      preRelativeAmount: preHitSize / maxHP,
      drPercent: drdh,
      timestamp: event.timestamp,
    });

    const mitigatedAmount = absoluteMitigation(event, drdh);
    this.recordMitigation({
      event,
      mitigatedAmount,
    });
  }

  updateMaxHP(event: DamageEvent | ResourceChangeEvent | DrainEvent | HealEvent) {
    this.currentMaxHP = event.maxHitPoints || this.currentMaxHP;
  }

  private get spec() {
    const scale = 0.025;
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const spec = {
      layer: [
        {
          mark: { type: 'bar', tooltip: true },
          transform: [
            { calculate: `floor(datum.drPercent / ${scale})`, as: 'binIndex' },
            {
              aggregate: [{ op: 'count', as: 'count' }],
              groupby: ['binIndex'],
            },
            {
              calculate: `datum.binIndex * ${scale}`,
              as: 'drPercent',
            },
          ],
          encoding: {
            x: {
              field: 'drPercent',
              type: 'quantitative' as const,
              title: 'DR %',
              scale: { zero: true, domain: [scale, 0.5 + scale] },
              axis: {
                format: '~%',
              },
            },
            y: {
              field: 'count',
              type: 'quantitative' as const,
              title: '# of Hits',
              axis: {
                grid: false,
                format: '~k',
              },
              scale: {
                zero: true,
              },
            },
          },
        },
      ],
    } as Spec;
    return spec;
  }

  description(): ReactNode {
    return (
      <>
        <p>
          <SpellLink spell={talents.DAMPEN_HARM_TALENT} /> provides{' '}
          <TooltipElement
            hoverable
            content={
              <>
                The damage reduction is based on the amount of damage you'd take <em>after</em>{' '}
                applying Armor, Versatility, and Avoidance, but <em>before</em> reductions from
                absorbs like <SpellLink spell={SPELLS.STAGGER} />,{' '}
                <SpellLink spell={talents.CELESTIAL_BREW_TALENT} />, or{' '}
                <SpellLink spell={talents.LIFE_COCOON_TALENT} />.
              </>
            }
          >
            40-50% damage reduction
          </TooltipElement>{' '}
          in many common scenarios, making it quite powerful. However, it is very weak to{' '}
          <em>damage-over-time</em> effects, which are only reduced by around 20%.
        </p>
        <p>
          This will often be your first choice for planning cooldown usage because of its
          consistent, low cooldown and good damage reduction.
        </p>
      </>
    );
  }

  statistic(): ReactNode {
    const relevantHits = this.hitsMitigated.filter((hit) => hit.relativeAmount >= 0.05);
    const avgDr =
      relevantHits.reduce((total, hit) => total + hit.drPercent, 0) / relevantHits.length;
    const trueAvgDr =
      this.hitsMitigated.reduce((total, hit) => total + hit.drPercent, 0) /
      this.hitsMitigated.length;

    return (
      <>
        <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.TALENTS} />
        {relevantHits.length > 0 && (
          <Statistic
            category={STATISTIC_CATEGORY.TALENTS}
            size="flexible"
            tooltip={
              <>
                Mitigated {relevantHits.length} hits. Hits for less than 5% of max HP are excluded
                from average. When they are included, average damage reduction is{' '}
                {formatPercentage(trueAvgDr)}%
              </>
            }
          >
            <BoringValue
              label={
                <>
                  Avg <SpellLink spell={talents.DAMPEN_HARM_TALENT} /> DR
                </>
              }
            >
              {formatPercentage(avgDr)}%
            </BoringValue>
            <FooterChart spec={this.spec} data={relevantHits} />
          </Statistic>
        )}
      </>
    );
  }
}

export default DampenHarm;
