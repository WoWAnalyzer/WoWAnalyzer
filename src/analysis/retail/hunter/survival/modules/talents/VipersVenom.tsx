import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Raptor Strike and Mongoose Bite apply Serpent Sting to your target.
 * Serpent Sting fires a poison-tipped arrow at an enemy, dealing (26.8% of attack power) Nature damage instantly and an additional (125.6% of attack power) over 12 sec.
 * Serpent Sting is Hasted and can pandemic
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/6GjD12YkQCnJqPTz#fight=25&type=damage-done&source=19&translate=true&ability=-259495
 */

class VipersVenom extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    spellUsable: SpellUsable,
    globalCooldown: GlobalCooldown,
  };

  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;
  protected globalCooldown!: GlobalCooldown;

  private targetsHit: number = 0;
  // Travel time of Wildfire Bomb can allow you to consume a tip with the following GCD and so tippedCasts should = tippedDamage
  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.VIPERS_VENOM_TALENT);
    if (!this.active) {
      return;
    }
  }

  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.SERPENT_STING_SURVIVAL.id) / this.owner.fightDuration;
  }

  get uptimeThresholds() {
    return {
      actual: this.uptimePercentage,
      isLessThan: {
        minor: 0.4,
        average: 0.35,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.uptimeThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try and maximize your uptime on <SpellLink spell={TALENTS.VIPERS_VENOM_TALENT} />.
        </>,
      )
        .icon(TALENTS.VIPERS_VENOM_TALENT.icon)
        .actual(
          defineMessage({
            id: 'hunter.survival.suggestions.vipersVenom.uptime',
            message: `${formatPercentage(actual)}% uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.SERPENT_STING_SURVIVAL}>
          <>
            {formatPercentage(this.uptimePercentage)}% <small> DoT uptime</small>
            <br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VipersVenom;
