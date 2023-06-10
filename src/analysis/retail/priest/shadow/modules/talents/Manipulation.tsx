import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/priest';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { MANIPULATION_COOLDOWN_PER_RANK } from '../../constants';
import UptimeIcon from 'interface/icons/Uptime';

class Manipulation extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  reduction =
    this.selectedCombatant.getTalentRank(TALENTS.MANIPULATION_TALENT) *
    MANIPULATION_COOLDOWN_PER_RANK *
    1000;
  casts = 0; //casts of spells that give CDR
  cooldown = 0; //actual time gained of CDR

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.MANIPULATION_TALENT);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MIND_BLAST), this.cast);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.MIND_SPIKE_TALENT),
      this.cast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MIND_SPIKE_INSANITY_TALENT_DAMAGE),
      this.cast,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY), this.cast);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.cast,
    );
  }

  cast(event: CastEvent) {
    let cd = 0;
    this.casts += 1;
    cd = this.spellUsable.reduceCooldown(
      TALENTS.MINDGAMES_TALENT.id,
      this.reduction,
      event.timestamp,
    );
    this.cooldown = this.cooldown + cd / 1000;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="Amount of cooldown reduction for Mindgames"
      >
        <BoringSpellValueText spellId={TALENTS.MANIPULATION_TALENT.id}>
          <>
            <UptimeIcon /> {this.cooldown.toFixed(1)} <small> seconds</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Manipulation;
