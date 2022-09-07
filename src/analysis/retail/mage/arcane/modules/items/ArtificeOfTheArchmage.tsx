import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class ArtificeOfTheArchmage extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  conduitRank = 0;
  freeCharges = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.ARTIFICE_OF_THE_ARCHMAGE.id);
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(
      SPELLS.ARTIFICE_OF_THE_ARCHMAGE.id,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.ARTIFICE_OF_THE_ARCHMAGE_ENERGIZE),
      this.onEnergize,
    );
  }

  onEnergize(event: ResourceChangeEvent) {
    this.freeCharges += 2;
  }

  get chargesPerMinute() {
    return this.freeCharges / (this.owner.fightDuration / 60000) || 0;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.COVENANTS}
        size="flexible"
        tooltip={
          <>The number of Arcane Charges you received from the Artifice of the Archmage conduit. </>
        }
      >
        <ConduitSpellText spellId={SPELLS.ARTIFICE_OF_THE_ARCHMAGE.id} rank={this.conduitRank}>
          {this.freeCharges} <small>Free Arcane Charges</small>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default ArtificeOfTheArchmage;
