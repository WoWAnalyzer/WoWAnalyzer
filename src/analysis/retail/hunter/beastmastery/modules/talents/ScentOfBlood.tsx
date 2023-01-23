import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
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
    this.active = this.selectedCombatant.hasTalent(TALENTS.SCENT_OF_BLOOD_TALENT);
    this.shotRecharges = this.selectedCombatant.getTalentRank(TALENTS.SCENT_OF_BLOOD_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.BESTIAL_WRATH_TALENT),
      this.bestialWrathApplication,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(TALENTS.BESTIAL_WRATH_TALENT),
      this.bestialWrathApplication,
    );
  }

  bestialWrathApplication(event: ApplyBuffEvent | RefreshBuffEvent) {
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
