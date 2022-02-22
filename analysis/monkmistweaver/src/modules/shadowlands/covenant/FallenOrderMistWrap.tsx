import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import BoringValueText from 'parser/ui/BoringValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const MIST_WRAP_BUFF = 1.4;
const ENVELOPING_MIST_BUFF = 1.3;
const ENVELOPING_MIST_BASE_DURATION = 6000;

class FallenOrderMistWrap extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  mistwrapHealing: number = 0;
  mistwrapOverhealing: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id);

    this.active = this.active && this.selectedCombatant.hasTalent(SPELLS.MIST_WRAP_TALENT.id);

    if (!this.active) {
      return;
    }

    //mistweaver spells
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER_PET)
        .spell([SPELLS.FALLEN_ORDER_ENVELOPING_MIST, SPELLS.FALLEN_ORDER_SOOTHING_MIST]),
      this.healing,
    );
  }

  healing(event: HealEvent) {
    const target = this.combatants.players[event.targetID];

    // If its a pet or something
    // https://www.warcraftlogs.com/reports/w1PjmFCfMrpvKxGa/#fight=15&type=healing&source=53&pins=2%24Off%24%23244F4B%24expression%24ability.id%20%3D%20344008%20or%20ability.id%20%3D%20328283&options=44&target=54
    // example for why Kevin is terrible. Fuck kevin and everything he stands for
    if (!target) {
      return;
    }

    if (event.ability.guid === SPELLS.FALLEN_ORDER_SOOTHING_MIST.id) {
      this.mistwrapBonus(event);
    } else {
      this.envelopingMistHandler(event);
    }
  }

  envelopingMistHandler(event: HealEvent) {
    const target = this.combatants.players[event.targetID];

    if (
      target.hasBuff(
        SPELLS.FALLEN_ORDER_ENVELOPING_MIST.id,
        event.timestamp,
        0,
        ENVELOPING_MIST_BASE_DURATION,
        event.sourceID,
      )
    ) {
      this.mistwrapHealing += event.amount + (event.absorbed || 0);
      this.mistwrapOverhealing += event.overheal || 0;
    } else {
      this.mistwrapBonus(event);
    }
  }

  mistwrapBonus(event: HealEvent) {
    const healing = event.amount + (event.absorbed || 0);

    const target = this.combatants.players[event.targetID];

    if (
      !target.hasBuff(SPELLS.FALLEN_ORDER_ENVELOPING_MIST.id, event.timestamp, 0, 0, event.sourceID)
    ) {
      return;
    }

    // get actual effective healing from mist wrap's healing amp
    const netHealing = healing - (healing / MIST_WRAP_BUFF) * ENVELOPING_MIST_BUFF;

    const overhealing = event.overheal || 0;

    const effectiveMistWrapHealing = Math.max(netHealing - overhealing, 0);

    this.mistwrapHealing += effectiveMistWrapHealing;

    this.mistwrapOverhealing += netHealing - effectiveMistWrapHealing;
  }

  statistic() {
    const overhealingPercent =
      (this.mistwrapOverhealing / (this.mistwrapOverhealing + this.mistwrapHealing)) * 100;

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            The bonus healing done by your Fallen Order monks by having Mist Wrap talented. <br />
            Specifically the extra duration of Enveloping Mist and the increased Healing Done % on
            their Soothing Mist and Enveloping Mist healing.
            <br />
            <br />
            Effective Healing: {this.mistwrapHealing.toFixed(0)}
            <br />
            Over Healing: {this.mistwrapOverhealing.toFixed(0)} ({overhealingPercent.toFixed(2)} %)
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellLink id={SPELLS.MIST_WRAP_TALENT.id} /> Increase on{' '}
              <SpellLink id={SPELLS.FALLEN_ORDER_CRANE_CLONE.id} /> healing
            </>
          }
        >
          <ItemHealingDone amount={this.mistwrapHealing} />
        </BoringValueText>
      </Statistic>
    );
  }
}

export default FallenOrderMistWrap;
