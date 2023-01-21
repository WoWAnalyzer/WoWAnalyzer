import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import { Options } from 'parser/core/Module';
import SPELLS from 'common/SPELLS';
import Events, {
  ApplyBuffEvent,
  ApplyDebuffEvent,
  DamageEvent,
  RefreshDebuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import {
  getSuddenAmbushBoostedDamage,
  isBoostedBySuddenAmbush,
} from 'analysis/retail/druid/feral/normalizers/SuddenAmbushLinkNormalizer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { PROWL_RAKE_DAMAGE_BONUS } from 'analysis/retail/druid/feral/constants';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { SpellIcon, SpellLink } from 'interface';
import CrossIcon from 'interface/icons/Cross';
import UptimeIcon from 'interface/icons/Uptime';
import { formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';

/**
 * **Sudden Ambush**
 * Spec Talent
 *
 * Finishing moves have a (5 / 10)% chance per combo point spent to make your next Rake or Shred
 * deal damage as though you were stealthed.
 */
class SuddenAmbush extends Analyzer {
  /** Number of shreads boosted by SA */
  boostedShreds = 0;
  /** Number of rakes boosted by SA */
  boostedRakes = 0;
  /** Total damage added to Shred by SA boost */
  boostedShredDamage = 0;
  /** Total damage added to Rake by SA boost */
  boostedRakeDamage = 0;

  /** SA buffs gained */
  saGained = 0;
  /** SA buffs used */
  saUsed = 0;
  /** SA buffs expired */
  saExpired = 0;
  /** SA buffs overwritten */
  saOverwritten = 0;

  /** Set of targets for whom the last applied Rake was boosted by SA */
  saBoostedRakeTargets: Set<string> = new Set<string>();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.SUDDEN_AMBUSH_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_AMBUSH_BUFF),
      this.onGainSa,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_AMBUSH_BUFF),
      this.onUseSa,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.SUDDEN_AMBUSH_BUFF),
      this.onOverwriteSa,
    );

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.RAKE_BLEED),
      this.onApplyRake,
    );
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.RAKE_BLEED),
      this.onApplyRake,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RAKE_BLEED),
      this.onRakeBleedDamage,
    );
  }

  onGainSa(event: ApplyBuffEvent) {
    this.saGained += 1;
  }

  onUseSa(event: RemoveBuffEvent) {
    const boostedDamageEvents: DamageEvent[] = getSuddenAmbushBoostedDamage(event);
    if (boostedDamageEvents.length === 0) {
      this.saExpired += 1;
    } else {
      this.saUsed += 1;
      // with Double Clawed Rake, possible more than one damage event is boosted
      boostedDamageEvents.forEach((d) => {
        if (d.ability.guid === SPELLS.SHRED.id) {
          this.boostedShreds += 1;
          this.boostedShredDamage += calculateEffectiveDamage(d, PROWL_RAKE_DAMAGE_BONUS);
        } else if (d.ability.guid === SPELLS.RAKE.id) {
          this.boostedRakes += 1;
          this.boostedRakeDamage += calculateEffectiveDamage(d, PROWL_RAKE_DAMAGE_BONUS);
        }
      });
    }
  }

  onOverwriteSa() {
    this.saOverwritten += 1;
  }

  onApplyRake(event: ApplyDebuffEvent | RefreshDebuffEvent) {
    if (isBoostedBySuddenAmbush(event)) {
      this.saBoostedRakeTargets.add(encodeEventTargetString(event) || '');
    } else {
      this.saBoostedRakeTargets.delete(encodeEventTargetString(event) || '');
    }
  }

  onRakeBleedDamage(event: DamageEvent) {
    if (this.saBoostedRakeTargets.has(encodeEventTargetString(event) || '')) {
      this.boostedRakeDamage += calculateEffectiveDamage(event, PROWL_RAKE_DAMAGE_BONUS);
    }
  }

  get saEnding() {
    return this.saGained - this.saUsed - this.saExpired - this.saOverwritten;
  }

  get saUtil() {
    return this.saGained === 0 ? 0 : this.saUsed / (this.saGained - this.saEnding);
  }

  get totalDamage() {
    return this.boostedRakeDamage + this.boostedShredDamage;
  }

  statistic() {
    const hasDcr = this.selectedCombatant.hasTalent(TALENTS_DRUID.DOUBLE_CLAWED_RAKE_TALENT);
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(3)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is the damage from the increase to Shred and Rake damage caused by Sudden Ambush
            procs. This underrates the total benefit of Sudden Ambush because it does not count the
            increased crit chance and additional combo point from Shred.
            <br />
            <br />
            Buff Utilization: <strong>{formatPercentage(this.saUtil, 1)}%</strong>
            <ul>
              <li>
                <SpellIcon id={TALENTS_DRUID.SUDDEN_AMBUSH_TALENT.id} /> Used:{' '}
                <strong>{this.saUsed}</strong>
              </li>
              <li>
                <CrossIcon /> Overwritten: <strong>{this.saOverwritten}</strong>
              </li>
              <li>
                <UptimeIcon /> Expired: <strong>{this.saExpired}</strong>
              </li>
              {this.saEnding > 0 && (
                <li>
                  Still active at fight end: <strong>{this.saEnding}</strong>
                </li>
              )}
            </ul>
            <br />
            Breakdown by spell{' '}
            {hasDcr && (
              <>
                (possibly more hits than uses due to{' '}
                <SpellLink id={TALENTS_DRUID.DOUBLE_CLAWED_RAKE_TALENT.id} />)
              </>
            )}
            :
            <ul>
              <li>
                <SpellLink id={SPELLS.SHRED.id} />: Boosted <strong>{this.boostedShreds}</strong>{' '}
                hits for{' '}
                <strong>&gt;{this.owner.formatItemDamageDone(this.boostedShredDamage)}</strong>
              </li>
              <li>
                <SpellLink id={SPELLS.RAKE.id} />: Boosted <strong>{this.boostedRakes}</strong> hits
                for <strong>{this.owner.formatItemDamageDone(this.boostedRakeDamage)}</strong>
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DRUID.SUDDEN_AMBUSH_TALENT}>
          <ItemPercentDamageDone greaterThan amount={this.totalDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SuddenAmbush;
