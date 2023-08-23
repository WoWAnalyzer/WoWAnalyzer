import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { CastEvent, GetRelatedEvents, HasRelatedEvent } from 'parser/core/Events';
import {
  getLeapingDamageEvents,
  getLeapingHealEvents,
  generatedEssenceBurst,
  getCastedGeneratedEssenceBurst,
  isFromLeapingFlames,
  getWastedEssenceBurst,
  ESSENCE_BURST_CAST_GENERATED,
  ESSENCE_BURST_GENERATED,
} from '../normalizers/LeapingFlamesNormalizer';

import { getPupilDamageEvents } from 'analysis/retail/evoker/augmentation/modules/normalizers/CastLinkNormalizer';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Soup from 'interface/icons/Soup';
import { SpellLink } from 'interface';
import SPECS from 'game/SPECS';
import { InformationIcon } from 'interface/icons';

/**
 * Fire Breath causes your next Living Flame to strike 1 additional target per empower level.
 */
class LeapingFlames extends Analyzer {
  leapingFlamesDamage: number = 0;
  leapingFlamesHealing: number = 0;
  leapingFlamesOverHealing: number = 0;
  essenceBurstGenerated: number = 0;
  essenceBurstWasted: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.LEAPING_FLAMES_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LIVING_FLAME_CAST),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    if (!isFromLeapingFlames(event)) {
      return;
    }

    const damageEvents = getLeapingDamageEvents(event);
    const damageHits = damageEvents.length;

    /** With Living Flame Essence Burst is for damage events generated on cast (for the most part)
     * and for heal events it's generated on hit.
     *
     * This obviously is not 100% correct, since you could generate two EB on cast
     * where neither came from original LF, buuuut it'll be accurate enough. */
    if (getCastedGeneratedEssenceBurst(event).length > 0) {
      const dragonrageActive = this.selectedCombatant.hasBuff(TALENTS.DRAGONRAGE_TALENT.id);
      /**
       * Dragonrage gives guranteed EB on hit, so we can only ever max generate one extra from Leaping during Dragonrage
       *
       * Case 1: We hit 3+ targets, Dragonrage isn't active, and we generated 2 EB on cast (We get 2+ extra chances to generated EB)
       * Case 2: We generated 2 EB (assumed that we hit 2+ targets since otherwise we couldn't actually generate 2 EB)
       * Case 3: 1 EB generated and we hit 2+ targets, and Dragonrage not active
       *
       * We will give some extra in favor of Leaping depending on target counts, since it does
       * increase the likelyhood of generating EB.
       * This is basicly done to account for the fact that we don't know if EB's comes from original LF
       * or Leaping LFs.
       */
      const extraHitFactor = 0.25;
      if (
        damageHits > 2 &&
        !dragonrageActive &&
        getCastedGeneratedEssenceBurst(event).length === 2
      ) {
        this.essenceBurstGenerated += 1 + damageHits * extraHitFactor;
      } else if (getCastedGeneratedEssenceBurst(event).length === 2) {
        this.essenceBurstGenerated += 1 + damageHits * extraHitFactor;
      } else if (damageHits > 1 && !dragonrageActive) {
        this.essenceBurstGenerated += 0 + damageHits * extraHitFactor;
      }
    }

    /** Much like the logic above, check the cast event and see if we wasted/overcapped EB
     * We basicly just check for amount of RefreshBuff events there were for EB, each one is an overcap */
    const hasAttunement = this.selectedCombatant.hasTalent(TALENTS.ESSENCE_ATTUNEMENT_TALENT); // This talent makes EB stack to 2 charges
    if (getCastedGeneratedEssenceBurst(event).length === 1 && hasAttunement) {
      this.essenceBurstWasted += Math.min(getWastedEssenceBurst(event).length, 1);
    } else if (getCastedGeneratedEssenceBurst(event).length === 0) {
      this.essenceBurstWasted += Math.min(
        getWastedEssenceBurst(event).length,
        hasAttunement ? 2 : 1,
      );
    }

    /** Logic needed to account for Pupil of Alexstraza for Augmentation
     * Pupil also sends out a cleave LF */
    let pupilDamage = 0;
    if (
      this.selectedCombatant.spec === SPECS.AUGMENTATION_EVOKER &&
      this.selectedCombatant.hasTalent(TALENTS.PUPIL_OF_ALEXSTRASZA_TALENT)
    ) {
      const pupilDamageEvents = getPupilDamageEvents(event);
      pupilDamageEvents.forEach((pupilDamageEvent) => {
        // Look for non maintarget pupil damage and keep track of it
        if (pupilDamageEvent.targetID !== event.targetID) {
          pupilDamage += pupilDamageEvent.amount + (pupilDamageEvent.absorbed ?? 0);
        }
      });
    }

    if (damageHits > 0) {
      damageEvents.forEach((damEvent) => {
        // If the target hit wasn't the main target we can safely assume it came from Leaping Flames
        if (damEvent.targetID !== event.targetID) {
          this.leapingFlamesDamage += damEvent.amount + (damEvent.absorbed ?? 0);
          if (generatedEssenceBurst(damEvent)) {
            this.essenceBurstGenerated += 1;
          }
        }
      });
      // Remove pupil damage from the total damage
      this.leapingFlamesDamage -= pupilDamage;
    }

    const healEvent = getLeapingHealEvents(event);
    if (healEvent.length > 0) {
      healEvent.forEach((healEvent) => {
        // If the target hit wasn't the main target we can safely assume it came from Leaping Flames
        if (healEvent.targetID !== event.targetID) {
          this.leapingFlamesHealing += healEvent.amount;
          this.leapingFlamesOverHealing += healEvent.overheal ?? 0;
          if (generatedEssenceBurst(healEvent)) {
            // This logic makes sure that we don't double count EB's
            // Events are weird but this solution works
            if (
              !HasRelatedEvent(
                GetRelatedEvents(healEvent, ESSENCE_BURST_GENERATED)[0],
                ESSENCE_BURST_CAST_GENERATED,
              )
            ) {
              this.essenceBurstGenerated += 1;
            }
          }
        }
      });
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.leapingFlamesDamage)}</li>
            <li>Healing: {formatNumber(this.leapingFlamesHealing)}</li>
            <li>Overhealing: {formatNumber(this.leapingFlamesOverHealing)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.LEAPING_FLAMES_TALENT}>
          <div>
            <ItemDamageDone amount={this.leapingFlamesDamage} />
          </div>
          <div>
            <ItemHealingDone amount={this.leapingFlamesHealing} />
          </div>
          <div>
            <Soup /> {Math.floor(this.essenceBurstGenerated)}
            <small>
              {' '}
              <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} /> generated
            </small>
          </div>
          <div>
            <InformationIcon /> {Math.floor(this.essenceBurstWasted)}
            <small>
              {' '}
              <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} /> wasted
            </small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default LeapingFlames;
