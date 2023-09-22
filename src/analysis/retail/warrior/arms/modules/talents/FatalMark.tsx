import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/warrior';
import SPELLS from 'common/SPELLS';
import Events, { ApplyDebuffEvent, ApplyDebuffStackEvent, DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';
import BoringValueText from 'parser/ui/BoringValueText';
import { formatNumber } from 'common/format';

class FatalMark extends Analyzer {
  //stacks on enemies based on their ID and instance as string. Could be fun but not needed.
  //private stacksOnEnemy: Map<string, number> = new Map<string, number>();
  private dmgUseCount = 0;
  private totalDamage = 0;
  private totalStacks = 0;

  //-- NOTE: Maybe the % of Mortal Strike / Cleaves that applied a stack would be interesting?

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FATALITY_TALENT);
    if (!this.active) {
      return;
    }
    //the first application of the debuff
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.FATAL_MARK_DEBUFF),
      this.onApplyDebuff,
    );
    //every stack afterwards
    this.addEventListener(
      Events.applydebuffstack.by(SELECTED_PLAYER).spell(SPELLS.FATAL_MARK_DEBUFF),
      this.onApplyDebuffStack,
    );
    //damage done by the talent.
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FATAL_MARK_DAMAGE),
      this.onDamage,
    );
  }

  private onApplyDebuff(event: ApplyDebuffEvent) {
    //const tID = this.getTargetIdentifier(event.targetID!, event.targetInstance || 0);
    //this.stacksOnEnemy.set(tID, 1);
    this.totalStacks += 1;
  }

  private onApplyDebuffStack(event: ApplyDebuffStackEvent) {
    //const tID = this.getTargetIdentifier(event.targetID!, event.targetInstance || 0);
    //ex: applyStack starts at the 2nd stack.
    //this.stacksOnEnemy.set(tID, (this.stacksOnEnemy.get(tID) || 1) + 1);
    this.totalStacks += 1;
  }

  private onDamage(event: DamageEvent) {
    this.dmgUseCount += 1;
    this.totalDamage += event.amount;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(10)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>Fatal Mark did damage to targets below 30% a total of {this.dmgUseCount} times.</>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink spell={TALENTS.FATALITY_TALENT} /> Damage done
            </>
          }
        >
          <>
            {formatNumber(this.totalDamage)} <small> Damage </small>
            <br />
            {this.totalStacks} <small> Stacks </small>
          </>
        </BoringValueText>
      </Statistic>
    );
  }
}

export default FatalMark;
