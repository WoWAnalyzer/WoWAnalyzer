import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { addAdditionalCastInformation } from 'parser/core/EventMetaLib';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * Casting Cobra Shot, Barbed Shot, or Black Arrow grants Nature's Ally, increasing the
 * damage of your next Kill Command by 30%.
 */
class NaturesAlly extends Analyzer {
  casts = 0;
  castsWithoutBuff = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.NATURES_ALLY_3_BEAST_MASTERY_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.KILL_COMMAND_BEAST_MASTERY_TALENT),
      this.onKillCommandCast,
    );
  }

  onKillCommandCast(event: CastEvent) {
    this.casts += 1;
    if (this.selectedCombatant.hasBuff(SPELLS.NATURES_ALLY_BUFF.id)) {
      return;
    }
    this.castsWithoutBuff += 1;
    addAdditionalCastInformation(
      event,
      <>
        Cast without <SpellLink spell={SPELLS.NATURES_ALLY_BUFF} /> active. This is fine while
        cleaving multiple targets, but on single target this Kill Command missed out on 30%
        increased damage.
      </>,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.NATURES_ALLY_3_BEAST_MASTERY_TALENT}>
          <>
            {this.castsWithoutBuff}/{this.casts}{' '}
            <small>Kill Commands cast without Nature's Ally</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default NaturesAlly;
