import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import Abilities from '../Abilities';

class Ascendance extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    enemies: Enemies,
  };
  justEnteredAscendance = false;
  checkDelay = 0;
  numCasts = {
    [SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id]: 0,
    [SPELLS.LAVA_BURST.id]: 0,
    [SPELLS.EARTH_SHOCK.id]: 0,
    [SPELLS.ELEMENTAL_BLAST_TALENT.id]: 0,
    others: 0,
  };
  protected abilities!: Abilities;
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id);
  }

  get AscendanceUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id) /
      this.owner.fightDuration
    );
  }

  get averageLavaBurstCasts() {
    return (
      this.numCasts[SPELLS.LAVA_BURST.id] / this.numCasts[SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id] ||
      0
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.numCasts.others,
      isGreaterThan: {
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic() {
    const hasEB = this.selectedCombatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id);

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            With a uptime of: {formatPercentage(this.AscendanceUptime)} %<br />
            Casts while Ascendance was up:
            <ul>
              <li>Earth Shock: {this.numCasts[SPELLS.EARTH_SHOCK.id]}</li>
              <li>Lava Burst: {this.numCasts[SPELLS.LAVA_BURST.id]}</li>
              {hasEB && <li>Elemental Blast: {this.numCasts[SPELLS.ELEMENTAL_BLAST_TALENT.id]}</li>}
              <li>Other Spells: {this.numCasts.others}</li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id}>
          <>
            On average {formatNumber(this.averageLavaBurstCasts)} Lava Bursts cast during
            Ascendance.
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when: When) {
    const abilities = `Lava Burst ${
      this.selectedCombatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id) ? `, Elemental Blast ` : ``
    } and Earth Shock`;
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(<span>Maximize your damage during ascendance by only using ${abilities}.</span>)
        .icon(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.icon)
        .actual(`${actual} other casts during Ascendence`)
        .recommended(`Only cast ${abilities} during Ascendence.`),
    );
  }
}

export default Ascendance;
