import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Events, { DamageEvent, HealEvent } from 'parser/core/Events';
import EOLAttrib from '../../core/EchoOfLightAttributor';

class PowerSurgeAndDivineHaloHoly extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    eolAttrib: EOLAttrib,
  };

  protected combatants!: Combatants;
  protected eolAttrib!: EOLAttrib;

  //These are the values from the first cast of halo
  firstHaloHealing = 0;
  firstHaloDamage = 0;
  firstHaloEol = 0;

  //all 6 halos and how much energy compression scales them
  totalArchonHaloHealing = 0;
  totalArchonHaloDamage = 0;

  eolContrib = 0;

  private firstHalo = false;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.DIVINE_HALO_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HALO_TALENT),
      this.newHaloCast,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HALO_HEAL),
      this.handleHaloHealing,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.HALO_DAMAGE),
      this.handleHaloDamage,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HALO_TALENT),
      this.removeArchonOut,
    );
  }

  handleHaloHealing(event: HealEvent) {
    if (this.firstHalo) {
      this.firstHaloHealing += event.amount + (event.absorbed || 0);
      this.firstHaloEol += this.eolAttrib.getEchoOfLightHealingAttrib(event);
    }

    this.totalArchonHaloHealing += event.amount + (event.absorbed || 0);
    this.eolContrib += this.eolAttrib.getEchoOfLightHealingAttrib(event);
  }

  handleHaloDamage(event: DamageEvent) {
    if (this.firstHalo) {
      this.firstHaloDamage += event.amount + (event.absorbed || 0);
    }

    this.totalArchonHaloDamage += event.amount + (event.absorbed || 0);
  }

  newHaloCast() {
    this.firstHalo = true;
  }

  removeArchonOut() {
    this.firstHalo = false;
  }

  // These functions return power surge/divine halo's contribution
  // compared to just the first halo (if you didn't have either archon talent)
  // aswell as energy compression
  get passHaloFirstAndCapStoneHealing(): number {
    return this.totalArchonHaloHealing + this.eolContrib;
  }

  get passHaloFirstAndCapStoneDamage(): number {
    return this.totalArchonHaloDamage;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            {'If you only cast your first '}
            <SpellLink spell={SPELLS.HALO_TALENT} />
            {' each time, it would have done: '}
            <br />
            {<ItemPercentHealingDone amount={this.firstHaloHealing}></ItemPercentHealingDone>}{' '}
            directly
            <br />
            <ItemPercentHealingDone amount={this.firstHaloEol}></ItemPercentHealingDone> from{' '}
            <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />
            <br />
            <ItemPercentDamageDone amount={this.firstHaloDamage}></ItemPercentDamageDone> of your
            damage
            <br />
            <br /> Total breakdown of healing from all 6 events per cast: <br />{' '}
            <SpellLink spell={SPELLS.ECHO_OF_LIGHT_MASTERY} />:{' '}
            <ItemPercentHealingDone amount={this.eolContrib}></ItemPercentHealingDone>
            <br />
            <SpellLink spell={TALENTS_PRIEST.HALO_SHARED_TALENT} />:{' '}
            <ItemPercentHealingDone amount={this.totalArchonHaloHealing}></ItemPercentHealingDone>
            {this.selectedCombatant.hasTalent(TALENTS_PRIEST.ENERGY_COMPRESSION_TALENT) && (
              <>
                <br />
                <br />
                {'This includes the amp from '}
                <SpellLink spell={TALENTS_PRIEST.ENERGY_COMPRESSION_TALENT} />
                {' if you are talented into it.'}
              </>
            )}
          </>
        }
      >
        <TalentSpellText talent={TALENTS_PRIEST.POWER_SURGE_TALENT}>
          <small>
            {'All 6 events per cast of '}
            <SpellLink spell={SPELLS.HALO_TALENT} />
            {' from the base spell and both '}
            <SpellLink spell={TALENTS_PRIEST.POWER_SURGE_TALENT} />
            {' and '}
            <SpellLink spell={TALENTS_PRIEST.DIVINE_HALO_TALENT} />
            {' did:'}
          </small>
          <br />
          <br />
          <div>
            <ItemPercentHealingDone amount={this.passHaloFirstAndCapStoneHealing} />
          </div>
          <div>
            <ItemPercentDamageDone amount={this.passHaloFirstAndCapStoneDamage} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PowerSurgeAndDivineHaloHoly;
