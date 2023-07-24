import Events, { AnyEvent, CastEvent, DamageEvent } from 'parser/core/Events';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import MajorCooldown, { SpellCast } from 'parser/core/MajorCooldowns/MajorCooldown';
import Enemies from 'parser/shared/modules/Enemies';
import SpellUsable from 'analysis/retail/shaman/enhancement/modules/core/SpellUsable';
import { SpellUse } from 'parser/core/SpellUsage/core';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { SpellLink } from 'interface';
import SPELLS from 'common/SPELLS';

interface AscendanceCooldownCast extends SpellCast {
  casts: CastEvent[];
  extraDamage: number;
  startTime: number;
  endTime: number;
}

class Ascendance extends MajorCooldown<AscendanceCooldownCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    enemies: Enemies,
    spellUsable: SpellUsable,
  };

  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;
  protected currentCooldown: AscendanceCooldownCast | null = null;

  constructor(options: Options) {
    super({ spell: TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT }, options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_SHAMAN.DEEPLY_ROOTED_ELEMENTS_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT),
      this.onEnd,
    );
    this.addEventListener(Events.fightend, this.onEnd);
  }

  onCast(event: CastEvent) {
    if (event.ability.guid === TALENTS_SHAMAN.ASCENDANCE_ENHANCEMENT_TALENT.id) {
      this.currentCooldown ??= {
        event: event,
        casts: [],
        extraDamage: 0,
        startTime: event.timestamp,
        endTime: 0,
      };
    } else if (this.currentCooldown) {
      this.currentCooldown.casts.push(event);
    }
  }

  onDamage(event: DamageEvent) {
    if (this.currentCooldown) {
      this.currentCooldown.extraDamage += event.amount;
    }
  }

  onEnd(event: AnyEvent) {
    if (this.currentCooldown) {
      this.currentCooldown.endTime = event.timestamp;
      this.recordCooldown(this.currentCooldown);
      this.currentCooldown = null;
    }
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

  explainPerformance(cast: AscendanceCooldownCast): SpellUse {
    const performance: QualitativePerformance = QualitativePerformance.Perfect;
    return {
      event: cast.event,
      checklistItems: [],
      performance: performance,
      performanceExplanation: <>{performance} Usage</>,
    };
  }
}

export default Ascendance;
