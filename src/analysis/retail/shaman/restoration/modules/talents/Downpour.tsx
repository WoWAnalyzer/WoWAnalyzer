import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import { TooltipElement } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent, CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import StatisticListBoxItem from 'parser/ui/StatisticListBoxItem';

import RestorationAbilityTracker from '../core/RestorationAbilityTracker';
import CooldownThroughputTracker from '../features/CooldownThroughputTracker';

const BUFFER = 100;
const cooldownIncrease = 5000;
const UNLEASH_LIFE_DURATION = 10000;

/**
 * CD changes depending on amount of effective targets hit (0 = 5s, 8 = 45)
 */

class Downpour extends Analyzer {
  static dependencies = {
    cooldownThroughputTracker: CooldownThroughputTracker,
    spellUsable: SpellUsable,
    abilityTracker: RestorationAbilityTracker,
  };

  protected cooldownThroughputTracker!: CooldownThroughputTracker;
  protected spellUsable!: SpellUsable;
  protected abilityTracker!: RestorationAbilityTracker;

  healing = 0;
  downpourHits = 0;
  downpourHitsSum = 0;
  downpourTimestamp = 0;
  maxHits = 6;
  unleashLifeRemaining = false;
  lastUnleashLifeTimestamp: number = Number.MAX_SAFE_INTEGER;

  unleashLifeSpells = {
    [TALENTS.RIPTIDE_TALENT.id]: {},
    [TALENTS.CHAIN_HEAL_TALENT.id]: {},
    [TALENTS.HEALING_WAVE_TALENT.id]: {},
    [SPELLS.HEALING_SURGE.id]: {},
    [TALENTS.WELLSPRING_TALENT.id]: {},
    [TALENTS.HEALING_RAIN_TALENT.id]: {},
    [TALENTS.DOWNPOUR_TALENT.id]: {},
  };

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DOWNPOUR_TALENT);

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this._onHeal);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this._onCast);
  }

  _onHeal(event: HealEvent) {
    // This spells cooldown gets increased depending on how many targets you heal
    // instead we set it to the maximum possible cooldown and reduce it by how many it fully overhealed or missed
    if (this.downpourTimestamp && event.timestamp > this.downpourTimestamp + BUFFER) {
      const reductionMS = (this.maxHits - this.downpourHits) * cooldownIncrease;
      this.spellUsable.reduceCooldown(TALENTS.DOWNPOUR_TALENT.id, reductionMS);
      this.downpourTimestamp = 0;
      this.downpourHits = 0;
      this.maxHits = 6;
    }

    const spellId = event.ability.guid;
    if (spellId !== TALENTS.DOWNPOUR_TALENT.id) {
      return;
    }

    if (event.amount) {
      this.downpourHits += 1;
      this.downpourHitsSum += 1;
    }

    this.downpourTimestamp = event.timestamp;
    this.healing += event.amount + (event.absorbed || 0);
  }

  _onCast(event: CastEvent) {
    const spellId = event.ability.guid;

    if (spellId === TALENTS.DOWNPOUR_TALENT.id && this.unleashLifeRemaining === true) {
      this.maxHits = 8;
    }

    if (spellId === TALENTS.UNLEASH_LIFE_TALENT.id) {
      this.unleashLifeRemaining = true;
      this.lastUnleashLifeTimestamp = event.timestamp;
    }

    if (
      this.unleashLifeRemaining &&
      this.lastUnleashLifeTimestamp + UNLEASH_LIFE_DURATION <= event.timestamp
    ) {
      this.unleashLifeRemaining = false;
      return;
    }

    if (this.unleashLifeRemaining) {
      if (this.unleashLifeSpells[spellId]) {
        this.unleashLifeRemaining = false;
      }
    }
  }

  statistic() {
    const downpour = this.abilityTracker.getAbility(TALENTS.DOWNPOUR_TALENT.id);

    const downpourCasts = downpour.casts;
    if (!downpourCasts) {
      return null;
    }
    // downpourHits are all hits and downpourHitsSum are only the ones with effective healing done
    const downpourHits = downpour.healingHits;
    const downpourAverageHits = this.downpourHitsSum / downpourCasts;
    const downpourAverageOverhealedHits = (downpourHits - this.downpourHitsSum) / downpourCasts;
    const downpourAverageCooldown = 5 + (this.downpourHitsSum / downpourCasts) * 5;

    return (
      <StatisticBox
        icon={<SpellIcon id={TALENTS.DOWNPOUR_TALENT.id} />}
        value={<>{downpourAverageCooldown.toFixed(1)} seconds</>}
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(90)}
        label={
          <TooltipElement
            content={
              <>
                You cast a total of {downpourCasts} Downpours, which on average hit{' '}
                {(downpourAverageHits + downpourAverageOverhealedHits).toFixed(1)} out of 6 targets.
                Keep in mind, that Unleash Life can increase the maximum number of targets by 2.
                <br />
                Of those hits, {downpourAverageHits.toFixed(1)} had effective healing and increased
                the cooldown.
              </>
            }
          >
            <>Average Downpour cooldown</>
          </TooltipElement>
        }
      />
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={TALENTS.DOWNPOUR_TALENT.id} />}
        value={`${formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.healing))} %`}
      />
    );
  }
}

export default Downpour;
