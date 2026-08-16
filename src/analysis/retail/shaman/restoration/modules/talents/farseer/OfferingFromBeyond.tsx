/**
 * When an Ancestor is called, they reduce the cooldown of Riptide by 2 sec.
 */

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, ApplyBuffStackEvent } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { OFFERING_FROM_BEYOND_CD_REDUCTION } from 'src/analysis/retail/shaman/restoration/constants';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { formatDuration } from 'common/format';

export default class OfferingFromBeyond extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  stacksGained = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.OFFERING_FROM_BEYOND_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.CALL_OF_THE_ANCESTORS_BUFF),
      this.onStackGained,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.CALL_OF_THE_ANCESTORS_BUFF),
      this.onStackGained,
    );
  }

  onStackGained(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    if (this.spellUsable.isOnCooldown(TALENTS.RIPTIDE_TALENT.id)) {
      this.spellUsable.reduceCooldown(TALENTS.RIPTIDE_TALENT.id, OFFERING_FROM_BEYOND_CD_REDUCTION);
      this.stacksGained += 1;
    }
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.HERO_TALENTS} size="flexible" wide={false}>
        <TalentSpellText talent={TALENTS.OFFERING_FROM_BEYOND_TALENT}>
          {formatDuration(this.stacksGained * OFFERING_FROM_BEYOND_CD_REDUCTION)}
          <p>
            <small>{this.stacksGained} times triggerd</small>
          </p>
        </TalentSpellText>
      </Statistic>
    );
  }
}
