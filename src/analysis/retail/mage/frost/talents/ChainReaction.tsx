import Analyzer, { Options } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/mage';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import IceLance from 'analysis/retail/mage/frost/core/IceLance';
import SPELLS from 'common/SPELLS';

const STACK_DMG_INCREASE = 0.02;

export default class ChainReaction extends Analyzer {
  static dependencies = {
    iceLance: IceLance,
  };

  protected iceLance!: IceLance;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CHAIN_REACTION_TALENT);
  }

  statistic() {
    let chainReactionTotalDamage = 0;

    this.iceLance.icelance.forEach((icelance) => {
      if (typeof icelance.damage !== 'undefined') {
        const chainReactionStacks = this.selectedCombatant.getBuffStacks(
          SPELLS.CHAIN_REACTION_BUFF.id,
          icelance.damage.timestamp,
        );
        const chainReactionDamage =
          icelance.damage.amount * chainReactionStacks * STACK_DMG_INCREASE;
        const chainReactionCleaveDamage = icelance.cleaveDamage
          ? icelance.cleaveDamage.amount * chainReactionStacks * STACK_DMG_INCREASE
          : 0;
        chainReactionTotalDamage += chainReactionDamage;
        chainReactionTotalDamage += chainReactionCleaveDamage;
      }
    });

    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <BoringSpellValueText spell={TALENTS.CHAIN_REACTION_TALENT}>
          <>
            <p>{this.owner.formatItemDamageDone(chainReactionTotalDamage)}</p>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
