import SPELLS from 'common/SPELLS/classic';
import SpellLink from 'interface/SpellLink';
import { TooltipElement } from 'interface/Tooltip';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringValue from 'parser/ui/BoringValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';

export default class SuddenDeath extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  protected triggerCount = 0;
  protected wastedTriggers = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.applybuff.spell(SPELLS.SUDDEN_DEATH), this.resetColossusSmash);
  }

  protected resetColossusSmash() {
    if (!this.deps.spellUsable.isOnCooldown(SPELLS.COLOSSUS_SMASH.id)) {
      this.wastedTriggers += 1;
    }
    this.deps.spellUsable.endCooldown(SPELLS.COLOSSUS_SMASH.id);
    this.triggerCount += 1;
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <BoringValue
          label={
            <>
              <SpellLink spell={SPELLS.COLOSSUS_SMASH} /> Resets
            </>
          }
        >
          <div>
            {this.triggerCount - this.wastedTriggers} resets{' '}
            <small>
              (+{this.wastedTriggers}{' '}
              <TooltipElement content="A reset is wasted if it occurs while Colossus Smash is not on cooldown.">
                wasted
              </TooltipElement>
              )
            </small>
          </div>
        </BoringValue>
      </Statistic>
    );
  }
}
