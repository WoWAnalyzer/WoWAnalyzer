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
import MyAbilityNormalizer from '../CastLinkNormalizer';

import Abilities from '../Abilities';
import ProtPaladinT304P from '../core/ProtPaladinT304P';

const BASE_PROC_CHANCE = 0.15;

class GrandCrusader extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    protPaladinT304p: ProtPaladinT304P,
  };
  totalResets: number = 0;
  exactResets: number = 0;
  resetChances: number = 0;
  gcProcs: number = 0;
  abilities!: Abilities;
  normalizer!: MyAbilityNormalizer;
  protPaladinT304p!: ProtPaladinT304P;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT, TALENTS.BLESSED_HAMMER_TALENT]),
      this.trackGrandCrusaderChanceCasts,
    );
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.trackGrandCrusaderChanceHits);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GRAND_CRUSADER_BUFF),
      this.trackGrandCrusaderProcs,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.GRAND_CRUSADER_BUFF),
      this.trackGrandCrusaderProcs,
    );
  }

  lastResetSource: CastEvent | DamageEvent | null = null;
  trackGrandCrusaderChanceCasts(event: CastEvent) {
    if (
      ![TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT.id, TALENTS.BLESSED_HAMMER_TALENT.id].includes(
        event.ability.guid,
      )
    ) {
      return;
    }
    this.resetChances += 1;
    this.lastResetSource = event;
  }

  trackGrandCrusaderChanceHits(event: DamageEvent) {
    if (![HIT_TYPES.DODGE, HIT_TYPES.PARRY].includes(event.hitType)) {
      return;
    }
    this.resetChances += 1;
    this.lastResetSource = event;
  }

  get procChance(): number {
    if (TALENTS.INSPIRING_VANGUARD_TALENT) {
      return BASE_PROC_CHANCE + 0.05;
    } else {
      return BASE_PROC_CHANCE;
    }
  }
  trackGrandCrusaderProcs(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.gcProcs += 1;
  }

  statistic() {
    const gcJProcs = this.protPaladinT304p.gcJudgmentCrits;
    //As we use a different formula than the standard one for XAxis, we send it along as a parameter
    const binomChartXAxis = {
      title: 'Reset %',
      tickFormat: (value: number) => `${formatPercentage(value / this.resetChances, 0)}%`,
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
            Grand Crusader reset the cooldown of Avenger's Shield {this.gcProcs - gcJProcs} times.
            <br />
            You had {this.resetChances} chances for Grand Crusader to trigger with a{' '}
            {formatPercentage(this.procChance, 0)}% chance to trigger.
          </>
        }
        dropdown={
          <div style={{ padding: '8px' }}>
            {plotOneVariableBinomChart(
              this.gcProcs - gcJProcs,
              this.resetChances,
              this.procChance,
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
          value={`${this.gcProcs - gcJProcs} Resets`}
          label="Grand Crusader"
        />
      </Statistic>
    );
  }
}

export default GrandCrusader;
