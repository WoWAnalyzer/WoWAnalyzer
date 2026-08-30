import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import SPELLS from 'common/SPELLS/evoker';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SpellLink from 'interface/SpellLink';
import ItemSetLink from 'interface/ItemSetLink';
import { EVOKER_MID1_ID } from 'common/ITEMS';
import TALENTS from 'common/TALENTS/evoker';
import DonutChart from 'parser/ui/DonutChart';
import Causality from '../talents/Causality';
import { MID2_4P_DAMAGE_AMP } from '../../constants';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { formatNumber } from 'common/format';

/**
 * (4) Set Devastation: Causality reduces the remaining cooldown of your empower spells by an additional 0.1 sec each time the effect occurs. Eternity Surge deals 10% increased damage.
 */
export default class MID2Devastation2P extends Analyzer.withDependencies({
  causality: Causality,
}) {
  damageFromAmp = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.MID2);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ETERNITY_SURGE_DAM),
      this.onEternitySurgeDamage,
    );
  }

  private onEternitySurgeDamage(event: DamageEvent) {
    const extraDamage = calculateEffectiveDamage(event, MID2_4P_DAMAGE_AMP);

    this.damageFromAmp += extraDamage;
  }

  statistic() {
    const effectiveCDRItems = [
      {
        color: 'rgb(123,188,93)',
        label: 'Effective CDR',
        valueTooltip: this.deps.causality.MIDS24PEffectiveCDR.toFixed(2) + 's effective CDR',
        value: this.deps.causality.MIDS24PEffectiveCDR,
      },
      {
        color: 'rgb(216,59,59)',
        label: 'Wasted CDR',
        valueTooltip:
          this.deps.causality.MIDS24PWastedCDR.toFixed(2) +
          's CDR wasted whilst an Empower was ready',
        value: this.deps.causality.MIDS24PWastedCDR,
      },
    ];

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <strong>Eternity Surge:</strong>
            <ul>
              <li>Damage from amp: {formatNumber(this.damageFromAmp)}</li>
            </ul>
          </>
        }
      >
        <div className="pad">
          <label>
            <ItemSetLink id={EVOKER_MID1_ID}>MID Season 1 Tier Set 4-piece</ItemSetLink>
          </label>
        </div>
        <div className="pad">
          <label>
            <SpellLink spell={SPELLS.ETERNITY_SURGE} />
          </label>
          <strong>Damage from amp:</strong>
          <div className="value">
            <ItemDamageDone amount={this.damageFromAmp} />
          </div>
        </div>
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS.CAUSALITY_TALENT} />
          </label>
          <div>
            <strong>CDR efficiency:</strong>
            <DonutChart items={effectiveCDRItems} />
          </div>
        </div>
      </Statistic>
    );
  }
}
