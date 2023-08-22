import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { CastEvent } from 'parser/core/Events';
import {
  getLeapingDamageEvents,
  getLeapingHealEvents,
  generatedEssenceBurst,
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

const SHOW_EB_GEN = false; // Needs more work before it can be shown
/**
 * Fire Breath causes your next Living Flame to strike 1 additional target per empower level.
 */
class LeapingFlames extends Analyzer {
  leapingFlamesDamage: number = 0;
  leapingFlamesHealing: number = 0;
  leapingFlamesOverHealing: number = 0;
  essenceBurstGenerated: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.LEAPING_FLAMES_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LIVING_FLAME_CAST),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    const damageEvents = getLeapingDamageEvents(event);

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

    if (damageEvents.length > 0) {
      damageEvents.forEach((damEvent) => {
        // If the target hit wasn't the main target we can safely assume it came from Leaping Flames
        if (damEvent.targetID !== event.targetID) {
          this.leapingFlamesDamage += damEvent.amount + (damEvent.absorbed ?? 0);
          // This solution is slightly broken for damage events due to
          // Blizzard sometimes giving the EB on hit, and sometimes on cast
          // Blizz pls fix
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
            this.essenceBurstGenerated += 1;
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
            {SHOW_EB_GEN && <li>Essence Burst Generated: {this.essenceBurstGenerated}</li>}
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
          {SHOW_EB_GEN && (
            <div>
              <Soup /> {this.essenceBurstGenerated}
              <small>
                {' '}
                <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} /> generated
              </small>
            </div>
          )}
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default LeapingFlames;
