import { PALADIN_TWW2_ID } from 'common/ITEMS/dragonflight';
import { TIERS } from 'game/TIERS';
import ItemSetLink from 'interface/ItemSetLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import SPELLS from 'common/SPELLS';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { isInsuranceFromDivineToll } from '../../normalizers/CastLinkNormalizer';
import { SPELL_COLORS } from '../../constants';
import { formatNumber } from 'common/format';
import DonutChart, { Item } from 'parser/ui/DonutChart';

class T33TierSet extends Analyzer {
  has4Piece = false;
  insurance2pHotHealing = 0;
  insurance2pProcHealing = 0;
  insurance4pHotHealing = 0;
  insurance4pProcHealing = 0;
  ins4pOverheal = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.TWW2);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.TWW2);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.INSURANCE_HOT_PALADIN).by(SELECTED_PLAYER),
      this.onInsuranceHeal,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.INSURANCE_PROC_PALADIN).by(SELECTED_PLAYER),
      this.onInsuranceHeal,
    );
  }

  onInsuranceHeal(event: HealEvent) {
    if (this.has4Piece && isInsuranceFromDivineToll(event)) {
      this.ins4pOverheal += event.overheal || 0;
      if (event.ability.guid === SPELLS.INSURANCE_HOT_PALADIN.id) {
        this.insurance4pHotHealing += event.amount + (event.absorbed || 0);
      } else if (event.ability.guid === SPELLS.INSURANCE_PROC_PALADIN.id) {
        this.insurance4pProcHealing += event.amount + (event.absorbed || 0);
      }
    } else {
      if (event.ability.guid === SPELLS.INSURANCE_HOT_PALADIN.id) {
        this.insurance2pHotHealing += event.amount + (event.absorbed || 0);
      } else if (event.ability.guid === SPELLS.INSURANCE_PROC_PALADIN.id) {
        this.insurance2pProcHealing += event.amount + (event.absorbed || 0);
      }
    }
  }

  private renderDonutChart(hotHealing: number, procHealing: number) {
    const items: Item[] = [
      {
        color: SPELL_COLORS.HOLY_SHOCK,
        label: 'HoT',
        spellId: SPELLS.INSURANCE_HOT_PALADIN.id,
        value: hotHealing,
        valueTooltip: formatNumber(hotHealing),
      },
      {
        color: SPELL_COLORS.JUDGMENT,
        label: 'Proc',
        spellId: SPELLS.INSURANCE_PROC_PALADIN.id,
        value: procHealing,
        valueTooltip: formatNumber(procHealing),
      },
    ];
    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <div className="pad">
          <ItemSetLink id={PALADIN_TWW2_ID}>Oath of the Aureate Sentry</ItemSetLink> (T33 tier){' '}
          <h4>2 Piece</h4>
          <ItemHealingDone amount={this.insurance2pHotHealing + this.insurance2pProcHealing} />
          {this.renderDonutChart(this.insurance2pHotHealing, this.insurance2pProcHealing)}
          <h4>4 piece</h4>
          <ItemHealingDone amount={this.insurance4pHotHealing + this.insurance4pProcHealing} />
          {this.renderDonutChart(this.insurance4pHotHealing, this.insurance4pProcHealing)}
        </div>
      </Statistic>
    );
  }
}

export default T33TierSet;
