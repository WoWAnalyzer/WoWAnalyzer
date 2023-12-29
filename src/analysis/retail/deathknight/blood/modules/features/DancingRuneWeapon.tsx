import { defineMessage, Trans } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { Fragment } from 'react';

const ALLOWED_CASTS_DURING_DRW = [
  TALENTS.DEATH_STRIKE_TALENT.id,
  TALENTS.HEART_STRIKE_TALENT.id,
  TALENTS.BLOOD_BOIL_TALENT.id,
  TALENTS.MARROWREND_TALENT.id,
  TALENTS.CONSUMPTION_TALENT.id, // todo => test if new consumption talent actually works with DRW
];

class DancingRuneWeapon extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

  castsDuringDRW: number[] = [];

  DD_ABILITY: Spell = SPELLS.DEATH_AND_DECAY;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.DANCING_RUNE_WEAPON_TALENT_BUFF.id)) {
      return;
    }

    const ability = this.abilities.getAbility(event.ability.guid);

    //push all casts during DRW that were on the GCD in array
    if (
      event.ability.guid !== SPELLS.RAISE_ALLY.id && //probably usefull to rezz someone even if it's a personal DPS-loss
      event.ability.guid !== TALENTS.DANCING_RUNE_WEAPON_TALENT.id && //because you get the DRW buff before the cast event since BFA
      ability?.gcd
    ) {
      this.castsDuringDRW.push(event.ability.guid);
    }
  }

  get goodDRWCasts() {
    return this.castsDuringDRW.filter((spellId) => ALLOWED_CASTS_DURING_DRW.includes(spellId));
  }

  get suggestionThresholds(): NumberThreshold {
    return {
      actual: this.goodDRWCasts.length / this.castsDuringDRW.length,
      isLessThan: {
        minor: 1,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  spellLinks(spellId: number, index: number) {
    if (spellId === TALENTS.CONSUMPTION_TALENT.id) {
      return (
        <>
          <Trans id="deathknight.blood.drw.spellLinks.consumption">
            and (if in AoE) <SpellLink spell={spellId} />
          </Trans>
        </>
      );
    } else if (index + 2 === ALLOWED_CASTS_DURING_DRW.length) {
      return (
        <>
          <Trans id="deathknight.blood.drw.spellLinks.last">
            <SpellLink spell={spellId} />
          </Trans>
        </>
      );
    } else {
      return (
        <>
          <Trans id="deathknight.blood.drw.spellLinks.default">
            <SpellLink spell={spellId} />,
          </Trans>
        </>
      );
    }
  }

  get goodDRWSpells() {
    return (
      <div>
        <Trans id="deathknight.blood.drw.suggestion.goodDrwSpells">Try and prioritize{'  '}</Trans>
        {ALLOWED_CASTS_DURING_DRW.map((id, index) => (
          <Fragment key={id}> {this.spellLinks(id, index)}</Fragment>
        ))}
      </div>
    );
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="deathknight.blood.drw.suggestion.suggestion">
          Avoid casting spells during <SpellLink spell={TALENTS.DANCING_RUNE_WEAPON_TALENT} /> that
          don't benefit from the copies such as <SpellLink spell={TALENTS.BLOODDRINKER_TALENT} />{' '}
          and <SpellLink spell={this.DD_ABILITY} />. Check the cooldown-tab below for more detailed
          breakdown.{this.goodDRWSpells}
        </Trans>,
      )
        .icon(TALENTS.DANCING_RUNE_WEAPON_TALENT.icon)
        .actual(
          defineMessage({
            id: 'deathknight.blood.drw.suggestion.actual',
            message: `${this.goodDRWCasts.length} out of ${this.castsDuringDRW.length} casts during DRW were good`,
          }),
        )
        .recommended(
          defineMessage({
            id: 'deathknight.blood.drw.suggestion.recommended',
            message: `${this.castsDuringDRW.length} recommended`,
          }),
        ),
    );
  }
}

export default DancingRuneWeapon;
