import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TIERS } from 'game/TIERS';

class AshesToAshesProbability extends Analyzer {
  procsGained: number = 0;
  chance: number = 0.12;
  totalChances: number = 0;
  procProbabilities: number[] = [];

  constructor(args: Options) {
    super(args);
    this.chance = this.selectedCombatant.hasTalent(SPELLS.BLADE_OF_WRATH_TALENT) ? 0.24 : 0.12;

    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T28);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MELEE), this.castCounter);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ASHES_TO_ASHES),
      this.gotAProc,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ASHES_TO_ASHES),
      this.gotAProc,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.BLADE_OF_WRATH_PROC),
      this.gotAProc,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.BLADE_OF_WRATH_PROC),
      this.gotAProc,
    );
  }

  castCounter() {
    this.totalChances += 1;
    this.procProbabilities.push(this.chance);
  }

  gotAProc() {
    this.procsGained += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={
          <>
            Reset Chance: {this.chance * 100} % <br />
            Total Swings: {this.totalChances} <br />
            Total Art of War Procs : {this.procsGained}
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink id={SPELLS.ART_OF_WAR.id} /> Overall Reset Chance
            </>
          }
        >
          {plotOneVariableBinomChart(this.procsGained, this.totalChances, this.procProbabilities)}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default AshesToAshesProbability;
