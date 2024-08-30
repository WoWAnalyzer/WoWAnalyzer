import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellLink from 'interface/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatNumber, formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Events, { CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';

//https://www.warcraftlogs.com/reports/WT19GKp2VHqLarbD#fight=19``&type=auras&source=122
class PowerSurgeAndDivineHaloHoly extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  //These are the values from the first cast of halo
  //all 6 halos and how much energy compression scales them
  firstHaloHealing = 0;
  totalArchonHaloHealing = 0;
  firstHaloDamage = 0;
  totalArchonHaloDamage = 0;

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
    }

    this.totalArchonHaloHealing += event.amount + (event.absorbed || 0);
  }

  handleHaloDamage(event: DamageEvent) {
    if (this.firstHalo) {
      this.firstHaloDamage += event.amount + (event.absorbed || 0);
    }

    this.totalArchonHaloDamage += event.amount + (event.absorbed || 0);
  }

  newHaloCast(event: CastEvent) {
    this.firstHalo = true;
  }
  removeArchonOut() {
    this.firstHalo = false;
  }

  // These functions return power surge/divine halo's contribution
  // compared to just the first halo (if you didn't have either archon talent)
  // aswell as energy compression
  passHaloFirstAndCapStoneHealing(): number {
    return this.totalArchonHaloHealing - this.firstHaloHealing;
  }

  passHaloFirstAndCapStoneDamage(): number {
    return this.totalArchonHaloDamage - this.firstHaloDamage;
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
            {' each time, it would have done '}
            {formatNumber(this.firstHaloHealing)}(
            {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.firstHaloHealing))}
            %) of your healing
            <br />
            {'and '}
            {formatNumber(this.firstHaloDamage)}(
            {formatPercentage(this.owner.getPercentageOfTotalHealingDone(this.firstHaloDamage))}
            %) of your damage
            <br />
            <br />
            {'This includes the amp from '}
            <SpellLink spell={TALENTS_PRIEST.ENERGY_COMPRESSION_TALENT} />
            {' if you are talented into it.'}
          </>
        }
      >
        <TalentSpellText talent={TALENTS_PRIEST.POWER_SURGE_TALENT}>
          <small>
            {'Your extra 5 casts of '}
            <SpellLink spell={SPELLS.HALO_TALENT} />
            {' from both '}
            <SpellLink spell={TALENTS_PRIEST.POWER_SURGE_TALENT} />
            {' and '}
            <SpellLink spell={TALENTS_PRIEST.DIVINE_HALO_TALENT} />
            {' did:'}
          </small>
          <br />
          <br />
          <ItemPercentHealingDone amount={this.passHaloFirstAndCapStoneHealing()} /> <br />
          <ItemPercentDamageDone amount={this.passHaloFirstAndCapStoneDamage()} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default PowerSurgeAndDivineHaloHoly;
