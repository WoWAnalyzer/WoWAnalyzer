import { Options } from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import spells from '../../spells';

const SACRED_WEAPON_ID = 432472;

class HolyArmaments extends Analyzer.withDependencies({
  abilities: Abilities,
}) {
  bulwarkCasts = 0;
  sacredWeaponCasts = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(spells.HOLY_BULWARK_TALENT);
    if (!this.active) {
      return;
    }

    const forewarningRank = this.selectedCombatant.getTalentRank(spells.FOREWARNING_TALENT);
    const cooldown = 60 * (1 - 0.2 * forewarningRank);

    this.deps.abilities.add({
      spell: [spells.HOLY_BULWARK_TALENT.id, SACRED_WEAPON_ID],
      name: 'Holy Armaments',
      category: SPELL_CATEGORY.COOLDOWNS,
      cooldown,
      charges: 2,
      gcd: { base: 1500 },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.9,
      },
    });

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell({ id: spells.HOLY_BULWARK_TALENT.id }),
      this.onBulwarkCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell({ id: SACRED_WEAPON_ID }),
      this.onSacredWeaponCast,
    );
  }

  private onBulwarkCast(_event: CastEvent) {
    this.bulwarkCasts += 1;
  }

  private onSacredWeaponCast(_event: CastEvent) {
    this.sacredWeaponCasts += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Holy Bulwark casts: {this.bulwarkCasts}
            <br />
            Sacred Weapon casts: {this.sacredWeaponCasts}
          </>
        }
      >
        <BoringSpellValue
          spell={spells.HOLY_BULWARK_TALENT.id}
          value={`${this.bulwarkCasts} / ${this.sacredWeaponCasts}`}
          label="Bulwark / Sacred Weapon casts"
        />
      </Statistic>
    );
  }
}

export default HolyArmaments;
