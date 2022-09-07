import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemManaGained from 'parser/ui/ItemManaGained';
import StatisticBox from 'parser/ui/StatisticBox';

import * as SPELLS from '../../SPELLS';

class Shadowfiend extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  get castCount() {
    return this.abilityTracker.getAbility(SPELLS.SHADOW_FIEND).casts;
  }

  damageFromShadowfiend = 0;
  manaFromShadowFiend = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER_PET), this.onShadowfiendDamage);
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER_PET).spell({ id: SPELLS.SHADOW_FIEND_MANA_LEECH }),
      this.onShadowfiendRegen,
    );
  }

  onShadowfiendDamage(event: DamageEvent) {
    this.damageFromShadowfiend += event.amount + (event.absorb || 0);
  }

  onShadowfiendRegen(event: ResourceChangeEvent) {
    this.manaFromShadowFiend += event.resourceChange;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellLink id={SPELLS.SHADOW_FIEND} />}
        value={
          <>
            <ItemManaGained amount={this.manaFromShadowFiend} />
            <br />
            <ItemDamageDone amount={this.damageFromShadowfiend} />
          </>
        }
      />
    );
  }
}

export default Shadowfiend;
