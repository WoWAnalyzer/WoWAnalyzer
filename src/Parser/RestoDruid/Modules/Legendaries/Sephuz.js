import Module from 'Main/Parser/Module';

export const SEPHUZ_ITEM_ID = 132452;

// 1% Haste is worth 375 haste rating.
const ONE_PERCENT_HASTE_RATING = 375;
const SEPHUZ_PROCC_HASTE = 25;
const SEPHUZ_BUFF_ID = 208052;

class Sephuz extends Module {
  uptime = 0;
  throughput = 0;
  sephuzProccInHasteRating = SEPHUZ_PROCC_HASTE * ONE_PERCENT_HASTE_RATING;
  sephuzStaticHasteInRating = 0;
  on_initialized() {
    this.sephuzStaticHasteInRating = ((this.owner.selectedCombatant.hastePercentage+1)-((this.owner.selectedCombatant.hastePercentage+1) / 1.02))*100*ONE_PERCENT_HASTE_RATING;
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;

    if (spellId === SEPHUZ_BUFF_ID) {
      this.uptime += 10000;
      console.log("Uptime: " + this.uptime);
      return;
    }
  }
}

export default Sephuz;
