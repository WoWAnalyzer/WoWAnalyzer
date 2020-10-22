import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { EnergizeEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class ArtificeOfTheArchmage extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  }
  protected spellUsable!: SpellUsable;

  freeCharges = 0;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.ARTIFICE_OF_THE_ARCHMAGE.id);
    this.addEventListener(Events.energize.by(SELECTED_PLAYER).spell(SPELLS.ARTIFICE_OF_THE_ARCHMAGE_ENERGIZE), this.onEnergize);
  }

  onEnergize(event: EnergizeEvent) {
    this.freeCharges += 2;
  }

  get chargesPerMinute() {
    return this.freeCharges / (this.owner.fightDuration / 60000) || 0;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={<>The number of Arcane Charges you received from the Artifice of the Archmage conduit. </>}
      >
        <BoringSpellValueText spell={SPELLS.ARTIFICE_OF_THE_ARCHMAGE}>
          {this.freeCharges} <small>Free Arcane Charges</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArtificeOfTheArchmage;
