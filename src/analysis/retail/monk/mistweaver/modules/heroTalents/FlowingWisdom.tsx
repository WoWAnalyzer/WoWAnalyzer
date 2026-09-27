import { formatDuration, formatPercentage } from 'common/format';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import HeartOfTheJadeSerpent from '../spells/HeartOfTheJadeSerpent';
import { FLOWING_WISDOM_HASTE } from 'analysis/retail/monk/shared/hero/ConduitOfTheCelestials/constants';
import HasteIcon from 'interface/icons/Haste';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class FlowingWisdom extends Analyzer.withDependencies({
  heartOfTheJadeSerpent: HeartOfTheJadeSerpent,
}) {
  talent = TALENTS_MONK.FLOWING_WISDOM_TALENT;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(this.talent);
  }

  get uptime() {
    return this.deps.heartOfTheJadeSerpent.uptime;
  }

  get uptimePercent() {
    return this.uptime / this.owner.fightDuration;
  }

  get averageHaste() {
    return FLOWING_WISDOM_HASTE * this.uptimePercent;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            Haste is active whenever{' '}
            <SpellLink spell={TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT} /> is, for{' '}
            {formatDuration(this.uptime)} of the fight.
          </>
        }
      >
        <TalentSpellText talent={this.talent}>
          <div>
            <HasteIcon /> {formatPercentage(this.averageHaste)}% <small>average Haste</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default FlowingWisdom;
