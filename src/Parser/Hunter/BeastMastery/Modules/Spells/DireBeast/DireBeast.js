import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import SPELLS from "common/SPELLS/index";
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";
import SpellLink from "common/SpellLink";

//Threshhold for when there is less than 3s remaining on Bestial Wrath to not cast Dire Beast
const CD_ON_BESTIAL_WRATH_BAD_DB_THRESHHOLD = 3000;

class DireBeast extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  casts = 0;
  badDBCasts = 0;
  remainingBestialWrathCooldown = 0;

  on_initialized() {
    this.active = !this.combatants.selected.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id);
  }
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DIRE_BEAST.id && spellId !== SPELLS.BESTIAL_WRATH.id) {
      return;
    }
    if (spellId === SPELLS.DIRE_BEAST.id) {
      this.casts += 1;
      const bestialWrathIsOnCooldown = this.spellUsable.isOnCooldown(SPELLS.BESTIAL_WRATH.id);
      if (bestialWrathIsOnCooldown) {
        this.remainingBestialWrathCooldown = this.spellUsable.cooldownRemaining(SPELLS.BESTIAL_WRATH.id);
        if (!this.remainingBestialWrathCooldown > CD_ON_BESTIAL_WRATH_BAD_DB_THRESHHOLD) {
          this.badDBCasts += 1;
        }
      } else {
        this.badDBCasts += 1;
      }
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DIRE_BEAST.id} />}
        value={(
          <span>
            {this.casts}{'  '}
            <SpellIcon
              id={SPELLS.DIRE_BEAST.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
            {'  '}
            {this.badDBCasts}{'  '}
            <SpellIcon
              id={SPELLS.DIRE_BEAST.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
                filter: 'grayscale(100%)',
              }}
            />
          </span>
        )}
        label={`Direbeast casts`}
        tooltip={`You cast Dire Beast ${this.casts} times. <br/> <ul> <li> You cast ${this.badDBCasts} Dire Beasts while there was less than 3 seconds remaining of Bestial Wrath cooldown.</li></ul>`}
      />
    );
  }
  suggestions(when) {
    when(this.badDBCasts).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Delay casting <SpellLink id={SPELLS.DIRE_BEAST.id} /> if there is less than 3 seconds cooldown remaining on <SpellLink id={SPELLS.BESTIAL_WRATH.id} />. It is generally better to cast something else while the remaining cooldown ticks down, so as to optimise the cooldown reduction aspect of <SpellLink id={SPELLS.DIRE_BEAST.id} />.</span>)
          .icon(SPELLS.DIRE_BEAST_SUMMON.icon)
          .actual(`You cast Dire Beast ${this.badDBCasts} times when Bestial Wrath had less than 3 seconds CD remaining.`)
          .recommended(`${recommended} is recommended`)
          .regular(recommended)
          .major(recommended + 1);
      });
  }

}

export default DireBeast;
