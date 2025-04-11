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
import Abilities from 'parser/core/modules/Abilities';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const BASE_PROC_CHANCE = 0.15;
const IV_PROC_CHANCE = 0.2;

const BASE_CDR_AMOUNT = 3000;
const CJ_CDR_AMOUNT = 3000;

class GrandCrusader extends Analyzer.withDependencies({
  abilities: Abilities,
  spellUsable: SpellUsable,
}) {
  totalResets: number = 0;
  exactResets: number = 0;
  resetChances: number = 0;
  gcProcs: number = 0;

  procChance = BASE_PROC_CHANCE;
  cdrAmount = BASE_CDR_AMOUNT;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.GRAND_CRUSADER_TALENT);

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

    if (this.selectedCombatant.hasTalent(TALENTS.CRUSADERS_JUDGMENT_TALENT)) {
      this.cdrAmount += CJ_CDR_AMOUNT;
    }

    if (this.selectedCombatant.hasTalent(TALENTS.INSPIRING_VANGUARD_TALENT)) {
      this.procChance = IV_PROC_CHANCE;
    }
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

  trackGrandCrusaderProcs(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.gcProcs += 1;
    this.deps.spellUsable.reduceCooldown(
      SPELLS.JUDGMENT_CAST_PROTECTION.id,
      this.cdrAmount,
      event.timestamp,
    );
    this.deps.spellUsable.endCooldown(TALENTS.AVENGERS_SHIELD_TALENT.id, event.timestamp);
  }

  statistic() {
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
            Grand Crusader reset the cooldown of Avenger's Shield {this.gcProcs} times.
            <br />
            You had {this.resetChances} chances for Grand Crusader to trigger with a{' '}
            {formatPercentage(this.procChance, 0)}% chance to trigger.
          </>
        }
        dropdown={
          <div style={{ padding: '8px' }}>
            {plotOneVariableBinomChart(
              this.gcProcs,
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
          spell={TALENTS.GRAND_CRUSADER_TALENT.id}
          value={`${this.gcProcs} Resets`}
          label="Grand Crusader"
        />
      </Statistic>
    );
  }
}

export default GrandCrusader;
