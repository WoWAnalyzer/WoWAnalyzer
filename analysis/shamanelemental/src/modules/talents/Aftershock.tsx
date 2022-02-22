import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { ResourceChangeEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ResourceGenerated from 'parser/ui/ResourceGenerated';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class Aftershock extends Analyzer {
  refund = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.AFTERSHOCK_TALENT.id);

    this.addEventListener(Events.resourcechange.spell(SPELLS.AFTERSHOCK), this.onAftershock);
  }

  onAftershock(event: ResourceChangeEvent) {
    this.refund += event.resourceChange;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={SPELLS.AFTERSHOCK_TALENT.id}>
          <>
            <ResourceGenerated resourceType={RESOURCE_TYPES.MAELSTROM} amount={this.refund} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Aftershock;
