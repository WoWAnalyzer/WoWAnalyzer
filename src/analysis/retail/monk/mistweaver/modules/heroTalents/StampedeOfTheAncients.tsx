import { formatNumber } from 'common/format';
import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import StrengthOfTheBlackOx, { HealingSource } from './StrengthOfTheBlackOx';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class StampedeOfTheAncients extends Analyzer.withDependencies({
  strengthOfTheBlackOx: StrengthOfTheBlackOx,
}) {
  talent = TALENTS_MONK.STAMPEDE_OF_THE_ANCIENTS_TALENT;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(this.talent);
  }

  get healing() {
    return this.deps.strengthOfTheBlackOx.getHealing(HealingSource.StampedeBonus);
  }

  statistic() {
    const blackOx = this.deps.strengthOfTheBlackOx;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <ul>
            <li>Boosted shields: {blackOx.boostedShields}</li>
            <li>Applications with no boosted shield: {blackOx.batchesWithoutBoost}</li>
            <li>
              Wasted bonus shield: {formatNumber(blackOx.getHealing(HealingSource.StampedeWasted))}
            </li>
          </ul>
        }
      >
        <TalentSpellText talent={this.talent}>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default StampedeOfTheAncients;
