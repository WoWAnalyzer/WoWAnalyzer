import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import SPELLS from 'common/SPELLS/evoker';
import Events from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SpellLink from 'interface/SpellLink';
import ItemSetLink from 'interface/ItemSetLink';
import { EVOKER_MID1_ID } from 'common/ITEMS';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import TALENTS from 'common/TALENTS/evoker';
import { MID1_4P_CDR_MS } from 'analysis/retail/evoker/devastation/constants';
import DonutChart from 'parser/ui/DonutChart';

/**
 * (4) Set Devastation: Eternity Surge grants 1 additional charge of Azure Sweep.
 * Casting Azure Sweep reduces the cooldown of Eternity Surge by 2.0 sec.
 */
class MID1Devastation2P extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  effectiveCDR = 0;
  wastedCDR = 0;

  eternitySurgeSpellId = SPELLS.ETERNITY_SURGE.id;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.MID1);

    if (this.selectedCombatant.hasTalent(TALENTS.FONT_OF_MAGIC_DEVASTATION_TALENT)) {
      this.eternitySurgeSpellId = SPELLS.ETERNITY_SURGE_FONT.id;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.AZURE_SWEEP), this.onCast);
  }

  private onCast() {
    const effectiveCDR = this.deps.spellUsable.reduceCooldown(
      this.eternitySurgeSpellId,
      MID1_4P_CDR_MS,
    );
    const wastedCDR = MID1_4P_CDR_MS - effectiveCDR;

    this.effectiveCDR += effectiveCDR / 1000;
    this.wastedCDR += wastedCDR / 1000;
  }

  statistic() {
    const effectiveCDRItems = [
      {
        color: 'rgb(123,188,93)',
        label: 'Effetive CDR',
        valueTooltip: this.effectiveCDR.toFixed(2) + 's effective CDR',
        value: this.effectiveCDR,
      },
      {
        color: 'rgb(216,59,59)',
        label: 'Wasted CDR',
        valueTooltip: this.wastedCDR.toFixed(2) + 's CDR wasted whilst Eternity Surge was ready',
        value: this.wastedCDR,
      },
    ];

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
      >
        <div className="pad">
          <label>
            <SpellLink spell={SPELLS.ETERNITY_SURGE} />
          </label>
          <small>
            <ItemSetLink id={EVOKER_MID1_ID}>MID Season 1 Tier Set 4-piece</ItemSetLink>
          </small>
          <div>
            <strong>CDR effeciency:</strong>
            <DonutChart items={effectiveCDRItems} />
          </div>
        </div>
      </Statistic>
    );
  }
}

export default MID1Devastation2P;
