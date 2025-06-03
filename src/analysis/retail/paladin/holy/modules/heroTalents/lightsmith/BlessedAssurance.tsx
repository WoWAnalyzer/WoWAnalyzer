import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  BeaconHealEvent,
  DamageEvent,
  GetRelatedEvents,
  HealEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import {
  AC_CRUSADER_STRIKE,
  BLESSED_ASSURANCE,
} from '../../../normalizers/EventLinks/EventLinkConstants';
import { formatNumber } from 'common/format';
import SpellLink from 'interface/SpellLink';

class BlessedAssurance extends Analyzer {
  hasAC = false;

  blessedAssuranceCrusaderStrikes: number[] = [];
  blessedAssuranceAvengingCrusaderHeals: number[] = [];
  crusaderStrikesInsideAC = 0;
  blessedAssuranceCrusaderStrikesInsideAC = 0;

  healingDone = 0;
  overhealing = 0;
  damageDone = 0;
  healingTransfered = 0;
  beaconOverhealing = 0;

  constructor(args: Options) {
    super(args);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BLESSED_ASSURANCE_TALENT);

    this.hasAC = this.selectedCombatant.hasTalent(TALENTS.AVENGING_CRUSADER_TALENT);

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.BLESSED_ASSURANCE_BUFF),
      this.onRemove,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CRUSADER_STRIKE),
      this.onDamage,
    );
    this.addEventListener(Events.beacontransfer.by(SELECTED_PLAYER), this.onBeaconTransfer);
  }

  onRemove(event: RemoveBuffEvent) {
    const events = GetRelatedEvents<DamageEvent>(event, BLESSED_ASSURANCE);
    for (const damage of events) {
      const amount = damage.amount + (damage.absorbed || 0);
      this.blessedAssuranceCrusaderStrikes.push(damage.timestamp);
      this.damageDone += amount * 0.2;
    }
  }

  onDamage(event: DamageEvent) {
    if (this.hasAC) {
      const events = GetRelatedEvents<HealEvent>(event, AC_CRUSADER_STRIKE);
      this.crusaderStrikesInsideAC += events.length;

      if (events.length > 0) {
        this.blessedAssuranceCrusaderStrikesInsideAC += 1;
      }

      if (this.blessedAssuranceCrusaderStrikes.includes(event.timestamp)) {
        for (const heal of events) {
          this.blessedAssuranceAvengingCrusaderHeals.push(heal.timestamp);
          this.healingDone += heal.amount + (heal.absorbed || 0);
          this.overhealing += heal.overheal || 0;
        }
      }
    }
  }

  onBeaconTransfer(event: BeaconHealEvent) {
    const spellId = event.originalHeal.ability.guid;
    if (
      spellId !== SPELLS.AVENGING_CRUSADER_HEAL_NORMAL.id &&
      spellId !== SPELLS.AVENGING_CRUSADER_HEAL_CRIT.id
    ) {
      return;
    }
    if (this.blessedAssuranceAvengingCrusaderHeals.includes(event.originalHeal.timestamp)) {
      this.healingTransfered += event.amount + (event.absorbed || 0);
      this.beaconOverhealing += event.overheal || 0;
    }
  }

  get totalHealing() {
    return this.healingDone + this.healingTransfered;
  }

  get totalOverhealing() {
    return this.overhealing + this.beaconOverhealing;
  }

  // no AC: report/wjh1ZKmYp9y6d8Q7/19-Mythic+Vexie+and+the+Geargrinders+-+Kill+(6:23)/卡布奇诺曉龚/standard/statistics
  // no AC & no CS casts: report/FD2xCPYHL8wdtpVn/5-Mythic+Rik+Reverb+-+Wipe+5+(4:38)/柠檬半夏/standard/statistics

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            {!this.hasAC && (
              <>
                No healing to be received from{' '}
                <SpellLink spell={TALENTS.BLESSED_ASSURANCE_TALENT} /> if{' '}
                <SpellLink spell={TALENTS.AVENGING_CRUSADER_TALENT} /> is not taken. <br />
              </>
            )}
            <SpellLink spell={TALENTS.BLESSED_ASSURANCE_TALENT} />{' '}
            <SpellLink spell={SPELLS.CRUSADER_STRIKE} />
            s: {this.blessedAssuranceCrusaderStrikes.length}
            <br />
            {this.hasAC && (
              <>
                <SpellLink spell={TALENTS.BLESSED_ASSURANCE_TALENT} />{' '}
                <SpellLink spell={SPELLS.CRUSADER_STRIKE} />s during{' '}
                <SpellLink spell={SPELLS.AVENGING_CRUSADER} />:{' '}
                {this.blessedAssuranceCrusaderStrikesInsideAC}
                <br />
                Healing from <SpellLink spell={TALENTS.BLESSED_ASSURANCE_TALENT} />:{' '}
                {formatNumber(this.healingDone)}
                <br />
                Healing from <SpellLink spell={SPELLS.BEACON_OF_LIGHT_CAST_AND_BUFF} /> via{' '}
                <SpellLink spell={TALENTS.BLESSED_ASSURANCE_TALENT} />:{' '}
                {formatNumber(this.healingTransfered)}
                <br />
                Overhealing: {formatNumber(this.totalOverhealing)}
              </>
            )}
          </>
        }
      >
        <TalentSpellText talent={TALENTS.BLESSED_ASSURANCE_TALENT}>
          <div>
            <ItemHealingDone amount={this.totalHealing} />
          </div>
          <div>
            <ItemDamageDone amount={this.damageDone} />
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default BlessedAssurance;
