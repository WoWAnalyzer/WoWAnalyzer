import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import conduitScaling from 'parser/core/conduitScaling';
import Events, { SummonEvent, CastEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import { ABILITIES_CLONED_BY_SEF } from '../../constants';

class CoordinatedOffensive extends Analyzer {
  CO_MOD = 0;
  totalDamage = 0;
  CO_Active: boolean = false;
  cloneIDs = new Set();
  cloneMap: Map<number, number> = new Map<number, number>();

  constructor(options: Options) {
    super(options);
    const conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.COORDINATED_OFFENSIVE.id);
    if (!conduitRank) {
      this.active = false;
      return;
    }

    this.CO_MOD = conduitScaling(0.088, conduitRank);
	
    //summon events (need to track this to get melees)
	this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STORM_EARTH_AND_FIRE_CAST),
    this.CO_Deactivator,
	);
	this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.STORM_EARTH_AND_FIRE_FIXATE),
    this.CO_Activator,
	);
    this.addEventListener(
      Events.summon
        .by(SELECTED_PLAYER)
        .spell([SPELLS.STORM_EARTH_AND_FIRE_EARTH_SPIRIT, SPELLS.STORM_EARTH_AND_FIRE_FIRE_SPIRIT]),
      this.trackSummons,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.MELEE),
      this.handleMelee,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER_PET)
		.spell(ABILITIES_CLONED_BY_SEF),
        this.onSEFDamage,
	);
  }
  CO_Deactivator(event: CastEvent) {
	this.CO_Active = false;
  }
  CO_Activator(event: CastEvent) {
	this.CO_Active = true;
  }
  trackSummons(event: SummonEvent) {
    this.cloneMap.set(event.targetID, event.ability.guid);
  }
  handleMelee(event: DamageEvent) {
    //if CO is not active we cant add the dmg
    if (this.CO_Active = false) {
      return;
    }
	//if we don't know who its from then we can't add it
	if (!event.sourceID) {
      return;
    }
    const id: number = event.sourceID;
    const cloneType: number | undefined = this.cloneMap.get(id);
    if (cloneType === undefined) {
      return;
    }
    if (cloneType === SPELLS.STORM_EARTH_AND_FIRE_FIRE_SPIRIT.id) {
      this.totalDamage+= calculateEffectiveDamage(event, this.CO_MOD);
    }
    if (cloneType === SPELLS.STORM_EARTH_AND_FIRE_EARTH_SPIRIT.id) {
      this.totalDamage+= calculateEffectiveDamage(event, this.CO_MOD);
    }
  }
  
  onSEFDamage(event: DamageEvent) {
    if (this.CO_Active = false) {
      return;
    }
    this.totalDamage += calculateEffectiveDamage(event, this.CO_MOD);
  }
	statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
		tooltip={
          <>
            The {formatPercentage(this.CO_MOD)}% increase from Coordinated Offensive was worth ~
			{formatNumber(this.totalDamage)} raw Damage.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.COORDINATED_OFFENSIVE.id}>
          <ItemDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CoordinatedOffensive;
