import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';
import { Trans } from '@lingui/react/macro';
import talents from 'common/TALENTS/shaman';
import { Options } from 'parser/core/Module';
import Events, { HealEvent } from 'parser/core/Events';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import spells from 'common/SPELLS';
import DonutChart from 'parser/ui/DonutChart';
import { RESTORATION_COLORS } from '../../constants';
import EarthlivingTracker from '../core/EarthlivingTracker';

class EarthlivingWeapon extends Analyzer {
  static dependencies = {
    earthlivingTracker: EarthlivingTracker,
    combatants: Combatants,
  };
  protected earthlivingTracker!: EarthlivingTracker;
  protected combatants!: Combatants;
  improved = false;
  totalHealing = 0;
  healingBySource = new Map<number, number>();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.EARTHLIVING_WEAPON_TALENT);
    this.improved = this.selectedCombatant.hasTalent(talents.IMPROVED_EARTHLIVING_WEAPON_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(spells.EARTHLIVING_WEAPON_HEAL),
      this.onEarthlivingHeal,
    );
  }

  onEarthlivingHeal(event: HealEvent) {
    if (event.tick) {
      if (
        !this.earthlivingTracker.hots[event.targetID] ||
        !this.earthlivingTracker.hots[event.targetID][event.ability.guid]
      ) {
        return;
      }
      const earthliving = this.earthlivingTracker.hots[event.targetID][event.ability.guid];
      const source = this.earthlivingTracker.getSourceSpellId(earthliving);
      const amount = event.amount + (event.absorbed || 0);
      const prev = this.healingBySource.get(source) || 0;
      this.healingBySource.set(source, prev + amount);
      this.totalHealing += amount;
    }
  }

  get earthlivingWeaponCastRatioChart() {
    const getAmount = (id: number) => this.healingBySource.get(id) || 0;

    const items = [
      {
        color: RESTORATION_COLORS.CHAIN_HEAL,
        label: <Trans id="shaman.restoration.spell.chainHeal">Chain Heal</Trans>,
        spellId: talents.CHAIN_HEAL_TALENT.id,
        value: getAmount(talents.CHAIN_HEAL_TALENT.id),
        valueTooltip: <ItemHealingDone amount={getAmount(talents.CHAIN_HEAL_TALENT.id)} />,
      },
      {
        color: RESTORATION_COLORS.STORMSTREAM_TOTEM,
        label: <Trans id="shaman.restoration.spell.stormstreamTotem">Stormstream Totem</Trans>,
        spellId: spells.STORMSTREAM_TOTEM.id,
        value: getAmount(spells.STORMSTREAM_TOTEM_HEAL.id),
        valueTooltip: <ItemHealingDone amount={getAmount(spells.STORMSTREAM_TOTEM_HEAL.id)} />,
      },
      {
        color: RESTORATION_COLORS.HEALING_STREAM_TOTEM,
        label: <Trans id="shaman.restoration.spell.healingStreamTotem">Healing Stream Totem</Trans>,
        spellId: spells.HEALING_STREAM_TOTEM.id,
        value: getAmount(spells.HEALING_STREAM_TOTEM_HEAL.id),
        valueTooltip: <ItemHealingDone amount={getAmount(spells.HEALING_STREAM_TOTEM_HEAL.id)} />,
      },
      {
        color: RESTORATION_COLORS.HEALING_WAVE,
        label: <Trans id="shaman.restoration.spell.healingWave">Healing Wave</Trans>,
        spellId: spells.HEALING_WAVE.id,
        value: getAmount(spells.HEALING_WAVE.id),
        valueTooltip: <ItemHealingDone amount={getAmount(spells.HEALING_WAVE.id)} />,
      },
      {
        color: RESTORATION_COLORS.HEALING_TIDE_TOTEM,
        label: <Trans id="shaman.restoration.spell.healingTideTotem">Healing Tide Totem</Trans>,
        spellId: talents.HEALING_TIDE_TOTEM_TALENT.id,
        value: getAmount(spells.HEALING_TIDE_TOTEM_HEAL.id),
        valueTooltip: <ItemHealingDone amount={getAmount(spells.HEALING_TIDE_TOTEM_HEAL.id)} />,
      },
      {
        color: RESTORATION_COLORS.RIPTIDE,
        label: <Trans id="shaman.restoration.spell.riptide">Riptide</Trans>,
        spellId: talents.RIPTIDE_TALENT.id,
        value: getAmount(talents.RIPTIDE_TALENT.id),
        valueTooltip: <ItemHealingDone amount={getAmount(talents.RIPTIDE_TALENT.id)} />,
      },
      {
        color: RESTORATION_COLORS.UNUSED,
        label: 'Unattributed',
        value: getAmount(0),
        valueTooltip: <ItemHealingDone amount={getAmount(0)} />,
      },
    ]
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(10)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={talents.EARTHLIVING_WEAPON_TALENT}>
          <ItemHealingDone amount={this.totalHealing} />
        </TalentSpellText>
        <aside className="pad">
          <hr />
          <header>
            <label>Earthliving Weapon Healing Sources</label>
          </header>
          {this.earthlivingWeaponCastRatioChart}
        </aside>
      </Statistic>
    );
  }
}

export default EarthlivingWeapon;
