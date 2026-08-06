import TALENTS from 'common/TALENTS/paladin';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import SPECS from 'game/SPECS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValue from 'parser/ui/BoringSpellValue';

class DivineResonance extends Analyzer {
  private resonanceSpell: Spell | null = null;
  private resonanceWindowEnd = 0;
  private castsInWindow = 0;
  private totalCasts = 0;
  private totalWindows = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.DIVINE_RESONANCE_SHARED_TALENT);
    if (!this.active) {
      return;
    }

    const specId = this.selectedCombatant.specId;
    switch (specId) {
      case SPECS.PROTECTION_PALADIN.id:
        this.resonanceSpell = TALENTS.AVENGERS_SHIELD_TALENT;
        break;
      case SPECS.RETRIBUTION_PALADIN.id:
        this.resonanceSpell = SPELLS.JUDGMENT_CAST;
        break;
      case SPECS.HOLY_PALADIN.id:
        this.resonanceSpell = TALENTS.HOLY_SHOCK_TALENT;
        break;
      default:
        this.active = false;
        return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DIVINE_TOLL_TALENT),
      this.onDivineTollCast,
    );

    if (this.resonanceSpell) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(this.resonanceSpell),
        this.onResonanceCast,
      );
    }
  }

  private onDivineTollCast(event: CastEvent) {
    this.resonanceWindowEnd = event.timestamp + 15000;
    this.castsInWindow = 0;
    this.totalWindows += 1;
  }

  private onResonanceCast(event: CastEvent) {
    if (event.timestamp <= this.resonanceWindowEnd) {
      this.castsInWindow += 1;
      this.totalCasts += 1;
    }
  }

  get maxCasts(): number {
    return this.totalWindows * 3;
  }

  get efficiency(): number {
    return this.maxCasts > 0 ? this.totalCasts / this.maxCasts : 0;
  }

  statistic() {
    if (!this.active || !this.resonanceSpell) {
      return null;
    }

    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            You used Divine Toll {this.totalWindows} times.
            <p />
            Maximum possible Resonance casts: {this.maxCasts} (3 per use).
            <p />
            Actual casts: {this.totalCasts}
          </>
        }
      >
        <BoringSpellValue
          spell={TALENTS.DIVINE_RESONANCE_SHARED_TALENT.id}
          value={`${this.totalCasts} / ${this.maxCasts}`}
          label="Resonance casts"
        />
      </Statistic>
    );
  }
}

export default DivineResonance;
