import { Trans } from '@lingui/macro';
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
import { abilityToSpell } from 'common/abilityToSpell';

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
                  <Trans id="common.groundingtotem.cast">Cast</Trans>
                </th>
                <th>
                  <Trans id="common.groundingtotem.spellgrounded">Spell Grounded</Trans>
                </th>
              </tr>
            </thead>
            <tbody>
              {this.groundedSpells.map((ability: Ability, index: number) => (
                <tr key={index}>
                  <td>{index}</td>
                  <td>{ability ? <SpellLink spell={abilityToSpell(ability)} /> : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <BoringValue
          label={
            <>
              <SpellLink spell={SPELLS.GROUNDING_TOTEM} />
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
