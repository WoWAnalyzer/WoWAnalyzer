import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import { Options } from 'parser/core/Module';
import Events, {
  ApplyBuffEvent,
  DamageEvent,
  FightEndEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { getTigersFuryDamageBonus, getTigersFuryDuration } from '../../constants';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellLink } from 'interface';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

/**
 * **Raging Fury**
 * Spec Talent
 *
 * Finishing moves extend the duration of Tiger's Fury by 0.4 sec per combo point spent.
 */
class RagingFury extends Analyzer {
  /** Total effective extension time */
  totalEffectiveExtensionMs: number = 0;
  /** Total damage added by the extended parts of Tiger's Fury */
  totalDamage: number = 0;
  /** Tiger's Fury duration before extension */
  tfDurationMs: number;
  /** Tiger's Fury damage boost */
  tfBoost: number;
  /** Timestamp the most recent TF was applied */
  lastTfApplyTimestamp?: number;

  /** Total TF applications */
  tfApplies: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.RAGING_FURY_TALENT);

    this.tfDurationMs = getTigersFuryDuration(this.selectedCombatant);
    this.tfBoost = getTigersFuryDamageBonus(this.selectedCombatant);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.TIGERS_FURY),
      this.onTfApply,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.TIGERS_FURY),
      this.onTfRefresh,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.TIGERS_FURY),
      this.onTfRemove,
    );
    this.addEventListener(Events.fightend, this.onFightEnd);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  onFightEnd(event: FightEndEvent) {
    this._closeOutLastTf(event.timestamp);
  }

  onTfApply(event: ApplyBuffEvent) {
    this._handleNewTf(event.timestamp);
  }

  onTfRefresh(event: RefreshBuffEvent) {
    this._closeOutLastTf(event.timestamp);
    this._handleNewTf(event.timestamp);
  }

  onTfRemove(event: RemoveBuffEvent) {
    this._closeOutLastTf(event.timestamp);
  }

  _handleNewTf(timestamp: number) {
    this.lastTfApplyTimestamp = timestamp;
    this.tfApplies += 1;
  }

  /** Tallies extension of last applied TF and marks TF inactive */
  _closeOutLastTf(timestamp: number) {
    if (this.lastTfApplyTimestamp) {
      const endWithoutExtension = this.lastTfApplyTimestamp + this.tfDurationMs;
      const timePastNaturalExpire = Math.max(0, timestamp - endWithoutExtension);
      this.totalEffectiveExtensionMs += timePastNaturalExpire;
      this.lastTfApplyTimestamp = undefined;
    }
  }

  onDamage(event: DamageEvent) {
    if (
      this.lastTfApplyTimestamp &&
      this.lastTfApplyTimestamp + this.tfDurationMs < event.timestamp
    ) {
      // TF is active, and we're in the part of it that wouldn't be there if not for this talent
      this.totalDamage += calculateEffectiveDamage(event, this.tfBoost);
    }
  }

  get extensionPerCast() {
    return this.tfApplies === 0 ? 0 : this.totalEffectiveExtensionMs / this.tfApplies;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(7)} // number based on talent row
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This is the total damage added by the extended portions of{' '}
            <SpellLink spell={TALENTS_DRUID.TIGERS_FURY_TALENT} />.<br />
            You extended each <SpellLink spell={TALENTS_DRUID.TIGERS_FURY_TALENT} /> by an average
            of <strong>{(this.extensionPerCast / 1000).toFixed(1)}s</strong>.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.RAGING_FURY_TALENT}>
          <ItemPercentDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default RagingFury;
