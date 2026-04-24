import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import SpellUsable from '../core/SpellUsable';

/**
 * Activating Bestial Wrath grants 1 charges of Barbed Shot.
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
    this.active = this.selectedCombatant.hasTalent(TALENTS.SCENT_OF_BLOOD_TALENT);
    this.shotRecharges = this.selectedCombatant.getTalentRank(TALENTS.SCENT_OF_BLOOD_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.BESTIAL_WRATH_TALENT),
      this.onBestialWrathCast,
    );
  }

  onBestialWrathCast(event: CastEvent) {
    const chargesAvailable = this.spellUsable.chargesAvailable(TALENTS.BARBED_SHOT_TALENT.id);
    if (this.shotRecharges === 2) {
      this.spellUsable.endCooldown(TALENTS.BARBED_SHOT_TALENT.id, event.timestamp, false, true);
    } else {
      this.spellUsable.endCooldown(TALENTS.BARBED_SHOT_TALENT.id);
    }
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
        <BoringSpellValueText spell={TALENTS.SCENT_OF_BLOOD_TALENT}>
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
