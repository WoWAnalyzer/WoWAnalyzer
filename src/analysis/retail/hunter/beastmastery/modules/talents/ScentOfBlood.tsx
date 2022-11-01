import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import SpellUsable from '../core/SpellUsable';

/**
 * Activating Bestial Wrath grants 1/2 charges of Barbed Shot. (depending on points)
 *
 * Example log:
 */

class ScentOfBlood extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  chargesGained = 0;
  chargesWasted = 0;
  shotRecharges = 0;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SCENT_OF_BLOOD_TALENT.id);
    this.shotRecharges = this.selectedCombatant.getTalentRank(TALENTS.SCENT_OF_BLOOD_TALENT.id);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BESTIAL_WRATH),
      this.bestialWrathApplication,
    );
  }

  bestialWrathApplication() {
    const chargesAvailable = this.spellUsable.chargesAvailable(SPELLS.BARBED_SHOT.id);
    this.chargesGained += this.shotRecharges - chargesAvailable;
    this.chargesWasted += chargesAvailable;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS.SCENT_OF_BLOOD_TALENT.id}>
          <>
            {this.chargesGained}/{this.chargesGained + this.chargesWasted}{' '}
            <small>charges gained</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ScentOfBlood;
