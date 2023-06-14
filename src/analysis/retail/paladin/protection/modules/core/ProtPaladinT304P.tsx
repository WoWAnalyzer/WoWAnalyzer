import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TIERS } from '../../../../../../game/TIERS';
import { gcJudgmentCrit } from '../CastLinkNormalizer';
import Abilities from '../Abilities';

const JUDGM_PROC_CHANCE = 0.5;

class ProtPaladinT304P extends Analyzer {
  private gcJudgmentCrits: number = 0;
  procs() {
    return this.gcJudgmentCrits;
  }

  static dependencies = {
    abilities: Abilities,
  };
  jResetChances: number = 0;
  abilities!: Abilities;
  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.JUDGMENT_CAST_PROTECTION),
      this.trackGrandCrusaderChanceCrits,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GRAND_CRUSADER_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.GRAND_CRUSADER_BUFF),
      this.onRefreshBuff,
    );
  }

  get jProcChance(): number {
    if (TALENTS.INSPIRING_VANGUARD_TALENT) {
      return JUDGM_PROC_CHANCE + 0.1;
    } else {
      return JUDGM_PROC_CHANCE;
    }
  }

  // If judgment crit within last 100ms, count it as a t304p proc
  // If not, count it as a GC proc, and have inverse counter in GC.tsx
  _lastResetSource: CastEvent | DamageEvent | null = null;

  private onApplyBuff(event: ApplyBuffEvent) {
    // If no Judgment crit for apply buff, T30 4p isn't why we got GC
    if (gcJudgmentCrit(event)) {
      console.log('NoProc APPLY BUFF');
      this.gcJudgmentCrits += 1;
    }
    return;
  }

  private onRefreshBuff(event: RefreshBuffEvent) {
    // const gcjudgmentCrit = gcJudgmentCrit(event);
    // If no Judgment crit for apply buff, T30 4p isn't why we got GC
    if (gcJudgmentCrit(event)) {
      console.log('NoProc Refresh BUFF');
      this.gcJudgmentCrits += 1;
    }
    return;
  }

  trackGrandCrusaderChanceCrits(event: DamageEvent) {
    if (
      event.ability.guid !== SPELLS.JUDGMENT_CAST_PROTECTION.id ||
      !this.selectedCombatant.has4PieceByTier(TIERS.T30) ||
      event.hitType !== HIT_TYPES.CRIT
    ) {
      return;
    }
    this.jResetChances += 1;
    this._lastResetSource = event;
  }

  statistic() {
    //As we use a different formula than the standard one for XAxis, we send it along as a parameter
    const binomChartXAxis = {
      title: 'Reset %',
      tickFormat: (value: number) => `${formatPercentage(value / this.jResetChances, 0)}%`,
      style: {
        fill: 'white',
      },
    };
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        tooltip={
          <>
            Your 4 set reset the cooldown of Avenger's Shield {this.gcJudgmentCrits} times.
            <br />
            You had {this.jResetChances} chances for 4 set to trigger with a{' '}
            {formatPercentage(this.jProcChance, 0)}% chance to trigger.
          </>
        }
        dropdown={
          <div style={{ padding: '8px' }}>
            {plotOneVariableBinomChart(
              this.gcJudgmentCrits,
              this.jResetChances,
              this.jProcChance,
              'Reset %',
              'Actual Resets',
              [0, 0.2],
              binomChartXAxis,
            )}
            <p>
              Likelihood of having <em>exactly</em> as many resets as you did with your talents.
            </p>
          </div>
        }
      >
        <BoringSpellValue
          spellId={TALENTS.GRAND_CRUSADER_TALENT.id}
          value={`${this.gcJudgmentCrits} Resets`}
          label="Tier Bonus"
        />
      </Statistic>
    );
  }
}

export default ProtPaladinT304P;
