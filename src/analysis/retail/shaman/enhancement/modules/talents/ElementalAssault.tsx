import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ResourceGenerated from 'parser/ui/ResourceGenerated';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { STORMSTRIKE_DAMAGE_SPELLS } from '../../constants';

const ELEMENTAL_ASSAULT = {
  INCREASE: 0.15,
};

const MAIN_HAND_DAMAGES = [SPELLS.STORMSTRIKE_DAMAGE.id, SPELLS.WINDSTRIKE_DAMAGE.id];

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

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ELEMENTAL_ASSAULT_TALENT.id);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(STORMSTRIKE_DAMAGE_SPELLS),
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
        <BoringSpellValueText spellId={TALENTS_SHAMAN.ELEMENTAL_ASSAULT_TALENT.id}>
          <>
            <ItemDamageDone amount={this.damageGained} />
            <br />
            <ResourceGenerated
              amount={this.maelstromWeaponGained}
              wasted={this.maelstromWeaponWasted}
              resourceType={SPELLS.MAELSTROM_WEAPON_BUFF}
            />
            <br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ElementalAssault;
