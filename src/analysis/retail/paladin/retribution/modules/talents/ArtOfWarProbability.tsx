import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/paladin';

class ArtOfWarProbability extends Analyzer {
  hasTier = false;
  flipFlop = false;

  procsGained: number = 0;
  chance: number = 0.12;
  totalChances: number = 0;
  procProbabilities: number[] = [];

  constructor(args: Options) {
    super(args);
    this.chance = this.selectedCombatant.hasTalent(TALENTS.ART_OF_WAR_TALENT) ? 0.2 : 0;

    this.active = this.chance > 0;

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MELEE), this.castCounter);

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
    if (this.hasTier && this.flipFlop) {
      this.flipFlop = !this.flipFlop;
      return;
    }
    this.totalChances += 1;
    this.procProbabilities.push(this.chance);
    this.flipFlop = !this.flipFlop;
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
              <SpellLink spell={SPELLS.ART_OF_WAR} /> BoJ Reset Chance
            </>
          }
        >
          {plotOneVariableBinomChart(this.procsGained, this.totalChances, this.procProbabilities)}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default ArtOfWarProbability;
