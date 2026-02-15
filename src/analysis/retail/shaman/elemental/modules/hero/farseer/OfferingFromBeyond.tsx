import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, { SummonEvent } from 'parser/core/Events';
import { formatNumber } from 'common/format';
import { CooldownIcon } from 'interface/icons';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { Talent } from 'common/TALENTS/types';

const COOLDOWN_REDUCTION_PER_CAST = 3000;

/*
 * When an Ancestor is called, they reduce the cooldown of Stormkeeper by 3 sec.
 */

class OfferingFromBeyond extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  totalCooldownReduction = 0;
  effectiveCooldownReduction = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.OFFERING_FROM_BEYOND_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.CALL_OF_THE_ANCESTORS_SUMMON),
      this.summonAncestor,
    );
  }

  summonAncestor(event: SummonEvent) {
    this.totalCooldownReduction += COOLDOWN_REDUCTION_PER_CAST;
    if (this.deps.spellUsable.isOnCooldown(TALENTS.STORMKEEPER_TALENT.id)) {
      this.effectiveCooldownReduction += this.deps.spellUsable.reduceCooldown(
        TALENTS.STORMKEEPER_TALENT.id,
        COOLDOWN_REDUCTION_PER_CAST,
        event.timestamp,
      );
    }
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
      >
        <TalentSpellText talent={TALENTS.OFFERING_FROM_BEYOND_TALENT}>
          <CooldownIcon /> {formatNumber(this.effectiveCooldownReduction / 1000)}s effective CDR{' '}
          <br />
          <small>
            {formatNumber((this.totalCooldownReduction - this.effectiveCooldownReduction) / 1000)}{' '}
            sec wasted
          </small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default OfferingFromBeyond;
