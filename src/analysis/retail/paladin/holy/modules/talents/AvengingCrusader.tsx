import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { BeaconHealEvent, HealEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import BeaconHealSource from '../beacons/BeaconHealSource';

/**
 * Avenging Crusader
 *
 *  You become the ultimate crusader of light, increasing your Crusader Strike, Judgment, and auto-attack damage by 30%.
 *  Crusader Strike and Judgment cool down 30% faster and heal up to 3 injured allies for 250% of the damage they deal. Lasts 20 sec.
 *  Example Log: https://www.warcraftlogs.com/reports/Ht1XgQxaCGc8kbrA#fight=4&type=healing&source=13
 */
class AvengingCrusader extends Analyzer {
  static dependencies = {
    beaconHealSource: BeaconHealSource,
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  healing = 0;
  healingTransfered = 0;
  hits = 0;
  crits = 0;
  overHealing = 0;
  beaconOverhealing = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.AVENGING_CRUSADER_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.AVENGING_CRUSADER_HEAL_NORMAL),
      this.onHit,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.AVENGING_CRUSADER_HEAL_CRIT),
      this.onCrit,
    );
    this.addEventListener(Events.beacontransfer.by(SELECTED_PLAYER), this.onBeaconTransfer);

    this.addEventListener(
      Events.applybuff.spell(TALENTS.AVENGING_CRUSADER_TALENT),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.spell(TALENTS.AVENGING_CRUSADER_TALENT),
      this.onRemoveBuff,
    );
  }

  onHit(event: HealEvent) {
    this.hits += 1;
    this.healing += event.amount + (event.absorbed || 0);
    this.overHealing += event.overheal || 0;
  }

  onCrit(event: HealEvent) {
    this.crits += 1;
    this.onHit(event);
  }

  onBeaconTransfer(event: BeaconHealEvent) {
    const spellId = event.originalHeal.ability.guid;
    if (
      spellId !== SPELLS.AVENGING_CRUSADER_HEAL_NORMAL.id &&
      spellId !== SPELLS.AVENGING_CRUSADER_HEAL_CRIT.id
    ) {
      return;
    }
    this.healingTransfered += event.amount + (event.absorbed || 0);
    this.beaconOverhealing += event.overheal || 0;
  }

  onApplyBuff() {
    this.spellUsable.applyCooldownRateChange(
      [SPELLS.JUDGMENT_CAST_HOLY.id, SPELLS.CRUSADER_STRIKE.id],
      1.3,
    );
  }

  onRemoveBuff() {
    this.spellUsable.removeCooldownRateChange(
      [SPELLS.JUDGMENT_CAST_HOLY.id, SPELLS.CRUSADER_STRIKE.id],
      1.3,
    );
  }

  get critRate() {
    return this.crits / this.hits || 0;
  }
  get totalHealing() {
    return this.healing + this.healingTransfered;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Hits: <b>{this.hits}</b> Crits: <b>{this.crits}</b>
            <br />
            Overhealed:{' '}
            <b>{formatPercentage(this.overHealing / (this.healing + this.overHealing))}%</b>
            <br />
            Beacon healing: <b>{formatNumber(this.healingTransfered)}</b>
            <br />
            Beacon overhealed:{' '}
            <b>
              {formatPercentage(
                this.beaconOverhealing / (this.beaconOverhealing + this.healingTransfered),
              )}
              %
            </b>
            <br />
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.AVENGING_CRUSADER_TALENT.id}>
          <ItemHealingDone amount={this.totalHealing} /> <br />
          {formatPercentage(this.critRate)}% Crit Rate
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default AvengingCrusader;
