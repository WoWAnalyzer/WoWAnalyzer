import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SpellLink from 'interface/SpellLink';
import { ON_CAST_BUFF_REMOVAL_GRACE_MS } from '../../constants';

const LAVA_BURST_DAMAGE_AMP = 0.2;

const LAVA_BURST_DAMAGE_SPELLS = [SPELLS.LAVA_BURST_DAMAGE, SPELLS.LAVA_BURST_OVERLOAD_DAMAGE];

/**
 * Power of the Maelstrom (12.1.0 redesign):
 * Lightning Bolt and Chain Lightning have a 15% chance to cause your next Lava Burst
 * to deal 20% increased damage, stacking up to 2 times. Lava Burst consumes one stack
 * at a time.
 *
 * Over-cap waste (procs that occur while already at 2 stacks) is not observable from
 * the log, so only expiry waste (stacks gained but never consumed) is reported.
 */
class PowerOfTheMaelstrom extends Analyzer {
  private stacksGained = 0;
  private buffedLavaBursts = 0;
  private addedDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.POWER_OF_THE_MAELSTROM_TALENT);
    if (!this.active) {
      return;
    }

    [Events.applybuff, Events.applybuffstack].forEach((filter) =>
      this.addEventListener(
        filter.by(SELECTED_PLAYER).spell(SPELLS.POWER_OF_THE_MAELSTROM_BUFF),
        this.onStackGained,
      ),
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.LAVA_BURST_TALENT),
      this.onLavaBurstCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(LAVA_BURST_DAMAGE_SPELLS),
      this.onLavaBurstDamage,
    );
  }

  private onStackGained() {
    this.stacksGained += 1;
  }

  private onLavaBurstCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.POWER_OF_THE_MAELSTROM_BUFF.id, event.timestamp)) {
      this.buffedLavaBursts += 1;
    }
  }

  private onLavaBurstDamage(event: DamageEvent) {
    if (
      this.selectedCombatant.hasBuff(
        SPELLS.POWER_OF_THE_MAELSTROM_BUFF.id,
        event.timestamp,
        ON_CAST_BUFF_REMOVAL_GRACE_MS,
      )
    ) {
      this.addedDamage += calculateEffectiveDamage(event, LAVA_BURST_DAMAGE_AMP);
    }
  }

  private get wastedStacks() {
    return Math.max(this.stacksGained - this.buffedLavaBursts, 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <ul>
              <li>
                <strong>{this.stacksGained}</strong> stacks gained
              </li>
              <li>
                <strong>{this.buffedLavaBursts}</strong> empowered{' '}
                <SpellLink spell={TALENTS.LAVA_BURST_TALENT} /> casts
              </li>
              <li>
                <strong>{this.wastedStacks}</strong> stacks expired unused
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.POWER_OF_THE_MAELSTROM_TALENT}>
          <ItemDamageDone amount={this.addedDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PowerOfTheMaelstrom;
