import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { Ability } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import SPELLS from 'common/SPELLS/classic/shaman';
import TotemTracker from '../TotemTracker';

class GroundingTotem extends Analyzer {
  static dependencies = {
    totemTracker: TotemTracker,
    abilityTracker: AbilityTracker,
  };

  protected totemTracker!: TotemTracker;
  protected abilityTracker!: AbilityTracker;

  get groundedSpells() {
    return this.totemTracker
      .totemEvents(SPELLS.GROUNDING_TOTEM.id)
      .map((totemEvent) => totemEvent?.spellsGrounded);
  }

  get groundedSpellCount() {
    return this.groundedSpells.filter((ability: Ability) => Boolean(ability)).length;
  }

  get totemCastCount() {
    return this.abilityTracker.getAbility(SPELLS.GROUNDING_TOTEM.id).casts;
  }

  statistic() {
    if (this.totemCastCount === 0) {
      return null;
    }

    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        position={STATISTIC_ORDER.UNIMPORTANT(89)}
        dropdown={
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>
                  <>Cast</>
                </th>
                <th>
                  <>Spell Grounded</>
                </th>
              </tr>
            </thead>
            <tbody>
              {this.groundedSpells.map((ability: Ability, index: number) => (
                <tr key={index}>
                  <td>{index}</td>
                  <td>{ability ? <SpellLink id={ability.guid} /> : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <BoringValue
          label={
            <>
              <SpellLink id={SPELLS.GROUNDING_TOTEM.id} />
            </>
          }
        >
          {this.groundedSpellCount} Spells Grounded
        </BoringValue>
      </Statistic>
    );
  }
}

export default GroundingTotem;
