import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';
import { formatPercentage } from 'common/format';
import StatisticBox from 'Main/StatisticBox';
import ItemDamageDone from 'Main/ItemDamageDone';
import Wrapper from 'common/Wrapper';

/*
 * Dire Frenzy
 * Causes your pet to enter a frenzy, performing a flurry of 5 attacks on the target,
 * and gaining 30% increased attack speed for 8 sec, stacking up to 3 times.
 */
//max stacks pet can have of Dire Frenzy buff
const MAX_DIRE_FRENZY_STACKS = 3;

class DireFrenzy extends Analyzer {

  static dependencies = {
    combatants: Combatants,
  };

  damage = 0;
  buffStart = 0;
  buffEnd = 0;
  currentStacks = 0;
  startOfMaxStacks = 0;
  timeAtMaxStacks = 0;
  timeBuffed = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.DIRE_FRENZY_TALENT.id);
  }

  on_byPlayerPet_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DIRE_FRENZY_DAMAGE.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  on_toPlayerPet_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DIRE_FRENZY_TALENT.id) {
      return;
    }
    this.timeBuffed += event.timestamp - this.buffStart;
    if (this.currentStacks === MAX_DIRE_FRENZY_STACKS) {
      this.timeAtMaxStacks += event.timestamp - this.startOfMaxStacks;
    }
    this.currentStacks = 0;
  }
  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DIRE_FRENZY_TALENT.id) {
      return;
    }
    this.buffStart = event.timestamp;
    this.currentStacks += 1;
    if (this.currentStacks > 3) {
    }
  }
  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.DIRE_FRENZY_TALENT.id) {
      return;
    }
    this.currentStacks += 1;
    if (this.currentStacks === MAX_DIRE_FRENZY_STACKS) {
      this.startOfMaxStacks = event.timestamp;
    }

  }

  get percentUptimeMaxStacks() {
    return this.timeAtMaxStacks / this.owner.fightDuration;
  }
  get percentUptimePet() {
    return this.timeBuffed / this.owner.fightDuration;
  }

  get percentPlayerUptime() {
    //This calculates the uptime over the course of the encounter of Dire Frenzy for the player
    const uptime = (this.combatants.selected.getBuffUptime(SPELLS.DIRE_FRENZY_TALENT_BUFF_1.id) + this.combatants.selected.getBuffUptime(SPELLS.DIRE_FRENZY_TALENT_BUFF_2.id) + this.combatants.selected.getBuffUptime(SPELLS.DIRE_FRENZY_TALENT_BUFF_3.id)) / this.owner.fightDuration;
    return uptime;
  }

  get direFrenzyUptimeThreshold() {
    return {
      actual: this.percentUptimePet,
      isLessThan: {
        minor: 0.85,
        average: 0.75,
        major: 0.7,
      },
      style: 'percentage',
    };
  }
  get direFrenzy3StackThreshold() {
    return {
      actual: this.percentUptimeMaxStacks,
      isLessThan: {
        minor: 0.45,
        average: 0.40,
        major: 0.35,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.direFrenzyUptimeThreshold)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>Your pet has a general low uptime of the buff from <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} icon />, you should never be sitting on 2 stacks of this spells, if you've chosen this talent, it's your most important spell to continously be casting. </Wrapper>)
          .icon(SPELLS.DIRE_FRENZY_TALENT.icon)
          .actual(`Your pet had the buff from Dire Frenzy for ${actual}% of the fight`)
          .recommended(`${recommended}% is recommended`);
      });
    when(this.direFrenzy3StackThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Your pet has a general low uptime of the 3 stacked buff from <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id} icon />. It's important to try and maintain the buff at 3 stacks for as long as possible, this is done by spacing out your casts, but at the same time never letting them cap on charges. </Wrapper>)
        .icon(SPELLS.DIRE_FRENZY_TALENT.icon)
        .actual(`Your pet had 3 stacks of the buff from Dire Frenzy for ${actual}% of the fight`)
        .recommended(`${recommended}% is recommended`);
    });
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DIRE_FRENZY_TALENT.id} />}
        value={`${formatPercentage(this.percentUptimeMaxStacks)}%`}
        label={`3 Stack Uptime`}
        tooltip={`Your pet had an overall uptime of ${formatPercentage(this.percentUptimePet)}% on the increased attack speed buff <br/> You had an uptime of ${formatPercentage(this.percentPlayerUptime)}% on the focus regen buff, this number indicates you had an average of ${(this.percentPlayerUptime).toFixed(2)} stacks of the buff up over the course of the encounter`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.DIRE_FRENZY_TALENT.id}>
            <SpellIcon id={SPELLS.DIRE_FRENZY_TALENT.id} noLink /> Dire Frenzy
          </SpellLink>
        </div>
        <div className="flex-sub text-right">
          <ItemDamageDone amount={this.damage} />
        </div>
      </div>
    );
  }
}

export default DireFrenzy;
