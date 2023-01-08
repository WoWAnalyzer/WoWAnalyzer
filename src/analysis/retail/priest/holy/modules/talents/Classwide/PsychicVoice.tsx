import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyDebuffEvent, CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

// Example Log: /report/nWVBjGLrDQvahH7M/15-Mythic+Taloc+-+Kill+(6:50)/3-Claver
class PsychicVoice extends Analyzer {
  psychicScreamCasts = 0;
  psychicScreamHits = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PSYCHIC_VOICE_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PSYCHIC_SCREAM),
      this.onCast,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.PSYCHIC_SCREAM),
      this.onApplyDebuff,
    );
  }

  onCast(event: CastEvent) {
    this.psychicScreamCasts += 1;
  }

  onApplyDebuff(event: ApplyDebuffEvent) {
    this.psychicScreamHits += 1;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(4)}
      >
        <BoringSpellValueText spellId={TALENTS.PSYCHIC_VOICE_TALENT.id}>
          {this.psychicScreamHits} Targets Feared
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PsychicVoice;
