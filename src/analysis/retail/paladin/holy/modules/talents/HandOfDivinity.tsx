import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

// The buff can be logged as dropping a few ms before the cast that consumed it,
// same race condition Infusion of Light has to work around.
const BUFF_EXPIRATION_BUFFER = 150;
const BUFF_MINIMAL_ACTIVE_TIME = 200;

// The buff is applied at two stacks in a single event -- there is no stack apply
// to count -- so each application is worth two instant Holy Lights.
const STACKS_PER_APPLICATION = 2;

/**
 * Hand of Divinity
 *
 * Casting Avenging Wrath grants two stacks of Hand of Divinity, each making one
 * Holy Light instant. There is nothing to cast, so the only thing worth measuring
 * is how many of the granted stacks were actually spent on a Holy Light.
 */
class HandOfDivinity extends Analyzer {
  procsGained = 0;
  procsUsed = 0;

  healing = 0;
  overhealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HAND_OF_DIVINITY_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.HAND_OF_DIVINITY_BUFF),
      this.onProcsGained,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_LIGHT),
      this.onHolyLightCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HOLY_LIGHT),
      this.onHolyLightHeal,
    );
  }

  onProcsGained() {
    this.procsGained += STACKS_PER_APPLICATION;
  }

  onHolyLightCast(event: CastEvent) {
    if (this.wasHandOfDivinityActive(event.timestamp)) {
      this.procsUsed += 1;
    }
  }

  onHolyLightHeal(event: HealEvent) {
    if (!this.wasHandOfDivinityActive(event.timestamp)) {
      return;
    }

    this.healing += event.amount + (event.absorbed || 0);
    this.overhealing += event.overheal || 0;
  }

  /**
   * The last stack is consumed on cast, so by the time its heal is logged the buff
   * has already gone. The expiration buffer is what keeps that heal attributed.
   */
  private wasHandOfDivinityActive(timestamp: number) {
    return this.selectedCombatant.hasBuff(
      SPELLS.HAND_OF_DIVINITY_BUFF.id,
      timestamp,
      BUFF_EXPIRATION_BUFFER,
      BUFF_MINIMAL_ACTIVE_TIME,
    );
  }

  get procsWasted() {
    return Math.max(0, this.procsGained - this.procsUsed);
  }

  get procsUsedPercentage() {
    return this.procsGained === 0 ? 0 : this.procsUsed / this.procsGained;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(8)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <p>
              Each <SpellLink spell={TALENTS.AVENGING_WRATH_TALENT} /> grants two stacks, each
              making one <SpellLink spell={SPELLS.HOLY_LIGHT} /> instant.
            </p>
            <p>
              The healing shown is the total done by the <SpellLink spell={SPELLS.HOLY_LIGHT} />{' '}
              casts that consumed a stack. The talent does not increase that healing, it only makes
              the casts instant, so treat this as the throughput the procs carried rather than
              healing gained from the talent.
            </p>
            <ul>
              <li>Procs gained: {this.procsGained}</li>
              <li>Procs used: {this.procsUsed}</li>
              <li>Procs wasted: {this.procsWasted}</li>
              <li>Proc usage: {formatPercentage(this.procsUsedPercentage, 0)}%</li>
              <li>Effective healing: {formatNumber(this.healing)}</li>
              <li>Overhealing: {formatNumber(this.overhealing)}</li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.HAND_OF_DIVINITY_TALENT}>
          <div>
            <ItemHealingDone amount={this.healing} />
          </div>
          <div>
            {this.procsUsed} / {this.procsGained} <small>procs used</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default HandOfDivinity;
