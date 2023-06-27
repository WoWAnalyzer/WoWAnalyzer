
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * While Bestial Wrath is active, Cobra Shot resets the cooldown on Kill
 * Command.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/M8dWYrRvmbnADCcZ#fight=11&type=damage-done&source=169
 *
 */

class KillerCobra extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  effectiveKillCommandResets = 0;
  wastedKillerCobraCobraShots = 0;

  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.KILLER_COBRA_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.COBRA_SHOT_TALENT),
      this.onCobraCast,
    );
  }

  get wastedKillerCobraThreshold() {
    return {
      actual: this.wastedKillerCobraCobraShots,
      isGreaterThan: {
        minor: 0,
        average: 1,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  onCobraCast() {
    if (!this.selectedCombatant.hasBuff(TALENTS.BESTIAL_WRATH_TALENT.id)) {
      return;
    }
    const killCommandIsOnCooldown = this.spellUsable.isOnCooldown(
      TALENTS.KILL_COMMAND_SHARED_TALENT.id,
    );
    if (killCommandIsOnCooldown) {
      this.spellUsable.endCooldown(TALENTS.KILL_COMMAND_SHARED_TALENT.id);
      this.effectiveKillCommandResets += 1;
    } else {
      this.wastedKillerCobraCobraShots += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={TALENTS.KILLER_COBRA_TALENT.id}>
          <>
            {this.effectiveKillCommandResets}/
            {this.effectiveKillCommandResets + this.wastedKillerCobraCobraShots}{' '}
            <small>
              {this.effectiveKillCommandResets + this.wastedKillerCobraCobraShots === 1
                ? 'reset'
                : 'resets'}
            </small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when: When) {
    when(this.wastedKillerCobraThreshold).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Avoid casting <SpellLink id={TALENTS.COBRA_SHOT_TALENT.id} /> whilst{' '}
          <SpellLink id={TALENTS.KILL_COMMAND_SHARED_TALENT.id} /> isn't on cooldown, when you have{' '}
          <SpellLink id={TALENTS.BESTIAL_WRATH_TALENT.id} /> up. Utilize the reset effect of{' '}
          <SpellLink id={TALENTS.KILLER_COBRA_TALENT.id} /> by only casting{' '}
          <SpellLink id={TALENTS.COBRA_SHOT_TALENT.id} /> to reset{' '}
          <SpellLink id={TALENTS.KILL_COMMAND_SHARED_TALENT.id} /> when{' '}
          <SpellLink id={TALENTS.BESTIAL_WRATH_TALENT.id} /> is up.{' '}
        </>,
      )
        .icon(TALENTS.KILLER_COBRA_TALENT.icon)
        .actual(
          <>
            {' '}
            You cast Cobra Shot while Kill Command wasn't on cooldown, whilst Bestial Wrath was up{' '}
            {actual} times.{' '}
          </>,
        )
        .recommended(
          <>
            {recommended} is recommended.
          </>,
        ),
    );
  }
}

export default KillerCobra;
