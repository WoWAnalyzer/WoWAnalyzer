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
import StaggerPool from '../core/StaggerPool';
import Spell from 'common/SPELLS/Spell';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

export default abstract class StaggerStatistic extends Analyzer.withDependencies({
  stagger: StaggerPool,
}) {
  private staggerRemoved = 0;
  private removalEventCount = 0;
  readonly ability: Talent | Spell;

  get amount(): number {
    return this.staggerRemoved;
  }

  get count(): number {
    return this.removalEventCount;
  }

  protected removeStagger(event: AnyEvent, amount: number) {
    this.removalEventCount += 1;
    const currentTotal = this.deps.stagger.getPoolAtTime(event.timestamp).total;
    // don't allow removing more than is present
    this.staggerRemoved += Math.min(currentTotal, amount);
  }

  constructor(ability: Talent | Spell, options: Options) {
    super(options);
    this.ability = ability;

    if ('entryIds' in ability) {
      this.active = this.selectedCombatant.hasTalent(ability);
    }
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
        <SpellTextWrapper ability={this.ability}>
          <ItemDamageTaken amount={this.staggerRemoved} hideTotal />
        </SpellTextWrapper>
      </Statistic>
    );
  }
}

function SpellTextWrapper({
  ability,
  children,
}: {
  ability: Talent | Spell;
  children: React.ReactNode;
}) {
  if ('entryIds' in ability) {
    return <TalentSpellText talent={ability}>{children}</TalentSpellText>;
  } else {
    return <BoringSpellValueText spell={ability}>{children}</BoringSpellValueText>;
  }
}
