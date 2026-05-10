import BaseHotJS, {
  HEART_BUFFS,
} from 'analysis/retail/monk/shared/hero/ConduitOfTheCelestials/talents/HeartOfTheJadeSerpent';
import { MISTWEAVER_HEART_SPELLS } from 'analysis/retail/monk/shared/hero/ConduitOfTheCelestials/constants';
import SPELLS from 'common/SPELLS/monk';
import { TALENTS_MONK } from 'common/TALENTS';
import { formatDuration, formatPercentage } from 'common/format';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';
import { SpellLink } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AnyEvent,
  ApplyBuffEvent,
  CastEvent,
  EventType,
  RemoveBuffEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import TalentAggregateBars, { TalentAggregateBarSpec } from 'parser/ui/TalentAggregateStatistic';
import TalentAggregateStatisticContainer from 'parser/ui/TalentAggregateStatisticContainer';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SPELL_COLORS } from '../../constants';

const SPELL_COLOR_MAP: Partial<Record<number, string>> = {
  [SPELLS.RENEWING_MIST_CAST.id]: SPELL_COLORS.RENEWING_MIST,
  [TALENTS_MONK.RISING_SUN_KICK_TALENT.id]: SPELL_COLORS.RISING_SUN_KICK,
  [TALENTS_MONK.RUSHING_WIND_KICK_MISTWEAVER_TALENT.id]: SPELL_COLORS.RISING_SUN_KICK,
  [TALENTS_MONK.THUNDER_FOCUS_TEA_TALENT.id]: '#ffd700',
  [TALENTS_MONK.LIFE_COCOON_TALENT.id]: '#a8d8a8',
};

class HeartOfTheJadeSerpent extends BaseHotJS {
  static override dependencies = {
    ...BaseHotJS.dependencies,
    abilities: Abilities,
  };

  declare protected abilities: Abilities;
  declare protected spellUsable: SpellUsable;

  private inWindow = false;
  private windowStart = 0;
  private windowExtraRate = 0;
  private activeSegments = new Map<number, number>();
  private totalExtraCdrMs = new Map<number, number>();
  private totalWastedCdrMs = new Map<number, number>();
  private totalWindowUptimeMs = 0;

  private get heartSpellIds(): number[] {
    return MISTWEAVER_HEART_SPELLS(
      this.selectedCombatant.hasTalent(TALENTS_MONK.RUSHING_WIND_KICK_MISTWEAVER_TALENT),
    );
  }

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(HEART_BUFFS),
      this.onWindowApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(HEART_BUFFS),
      this.onWindowRemove,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.any, this.onAny);
  }

  private onWindowApply(event: ApplyBuffEvent) {
    if (this.inWindow) {
      this.flushSegments(event.timestamp);
    }

    this.windowExtraRate = this.rateChange(event.ability.guid);
    this.windowStart = event.timestamp;
    this.inWindow = true;

    for (const spellId of this.heartSpellIds) {
      if (this.spellUsable.isOnCooldown(spellId)) {
        this.activeSegments.set(spellId, event.timestamp);
      }
    }
  }

  private onWindowRemove(event: RemoveBuffEvent) {
    if (!this.inWindow) return;

    this.flushSegments(event.timestamp);
    this.inWindow = false;
  }

  private onCast(event: CastEvent) {
    if (!this.inWindow || !this.heartSpellIds.includes(event.ability.guid)) return;

    this.activeSegments.set(event.ability.guid, event.timestamp);
  }

  private onAny(event: AnyEvent) {
    if (!this.inWindow || event.type !== EventType.UpdateSpellUsable) return;
    const usable = event as UpdateSpellUsableEvent;

    if (usable.updateType !== UpdateSpellUsableType.EndCooldown) return;

    const spellId = usable.ability.guid;
    const segStart = this.activeSegments.get(spellId);
    if (segStart !== undefined) {
      this.accumulate(spellId, event.timestamp - segStart);
      this.activeSegments.delete(spellId);
    }
  }

  private flushSegments(now: number) {
    const windowDuration = now - this.windowStart;
    this.totalWindowUptimeMs += windowDuration;
    const possibleCdr = windowDuration * this.windowExtraRate;

    for (const spellId of this.heartSpellIds) {
      const segStart = this.activeSegments.get(spellId);
      const activeCdr = segStart !== undefined ? (now - segStart) * this.windowExtraRate : 0;

      this.totalWastedCdrMs.set(
        spellId,
        (this.totalWastedCdrMs.get(spellId) ?? 0) + possibleCdr - activeCdr,
      );
      if (segStart !== undefined) {
        this.accumulate(spellId, now - segStart);
      }
    }
    this.activeSegments.clear();
  }

  private accumulate(spellId: number, durationMs: number) {
    const extra = durationMs * this.windowExtraRate;
    this.totalExtraCdrMs.set(spellId, (this.totalExtraCdrMs.get(spellId) ?? 0) + extra);
  }

  private extraCasts(spellId: number): number {
    const cdr = this.totalExtraCdrMs.get(spellId) ?? 0;
    const abilityCd = this.abilities.getAbility(spellId)?.cooldown;
    const baseCd =
      (typeof abilityCd === 'number' ? abilityCd * 1000 : null) ??
      (this.spellUsable.fullCooldownDuration(spellId) || 12_000);
    return cdr / baseCd;
  }

  private get totalExtraCasts(): number {
    return this.heartSpellIds.reduce((sum, id) => sum + this.extraCasts(id), 0);
  }

  private buildBars(): TalentAggregateBarSpec[] {
    return this.heartSpellIds.flatMap((spellId) => {
      const spell = maybeGetTalentOrSpell(spellId);
      if (!spell) return [];

      const extraCasts = this.extraCasts(spellId);
      const cdrMs = this.totalExtraCdrMs.get(spellId) ?? 0;
      const wastedMs = this.totalWastedCdrMs.get(spellId) ?? 0;
      return [
        {
          spell,
          amount: extraCasts,
          color: SPELL_COLOR_MAP[spellId],
          tooltip: (
            <>
              <div>
                <strong>{formatDuration(cdrMs)}</strong> of cooldown reduction on{' '}
                <SpellLink spell={spell} /> ≈ <strong>{extraCasts.toFixed(1)}</strong> extra casts
              </div>
              <div>
                <small>
                  <SpellLink spell={spell} /> was available during{' '}
                  <strong>{formatDuration(wastedMs)}</strong> of cooldown reduction
                </small>
              </div>
            </>
          ),
        } satisfies TalentAggregateBarSpec,
      ];
    });
  }

  statistic() {
    const uptimePct = formatPercentage(this.totalWindowUptimeMs / this.owner.fightDuration);
    const uptimeSec = (this.totalWindowUptimeMs / 1000).toFixed(1);
    return (
      <TalentAggregateStatisticContainer
        title={
          <>
            <SpellLink spell={TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT} /> -{' '}
            <strong>{Math.floor(this.totalExtraCasts)}</strong> <small>extra casts</small>
          </>
        }
        tooltip={
          <>
            <SpellLink spell={TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT} /> uptime:{' '}
            <strong>{uptimeSec}s</strong> ({uptimePct}%)
          </>
        }
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        position={STATISTIC_ORDER.CORE(10)}
        wide
      >
        <TalentAggregateBars bars={this.buildBars()} wide />
      </TalentAggregateStatisticContainer>
    );
  }
}

export default HeartOfTheJadeSerpent;
