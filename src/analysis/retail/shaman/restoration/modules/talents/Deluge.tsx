import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { HealEvent, BeginCastEvent } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

import HealingRainLocation from '../core/HealingRainLocation';
import RiptideTracker from '../core/RiptideTracker';

const DELUGE_HEALING_INCREASE = 0.1; //per rank

/**
 * Chain Heal heals for an additional 20% on targets within your Healing Rain or affected by your Riptide.
 */
class Deluge extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    healingRainLocation: HealingRainLocation,
    riptideTracker: RiptideTracker,
  };
  protected combatants!: Combatants;
  protected healingRainLocation!: HealingRainLocation;
  protected riptideTracker!: RiptideTracker;

  fromRiptideHealing: number = 0;
  fromHealingRainHealing: number = 0;
  eventsDuringRain: HealEvent[] = [];
  delugeIncrease: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DELUGE_TALENT);
    this.delugeIncrease =
      this.selectedCombatant.getTalentRank(TALENTS.DELUGE_TALENT) * DELUGE_HEALING_INCREASE;
    this.addEventListener(
      Events.heal
        .by(SELECTED_PLAYER)
        .spell([TALENTS.CHAIN_HEAL_TALENT, SPELLS.HEALING_WAVE, SPELLS.HEALING_SURGE]),
      this._onHeal,
    );
    this.addEventListener(
      Events.begincast.by(SELECTED_PLAYER).spell(TALENTS.HEALING_RAIN_TALENT),
      this._onHealingRainBegincast,
    );
    this.addEventListener(Events.fightend, this._onFightEnd);
  }

  get healing() {
    return this.fromRiptideHealing + this.fromHealingRainHealing;
  }

  _onHeal(event: HealEvent) {
    const combatant = this.combatants.getEntity(event);
    if (!combatant) {
      // Pet healing
      this.eventsDuringRain.push(event);
      return;
    }
    const targetId = event.targetID;
    if (
      this.riptideTracker.hots[targetId] &&
      this.riptideTracker.hots[targetId][TALENTS.RIPTIDE_TALENT.id]
    ) {
      this.fromRiptideHealing += calculateEffectiveHealing(event, this.delugeIncrease);
    } else {
      // We add events for the Healing Rain here, so that it doesn't double dip on targets with Riptide
      this.eventsDuringRain.push(event);
    }
  }

  // Due to the nature of having to wait until rain is over, to be able to find out its position,
  // we only start processing the healing contribution on the next cast of Healing Rain or at the end of combat.
  _onHealingRainBegincast(event: BeginCastEvent) {
    if (event.isCancelled) {
      return;
    }
    this.recordHealing();
    this.eventsDuringRain.length = 0;
  }

  _onFightEnd() {
    this.recordHealing();
  }

  recordHealing() {
    // filters out the first cast in combat if there was no pre-cast, or if there were no Chain Heal casts anyway.
    if (this.eventsDuringRain.length === 0) {
      return;
    }

    this.fromHealingRainHealing += this.healingRainLocation.processHealingRain(
      this.eventsDuringRain,
      DELUGE_HEALING_INCREASE,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(15)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <ul>
              <li>
                {formatThousands(this.fromRiptideHealing)} from healing targets with{' '}
                <SpellLink spell={TALENTS.RIPTIDE_TALENT} />
              </li>
              <li>
                {formatThousands(this.fromHealingRainHealing)} from healing targets inside your{' '}
                <SpellLink spell={TALENTS.HEALING_RAIN_TALENT} />
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.DELUGE_TALENT}>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Deluge;
