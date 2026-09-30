import BaseHotJS, {
  HEART_BUFFS,
} from 'analysis/retail/monk/shared/hero/ConduitOfTheCelestials/talents/HeartOfTheJadeSerpent';
import { MISTWEAVER_HEART_SPELLS } from 'analysis/retail/monk/shared/hero/ConduitOfTheCelestials/constants';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { formatDuration, formatPercentage } from 'common/format';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';
import { SpellLink } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  FightEndEvent,
  RemoveBuffEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import TalentAggregateBars, { TalentAggregateBarSpec } from 'parser/ui/TalentAggregateStatistic';
import TalentAggregateStatisticContainer from 'parser/ui/TalentAggregateStatisticContainer';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ID_TO_SPELL_COLOR } from '../../constants';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class HeartOfTheJadeSerpent extends BaseHotJS {
  static override dependencies = {
    ...BaseHotJS.dependencies,
    abilities: Abilities,
  };

  declare protected abilities: Abilities;
  declare protected spellUsable: SpellUsable;

  talent = TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT;
  private inWindow = false;
  private windowStart = 0;
  private windowExtraRate = 0;
  private windowIsUnity = false;
  private activeWindowBuffs = new Set<number>();
  private unityExtraCdrMs = new Map<number, number>();
  private windowExtraCdrMs = new Map<number, number>();
  private activeSegments = new Map<number, number>();
  private totalExtraCdrMs = new Map<number, number>();
  private totalWastedCdrMs = new Map<number, number>();
  private totalWindowUptimeMs = 0;
  private readonly heartSpellIds: number[];

  constructor(options: Options) {
    super(options);

    this.heartSpellIds = MISTWEAVER_HEART_SPELLS(
      this.selectedCombatant.hasTalent(TALENTS_MONK.RUSHING_WIND_KICK_MISTWEAVER_TALENT),
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(HEART_BUFFS),
      this.onWindowApply,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(HEART_BUFFS),
      this.onWindowRemove,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.UpdateSpellUsable, this.onUpdateSpellUsable);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  private onWindowApply(event: ApplyBuffEvent) {
    if (this.inWindow) {
      this.flushSegments(event.timestamp);
    }

    this.activeWindowBuffs.add(event.ability.guid);
    this.startWindow(event.timestamp);
  }

  private onFightEnd(event: FightEndEvent) {
    if (!this.inWindow) return;

    this.flushSegments(event.timestamp);
    this.inWindow = false;
  }

  private onWindowRemove(event: RemoveBuffEvent) {
    if (!this.inWindow) return;

    this.flushSegments(event.timestamp);
    this.activeWindowBuffs.delete(event.ability.guid);

    if (this.activeWindowBuffs.size === 0) {
      this.inWindow = false;
      return;
    }

    this.startWindow(event.timestamp);
  }

  private startWindow(timestamp: number) {
    // unity's faster rate wins while it overlaps one of the others
    this.windowIsUnity = this.activeWindowBuffs.has(SPELLS.HEART_OF_THE_JADE_SERPENT_UNITY.id);
    this.windowExtraRate = this.rateChange(
      this.windowIsUnity
        ? SPELLS.HEART_OF_THE_JADE_SERPENT_UNITY.id
        : SPELLS.HEART_OF_THE_JADE_SERPENT_BUFF.id,
    );
    this.windowStart = timestamp;
    this.inWindow = true;

    for (const spellId of this.heartSpellIds) {
      if (this.spellUsable.isOnCooldown(spellId)) {
        this.activeSegments.set(spellId, timestamp);
      }
    }
  }

  private onCast(event: CastEvent) {
    if (!this.inWindow || !this.heartSpellIds.includes(event.ability.guid)) return;

    if (this.activeSegments.has(event.ability.guid)) return;

    this.activeSegments.set(event.ability.guid, event.timestamp);
  }

  private onUpdateSpellUsable(event: UpdateSpellUsableEvent) {
    if (!this.inWindow || event.updateType !== UpdateSpellUsableType.EndCooldown) return;

    const spellId = event.ability.guid;
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
      if (segStart !== undefined) {
        this.accumulate(spellId, now - segStart);
      }

      const windowCdr = this.windowExtraCdrMs.get(spellId) ?? 0;
      this.totalWastedCdrMs.set(
        spellId,
        (this.totalWastedCdrMs.get(spellId) ?? 0) + Math.max(0, possibleCdr - windowCdr),
      );
    }
    this.activeSegments.clear();
    this.windowExtraCdrMs.clear();
  }

  private accumulate(spellId: number, durationMs: number) {
    const extra = durationMs * this.windowExtraRate;
    this.totalExtraCdrMs.set(spellId, (this.totalExtraCdrMs.get(spellId) ?? 0) + extra);
    this.windowExtraCdrMs.set(spellId, (this.windowExtraCdrMs.get(spellId) ?? 0) + extra);
    if (this.windowIsUnity) {
      this.unityExtraCdrMs.set(spellId, (this.unityExtraCdrMs.get(spellId) ?? 0) + extra);
    }
  }

  get uptime() {
    return this.totalWindowUptimeMs;
  }

  // extra casts gained during unity within's window
  get unityExtraCasts(): number {
    return this.heartSpellIds.reduce(
      (sum, id) => sum + this.extraCasts(id, this.unityExtraCdrMs),
      0,
    );
  }

  private extraCasts(spellId: number, cdrMap = this.totalExtraCdrMs): number {
    const cdr = cdrMap.get(spellId) ?? 0;
    const baseCd = this.abilities.getExpectedCooldownDuration(spellId);
    if (!baseCd) {
      const ability = this.abilities.getAbility(spellId);
      throw new Error(`${ability?.name} ${spellId} has no cooldown, cannot calculate extra casts`);
    }
    return cdr / baseCd;
  }

  private get totalExtraCasts(): number {
    return this.heartSpellIds.reduce((sum, id) => sum + this.extraCasts(id), 0);
  }

  private get cdrTotals() {
    return this.heartSpellIds.flatMap((spellId) => {
      const spell = maybeGetTalentOrSpell(spellId);
      if (!spell) {
        return [];
      }
      return [
        {
          spellId,
          spell,
          extraCasts: this.extraCasts(spellId),
          cdrMs: this.totalExtraCdrMs.get(spellId) ?? 0,
          wastedMs: this.totalWastedCdrMs.get(spellId) ?? 0,
        },
      ];
    });
  }

  private buildBars(): TalentAggregateBarSpec[] {
    return this.cdrTotals.map(({ spellId, spell, extraCasts, cdrMs, wastedMs }) => {
      return {
        spell,
        amount: extraCasts,
        color: ID_TO_SPELL_COLOR[spellId],
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
      } satisfies TalentAggregateBarSpec;
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
        footer={<>Estimated via cumulative cooldown reduction gained during the buff</>}
        smallFooter
        tooltip={
          <ul>
            <li>
              <SpellLink spell={TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT} /> uptime:{' '}
              {uptimeSec}s ({uptimePct}%)
            </li>
            {this.cdrTotals.map(({ spellId, spell, extraCasts, cdrMs, wastedMs }) => (
              <li key={spellId}>
                <SpellLink spell={spell} />: {formatDuration(cdrMs)} of cooldown reduction,{' '}
                {formatDuration(wastedMs)} wasted, {extraCasts.toFixed(1)} extra casts
              </li>
            ))}
          </ul>
        }
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        position={STATISTIC_ORDER.CORE(1)}
        wide
      >
        <TalentAggregateBars bars={this.buildBars()} wide />
      </TalentAggregateStatisticContainer>
    );
  }
}

export default HeartOfTheJadeSerpent;
