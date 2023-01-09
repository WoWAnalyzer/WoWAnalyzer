import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SPELL_COLORS } from 'analysis/retail/evoker/preservation/constants';
import DonutChart from 'parser/ui/DonutChart';
import SPECS from 'game/SPECS';
import { DEV_ESSENCE_CASTS, PRES_ESSENCE_CASTS } from '../../constants';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class Essence extends Analyzer {
  castsBySpell: Map<number, number> = new Map<number, number>();
  spentBySpell: Map<number, number> = new Map<number, number>();
  constructor(options: Options) {
    super(options);
    const casts =
      this.selectedCombatant.specId === SPECS.PRESERVATION_EVOKER.id
        ? PRES_ESSENCE_CASTS
        : DEV_ESSENCE_CASTS;
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(casts), this.onCast);
  }

  onCast(event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.ESSENCE_BURST_BUFF.id)) {
      return;
    }
    const cost = event.ability.guid === TALENTS_EVOKER.ECHO_TALENT.id ? 2 : 3;
    this.spentBySpell.set(
      event.ability.guid,
      (this.spentBySpell.get(event.ability.guid) ?? 0) + cost,
    );
    this.castsBySpell.set(event.ability.guid, (this.castsBySpell.get(event.ability.guid) ?? 0) + 1);
  }

  renderDonutChart() {
    const items = [
      {
        color: SPELL_COLORS.ECHO,
        label: 'Echo',
        spellId: TALENTS_EVOKER.ECHO_TALENT.id,
        value: this.spentBySpell.get(TALENTS_EVOKER.ECHO_TALENT.id) ?? 0,
        valueTooltip:
          this.spentBySpell.get(TALENTS_EVOKER.ECHO_TALENT.id) +
          ' essence in ' +
          this.castsBySpell.get(TALENTS_EVOKER.ECHO_TALENT.id) +
          ' casts',
      },
      {
        color: SPELL_COLORS.DISINTEGRATE,
        label: 'Disintegrate',
        spellId: SPELLS.DISINTEGRATE.id,
        value: this.spentBySpell.get(SPELLS.DISINTEGRATE.id) ?? 0,
        valueTooltip:
          this.spentBySpell.get(SPELLS.DISINTEGRATE.id) +
          ' essence in ' +
          this.castsBySpell.get(SPELLS.DISINTEGRATE.id) +
          ' casts',
      },
      {
        color: SPELL_COLORS.EMERALD_BLOSSOM,
        label: 'Emerald Blossom',
        spellId: SPELLS.EMERALD_BLOSSOM_CAST.id,
        value: this.spentBySpell.get(SPELLS.EMERALD_BLOSSOM_CAST.id) ?? 0,
        valueTooltip:
          this.spentBySpell.get(SPELLS.EMERALD_BLOSSOM_CAST.id) +
          ' essence in ' +
          this.castsBySpell.get(SPELLS.EMERALD_BLOSSOM_CAST.id) +
          ' casts',
      },
      {
        color: SPELL_COLORS.RENEWING_BLAZE,
        label: 'Pyre',
        spellId: TALENTS_EVOKER.PYRE_TALENT.id,
        value: this.spentBySpell.get(TALENTS_EVOKER.PYRE_TALENT.id) ?? 0,
        valueTooltip:
          this.spentBySpell.get(TALENTS_EVOKER.PYRE_TALENT.id) +
          ' essence in ' +
          this.castsBySpell.get(TALENTS_EVOKER.ECHO_TALENT.id) +
          ' casts',
      },
    ].filter((item) => {
      return item.value > 0;
    });
    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(6)}
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
      >
        <div className="pad">
          <label>Essence spending by spell</label>
          {this.renderDonutChart()}
        </div>
      </Statistic>
    );
  }
}

export default Essence;
