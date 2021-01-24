import SPELLS from 'common/SPELLS';
import CoreChanneling from 'parser/shared/modules/Channeling';
import Events, { RemoveBuffEvent, CastEvent } from 'parser/core/Events';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import bosses from 'raids/castlenathria';

/* Soul Infusion for Sun king's Salvation */
/* Example Data: https://Wowanalyzer.com/report/g4Pja6pLHnmQtbvk/32-Normal+Sun+King's+Salvation+-+Kill+(10:14)/Pjurbo/standard/timeline */

class SoulInfusion extends CoreChanneling {
  constructor(options: Options) {
    super(options);

    const boss = this.owner.boss;
    this.active = boss === bosses.bosses['SunKingsSalvation'];
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SOUL_INFUSION),
      this.onBeginChannel,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SOUL_INFUSION),
      this.onRemoveBuff,
    );
  }

  onBeginChannel(event: CastEvent) {
    this.beginChannel(event);
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    //Buff will be removed if channeld is canceled
    this.endChannel(event);
  }
}

export default SoulInfusion;
