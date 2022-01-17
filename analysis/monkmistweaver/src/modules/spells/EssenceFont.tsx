import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class EssenceFont extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;

  boltHealing: number = 0;
  boltOverhealing: number = 0;
  hotHealing: number = 0;
  hotOverhealing: number = 0;
  gomHealing: number = 0;
  gomOverhealing: number = 0;
  gomEFHits: number = 0;
  gomEFEvent: boolean = false;

  totalHealing: number = 0;
  totalOverhealing: number = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_FONT_BUFF),
      this.handleEssenceFontHealing,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.gustHealing,
    );
  }

  gustHealing(event: HealEvent) {
    const combatant = this.combatants.players[event.targetID];
    if (!combatant) {
      return;
    }

    const targetHasEFHot = combatant.hasBuff(
      SPELLS.ESSENCE_FONT_BUFF.id,
      event.timestamp,
      0,
      0,
      event.sourceID,
    );

    // if no EF buff die
    if (!targetHasEFHot) {
      return;
    }

    if (!this.gomEFEvent) {
      this.gomEFEvent = true;
      return;
    }

    // GoM healing
    this.gomEFEvent = false;
    this.gomEFHits += 1;
    this.gomHealing += event.amount + (event.absorbed || 0);
    this.gomOverhealing += event.overheal || 0;

    // Total healing
    this.totalHealing += event.amount + (event.absorbed || 0);
    this.totalOverhealing += event.overheal || 0;
  }

  handleEssenceFontHealing(event: HealEvent) {
    //tick vs bolt hit
    if (event.tick) {
      this.hotHealing += event.amount + (event.absorbed || 0);
      this.hotOverhealing += event.overheal || 0;
    } else {
      this.boltHealing += event.amount + (event.absorbed || 0);
      this.boltOverhealing += event.overheal || 0;
    }

    // total healing
    this.totalHealing += event.amount + (event.absorbed || 0);
    this.totalOverhealing += event.overheal || 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(0)}
        size="flexible"
        category={STATISTIC_CATEGORY.THEORYCRAFT}
        tooltip={<>Gust Of Mist healing events due to Essence Font Hot.</>}
      >
        <BoringValueText
          label={
            <>
              <SpellLink id={SPELLS.GUSTS_OF_MISTS.id} /> from Essence Font
            </>
          }
        >
          {this.gomEFHits}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default EssenceFont;
