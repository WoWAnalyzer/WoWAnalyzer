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
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ReactNode } from 'react';

type Hit = {
  amount: number;
  relativeAmount: number;
  drPercent: number;
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
    let drdh = 0;
    // given 1 - u / h = 0.2 + 0.3 * u, where u = hit size after all other dr effecs, h = current max hp
    // the following can be then produced algebraically:
    if (hitSize >= maxHP / 2) {
      drdh = 0.5;
    } else {
      drdh = 0.6 - 0.5 * Math.sqrt(0.64 - (6 * hitSize) / (5 * maxHP));
    }

    this.hitsMitigated.push({
      amount: hitSize,
      relativeAmount: hitSize / maxHP,
      drPercent: drdh,
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
            size="flexible"
            tooltip={
              <>
                Mitigated {relevantHits.length} hits. Hits for less than 5% of max HP are excluded
                from average. When they are included, avg DR is {formatPercentage(trueAvgDr)}%
              </>
            }
          >
            <BoringValue
              label={
                <>
                  Average <SpellLink spell={talents.DAMPEN_HARM_TALENT} /> Damage Reduction
                </>
              }
            >
              {formatPercentage(avgDr)}%
            </BoringValue>
          </Statistic>
        )}
      </>
    );
  }
}

export default DampenHarm;
