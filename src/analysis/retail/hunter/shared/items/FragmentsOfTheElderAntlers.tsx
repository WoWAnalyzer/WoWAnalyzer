import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { MS_BUFFER_100 } from '../constants';

/**
 * When Wild Spirits hits fewer than 5 targets, there is a 100% chance to cause Wild Spirits damage a second time.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/PCBn2JY9TR3qVcQM#fight=27&type=damage-done&source=17
 */
class FragmentsOfTheElderAntlers extends Analyzer {
  damage = 0;
  antlerHits = 0;
  wildSpiritsHits = 0;
  targetsHit: string[] = [];
  lastWSTimestamp = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendary(SPELLS.FRAGMENTS_OF_THE_ELDER_ANTLERS);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.WILD_SPIRITS_DAMAGE_AOE),
      this.onWildSpiritsDamage,
    );
  }

  onWildSpiritsDamage(event: DamageEvent) {
    if (event.timestamp > this.lastWSTimestamp + MS_BUFFER_100) {
      this.targetsHit = [];
    }
    this.lastWSTimestamp = event.timestamp;
    const targetHit = encodeTargetString(event.targetID, event.targetInstance);
    this.targetsHit.push(targetHit);
    const isAntlersHit = this.targetsHit.filter((x) => x === targetHit).length % 2 === 0;
    if (isAntlersHit) {
      this.antlerHits += 1;
      this.damage += event.amount + (event.absorb || 0);
    } else {
      this.wildSpiritsHits += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <BoringSpellValueText spellId={SPELLS.FRAGMENTS_OF_THE_ELDER_ANTLERS.id}>
          <ItemDamageDone amount={this.damage} />
          <br />
          {formatPercentage(this.antlerHits / (this.wildSpiritsHits + this.antlerHits))}%{' '}
          <small>
            of <SpellLink id={SPELLS.WILD_SPIRITS.id} /> hits
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
export default FragmentsOfTheElderAntlers;
