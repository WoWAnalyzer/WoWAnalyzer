import React from 'react';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Events from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import AngerManagement from './AngerManagement';

class AngerCD extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
    angerManagement: AngerManagement,
  };

  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;
  protected angerManagement!: AngerManagement;

  DEMOTEXT: JSX.Element;
  DEMOTEXTWITHBOOM = <>Cast <SpellLink id={SPELLS.DEMORALIZING_SHOUT.id} /> more often to maximise the DPS increase and rage generation provided by Booming Voice unless you need it to survive a specific mechanic. </>;
  DEMOTEXTWITHOUTBOOM = <>Cast <SpellLink id={SPELLS.DEMORALIZING_SHOUT.id} /> more often to reduce the incoming damage </>;

  actualFightTime = 0;
  DEMOSHOUTCD = 45000;
  AVATARCD = 90000;
  LASTSTANDCD = this.selectedCombatant.hasTalent(SPELLS.BOLSTER_TALENT.id) ? 180000 - 60000 : 180000;
  SHIELDWALLCD = 240000;

  hasAM = false;
  usedAvatar = false;

  prepullCast = false;

  constructor(options: Options) {
    super(options);
    this.hasAM = this.selectedCombatant.hasTalent(SPELLS.ANGER_MANAGEMENT_TALENT.id);
    this.DEMOTEXT = this.selectedCombatant.hasTalent(SPELLS.BOOMING_VOICE_TALENT.id) ? this.DEMOTEXTWITHBOOM : this.DEMOTEXTWITHOUTBOOM;
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AVATAR_TALENT), this.onAvatarCast);
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.AVATAR_TALENT), this.onAvatarRemove);
    this.addEventListener(Events.fightend, this.fightEnd);
  }

  onAvatarCast() {
    this.usedAvatar = true;
  }

  onAvatarRemove() {
    if (!this.usedAvatar) {
      this.prepullCast = true;
    }
  }

  fightEnd() {
    if (this.hasAM) {
      this.actualFightTime = (this.owner.fight.end_time - this.owner.fight.start_time) + this.angerManagement.effectiveReduction[SPELLS.DEMORALIZING_SHOUT.id] + this.angerManagement.wastedReduction[SPELLS.DEMORALIZING_SHOUT.id];
    } else {
      this.actualFightTime = (this.owner.fight.end_time - this.owner.fight.start_time);
    }
  }

  ratio(spellCD: number, spellid: number) {
    const possibleCasts = Math.ceil(this.actualFightTime / spellCD) || 1;
    let actualCasts = this.abilityTracker.getAbility(spellid).casts || 0;
    if (spellid === SPELLS.AVATAR_TALENT.id) {
      actualCasts = this.prepullCast ? actualCasts + 1 : actualCasts;
    }
    return actualCasts / possibleCasts;
  }

  //KLUDGE
  get suggestionThresholdsDemoShout() {
    return {
      actual: this.ratio(this.DEMOSHOUTCD, SPELLS.DEMORALIZING_SHOUT.id),
      isLessThan: {
        minor: .90,
        average: .80,
        major: .70,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsAvatar() {
    return {
      actual: this.ratio(this.AVATARCD, SPELLS.AVATAR_TALENT.id),
      isLessThan: {
        minor: .90,
        average: .80,
        major: .70,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsLastStand() {
    return {
      actual: this.ratio(this.LASTSTANDCD, SPELLS.LAST_STAND.id),
      isLessThan: {
        minor: .80,
        average: .70,
        major: .60,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsShieldWall() {
    return {
      actual: this.ratio(this.SHIELDWALLCD, SPELLS.SHIELD_WALL.id),
      isLessThan: {
        minor: .80,
        average: .70,
        major: .60,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {

    when(this.suggestionThresholdsDemoShout).addSuggestion((suggest, actual, recommended) => suggest(
        this.DEMOTEXT,
      )
        .icon(SPELLS.DEMORALIZING_SHOUT.icon)
        .actual(`${formatPercentage(actual)}% Demoralizing Shout`)
        .recommended(`${formatPercentage(recommended)}% casts recommended`));

    when(this.suggestionThresholdsAvatar).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          Using  <SpellLink id={SPELLS.AVATAR_TALENT.id} /> as often as possible is very important for the increased damage output and rage generation so try to get the maximum casts out of it.
        </>,
      )
        .icon(SPELLS.AVATAR_TALENT.icon)
        .actual(`${formatPercentage(actual)}% Avatar casts`)
        .recommended(`${formatPercentage(recommended)}% casts recommended`));

    when(this.suggestionThresholdsLastStand).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          Remember to cast <SpellLink id={SPELLS.LAST_STAND.id} /> more frequently. If you have <SpellLink id={SPELLS.BOLSTER_TALENT.id} /> talented you can use this to fill gaps between your <SpellLink id={SPELLS.SHIELD_BLOCK.id} />.
        </>,
      )
        .icon(SPELLS.LAST_STAND.icon)
        .actual(`${formatPercentage(actual)}% Last Stand casts`)
        .recommended(`${formatPercentage(recommended)}% casts recommended`));

    when(this.suggestionThresholdsShieldWall).addSuggestion((suggest, actual, recommended) => suggest(
        <>
          Try to use <SpellLink id={SPELLS.SHIELD_WALL.id} /> more often as it reduces both physical and magical damage - unless you need it for a specific mechanic in the fight.
        </>,
      )
        .icon(SPELLS.SHIELD_WALL.icon)
        .actual(`${formatPercentage(actual)}% Shield Wall casts`)
        .recommended(`${formatPercentage(recommended)}% casts recommended`));
  }
}

export default AngerCD;
