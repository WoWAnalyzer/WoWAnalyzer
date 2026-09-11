import {
  FORTIFYING_BREW_DR,
  FORTIFYING_BREW_IRONSHELL_DR,
  FORTIFYING_BREW_IRONSHELL_MAX_HEALTH_INCREASE,
  FORTIFYING_BREW_MAX_HEALTH_INCREASE,
} from 'analysis/retail/monk/shared/constants';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { SpellLink } from 'interface';
import {
  absoluteMitigation,
  buff,
  MajorDefensiveBuff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, DispelEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ReactNode } from 'react';

class FortifyingBrew extends MajorDefensiveBuff {
  lifeSavingEvents: DamageEvent[] = [];
  dispelledDebuffs: DispelEvent[] = [];
  hasDiffuseMagic = false;
  hasIronshell = false;
  drAmount = FORTIFYING_BREW_DR;
  maxHealthIncrease = FORTIFYING_BREW_MAX_HEALTH_INCREASE;
  // hp ratio at or below which the hit would have been fatal without fort brew
  hpThreshold = 0;

  constructor(options: Options) {
    super(SPELLS.FORTIFYING_BREW_CAST, buff(SPELLS.FORTIFYING_BREW_BUFF), options);

    this.active = this.selectedCombatant.hasTalent(talents.FORTIFYING_BREW_TALENT);

    this.hasDiffuseMagic = this.selectedCombatant.hasTalent(talents.DIFFUSE_MAGIC_TALENT);

    this.hasIronshell = this.selectedCombatant.hasTalent(talents.IRONSHELL_BREW_TALENT);
    if (this.hasIronshell) {
      this.drAmount = FORTIFYING_BREW_IRONSHELL_DR;
      this.maxHealthIncrease = FORTIFYING_BREW_IRONSHELL_MAX_HEALTH_INCREASE;
    }

    this.hpThreshold = 1 - 1 / (1 + this.maxHealthIncrease);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
    if (this.hasDiffuseMagic) {
      this.addEventListener(
        Events.dispel.by(SELECTED_PLAYER).spell(SPELLS.FORTIFYING_BREW_CAST),
        this.recordDispel,
      );
    }
  }

  private recordDamage(event: DamageEvent) {
    if (!this.defensiveActive(event)) return;

    this.recordMitigation({
      event,
      mitigatedAmount: absoluteMitigation(event, this.drAmount),
    });

    const hitPoints = event.hitPoints ?? NaN;
    const maxHitPoints = event.maxHitPoints ?? NaN;
    if (!Number.isFinite(hitPoints) || !Number.isFinite(maxHitPoints) || hitPoints <= 0) {
      return;
    }

    const currentHealthRatio = hitPoints / maxHitPoints;
    if (currentHealthRatio > this.hpThreshold) {
      return;
    }

    this.lifeSavingEvents.push(event);
  }

  private recordDispel(event: DispelEvent) {
    this.dispelledDebuffs.push(event);
  }

  description(): ReactNode {
    return (
      <>
        <p>
          <SpellLink spell={talents.FORTIFYING_BREW_TALENT} /> reduces damage taken by{' '}
          {formatPercentage(this.drAmount, 0)}% and increases your maximum health by{' '}
          {formatPercentage(this.maxHealthIncrease, 0)}% while active.
          {this.hasIronshell && (
            <>
              {' '}
              The damage reduction is increased by{' '}
              <SpellLink spell={talents.IRONSHELL_BREW_TALENT} />.
            </>
          )}
          {this.hasDiffuseMagic && (
            <>
              {' '}
              With <SpellLink spell={talents.DIFFUSE_MAGIC_TALENT} />, activating it also transfers
              all currently active harmful magical effects on you back to their caster if possible.
            </>
          )}
        </p>
        <p>Deaths prevented by the max health increase: {this.lifeSavingEvents.length}</p>
        {this.hasDiffuseMagic && (
          <p>Harmful magic effects removed: {this.dispelledDebuffs.length}</p>
        )}
      </>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }
}

export default FortifyingBrew;
