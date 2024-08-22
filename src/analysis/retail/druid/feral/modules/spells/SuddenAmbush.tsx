import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import { Options } from 'parser/core/Module';
import SPELLS from 'common/SPELLS';
import Events, {
  ApplyBuffEvent,
  ApplyDebuffEvent,
  DamageEvent,
  RefreshBuffEvent,
  RefreshDebuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import {
  getSuddenAmbushBoostedDamage,
  isBoostedBySuddenAmbush,
} from 'analysis/retail/druid/feral/normalizers/SuddenAmbushLinkNormalizer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import {
  getRakeDuration,
  PANDEMIC_FRACTION,
  PROWL_RAKE_DAMAGE_BONUS,
} from 'analysis/retail/druid/feral/constants';
import Enemies, { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { SpellIcon, SpellLink } from 'interface';
import CrossIcon from 'interface/icons/Cross';
import UptimeIcon from 'interface/icons/Uptime';
import { formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { BadColor, OkColor } from 'interface/guide';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Snapshots, {
  PROWL_SPEC,
  SnapshotSpec,
  TIGERS_FURY_SPEC,
} from 'analysis/retail/druid/feral/modules/core/Snapshots';
import { getHardcast } from 'analysis/retail/druid/feral/normalizers/CastLinkNormalizer';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';

/**
 * **Sudden Ambush**
 * Spec Talent
 *
 * Finishing moves have a 6% chance per combo point spent to make your next Rake or Shred
 * deal damage as though you were stealthed.
 */
class SuddenAmbush extends Snapshots {
  static dependencies = {
    ...Snapshots.dependencies,
    enemies: Enemies,
  };
  protected enemies!: Enemies;

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

  /** Per use entries for the Guide */
  useEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(SPELLS.RAKE, SPELLS.RAKE_BLEED, [TIGERS_FURY_SPEC, PROWL_SPEC], options);

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

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SHRED), this.onSaShred);

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

  // Uses the 'Snapshots' framework seprately from the RakeUptimeAndSnapshots module to capture SA specific info

  getDotExpectedDuration(): number {
    return getRakeDuration(this.selectedCombatant);
  }

  getDotFullDuration(): number {
    return getRakeDuration(this.selectedCombatant);
  }

  getTotalDotUptime(): number {
    return this.enemies.getBuffUptime(SPELLS.RAKE_BLEED.id);
  }

  handleApplication(
    application: ApplyDebuffEvent | RefreshDebuffEvent,
    snapshots: SnapshotSpec[],
    prevSnapshots: SnapshotSpec[] | null,
    power: number,
    prevPower: number,
    remainingOnPrev: number,
    clipped: number,
  ) {
    const cast = getHardcast(application);
    if (!cast) {
      return; // no entry needed for 'uncontrolled' rakes from DCR or Convoke
    }
    if (!isBoostedBySuddenAmbush(application)) {
      // most Rake handling is in RakeUptimeAndSnapshots module,
      // here we only need to look at SA buffed Rakes
      return;
    }

    const targetName = this.owner.getTargetName(cast);
    const wasUpgrade = power > prevPower;

    const isRakeOnTarget = prevSnapshots !== null;
    const wasPrevRakeProwlBuffed =
      prevSnapshots !== null &&
      prevSnapshots.find((ss) => ss.name === PROWL_SPEC.name) !== undefined;

    let value: QualitativePerformance = QualitativePerformance.Good;
    let perfExplanation: React.ReactNode = undefined;

    if (!wasUpgrade && clipped > 0) {
      value = QualitativePerformance.Ok;
      perfExplanation = (
        <h5 style={{ color: OkColor }}>
          Careful, you early overwrote an already strong Rake.
          <br />
        </h5>
      );
    }

    const tooltip = (
      <>
        <strong>
          Consumed with <SpellLink spell={SPELLS.RAKE} />
        </strong>
        <br />
        {perfExplanation}@ <strong>{this.owner.formatTimestamp(cast.timestamp)}</strong> targetting{' '}
        <strong>{targetName || 'unknown'}</strong>
        <br />
        {isRakeOnTarget ? (
          <>
            Previous rake on target had <strong>{(remainingOnPrev / 1000).toFixed(1)}s</strong> left
            and{' '}
            {wasPrevRakeProwlBuffed ? (
              <strong>
                <SpellLink spell={TALENTS_DRUID.POUNCING_STRIKES_TALENT} /> buff
              </strong>
            ) : (
              <strong>no buff</strong>
            )}
          </>
        ) : (
          <>
            <b>No Rake on target!</b>
          </>
        )}
      </>
    );

    this.useEntries.push({
      value,
      tooltip,
    });
  }

  onSaShred(event: DamageEvent) {
    if (!isBoostedBySuddenAmbush(event)) {
      return;
    }
    const cast = getHardcast(event);
    if (!cast) {
      return; // no entry needed for 'uncontrolled' shreds from Convoke
    }

    const latestUptime = this.getLatestUptimeForTarget(event);
    const isRakeOnTarget = latestUptime !== undefined;
    const timeLeftOnRake = this.getTimeRemaining(event);
    const isRakeProwlBuffed = latestUptime
      ? latestUptime.snapshots.find((ss) => ss.name === PROWL_SPEC.name) !== undefined
      : false;
    const targetName = this.owner.getTargetName(event);

    let value: QualitativePerformance = QualitativePerformance.Good;
    let perfExplanation: React.ReactNode = undefined;

    if (!isRakeOnTarget) {
      value = QualitativePerformance.Fail;
      perfExplanation = (
        <h5 style={{ color: BadColor }}>
          Bad because there was no Rake on the target
          <br />
        </h5>
      );
    } else if (timeLeftOnRake <= getRakeDuration(this.selectedCombatant) * PANDEMIC_FRACTION) {
      value = QualitativePerformance.Fail;
      perfExplanation = (
        <h5 style={{ color: BadColor }}>
          Bad because the Rake on target was within the refresh window
          <br />
        </h5>
      );
    } else if (!isRakeProwlBuffed) {
      value = QualitativePerformance.Fail;
      perfExplanation = (
        <h5 style={{ color: BadColor }}>
          Bad because the Rake on target was weak
          <br />
        </h5>
      );
    }

    const tooltip = (
      <>
        <strong>
          Consumed with <SpellLink spell={SPELLS.SHRED} />
        </strong>
        <br />
        {perfExplanation}@ <strong>{this.owner.formatTimestamp(cast.timestamp)}</strong> targetting{' '}
        <strong>{targetName || 'unknown'}</strong>
        <br />
        {isRakeOnTarget ? (
          <>
            Rake on target had <strong>{(timeLeftOnRake / 1000).toFixed(1)}s</strong> left and{' '}
            {isRakeProwlBuffed ? (
              <strong>
                <SpellLink spell={TALENTS_DRUID.POUNCING_STRIKES_TALENT} /> buff
              </strong>
            ) : (
              <strong>no buff</strong>
            )}
          </>
        ) : (
          <>
            <b>No Rake on target!</b>
          </>
        )}
      </>
    );

    this.useEntries.push({
      value,
      tooltip,
    });
  }

  onGainSa(event: ApplyBuffEvent) {
    this.saGained += 1;
  }

  onUseSa(event: RemoveBuffEvent) {
    const boostedDamageEvents: DamageEvent[] = getSuddenAmbushBoostedDamage(event);
    if (boostedDamageEvents.length === 0) {
      this.saExpired += 1;

      const value = QualitativePerformance.Fail;
      const tooltip = (
        <>
          <h5 style={{ color: BadColor }}>
            Bad because you let a proc expire
            <br />
          </h5>
          @ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong>
        </>
      );
      this.useEntries.push({
        value,
        tooltip,
      });
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

  onOverwriteSa(event: RefreshBuffEvent) {
    this.saOverwritten += 1;

    const value = QualitativePerformance.Fail;
    const tooltip = (
      <>
        <h5 style={{ color: BadColor }}>
          Bad because you overwrote a proc
          <br />
        </h5>
        @ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong>
      </>
    );
    this.useEntries.push({
      value,
      tooltip,
    });
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

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS_DRUID.SUDDEN_AMBUSH_TALENT} />
        </strong>{' '}
        buffs your next <SpellLink spell={SPELLS.SHRED} /> or <SpellLink spell={SPELLS.RAKE} />.
        Consuming the proc with <SpellLink spell={SPELLS.RAKE} /> is almost always preferred - the
        only time you should consume with <SpellLink spell={SPELLS.SHRED} /> is when your target
        already has a high duration buffed <SpellLink spell={SPELLS.RAKE} />.
      </p>
    );

    const data = (
      <div>
        <CastSummaryAndBreakdown
          spell={TALENTS_DRUID.SUDDEN_AMBUSH_TALENT}
          castEntries={this.useEntries}
          badExtraExplanation={<>or an expired proc</>}
          usesInsteadOfCasts
        />
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
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
                <SpellIcon spell={TALENTS_DRUID.SUDDEN_AMBUSH_TALENT} /> Used:{' '}
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
                <SpellLink spell={TALENTS_DRUID.DOUBLE_CLAWED_RAKE_TALENT} />)
              </>
            )}
            :
            <ul>
              <li>
                <SpellLink spell={SPELLS.SHRED} />: Boosted <strong>{this.boostedShreds}</strong>{' '}
                hits for{' '}
                <strong>&gt;{this.owner.formatItemDamageDone(this.boostedShredDamage)}</strong>
              </li>
              <li>
                <SpellLink spell={SPELLS.RAKE} />: Boosted <strong>{this.boostedRakes}</strong> hits
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
