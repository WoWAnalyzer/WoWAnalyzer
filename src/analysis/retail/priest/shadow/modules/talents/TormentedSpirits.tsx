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

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MIND_BLAST), this.onCastMB);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VOID_BOLT), this.onCastVB);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.DEVOURING_PLAGUE_TALENT),
      this.onCastDP,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SHADOWY_APPARITION_CAST),
      this.onCastSA,
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

  get tormentedSpirits() {
    //appiritions are spawned by mind blast, void bolt, devouring plague and the talent tormented spirits
    //by calculating the casts of the others and the total, we can find the number of casts of tormented spirits
    return this.castSA - this.castMB - this.castVB - this.castDP;
  }

  //this is used in ShadowyApparitions to show all Apparition Talents together
  statisticSubsection() {
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
