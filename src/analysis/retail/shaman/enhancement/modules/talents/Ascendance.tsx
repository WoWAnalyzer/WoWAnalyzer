import Events, {
  AnyEvent,
  CastEvent,
  DamageEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import MajorCooldown, { SpellCast } from 'parser/core/MajorCooldowns/MajorCooldown';
import SpellUsable from 'analysis/retail/shaman/enhancement/modules/core/SpellUsable';
import { ChecklistUsageInfo, SpellUse, UsageInfo } from 'parser/core/SpellUsage/core';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';
import Abilities from '../Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Haste from 'parser/shared/modules/Haste';
import { THORIMS_INVOCATION_LINK } from 'analysis/retail/shaman/enhancement/modules/normalizers/EventLinkNormalizer';
import { combineQualitativePerformances } from 'common/combineQualitativePerformances';

const NonMissedCastSpells = [
  TALENTS_SHAMAN.SUNDERING_TALENT.id,
  TALENTS_SHAMAN.DOOM_WINDS_TALENT.id,
  TALENTS_SHAMAN.FERAL_SPIRIT_TALENT.id,
  SPELLS.WINDSTRIKE_CAST.id,
];

interface AscendanceCooldownCast extends SpellCast {
  casts: CastEvent[];
  extraDamage: number;
  startTime: number;
  endTime: number;
  hasteAdjustedWastedCooldown: number;
}

class Ascendance extends MajorCooldown<AscendanceCooldownCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    haste: Haste,
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  protected haste!: Haste;
  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

  protected currentCooldown: AscendanceCooldownCast | null = null;
  protected windstrikeOnCooldown: boolean = true;
  protected lastCooldownWasteCheck: number = 0;

  constructor(options: Options) {
    super({ spell: TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT }, options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_SHAMAN.DEEPLY_ROOTED_ELEMENTS_TALENT);
    if (!this.active) {
      return;
    }

    const ascendanceCooldown = this.selectedCombatant.hasTalent(
      TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT,
    )
      ? 180
      : -1;
    const abilities = options.abilities as Abilities;
    abilities.add({
      spell: SPELLS.WINDSTRIKE_CAST.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      cooldown: (haste: number) => 3 / (1 + haste),
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.85,
        maxCasts: () => this.maxCasts,
      },
    });
    abilities.add({
      spell: TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT.id,
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown: ascendanceCooldown,
      gcd: {
        base: 1500,
      },
      enabled:
        this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT) ||
        this.selectedCombatant.hasTalent(TALENTS_SHAMAN.DEEPLY_ROOTED_ELEMENTS_TALENT),
      damageSpellIds: [SPELLS.ASCENDANCE_INITIAL_DAMAGE.id],
      castEfficiency: {
        suggestion: this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT),
        recommendedEfficiency: 1.0,
      },
    });

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT),
      this.onAscendanceCast,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onGeneralCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT),
      this.onAscendanceEnd,
    );
    this.addEventListener(Events.fightend, this.onAscendanceEnd);
    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(SPELLS.WINDSTRIKE_CAST),
      this.detectWindstrikeCasts,
    );
  }

  detectWindstrikeCasts(event: UpdateSpellUsableEvent) {
    if (event.updateType === UpdateSpellUsableType.BeginCooldown) {
      this.windstrikeOnCooldown = true;
    }
    if (event.updateType === UpdateSpellUsableType.EndCooldown) {
      this.windstrikeOnCooldown = false;
      this.lastCooldownWasteCheck = event.timestamp;
    }
  }

  get maxCasts() {
    return this.casts.reduce(
      (total: number, cast: AscendanceCooldownCast) =>
        (total +=
          cast.casts.filter((c) => c.ability.guid === SPELLS.WINDSTRIKE_CAST.id).length +
          this.getMissedWindstrikes(cast)),
      0,
    );
  }

  /**
   * When Ascendance is cast, being recording the cooldown usage
   * @remarks
   * Deeply Rooted Elements appears as a fabricated cast
   */
  onAscendanceCast(event: CastEvent) {
    this.currentCooldown ??= {
      event: event,
      casts: [],
      extraDamage: 0,
      startTime: event.timestamp,
      endTime: 0,
      hasteAdjustedWastedCooldown: 0,
    };
  }

  onGeneralCast(event: CastEvent) {
    if (
      !this.currentCooldown ||
      event.ability.guid === TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT.id ||
      !event.globalCooldown
    ) {
      return;
    }
    if (!NonMissedCastSpells.includes(event.ability.guid)) {
      this.currentCooldown.hasteAdjustedWastedCooldown +=
        this.hasteAdjustedCooldownWasteSinceLastWasteCheck(event);
    }
    this.lastCooldownWasteCheck = event.timestamp;
    this.currentCooldown!.casts.push(event);
  }

  onDamage(event: DamageEvent) {
    if (this.currentCooldown) {
      this.currentCooldown.extraDamage += event.amount;
    }
  }

  onAscendanceEnd(event: AnyEvent) {
    if (this.currentCooldown) {
      this.currentCooldown.endTime = event.timestamp;
      this.currentCooldown.hasteAdjustedWastedCooldown +=
        this.hasteAdjustedCooldownWasteSinceLastWasteCheck(event);
      this.recordCooldown(this.currentCooldown);
      this.currentCooldown = null;
    }
  }

  hasteAdjustedCooldownWasteSinceLastWasteCheck(event: AnyEvent): number {
    const currentHaste = this.haste.current;
    return (event.timestamp - this.lastCooldownWasteCheck) * (1 + currentHaste);
  }

  description(): JSX.Element {
    return (
      <>
        <p>
          <strong>
            <SpellLink spell={TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT} />
          </strong>{' '}
          is a powerful{' '}
          {this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT) ? (
            <>cooldow</>
          ) : (
            <>proc</>
          )}
          , which when combined with <SpellLink spell={TALENTS_SHAMAN.STATIC_ACCUMULATION_TALENT} />{' '}
          and
          <SpellLink spell={TALENTS_SHAMAN.THORIMS_INVOCATION_TALENT} /> has the potential for
          extemely high burst windows.
        </p>
        <p>
          Prioritising the correct abilities and having{' '}
          <SpellLink spell={TALENTS_SHAMAN.THORIMS_INVOCATION_TALENT} /> primed with{' '}
          <SpellLink spell={SPELLS.LIGHTNING_BOLT} /> is key to getting the most out of{' '}
          <SpellLink spell={TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT} />
        </p>
      </>
    );
  }

  getMissedWindstrikes(cast: AscendanceCooldownCast): number {
    return Math.floor(cast.hasteAdjustedWastedCooldown / 3000);
  }

  windstrikePerformance(cast: AscendanceCooldownCast): UsageInfo {
    const windstrikesCasts = cast.casts.filter(
      (c) => c.ability.guid === SPELLS.WINDSTRIKE_CAST.id,
    ).length;
    const missedWindstrikes = this.getMissedWindstrikes(cast);
    const maximumNumberOfWindstrikesPossible = windstrikesCasts + missedWindstrikes;
    const castsAsPercentageOfMax = windstrikesCasts / maximumNumberOfWindstrikesPossible;

    const windstrikeSummary = (
      <div>
        Cast {Math.floor(maximumNumberOfWindstrikesPossible * 0.85)}+{' '}
        <SpellLink spell={SPELLS.WINDSTRIKE_CAST} />
        (s) during window
      </div>
    );

    if (missedWindstrikes === 0) {
      return {
        performance: QualitativePerformance.Perfect,
        summary: windstrikeSummary,
        details: (
          <div>
            You cast {windstrikesCasts} <SpellLink spell={SPELLS.WINDSTRIKE_CAST} />
            (s).
          </div>
        ),
      };
    }
    return {
      performance:
        castsAsPercentageOfMax >= 0.85
          ? QualitativePerformance.Good
          : castsAsPercentageOfMax >= 0.7
          ? QualitativePerformance.Ok
          : QualitativePerformance.Fail,
      summary: windstrikeSummary,
      details: (
        <div>
          You cast {windstrikesCasts} <SpellLink spell={SPELLS.WINDSTRIKE_CAST} />
          (s) when you could have cast {maximumNumberOfWindstrikesPossible}
        </div>
      ),
    };
  }

  thorimsInvocationPerformance(cast: AscendanceCooldownCast): UsageInfo[] | undefined {
    const result: UsageInfo[] = [];
    const windstrikes = cast.casts.filter((c) => c.ability.guid === SPELLS.WINDSTRIKE_CAST.id);
    const thorimsInvocationFreeCasts = windstrikes.map((event: CastEvent) => {
      return event._linkedEvents
        ?.filter((le) => le.relation === THORIMS_INVOCATION_LINK)
        .map((le) => le.event as DamageEvent);
    });

    // casts without any maelstrom are bad casts
    const noMaelstromCasts = thorimsInvocationFreeCasts.filter((fc) => !fc).length;
    if (noMaelstromCasts) {
      result.push({
        performance: QualitativePerformance.Fail,
        summary: (
          <div>
            You cast <SpellLink spell={SPELLS.WINDSTRIKE_CAST} /> with no{' '}
            <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />
          </div>
        ),
        details: (
          <div>
            <SpellLink spell={SPELLS.WINDSTRIKE_CAST} /> has significantly lower priority when you
            have no stacks of <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />
          </div>
        ),
      });
    }

    const chainLightningCastsWith1Hit = thorimsInvocationFreeCasts.filter((fc) => {
      if (fc) {
        return (
          fc.filter((de) => de.ability.guid === TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT.id).length ===
          1
        );
      }
      return false;
    }).length;
    if (chainLightningCastsWith1Hit > 0) {
      result.push({
        performance: QualitativePerformance.Ok,
        summary: (
          <div>
            <SpellLink spell={TALENTS_SHAMAN.THORIMS_INVOCATION_TALENT} /> was primed with{' '}
            <SpellLink spell={TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT} />
          </div>
        ),
        details: (
          <div>
            <SpellLink spell={TALENTS_SHAMAN.THORIMS_INVOCATION_TALENT} /> cast
            <SpellLink spell={TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT} />{' '}
            {chainLightningCastsWith1Hit} time(s) only hitting one target.
          </div>
        ),
      });
    }
    return result.length > 0 ? result : undefined;
  }

  explainPerformance(cast: AscendanceCooldownCast): SpellUse {
    const checklistItems: ChecklistUsageInfo[] = [];

    const windstrikePerformance = this.windstrikePerformance(cast);
    const thorimsInvocationPerformance = this.thorimsInvocationPerformance(cast);

    checklistItems.push({
      check: 'windstrike',
      timestamp: cast.event.timestamp,
      ...windstrikePerformance,
    });

    if (thorimsInvocationPerformance) {
      thorimsInvocationPerformance.forEach((item) => {
        checklistItems.push({
          check: 'thorims-invocation',
          timestamp: cast.event.timestamp,
          ...item,
        });
      });
    }

    const actualPerformance = combineQualitativePerformances(
      checklistItems.map((item) => item.performance),
    );

    return {
      event: cast.event,
      checklistItems: checklistItems,
      performance: actualPerformance,
      performanceExplanation:
        actualPerformance !== QualitativePerformance.Fail
          ? `${actualPerformance} Usage`
          : 'Bad Usage',
    };
  }
}

export default Ascendance;
