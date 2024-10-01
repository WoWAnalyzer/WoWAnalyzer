import { Trans } from '@lingui/macro';
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
      TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id,
    );
    if (killCommandIsOnCooldown) {
      this.spellUsable.endCooldown(TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT.id);
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
        <BoringSpellValueText spell={TALENTS.KILLER_COBRA_TALENT}>
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
          Avoid casting <SpellLink spell={TALENTS.COBRA_SHOT_TALENT} /> whilst{' '}
          <SpellLink spell={TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT} /> isn't on cooldown, when
          you have <SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} /> up. Utilize the reset effect
          of <SpellLink spell={TALENTS.KILLER_COBRA_TALENT} /> by only casting{' '}
          <SpellLink spell={TALENTS.COBRA_SHOT_TALENT} /> to reset{' '}
          <SpellLink spell={TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT} /> when{' '}
          <SpellLink spell={TALENTS.BESTIAL_WRATH_TALENT} /> is up.{' '}
        </>,
      )
        .icon(TALENTS.KILLER_COBRA_TALENT.icon)
        .actual(
          <Trans id="hunter.beastmastery.suggestions.killerCobra.efficiency">
            {' '}
            You cast Cobra Shot while Kill Command wasn't on cooldown, whilst Bestial Wrath was up{' '}
            {actual} times.{' '}
          </Trans>,
        )
        .recommended(
          <Trans id="hunter.beastmastery.suggestions.killerCobra.recommended">
            {recommended} is recommended.
          </Trans>,
        ),
    );
  }
}

export default KillerCobra;
