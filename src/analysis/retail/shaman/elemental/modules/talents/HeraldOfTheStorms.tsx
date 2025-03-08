import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { CooldownIcon } from 'interface/icons';
import { formatNumber } from 'common/format';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

const COOLDOWN_REDUCTION_PER_CAST = 2000;

class HeraldOfTheStorms extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  totalCooldownReduction: number = 0;
  effectiveCooldownReduction: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HERALD_OF_THE_STORMS_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.LIGHTNING_BOLT, TALENTS.CHAIN_LIGHTNING_TALENT, SPELLS.TEMPEST_CAST]),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
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
        <TalentSpellText talent={TALENTS.HERALD_OF_THE_STORMS_TALENT}>
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

export default HeraldOfTheStorms;
