import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class ElementalSpirits extends Analyzer {
  protected moltenWeaponCount = 0;
  protected icyEdgeCount = 0;
  protected cracklingSurgeCount = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ELEMENTAL_SPIRITS_TALENT);

    if (!this.active) {
      return;
    }

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.spell(SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON),
      this.gainMoltenWeapon,
    );

    this.addEventListener(
      Events.applybuff.spell(SPELLS.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE),
      this.gainIcyEdge,
    );

    this.addEventListener(
      Events.applybuff.spell(SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE),
      this.gainCracklingSurge,
    );
  }

  gainMoltenWeapon(event: ApplyBuffEvent) {
    this.moltenWeaponCount += 1;
  }

  gainIcyEdge(event: ApplyBuffEvent) {
    this.icyEdgeCount += 1;
  }

  gainCracklingSurge(event: ApplyBuffEvent) {
    this.cracklingSurgeCount += 1;
  }

  elementalSpiritsDonut() {
    const items = [
      {
        color: '#f37735',
        label: <>Molten Weapon</>,
        spellId: SPELLS.ELEMENTAL_SPIRITS_BUFF_MOLTEN_WEAPON.id,
        value: this.moltenWeaponCount,
      },
      {
        color: '#94d3ec',
        label: <>Icy Edge</>,
        spellId: SPELLS.ELEMENTAL_SPIRITS_BUFF_ICY_EDGE.id,
        value: this.icyEdgeCount,
      },
      {
        color: '#3b7fb0',
        label: <>Crackling Surge</>,
        spellId: SPELLS.ELEMENTAL_SPIRITS_BUFF_CRACKLING_SURGE.id,
        value: this.cracklingSurgeCount,
      },
    ];

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL()} category={STATISTIC_CATEGORY.TALENTS}>
        <div className="pad">
          <label>
            <SpellLink id={TALENTS_SHAMAN.ELEMENTAL_SPIRITS_TALENT.id} /> distribution
          </label>
          {this.elementalSpiritsDonut()}
        </div>
      </Statistic>
    );
  }
}

export default ElementalSpirits;
