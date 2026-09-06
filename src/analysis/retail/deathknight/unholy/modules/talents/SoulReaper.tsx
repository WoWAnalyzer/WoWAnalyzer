import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  FightEndEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Enemies from 'parser/shared/modules/Enemies';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import type { JSX } from 'react';
import SpellUsable from '../core/SpellUsable';

const SOUL_REAPER_EXECUTE_THRESHOLD = 0.35;
const SOUL_REAPER_COOLDOWN_MS = 15_000;
const ATTRIBUTED_PLAYER_DAMAGE_SPELL_IDS = new Set([
  SPELLS.DREAD_PLAGUE.id,
  SPELLS.VIRULENT_PLAGUE.id,
]);

interface SoulReaperCastRecord {
  timestamp: number;
  darkTransformationWindowId: number | null;
  darkTransformationCooldownRemaining: string;
}

interface MissedFreeSoulReaperRecord {
  timestamp: number;
  endTimestamp: number;
  endedAtFightEnd: boolean;
  darkTransformationWindowId: number;
}

class SoulReaper extends ExecuteHelper.withDependencies({
  spellUsable: SpellUsable,
  enemies: Enemies,
}) {
  public static readonly executeSources = SELECTED_PLAYER;
  public static readonly lowerThreshold = SOUL_REAPER_EXECUTE_THRESHOLD;
  public static readonly executeSpells = [TALENTS.SOUL_REAPER_TALENT];
  public static readonly countCooldownAsExecuteTime = false;

  maxCasts = 0;

  private dtWindowOpen = false;
  private debuffWindowDamage = 0;
  private currentDarkTransformationWindowId: number | null = null;
  private currentDarkTransformationStartedAt: number | null = null;
  private darkTransformationWindowIdCounter = 0;
  private readonly soulReaperCasts: SoulReaperCastRecord[] = [];
  private readonly missedFreeSoulReaperWindows: MissedFreeSoulReaperRecord[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.SOUL_REAPER_TALENT);
    if (!this.active) {
      return;
    }

    // With Reaping, Dark Transformation resets Soul Reaper and allows a cast
    // above the usual execute health threshold.
    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .to(SELECTED_PLAYER)
        .spell(SPELLS.DARK_TRANSFORMATION_BUFF),
      this.onDTApply,
    );
    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .to(SELECTED_PLAYER)
        .spell(SPELLS.DARK_TRANSFORMATION_BUFF),
      this.onDTRemove,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SOUL_REAPER_TALENT),
      this.onSRCast,
    );

    // Caster-only sources for debuff attribution.
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onPlayerDamage);

    // Include all pet damage in debuff attribution.
    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onPetDamage);
  }

  /**
   * Only consider a target "in execute range" for maxCasts purposes if the
   * player has Dread Plague applied to it.  This keeps trash adds — which may
   * spend their whole life below 35% HP — from inflating the execute window.
   */
  isTargetInHealthExecuteWindow(event: DamageEvent): boolean {
    if (!this.deps.enemies.getEntity(event)?.hasBuff(SPELLS.DREAD_PLAGUE.id)) {
      return false;
    }
    return super.isTargetInHealthExecuteWindow(event);
  }

  private onDTApply(_event: ApplyBuffEvent) {
    const darkTransformationWindowId = this.darkTransformationWindowIdCounter + 1;

    this.darkTransformationWindowIdCounter = darkTransformationWindowId;
    this.currentDarkTransformationWindowId = darkTransformationWindowId;
    this.currentDarkTransformationStartedAt = _event.timestamp;
    this.dtWindowOpen = this.selectedCombatant.hasTalent(TALENTS.REAPING_TALENT);
    if (this.dtWindowOpen) {
      this.maxCasts += 1;
    }
  }

  private onDTRemove(event: RemoveBuffEvent) {
    this.closeDarkTransformationWindow(event.timestamp);
  }

  private onSRCast(event: CastEvent) {
    this.soulReaperCasts.push({
      timestamp: event.timestamp,
      darkTransformationWindowId: this.currentDarkTransformationWindowId,
      darkTransformationCooldownRemaining: this.getDarkTransformationCooldownRemaining(
        event.timestamp,
      ),
    });

    if (this.dtWindowOpen) {
      this.dtWindowOpen = false;
    }
  }

  private onPlayerDamage(event: DamageEvent) {
    if (
      this.deps.enemies.getEntity(event)?.hasBuff(SPELLS.SOUL_REAPER_DEBUFF.id) &&
      this.isAttributedPlayerDamage(event)
    ) {
      this.addDebuffWindowDamage(event);
    }
  }

  private onPetDamage(event: DamageEvent) {
    if (this.deps.enemies.getEntity(event)?.hasBuff(SPELLS.SOUL_REAPER_DEBUFF.id)) {
      this.addDebuffWindowDamage(event);
    }
  }

  private addDebuffWindowDamage(event: DamageEvent) {
    this.debuffWindowDamage += calculateEffectiveDamage(event, 0.2);
  }

  private isAttributedPlayerDamage(event: DamageEvent): boolean {
    if (ATTRIBUTED_PLAYER_DAMAGE_SPELL_IDS.has(event.ability.guid)) {
      return true;
    }

    // Putrefy can appear with multiple damage IDs; match by spell name.
    return event.ability.name === TALENTS.PUTREFY_TALENT.name;
  }

  private closeDarkTransformationWindow(fallbackTimestamp: number, endedAtFightEnd = false) {
    const darkTransformationWindowId = this.currentDarkTransformationWindowId;
    const darkTransformationStartedAt = this.currentDarkTransformationStartedAt;
    this.currentDarkTransformationWindowId = null;
    this.currentDarkTransformationStartedAt = null;
    if (!this.dtWindowOpen || darkTransformationWindowId === null) {
      return;
    }

    this.missedFreeSoulReaperWindows.push({
      darkTransformationWindowId,
      timestamp: darkTransformationStartedAt ?? fallbackTimestamp,
      endTimestamp: fallbackTimestamp,
      endedAtFightEnd,
    });
    this.dtWindowOpen = false;
  }

  private isTimestampDuringExecute(timestamp: number): boolean {
    return this.executeRanges.some(
      (range) => range.startEvent.timestamp <= timestamp && timestamp <= range.endEvent.timestamp,
    );
  }

  private getFreeDarkTransformationCastsDuringExecute(): number {
    if (!this.selectedCombatant.hasTalent(TALENTS.REAPING_TALENT)) {
      return 0;
    }
    const countedWindows = new Set<number>();

    for (const cast of this.soulReaperCasts) {
      if (cast.darkTransformationWindowId === null) {
        continue;
      }

      if (countedWindows.has(cast.darkTransformationWindowId)) {
        continue;
      }

      if (!this.isTimestampDuringExecute(cast.timestamp)) {
        continue;
      }

      countedWindows.add(cast.darkTransformationWindowId);
    }

    return countedWindows.size;
  }

  onFightEnd(event: FightEndEvent) {
    super.onFightEnd(event);
    this.maxCasts += Math.ceil(this.totalExecuteDuration / SOUL_REAPER_COOLDOWN_MS);
    this.maxCasts -= this.getFreeDarkTransformationCastsDuringExecute();
    this.closeDarkTransformationWindow(event.timestamp, true);
  }

  private getDarkTransformationCooldownRemaining(castTimestamp: number): string {
    const state = this.deps.spellUsable
      .history(TALENTS.DARK_TRANSFORMATION_TALENT.id)
      .getBefore(castTimestamp, true);
    if (!state) {
      return 'Unknown';
    }
    const remainingMs = state.isOnCooldown
      ? Math.max(0, state.expectedRechargeTimestamp - castTimestamp)
      : 0;
    return `${(remainingMs / 1000).toFixed(1)}s`;
  }

  get guideSubsection(): JSX.Element {
    const hasReaping = this.selectedCombatant.hasTalent(TALENTS.REAPING_TALENT);
    // Timing guidance follows the retained SimC Unholy APL (ed724891d6ec):
    // single_target Soul Reaper and aoe Putrefy/Soul Reaper priorities.
    // These priorities are advice, not per-cast failure thresholds.
    const explanation = (
      <>
        <p>
          Use <SpellLink spell={TALENTS.SOUL_REAPER_TALENT} /> against targets below 35% health.
          Favor a low-health target and keep using it as it becomes available during execute, while
          handling higher-priority actions such as disease maintenance and{' '}
          <SpellLink spell={TALENTS.PUTREFY_TALENT} /> during{' '}
          <SpellLink spell={SPELLS.DARK_TRANSFORMATION_BUFF} />.
        </p>
        {hasReaping && (
          <p>
            With <SpellLink spell={TALENTS.REAPING_TALENT} />,{' '}
            <SpellLink spell={TALENTS.DARK_TRANSFORMATION_TALENT} /> resets Soul Reaper and allows a
            cast above the usual health threshold. Plan to use that opportunity. On single target,
            aim for the later part of Dark Transformation, with less than 12 seconds remaining,
            rather than automatically casting Soul Reaper as soon as the window opens. A target
            below 35% health is also a reason to use it earlier.
          </p>
        )}
        {this.selectedCombatant.hasTalent(TALENTS.LORD_OF_THE_DEAD_TALENT) && (
          <p>
            On single target, also prioritize an available{' '}
            <SpellLink spell={TALENTS.SOUL_REAPER_TALENT} /> when your{' '}
            <SpellLink spell={TALENTS.LORD_OF_THE_DEAD_TALENT} /> has less than 9 seconds left. Soul
            Reaper still requires execute health or the Reaping opportunity.
          </p>
        )}
        <p>
          With three or more enemies, use an available Soul Reaper on a low-health target after
          higher-priority actions, including Putrefy during Dark Transformation. You do not need to
          wait for the single-target timing above.
        </p>
        <p>
          Review the timestamps alongside your target's health and your other casts. Look for
          opportunities to fit in another Soul Reaper before the target dies or becomes unavailable.
          Dark Transformation's cooldown below is its remaining cooldown at the time of the cast; it
          is not a recommended waiting time.
        </p>
      </>
    );
    const data = (
      <div>
        {this.soulReaperCasts.length === 0 ? (
          <p>
            No Soul Reaper casts were recorded. Look for targets below 35% health
            {hasReaping && ' and opportunities from Reaping after Dark Transformation'} to use Soul
            Reaper next time.
          </p>
        ) : (
          <table>
            <caption>Soul Reaper casts</caption>
            <thead>
              <tr>
                <th>Time</th>
                <th>Window</th>
                <th>DT CD remaining at cast</th>
              </tr>
            </thead>
            <tbody>
              {this.soulReaperCasts.map((cast, index) => (
                <tr key={index}>
                  <td>{this.owner.formatTimestamp(cast.timestamp)}</td>
                  <td>{cast.darkTransformationWindowId !== null ? 'During DT' : 'Outside DT'}</td>
                  <td>
                    {cast.darkTransformationWindowId !== null
                      ? 'Active'
                      : cast.darkTransformationCooldownRemaining}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {this.missedFreeSoulReaperWindows.length > 0 && (
          <>
            <h4>Dark Transformation windows to review</h4>
            <p>
              No Soul Reaper cast was recorded in these windows. If you could attack a target, plan
              a Soul Reaper into the window to use the Reaping opportunity. Check for downtime or
              the end of the fight before treating a missing cast as a mistake.
            </p>
            <table>
              <caption>Windows without a Soul Reaper cast</caption>
              <thead>
                <tr>
                  <th>Start</th>
                  <th>End</th>
                  <th>Review</th>
                </tr>
              </thead>
              <tbody>
                {this.missedFreeSoulReaperWindows.map((window) => (
                  <tr key={window.darkTransformationWindowId}>
                    <td>{this.owner.formatTimestamp(window.timestamp)}</td>
                    <td>{this.owner.formatTimestamp(window.endTimestamp)}</td>
                    <td>
                      {window.endedAtFightEnd
                        ? 'The fight ended while this window was active. Check whether there was time to cast.'
                        : 'Check target availability and whether other casts could have made room for Soul Reaper.'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    );
    return explanationAndDataSubsection(explanation, data, 40);
  }

  statistic() {
    const debuffBonus = this.debuffWindowDamage;
    const directDamage = this.executeDamage;
    const totalGain = directDamage + debuffBonus;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(30)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.SOUL_REAPER_TALENT}>
          <div>
            <ItemDamageDone amount={totalGain} />
          </div>
          <div style={{ lineHeight: 1.2 }}>
            <small style={{ display: 'block' }}>Breakdown</small>
            <small style={{ display: 'block' }}>
              <ItemDamageDone amount={directDamage} displayPercentage={false} /> ability damage
            </small>
            <small style={{ display: 'block' }}>
              <ItemDamageDone amount={debuffBonus} displayPercentage={false} /> debuff bonus (est.)
            </small>
          </div>
          {this.missedFreeSoulReaperWindows.length > 0 && (
            <div>
              <span>{this.missedFreeSoulReaperWindows.length}</span>{' '}
              <small>
                Dark Transformation window without an observed Soul Reaper cast
                {this.missedFreeSoulReaperWindows.length > 1 ? 's' : ''}
              </small>
            </div>
          )}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SoulReaper;
