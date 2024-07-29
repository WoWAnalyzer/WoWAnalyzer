import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';
import { hasLunar, hasSolar } from 'analysis/retail/druid/balance/constants';
import {
  hardcastApGenerated,
  hardcastGetHits,
} from 'analysis/retail/druid/balance/normalizers/CastLinkNormalizer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { ResourceIcon, SpellIcon } from 'interface';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';

const WRATH_BONUS_AP = 0.6;
const STARFIRE_BONUS_PER_ADDITIONAL_HIT = 0.2;
const STARFIRE_MAX_HITS = 3;

/**
 * **Soul of the Forest**
 * Spec Talent
 *
 * Solar Eclipse increases Wrath's Astral Power generation by 60% and Lunar Eclipse increases
 * Starfire's damage and Astral Power generation by 20% for each target hit beyond the first, up to 60%.
 */
class SoulOfTheForest extends Analyzer {
  wrathAp = 0;
  starfireAp = 0;
  starfireDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.SOUL_OF_THE_FOREST_BALANCE_TALENT);

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.WRATH_MOONKIN),
      this.onWrathEnergize,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STARFIRE),
      this.onStarfireCast,
    );
  }

  onWrathEnergize(event: ResourceChangeEvent) {
    if (
      event.resourceChangeType === RESOURCE_TYPES.ASTRAL_POWER.id &&
      hasSolar(this.selectedCombatant)
    ) {
      this.wrathAp += this.calculateApGain(event, WRATH_BONUS_AP);
    }
  }

  onStarfireCast(event: CastEvent) {
    if (!hasLunar(this.selectedCombatant)) {
      return;
    }
    const hits = hardcastGetHits(event);
    const energize = hardcastApGenerated(event);
    if (energize && hits.length > 0) {
      const maxTargetBenefit = Math.min(hits.length - 1, STARFIRE_MAX_HITS);
      const bonus = maxTargetBenefit * STARFIRE_BONUS_PER_ADDITIONAL_HIT;
      this.starfireAp += this.calculateApGain(energize, bonus);
      if (bonus > 0) {
        hits.forEach((hit) => (this.starfireDamage += calculateEffectiveDamage(hit, bonus)));
      }
    } else {
      console.warn(
        `Unable to get hits (${hits.length}) or energize (${energize}) for Starfire hardcast`,
      );
    }
  }

  private calculateApGain(event: ResourceChangeEvent, bonus: number): number {
    //event.resourceChange contains the AP gained including modifiers, we need to calculate it back
    const apBeforeGain = event.resourceChange / (1 + bonus);
    return apBeforeGain * bonus;
  }

  get totalAp() {
    return this.wrathAp + this.starfireAp;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(7)} size="flexible">
        <TalentSpellText talent={TALENTS_DRUID.SOUL_OF_THE_FOREST_BALANCE_TALENT}>
          <>
            <ResourceIcon id={RESOURCE_TYPES.ASTRAL_POWER.id} />{' '}
            {formatNumber(this.owner.getPerMinute(this.totalAp))}{' '}
            <small>Astral Power per minute</small>
            <br />
            <SpellIcon spell={SPELLS.STARFIRE} noLink />{' '}
            <ItemPercentDamageDone amount={this.starfireDamage} />
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SoulOfTheForest;
