import { TALENTS_SHAMAN } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { STORMSTRIKE_DAMAGE_SPELLS } from '../../constants';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { MaelstromWeaponTracker } from '../resourcetracker';

const ELEMENTAL_ASSAULT_RANKS: Record<number, number> = {
  1: 0.1,
  2: 0.2,
};

const ELEMENTAL_ASSAULT_SPELLS: number[] = [
  TALENTS_SHAMAN.STORMSTRIKE_TALENT.id,
  TALENTS_SHAMAN.LAVA_LASH_TALENT.id,
  TALENTS_SHAMAN.ICE_STRIKE_TALENT.id,
];

/**
 * Stormstrike damage is increased by [10/20]%, and Stormstrike, Lava Lash, and Ice Strike
 * have a [50/100]% chance to generate 1 stack of Maelstrom Weapon.
 *
 * Example Log:
 *
 */
class ElementalAssault extends Analyzer {
  static dependencies = {
    tracker: MaelstromWeaponTracker,
  };
  protected tracker!: MaelstromWeaponTracker;
  protected damageIncrease: number = 0;
  protected damageGained: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ELEMENTAL_ASSAULT_TALENT);

    if (!this.active) {
      return;
    }

    this.damageIncrease =
      ELEMENTAL_ASSAULT_RANKS[
        this.selectedCombatant.getTalentRank(TALENTS_SHAMAN.ELEMENTAL_ASSAULT_TALENT)
      ];

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(STORMSTRIKE_DAMAGE_SPELLS),
      this.onStormstrikeDamage,
    );
  }

  onStormstrikeDamage(event: DamageEvent): void {
    this.damageGained += calculateEffectiveDamage(event, this.damageIncrease);
  }

  get maelstromGenerators() {
    const elementalAssaultBuilders = Object.keys(this.tracker.buildersObj)
      .map((abilityId) => {
        const id = Number(abilityId);
        return {
          abilityId: id,
          casts: this.tracker.buildersObj[id].casts,
          total: this.tracker.buildersObj[id].generated + this.tracker.buildersObj[id].wasted,
        };
      })
      .filter((ability) => ELEMENTAL_ASSAULT_SPELLS.includes(ability.abilityId));

    // if the combatant has the swirling maelstrom, assume SW generated the first stack.
    if (this.selectedCombatant.hasTalent(TALENTS_SHAMAN.SWIRLING_MAELSTROM_TALENT)) {
      const iceStrike = elementalAssaultBuilders[TALENTS_SHAMAN.ICE_STRIKE_TALENT.id];
      if (iceStrike) {
        iceStrike.total -= iceStrike.casts;
      }
    }
    return elementalAssaultBuilders;
  }

  get maelstromWeaponGained() {
    return this.maelstromGenerators.reduce((total, ability) => (total += ability.total), 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <TalentSpellText talent={TALENTS_SHAMAN.ELEMENTAL_ASSAULT_TALENT}>
          <>
            <ItemDamageDone amount={this.damageGained} />
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ElementalAssault;
