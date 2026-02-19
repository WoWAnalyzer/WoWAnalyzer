import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { TALENTS_PALADIN } from 'common/TALENTS/paladin';
import HIT_TYPES from 'game/HIT_TYPES';

class ArtOfWarProbability extends Analyzer {
  procsGained = 0;
  procChance = 0.15;
  procChanceWithCrit = 0.25;
  totalChances = 0;
  procProbabilities: number[] = [];

  constructor(args: Options) {
    super(args);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PALADIN.ART_OF_WAR_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.MELEE), this.castCounter);
    if (this.selectedCombatant.hasTalent(TALENTS_PALADIN.CRUSADING_STRIKES_TALENT)) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CRUSADING_STRIKES),
        this.castCounter,
      );
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ART_OF_WAR),
      this.gotAProc,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ART_OF_WAR),
      this.gotAProc,
    );
  }

  castCounter(event: DamageEvent) {
    this.totalChances += 1;
    this.procProbabilities.push(
      event.hitType === HIT_TYPES.CRIT ? this.procChanceWithCrit : this.procChance,
    );
  }

  gotAProc() {
    this.procsGained += 1;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Reset Chance: {this.procChance * 100} % on a normal hit and{' '}
            {this.procChanceWithCrit * 100} % on a critical strike
            <br />
            Total Swings: {this.totalChances} <br />
            Total Art of War Procs : {this.procsGained}
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink spell={TALENTS_PALADIN.ART_OF_WAR_TALENT} /> BoJ Reset Chance
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
