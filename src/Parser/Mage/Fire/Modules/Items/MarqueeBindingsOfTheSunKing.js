import React from 'react';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemLink from 'common/ItemLink';
import { formatPercentage, formatNumber } from 'common/format';
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';

class MarqueeBindingsOfTheSunKing extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  
  baseProcs = 0;
  refreshedProcs = 0;
  buffedPyroblasts = 0;
  buffChecked = 0;
  combustionRefresh = 0;
  
  on_initialized() {
  this.active = this.combatants.selected.hasWrists(ITEMS.MARQUEE_BINDINGS_OF_THE_SUN_KING.id);
  }

  // count procs + refreshes  
  on_toPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.KAELTHAS_ULTIMATE_ABILITY.id) {
    return;
    }
    this.baseProcs += 1;
  } 
  
  on_byPlayer_refreshbuff(event) {
    if (event.ability.guid !== SPELLS.KAELTHAS_ULTIMATE_ABILITY.id) {
      return;
    }
    if (this.combatants.selected.hasBuff(SPELLS.COMBUSTION.id))
    {this.combustionRefresh +=1;
    return;
    }
    this.refreshedProcs += 1;
	}
  
  // when buff expires, start check for matching pyroblast
 
  on_byPlayer_removebuff(event) {
    if (event.ability.guid !== SPELLS.KAELTHAS_ULTIMATE_ABILITY.id) {
      return;
    }
    this.buffChecked=1;
    }
  
  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.PYROBLAST.id) {
      return;
     }
	 	 
   if (this.buffChecked === 0) {
       return;
     }  
   
  // make sure that this isn't a hot streak instant pyroblast that just happened to cast as buff fell off
     
     if (this.combatants.selected.hasBuff(SPELLS.KAELTHAS_ULTIMATE_ABILITY.id, event.timestamp, 100) && !this.combatants.selected.hasBuff(SPELLS.HOT_STREAK)) {
      this.buffedPyroblasts += 1;
      this.buffChecked = 0;
    }
    }	
	
  // math
	
  get totalProcs() {
    return (this.baseProcs + this.refreshedProcs + this.combustionRefresh);
  }
 
  get expiredProcs() {
    return (this.totalProcs - this.refreshedProcs - this.buffedPyroblasts - this.combustionRefresh);
  }

  get refreshPercentage() {
    return (this.refreshedProcs) / (this.totalProcs);
  }

// item display
   
item() {
  return {
  item: ITEMS.MARQUEE_BINDINGS_OF_THE_SUN_KING,
  result: <Wrapper>{this.buffedPyroblasts} buffed Pyroblasts<br />{this.totalProcs} total procs<br />{this.expiredProcs} expired</Wrapper>,
};
}
    
  // suggestions
  
    get refreshSuggestionThresholds() {
    return {
      actual: this.refreshPercentage,
      isGreaterThan: {
        minor: 0.10,
        average: 0.15,
        major: 0.20,
      },
      style: 'percentage',
    };
  }
  
    get expireSuggestionThresholds() {
    return {
      actual: this.expiredProcs,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
    };
  }
   
   suggestions(when) {
     
    when(this.refreshSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>Your buff from <ItemLink id={ITEMS.MARQUEE_BINDINGS_OF_THE_SUN_KING.id} /> was refreshed {formatPercentage(this.refreshPercentage, 1)}% of the time outside of <SpellLink id={SPELLS.COMBUSTION.id} />. This can happen when <SpellLink id={SPELLS.PYROBLAST.id} /> is cast during <SpellLink id={SPELLS.HOT_STREAK.id} />. Even under ideal circumstances this cannot always be avoided. When possible, try to avoid triggering <SpellLink id={SPELLS.HOT_STREAK.id} /> through use of <SpellLink id={SPELLS.PHOENIXS_FLAMES.id} /> or <SpellLink id={SPELLS.FIRE_BLAST.id} /> until the buff is consumed.</Wrapper>)
          .icon(SPELLS.PYROBLAST.icon)
          .actual(`${formatPercentage(this.refreshPercentage, 1)}% buffs refreshed early`)
          .recommended(`<${formatPercentage(recommended, 1)}% is recommended`);
      });
        
       when(this.expireSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You let {(this.expiredProcs)} procs from <ItemLink id={ITEMS.MARQUEE_BINDINGS_OF_THE_SUN_KING.id} /> expire. Phase changes and other fight mechanics may sometimes make it impossible to hard cast <SpellLink id={SPELLS.PYROBLAST.id} /> before the buff expires, but you should try to avoid this. </Wrapper>)
          .icon(SPELLS.PYROBLAST.icon)
          .actual(`${formatNumber(this.expiredProcs)} expired buffs`)
          .recommended(`${formatNumber(recommended)} is recommended`);
      });   
  }  
}

export default MarqueeBindingsOfTheSunKing;
