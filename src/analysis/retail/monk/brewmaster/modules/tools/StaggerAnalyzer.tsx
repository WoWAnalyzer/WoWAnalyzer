import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { Talent } from 'common/TALENTS/types';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { AnyEvent } from 'parser/core/Events';
import ItemDamageTaken from 'parser/ui/ItemDamageTaken';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import StaggerFabricator from '../core/StaggerFabricator';

export default abstract class StaggerStatistic extends Analyzer {
  static dependencies = { fab: StaggerFabricator };
  protected fab!: StaggerFabricator;

  private staggerRemoved = 0;
  private removalEventCount = 0;
  private talent: Talent;

  protected removeStagger(event: AnyEvent, amount: number) {
    this.staggerRemoved += this.fab.removeStagger(event, amount);
    this.removalEventCount += 1;
  }

  constructor(talent: Talent, options: Options) {
    super(options);
    this.talent = talent;

    this.active = this.selectedCombatant.hasTalent(talent);
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Removed <strong>{formatNumber(this.staggerRemoved)}</strong>{' '}
            <SpellLink spell={SPELLS.STAGGER} /> over <strong>{this.removalEventCount}</strong>{' '}
            clears (an average of{' '}
            <strong>{formatNumber(this.staggerRemoved / this.removalEventCount)}</strong> per
            clear).
          </>
        }
      >
        <TalentSpellText talent={this.talent}>
          <ItemDamageTaken amount={this.staggerRemoved} hideTotal />
        </TalentSpellText>
      </Statistic>
    );
  }
}
