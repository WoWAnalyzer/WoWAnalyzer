import { t } from '@lingui/macro';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { TooltipElement } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { SAVAGE_ROAR_DAMAGE_BONUS } from '../../constants';
import getDamageBonus from '../core/getDamageBonus';

/**
 * Since 8.0 only affects "cat" abilities.
 * Tested and found not to be affected:
 *  Damage procs from trinkets
 *  DoT from bear's Thrash
 *  Sunfire from balance affinity
 *
 * Presumably would affect Brutal Slash, but they're rival talents.
 */
const AFFECTED_BY_SAVAGE_ROAR = [
  SPELLS.MELEE,
  SPELLS.SHRED,
  SPELLS.RAKE,
  SPELLS.RIP,
  SPELLS.FEROCIOUS_BITE,
  SPELLS.MOONFIRE_FERAL,
  SPELLS.THRASH_FERAL,
  SPELLS.SWIPE_CAT,
  SPELLS.FERAL_FRENZY_TALENT,
  SPELLS.MAIM,
  SPELLS.MOONFIRE_DEBUFF, // not really a cat ability, but is affected
];

/**
 * "Finishing move that increases damage by 15% while in Cat Form."
 */
class SavageRoar extends Analyzer {
  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.SAVAGE_ROAR_TALENT.id) / this.owner.fightDuration
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static dependencies = {
    enemies: Enemies,
  };
  bonusDmg = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SAVAGE_ROAR_TALENT.id);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(AFFECTED_BY_SAVAGE_ROAR),
      this.onDamage,
    );
  }

  onDamage(event) {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.SAVAGE_ROAR_TALENT.id) ||
      !this.selectedCombatant.hasBuff(SPELLS.CAT_FORM.id)
    ) {
      return;
    }
    this.bonusDmg += getDamageBonus(event, SAVAGE_ROAR_DAMAGE_BONUS);
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your <SpellLink id={SPELLS.SAVAGE_ROAR_TALENT.id} /> uptime can be improved. You should
          refresh the buff once it has reached its{' '}
          <TooltipElement content="The last 30% of the DoT's duration. When you refresh during this time you don't lose any duration in the process.">
            pandemic window
          </TooltipElement>
          , don't wait for it to wear off. You may also consider switching to{' '}
          <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_FERAL.id} /> which is simpler to use and
          provides more damage in many situations.
        </>,
      )
        .icon(SPELLS.SAVAGE_ROAR_TALENT.icon)
        .actual(
          t({
            id: 'druid.feral.suggestions.savageRoar.uptime',
            message: `${formatPercentage(actual)}% uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip={
          <>
            Your Savage Roar talent contributed <strong>{formatNumber(this.bonusDmg)}</strong> total
            damage ({formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))}%).
          </>
        }
        position={STATISTIC_ORDER.OPTIONAL(1)}
      >
        <BoringSpellValueText spellId={SPELLS.SAVAGE_ROAR_TALENT.id}>
          <>
            <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small> <br />
            <ItemDamageDone amount={this.bonusDmg} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default SavageRoar;
