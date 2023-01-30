import SPELLS from 'common/SPELLS';
import { SpellLink, SpellIcon } from 'interface';
import CrossIcon from 'interface/icons/Cross';
import UpArrowIcon from 'interface/icons/UpArrow';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  DamageEvent,
  ResourceChangeEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { TALENTS_DRUID } from 'common/TALENTS';
import { formatPercentage } from 'common/format';
import { isConvoking } from 'analysis/retail/druid/shared/spells/ConvokeSpirits';

const BUFFER_MS = 50;

// TODO track the Sabertooth Rip boost from Apex bites?
/**
 * **Apex Predator's Craving**
 * Spec Talent
 *
 * Rip damage has a 4% chance to make your next Ferocious Bite free and deal the maximum damage.
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

  lastSotf?: ResourceChangeEvent;
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
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE),
      this.onFbDamage,
    );

    if (this.hasSotf) {
      this.addEventListener(
        Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.SOUL_OF_THE_FOREST_FERAL_ENERGY),
        this.onSotfEnergize,
      );
    }
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

  onFbDamage(event: DamageEvent) {
    if (
      !isConvoking(this.selectedCombatant) &&
      this.selectedCombatant.hasBuff(
        SPELLS.APEX_PREDATORS_CRAVING_BUFF.id,
        event.timestamp,
        BUFFER_MS,
      )
    ) {
      this.buffsUsed += 1;
      this.biteDamage += event.amount + (event.absorbed || 0);
      // SotF energize actually seems to consistently come before the damage and on same timestamp
      if (this.lastSotf && this.lastSotf.timestamp === event.timestamp) {
        this.sotfEnergyGained += this.lastSotf.resourceChange;
        this.sotfEnergyWasted += this.lastSotf.waste;
        this.sotfEnergyEffective += this.lastSotf.resourceChange - this.lastSotf.waste;
      }
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

  onSotfEnergize(event: ResourceChangeEvent) {
    this.lastSotf = event;
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
            This is the damage done by the free <SpellLink id={SPELLS.FEROCIOUS_BITE.id} /> procced
            by Apex Predator's Craving
            {this.hasRf && (
              <>
                {' '}
                and the <SpellLink id={SPELLS.RAMPANT_FEROCITY.id} /> splash from those free bites
              </>
            )}
            {this.hasSotf && (
              <>
                , and the effective energy gained due to{' '}
                <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_FERAL_ENERGY.id} /> from those bites
              </>
            )}
            . You gained <strong>{this.buffsGainedPerMinute.toFixed(1)} procs per minute</strong>,
            for a total of <strong>{this.buffsGained} procs</strong>:
            <ul>
              <li>
                <SpellIcon id={SPELLS.FEROCIOUS_BITE.id} /> Used: <strong>{this.buffsUsed}</strong>
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
                Total <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_FERAL_ENERGY.id} /> energy gained
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
                <SpellLink id={SPELLS.RAMPANT_FEROCITY.id} />
                <ul>
                  <li>
                    <SpellLink id={SPELLS.FEROCIOUS_BITE.id} />:{' '}
                    <strong>
                      {formatPercentage(
                        this.owner.getPercentageOfTotalDamageDone(this.biteDamage),
                        2,
                      )}
                      %
                    </strong>
                  </li>
                  <li>
                    <SpellLink id={SPELLS.RAMPANT_FEROCITY.id} />:{' '}
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
        <BoringSpellValueText spellId={TALENTS_DRUID.APEX_PREDATORS_CRAVING_TALENT.id}>
          <ItemPercentDamageDone amount={this.totalDamage} />
          {this.hasSotf && (
            <>
              <br />
              <SpellIcon id={SPELLS.SOUL_OF_THE_FOREST_FERAL_ENERGY.id} />{' '}
              {this.sotfEnergyEffectivePerMinute.toFixed(0)} <small>energy per minute</small>
            </>
          )}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ApexPredatorsCraving;
