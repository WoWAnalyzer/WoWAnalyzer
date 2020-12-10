import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import { STORMSTRIKE_DAMAGE_SPELLS } from 'parser/shaman/enhancement/constants';
import ResourceGenerated from 'interface/others/ResourceGenerated';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';

const ELEMENTAL_ASSAULT = {
  INCREASE: .15,
};

const MAIN_HAND_DAMAGES = [
  SPELLS.STORMSTRIKE_DAMAGE.id,
  SPELLS.WINDSTRIKE_DAMAGE.id,
];

/**
 * Stormstrike damage is increased by 15%, and Stormstrike
 * now generates 1 stack of Maelstrom Weapon.
 *
 * Example Log:
 *
 */
class ElementalAssault extends Analyzer {
  protected damageGained: number = 0;
  protected maelstromWeaponGained: number = 0;
  protected maelstromWeaponWasted: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.ELEMENTAL_ASSAULT_TALENT.id);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER)
        .spell(STORMSTRIKE_DAMAGE_SPELLS),
      this.onStormstrikeDamage,
    );
  }

  onStormstrikeDamage(event: DamageEvent): void {
    this.damageGained += calculateEffectiveDamage(event, ELEMENTAL_ASSAULT.INCREASE);

    // Use main-hand to determine gained maelstrom weapon stacks, which should catch MW gained from Stormflurry also
    if (MAIN_HAND_DAMAGES.includes(event.ability.guid)) {
      this.maelstromWeaponGained += 1;
    }

    const maelstromWeaponBuff = this.selectedCombatant.getBuff(SPELLS.MAELSTROM_WEAPON_BUFF.id);
    if (maelstromWeaponBuff?.stacks === 10) {
      this.maelstromWeaponWasted += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.ELEMENTAL_ASSAULT_TALENT}>
          <>
            <ItemDamageDone amount={this.damageGained} /><br />
            <ResourceGenerated amount={this.maelstromWeaponGained} wasted={this.maelstromWeaponWasted} resourceType={SPELLS.MAELSTROM_WEAPON_BUFF} /><br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ElementalAssault;
