import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellUsable from 'Parser/Core/Modules/SpellUsable';
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";
import SpellLink from "common/SpellLink";
import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';

const debug = false;

const TITANS_THUNDER_USE_REGARDLESS_THRESHHOLD = 30;

class TitansThunder extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    spellUsable: SpellUsable,
  };

  goodTTCasts = 0;
  badTTCasts = 0;
  _currentStacks = 0;
  totalTTCasts = 0;
  stacksOnTTCast = 0;
  shouldHaveSavedTT = 0;
  weirdCast = 0;
  damage = 0;

  on_initialized() {
    this.active = this.combatants.selected.traitsBySpellId[SPELLS.TITANS_THUNDER.id];
  }

  on_toPlayer_applybuff(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.DIRE_BEAST_BUFF.id) {
      return;
    }
    this._currentStacks += 1;
  }

  on_toPlayer_removebuff(event) {
    const buffId = event.ability.guid;
    if (buffId !== SPELLS.DIRE_BEAST_BUFF.id) {
      return;
    }
    this._currentStacks -= 1;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.TITANS_THUNDER.id) {
      return;
    }
    debug && console.log(`stacks:`, this._currentStacks);
    this.totalTTCasts += 1;
    const bestialWrathIsOnCooldown = this.spellUsable.isOnCooldown(SPELLS.BESTIAL_WRATH.id);
    if (bestialWrathIsOnCooldown) {
      if (!this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id) && this.spellUsable.cooldownRemaining(SPELLS.BESTIAL_WRATH.id) < TITANS_THUNDER_USE_REGARDLESS_THRESHHOLD) {
        this.shouldHaveSavedTT += 1;
        return;
      } else if (!this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id) && (this.spellUsable.cooldownRemaining(SPELLS.BESTIAL_WRATH.id) > TITANS_THUNDER_USE_REGARDLESS_THRESHHOLD)) {
        this.goodTTCasts += 1;
        return;
      }
    }
    if (!this.combatants.selected.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id)) {
      if (this.combatants.selected.hasBuff(SPELLS.DIRE_BEAST_BUFF.id)) {
        this.goodTTCasts += 1;
        this.stacksOnTTCast += this._currentStacks;
      } else {
        this.badTTCasts += 1;
      }
    } else {
      if (this.combatants.selected.hasBuff(SPELLS.BESTIAL_WRATH.id)) {
        debug && console.log(`in good tt casts`);
        this.goodTTCasts += 1;
      } else {
        this.badTTCasts += 1;
      }
    }

    debug && console.log('good tt casts:', this.goodTTCasts, ' and bad tt casts: ', this.badTTCasts, ' and total casts is: ', this.totalTTCasts, ' and weird casts: ', this.weirdCast);
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.TITANS_THUNDER_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    let tooltipText = `You cast Titan's Thunder a total of ${this.totalTTCasts} times.`;
    tooltipText += this.badTTCasts + this.shouldHaveSavedTT > 0 ? `<ul>` : ``;
    tooltipText += this.badTTCasts > 0 && !this.combatants.selected.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id) ? `<li>You had ${this.badTTCasts} bad cast(s) of Titan's Thunder. Bad casts indicate that Titan's Thunder was used without any Dire Beasts up.</li>` : ``;
    tooltipText += this.badTTCasts > 0 && this.combatants.selected.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id) ? `<li>You had ${this.badTTCasts} bad cast(s) of Titan's Thunder. Bad casts indicate that Titan's Thunder was used without Bestial Wrath up.</li>` : ``;
    tooltipText += this.shouldHaveSavedTT > 0 ? `<li>You cast Titan's Thunder ${this.shouldHaveSavedTT} times where you should have delayed casting it, this occurs when you cast Titan's Thunder when there is less than 30 seconds remaning on Bestial Wrath cooldown.</li>` : ``;
    tooltipText += this.badTTCasts + this.shouldHaveSavedTT > 0 ? `</ul>` : ``;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.TITANS_THUNDER.id} />}
        value={(
          <span>
            {this.goodTTCasts}{'  '}
            <SpellIcon
              id={SPELLS.TITANS_THUNDER.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            />
            {'  '}
            {this.badTTCasts + this.shouldHaveSavedTT}{'  '}
            <SpellIcon
              id={SPELLS.TITANS_THUNDER.id}
              style={{
                height: '1.3em',
                marginTop: '-.1em',
                filter: 'grayscale(100%)',
              }}
            />
          </span>

        )}
        label={`Titan's Thunder`}
        tooltip={tooltipText}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(6);

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.TITANS_THUNDER.id}>
            <SpellIcon id={SPELLS.TITANS_THUNDER.id} noLink /> Titan's Thunder
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          {(this.owner.formatItemDamageDone(this.damage))}
        </div>
      </div>
    );
  }
  suggestions(when) {
    when(this.badTTCasts).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Don't cast <SpellLink id={SPELLS.TITANS_THUNDER.id} /> without <SpellLink id={SPELLS.DIRE_BEAST.id} /> up, or if using <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} /> without <SpellLink id={SPELLS.BESTIAL_WRATH.id} /> up.</span>)
          .icon(SPELLS.TITANS_THUNDER.icon)
          .actual(`You cast Titan's Thunder ${this.badTTCasts} times without Dire Beasts up, or if using Dire Frenzy without Bestial Wrath up.`)
          .recommended(`${recommended} is recommended`)
          .major(recommended);
      });
    when(this.shouldHaveSavedTT).isGreaterThan(0)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Don't cast <SpellLink id={SPELLS.TITANS_THUNDER.id} /> when there is less than 30 seconds cooldown remaining on <SpellLink id={SPELLS.BESTIAL_WRATH.id} />.</span>)
          .icon(SPELLS.TITANS_THUNDER.icon)
          .actual(`You cast Titan's Thunder ${this.badTTCasts} times when there was less than 30 seconds cooldown on Bestial Wrath`)
          .recommended(`${recommended} is recommended`)
          .major(recommended);
      });
  }

}

export default TitansThunder;
