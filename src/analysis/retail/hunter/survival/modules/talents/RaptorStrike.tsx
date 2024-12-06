import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SpellLink } from 'interface';
/**
 * A vicious slash dealing (70% of Attack power) Physical damage.
 *
 * Example log with timeline warning:
 * https://www.warcraftlogs.com/reports/ZRALzNbMpqka1fTB#fight=17&type=summary&source=329
 */

class RaptorStrike extends Analyzer {
  constructor(options: Options) {
    super(options);

    this.active =
      !this.selectedCombatant.hasTalent(TALENTS.MONGOOSE_BITE_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS.VIPERS_VENOM_TALENT);

    if (!this.active) {
      return;
    }
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        At it's core, Survival is a spec whose rotation revolves around generating Focus with Kill
        Command and spending it with <SpellLink spell={TALENTS.RAPTOR_STRIKE_TALENT} />
        or <SpellLink spell={TALENTS.MONGOOSE_BITE_TALENT} />. If you cannot generate focus without
        wasting, then it should be spent. The cut off for not wasting focus is 77 because{' '}
        <SpellLink spell={TALENTS.KILL_COMMAND_SURVIVAL_TALENT} />
        generates 15 focus on use, and then you passively generate 7.5 focus during the global
        cooldown for a total of 23 focus (rounded up). You will find you are balancing generating
        and spending focus with generating and spending
        <SpellLink spell={TALENTS.TIP_OF_THE_SPEAR_TALENT} />. There are several abilities that are
        stronger than <SpellLink spell={TALENTS.RAPTOR_STRIKE_TALENT} /> and it is ideal to keep
        them on cooldown and engage with spec mechanics that reduce their cooldown like{' '}
        <SpellLink spell={TALENTS.LUNGE_TALENT} />,{' '}
        <SpellLink spell={TALENTS.FRENZY_STRIKES_TALENT} /> and{' '}
        <SpellLink spell={TALENTS.GRENADE_JUGGLER_TALENT} />.
      </p>
    );
    return explanation;
  }
}

export default RaptorStrike;
