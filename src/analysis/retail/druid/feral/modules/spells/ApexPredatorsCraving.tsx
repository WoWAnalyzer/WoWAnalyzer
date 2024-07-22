import SPELLS from 'common/SPELLS';
import { SpellLink, SpellIcon } from 'interface';
import CrossIcon from 'interface/icons/Cross';
import UpArrowIcon from 'interface/icons/UpArrow';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  DamageEvent,
  RefreshBuffEvent,
  CastEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { TALENTS_DRUID } from 'common/TALENTS';
import { formatPercentage } from 'common/format';
import { isConvoking } from 'analysis/retail/druid/shared/spells/ConvokeSpirits';
import { FB_SPELLS } from 'analysis/retail/druid/feral/constants';
import { getDamageHits } from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';
import { getSotfEnergize } from 'analysis/retail/druid/feral/normalizers/SoulOfTheForestLinkNormalizer';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';

const BUFFER_MS = 50;

// TODO track Sabertooth procs due to Apex bites - this may be a non-trivial part of the damage
/**
 * **Apex Predator's Craving**
 * Spec Talent
 *
 * Rip damage has a 6% chance to make your next Ferocious Bite free and deal the maximum damage.
 */
class ApexPredatorsCraving extends Analyzer {
  hasSotf: boolean;
  hasRf: boolean;

  buffsGained: number = 0;
  buffsUsed: number = 0;
  buffsOverwritten: number = 0;

  /** Damage directly from Apex procced bite */
  biteDamage: number = 0;
  /** Damage from Rampant Ferocity splash of an Apex bite */
  rampantFerocityDamage: number = 0;

  sotfEnergyGained: number = 0;
  sotfEnergyEffective: number = 0;
  sotfEnergyWasted: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.APEX_PREDATORS_CRAVING_TALENT);
    this.hasSotf = this.selectedCombatant.hasTalent(TALENTS_DRUID.SOUL_OF_THE_FOREST_FERAL_TALENT);
    this.hasRf = this.selectedCombatant.hasTalent(TALENTS_DRUID.RAMPANT_FEROCITY_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.APEX_PREDATORS_CRAVING_BUFF),
      this.onBuffApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.APEX_PREDATORS_CRAVING_BUFF),
      this.onBuffRefresh,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(FB_SPELLS), this.onFbCast);

    if (this.hasRf) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RAMPANT_FEROCITY),
        this.onRfDamage,
      );
    }
  }

  onBuffApply(_: ApplyBuffEvent) {
    this.buffsGained += 1;
  }

  onBuffRefresh(_: RefreshBuffEvent) {
    this.buffsGained += 1;
    this.buffsOverwritten += 1;
  }

  // Convoke'd bites don't interact with APC, so it's fine we're missing them here
  onFbCast(event: CastEvent) {
    if (
      this.selectedCombatant.hasBuff(
        SPELLS.APEX_PREDATORS_CRAVING_BUFF.id,
        event.timestamp,
        BUFFER_MS,
      )
    ) {
      this.buffsUsed += 1;
      const sotfEnergize = getSotfEnergize(event);
      if (sotfEnergize) {
        this.sotfEnergyGained += sotfEnergize.resourceChange;
        this.sotfEnergyWasted += sotfEnergize.waste;
        this.sotfEnergyEffective += sotfEnergize.resourceChange - sotfEnergize.waste;
      }
      getDamageHits(event).forEach((hit) => {
        // Ravage cleave hits are from consumable proc - should not be attributed to APC
        if (encodeEventTargetString(hit) === encodeEventTargetString(event)) {
          this.biteDamage += hit.amount + (hit.absorbed || 0);
        }
      });
    }
  }

  onRfDamage(event: DamageEvent) {
    if (
      !isConvoking(this.selectedCombatant) &&
      this.selectedCombatant.hasBuff(
        SPELLS.APEX_PREDATORS_CRAVING_BUFF.id,
        event.timestamp,
        BUFFER_MS,
      )
    ) {
      this.rampantFerocityDamage += event.amount + (event.absorbed || 0);
    }
  }

  get buffsActive() {
    return this.selectedCombatant.hasBuff(SPELLS.APEX_PREDATORS_CRAVING_BUFF.id) ? 1 : 0;
  }

  get buffsExpired() {
    return this.buffsGained - this.buffsUsed - this.buffsActive - this.buffsOverwritten;
  }

  get buffsGainedPerMinute() {
    return this.owner.getPerMinute(this.buffsGained);
  }

  get sotfEnergyEffectivePerMinute() {
    return this.owner.getPerMinute(this.sotfEnergyEffective);
  }

  get totalDamage() {
    return this.biteDamage + this.rampantFerocityDamage;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is the damage done by the free <SpellLink spell={SPELLS.FEROCIOUS_BITE} /> procced
            by Apex Predator's Craving
            {this.hasRf && (
              <>
                {' '}
                and the <SpellLink spell={SPELLS.RAMPANT_FEROCITY} /> splash from those free bites
              </>
            )}
            {this.hasSotf && (
              <>
                , and the effective energy gained due to{' '}
                <SpellLink spell={SPELLS.SOUL_OF_THE_FOREST_FERAL_ENERGY} /> from those bites
              </>
            )}
            . You gained <strong>{this.buffsGainedPerMinute.toFixed(1)} procs per minute</strong>,
            for a total of <strong>{this.buffsGained} procs</strong>:
            <ul>
              <li>
                <SpellIcon spell={SPELLS.FEROCIOUS_BITE} /> Used: <strong>{this.buffsUsed}</strong>
              </li>
              <li>
                <CrossIcon /> Overwritten: <strong>{this.buffsOverwritten}</strong>
              </li>
              <li>
                <UptimeIcon /> Expired: <strong>{this.buffsExpired}</strong>
              </li>
              {this.buffsActive > 0 && (
                <li>
                  Still active at fight end: <strong>{this.buffsActive}</strong>
                </li>
              )}
            </ul>
            {this.hasSotf && (
              <>
                Total <SpellLink spell={SPELLS.SOUL_OF_THE_FOREST_FERAL_ENERGY} /> energy gained
                from free bites was <strong>{this.sotfEnergyGained}</strong>.
                <ul>
                  <li>
                    <UpArrowIcon /> Effective: <strong>{this.sotfEnergyEffective}</strong>
                  </li>
                  <li>
                    <CrossIcon /> Wasted: <strong>{this.sotfEnergyWasted}</strong>
                  </li>
                </ul>
              </>
            )}
            {this.hasRf && (
              <>
                Breakdown between direct bite damage and from{' '}
                <SpellLink spell={SPELLS.RAMPANT_FEROCITY} />
                <ul>
                  <li>
                    <SpellLink spell={SPELLS.FEROCIOUS_BITE} />:{' '}
                    <strong>
                      {formatPercentage(
                        this.owner.getPercentageOfTotalDamageDone(this.biteDamage),
                        2,
                      )}
                      %
                    </strong>
                  </li>
                  <li>
                    <SpellLink spell={SPELLS.RAMPANT_FEROCITY} />:{' '}
                    <strong>
                      {formatPercentage(
                        this.owner.getPercentageOfTotalDamageDone(this.rampantFerocityDamage),
                        2,
                      )}
                      %
                    </strong>
                  </li>
                </ul>
              </>
            )}
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.APEX_PREDATORS_CRAVING_TALENT}>
          <ItemPercentDamageDone amount={this.totalDamage} />
          {this.hasSotf && (
            <>
              <br />
              <SpellIcon spell={SPELLS.SOUL_OF_THE_FOREST_FERAL_ENERGY} />{' '}
              {this.sotfEnergyEffectivePerMinute.toFixed(0)} <small>energy per minute</small>
            </>
          )}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ApexPredatorsCraving;
