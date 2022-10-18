import { t } from '@lingui/macro';
import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { isPermanentPet } from 'parser/shared/modules/pets/helpers';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class LegionStrike extends Analyzer {
  get suggestionThresholds() {
    return {
      actual: this.casts,
      isLessThan: {
        minor: 1,
        average: 0,
        major: 0,
      },
      style: 'number',
    };
  }

  casts = 0;
  damage = 0;

  constructor(...args) {
    super(...args);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER_PET).spell(SPELLS.FELGUARD_LEGION_STRIKE),
      this.legionStrikeCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.FELGUARD_LEGION_STRIKE),
      this.legionStrikeDamage,
    );
  }

  legionStrikeCast(event) {
    // Grimoire: Felguard casts Legion Strike with the same spell ID, only count LS casts from the permanent pet
    if (this._isPermanentPet(event.sourceID)) {
      this.casts += 1;
    }
  }

  legionStrikeDamage(event) {
    if (this._isPermanentPet(event.sourceID)) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  _getPetGuid(id) {
    return this.owner.playerPets.find((pet) => pet.id === id).guid;
  }

  _isPermanentPet(id) {
    const guid = this._getPetGuid(id);
    return isPermanentPet(guid);
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your Felguard didn't cast <SpellLink id={SPELLS.FELGUARD_LEGION_STRIKE.id} /> at all.
          Remember to turn on the auto-cast for this ability as it's a great portion of your total
          damage.
        </>,
      )
        .icon(SPELLS.FELGUARD_LEGION_STRIKE.icon)
        .actual(
          t({
            id: 'warlock.demonology.suggestions.legionStrike.casts',
            message: `${actual} Legion Strike casts`,
          }),
        )
        .recommended(`> ${recommended} casts are recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        tooltip={`${formatThousands(this.damage)} damage`}
      >
        <BoringSpellValueText spellId={SPELLS.FELGUARD_LEGION_STRIKE.id}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default LegionStrike;
