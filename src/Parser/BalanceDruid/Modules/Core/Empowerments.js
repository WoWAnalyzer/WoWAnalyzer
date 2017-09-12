import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

class Empowerments extends Module {
  SolarCasts = 0;
  LunarCasts = 0;

  SolarEmpsActive = 0;
  LunarEmpsActive = 0;

  SolarEmpsOver = 0;
  LunarEmpsOver = 0;

  UnempSolar = 0;
  UnempLunar = 0;

  lastCast = 0;
  targetsHit = 0;

  UnempLunarLess = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.LUNAR_STRIKE.id !== spellId && SPELLS.STARSURGE_MOONKIN.id !== spellId && SPELLS.SOLAR_WRATH_MOONKIN.id !== spellId) {
      return;
    }
    switch (spellId) {
      case SPELLS.STARSURGE_MOONKIN.id:
        if (this.SolarEmpsActive < 3)
          this.SolarEmpsActive++;
        else
          this.SolarEmpsOver++;

        if (this.LunarEmpsActive < 3)
          this.LunarEmpsActive++;
        else
          this.LunarEmpsOver++;
        
        break;

      case SPELLS.LUNAR_STRIKE.id:
        this.LunarCasts++;
  
        if (this.LunarEmpsActive > 0)
          this.LunarEmpsActive--;
        else {
          this.UnempLunar++;
          this.lastCast = event;
        }

        break;
        
      case SPELLS.SOLAR_WRATH_MOONKIN.id:
        this.SolarCasts++;

        if (this.SolarEmpsActive > 0)
          this.SolarEmpsActive--;
        else
          this.UnempSolar++;
        
        break;

      default:
        return;
    }
  }

  on_byPlayer_damage(event){
    if (event === this.lastCast) {
        this.targetsHit ++;
    }
    else {
        if (this.targetsHit < 3)
            this.UnempLunarLess++;
        this.targetsHit = 0;
        this.lastCast = undefined;
    }
  }
}

export default Empowerments;
