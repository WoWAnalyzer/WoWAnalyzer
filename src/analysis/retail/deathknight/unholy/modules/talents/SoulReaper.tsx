import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  DamageEvent,
  FightEndEvent,
  EventType,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
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
import SoulReaperTimeline, { MissedFreeSoulReaperRecord } from '../guide/SoulReaperTimeline';
import SoulReaperConsumption from '../guide/SoulReaperConsumption';
import { LesserGhoulConsumption } from '../../normalizers/LesserGhoulConsumption';

const SOUL_REAPER_EXECUTE_THRESHOLD = 0.35;
const SOUL_REAPER_COOLDOWN_MS = 15_000;
const ATTRIBUTED_PLAYER_DAMAGE_SPELL_IDS = new Set([
  SPELLS.DREAD_PLAGUE.id,
  SPELLS.VIRULENT_PLAGUE.id,
]);

interface SoulReaperCastRecord {
  event: CastEvent;
  stacksBeforeCast: number;
  timestamp: number;
  darkTransformationWindowId: number | null;
}

class SoulReaper extends ExecuteHelper.withDependencies({
  enemies: Enemies,
}) {
  public static readonly executeSources = SELECTED_PLAYER;
  public static readonly lowerThreshold = SOUL_REAPER_EXECUTE_THRESHOLD;
  public static readonly executeSpells = [TALENTS.SOUL_REAPER_TALENT];
  public static readonly countCooldownAsExecuteTime = false;

  maxCasts = 0;

  private lesserGhoulStacks = 0;
  private readonly consumedStacks = new Map<CastEvent, number | null>();
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

    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.LESSER_GHOUL_BUFF),
      this.onGhoulApply,
    );
    this.addEventListener(
      Events.applybuffstack.to(SELECTED_PLAYER).spell(SPELLS.LESSER_GHOUL_BUFF),
      this.onGhoulStack,
    );
    this.addEventListener(
      Events.removebuffstack.to(SELECTED_PLAYER).spell(SPELLS.LESSER_GHOUL_BUFF),
      this.onGhoulRemove,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.LESSER_GHOUL_BUFF),
      this.onGhoulRemove,
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
      event,
      stacksBeforeCast: this.lesserGhoulStacks,
      timestamp: event.timestamp,
      darkTransformationWindowId: this.currentDarkTransformationWindowId,
    });

    if (this.dtWindowOpen) {
      this.dtWindowOpen = false;
    }
  }

  private onGhoulApply(_event: ApplyBuffEvent) {
    this.lesserGhoulStacks = 1;
  }

  private onGhoulStack(event: ApplyBuffStackEvent) {
    this.lesserGhoulStacks = event.stack;
  }

  private onGhoulRemove(event: RemoveBuffEvent | RemoveBuffStackEvent) {
    const remaining = event.type === EventType.RemoveBuffStack ? event.stack : 0;
    const removed = this.lesserGhoulStacks - remaining;
    this.lesserGhoulStacks = remaining;
    const cast = LesserGhoulConsumption.first(event);
    if (!cast || cast.ability.guid !== TALENTS.SOUL_REAPER_TALENT.id) {
      return;
    }

    const previous = this.consumedStacks.has(cast) ? this.consumedStacks.get(cast)! : 0;
    // Missing stack history or an impossible total is ungraded, not a zero.
    this.consumedStacks.set(
      cast,
      previous === null || removed <= 0 || previous + removed > 3 ? null : previous + removed,
    );
  }

  private get consumptionCasts() {
    return this.soulReaperCasts.map((cast) => ({
      timestamp: cast.timestamp,
      stacksConsumed: this.consumedStacks.has(cast.event)
        ? this.consumedStacks.get(cast.event)!
        : cast.stacksBeforeCast === 0 && !LesserGhoulConsumption.reverse.first(cast.event)
          ? 0
          : null,
    }));
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

  get guideSubsection(): JSX.Element {
    const hasReaping = this.selectedCombatant.hasTalent(TALENTS.REAPING_TALENT);
    // Three-stack preparation is explicitly recommended by the 12.1 rotation guide:
    // https://www.icy-veins.com/wow/unholy-death-knight-pve-dps-rotation-cooldowns-abilities
    const explanation = (
      <>
        <p>
          Prepare three <SpellLink spell={SPELLS.LESSER_GHOUL_BUFF} /> stacks before{' '}
          <SpellLink spell={TALENTS.SOUL_REAPER_TALENT} /> to get the most minion damage from each
          cast. It can consume all three at once, summoning ghouls or triggering attacks from your
          existing army during <SpellLink spell={TALENTS.ARMY_OF_THE_DEAD_TALENT} />.
        </p>
        {hasReaping && (
          <p>
            <SpellLink spell={TALENTS.REAPING_TALENT} /> lets you use Soul Reaper during{' '}
            <SpellLink spell={TALENTS.DARK_TRANSFORMATION_TALENT} /> even above 35% target health.
          </p>
        )}
      </>
    );
    const data = (
      <div>
        {this.soulReaperCasts.length === 0 && (
          <p>
            No Soul Reaper casts were recorded. Look for targets below 35% health
            {hasReaping && ' and opportunities from Reaping after Dark Transformation'} to use Soul
            Reaper next time.
          </p>
        )}
        {hasReaping &&
          this.darkTransformationWindowIdCounter > 0 &&
          this.missedFreeSoulReaperWindows.length === 0 && (
            <p>
              You used Soul Reaper in every observed Reaping window. Keep using that opportunity
              each time you activate Dark Transformation.
            </p>
          )}
        <SoulReaperConsumption
          casts={this.consumptionCasts}
          fightStart={this.owner.fight.start_time}
          fightEnd={this.owner.fight.end_time}
          formatTimestamp={(timestamp) => this.owner.formatTimestamp(timestamp)}
        />
        <SoulReaperTimeline
          missedWindows={this.missedFreeSoulReaperWindows}
          fightStart={this.owner.fight.start_time}
          fightEnd={this.owner.fight.end_time}
          formatTimestamp={(timestamp) => this.owner.formatTimestamp(timestamp)}
        />
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
