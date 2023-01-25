import { t } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/EventFilter';
import Events, { DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import { ABILITIES_AFFECTED_BY_DAMAGE_INCREASES } from '../../constants';
import { TALENTS_MONK } from 'common/TALENTS';

const MOD_PER_STACK = 0.01;
const MAX_STACKS = 6;

class HitCombo extends Analyzer {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.HIT_COMBO_TALENT);
    if (this.active) {
      this.addEventListener(
        Events.damage
          .by(SELECTED_PLAYER | SELECTED_PLAYER_PET)
          .spell(ABILITIES_AFFECTED_BY_DAMAGE_INCREASES),
        this.onAffectedDamage,
      );
    }
  }
  totalDamage = 0;

  onAffectedDamage(event: DamageEvent) {
    const buffInfo = this.selectedCombatant.getBuff(SPELLS.HIT_COMBO_BUFF.id);
    if (!buffInfo) {
      return;
    }
    const mod = buffInfo.stacks * MOD_PER_STACK;
    const increase = calculateEffectiveDamage(event, mod);
    this.totalDamage += increase;
  }

  get uptime() {
    return (
      this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.HIT_COMBO_BUFF.id) /
      (this.owner.fightDuration * MAX_STACKS)
    );
  }

  get dps() {
    return (this.totalDamage / this.owner.fightDuration) * 1000;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          You let your <SpellLink id={TALENTS_MONK.HIT_COMBO_TALENT.id} /> buff drop by casting a
          spell twice in a row. Dropping this buff is a large DPS decrease so be mindful of the
          spells being cast.
        </span>,
      )
        .icon(TALENTS_MONK.HIT_COMBO_TALENT.icon)
        .actual(
          t({
            id: 'monk.windwalker.suggestions.hitCombo.uptime',
            message: `${formatPercentage(actual)} % uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)} % is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(11)}
        size="flexible"
        tooltip={
          <>
            Total damage increase: {formatNumber(this.totalDamage)}
            <br />
            Uptime is weighted so less stacks count less towards 100% uptime
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS_MONK.HIT_COMBO_TALENT.id}>
          <UptimeIcon /> {formatPercentage(this.uptime)}% <small>Weighted uptime</small>
          <br />
          <img src="/img/sword.png" alt="Damage" className="icon" /> {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.totalDamage))} % of
            total
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default HitCombo;
