import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

class TormentedSpirits extends Analyzer {
  castVB = 0;
  castMB = 0;
  castSA = 0;
  castDP = 0;
  castSI = 0; //gained from surge of insanity with archon

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.TORMENTED_SPIRITS_TALENT);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MIND_BLAST), this.onCastMB);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VOID_BOLT), this.onCastVB);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SHADOW_WORD_MADNESS_TALENT),
      this.onCastDP,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHADOWY_APPARITION_CAST),
      this.onCastSA,
    );
    //Archon also gets Apiritions from Surge of Insanity
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MIND_FLAY_INSANITY_TALENT_DAMAGE),
      this.onCastSurgeOfInsanity,
    );
  }

  onCastMB() {
    this.castMB += 1;
  }
  onCastVB() {
    this.castVB += 1;
  }
  onCastDP() {
    this.castDP += 1;
  }
  onCastSA() {
    this.castSA += 1;
  }
  onCastSurgeOfInsanity() {
    this.castSI += 1;
  }

  get tormentedSpirits() {
    //appiritions are spawned by mind blast, void bolt, devouring plague and the talent tormented spirits
    //by calculating the casts of the others and the total, we can find the number of casts of tormented spirits
    //Archon also spawns spirts from Surges of Insanity due to the Energy Cycle Hero Talent
    if (this.selectedCombatant.hasTalent(TALENTS.ENERGY_CYCLE_TALENT)) {
      return this.castSA - this.castMB - this.castVB - this.castDP - this.castSI;
    }
    return this.castSA - this.castMB - this.castVB - this.castDP;
  }

  //this is used in ShadowyApparitions to show all Apparition Talents together
  subStatistic() {
    return (
      <BoringSpellValueText spell={TALENTS.TORMENTED_SPIRITS_TALENT}>
        <div>
          <>{this.tormentedSpirits}</> <small>extra spirits out of {this.castSA} total</small>
        </div>
      </BoringSpellValueText>
    );
  }
}

export default TormentedSpirits;
