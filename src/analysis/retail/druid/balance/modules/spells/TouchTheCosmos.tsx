import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TIERS } from 'game/TIERS';
import { SpellLink } from 'interface';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STARFALL_BASE_COST, STARSURGE_BASE_COST } from '../../constants';

const AFFECTED_CAST = [SPELLS.STARSURGE_MOONKIN, SPELLS.STARFALL_CAST];
class TouchTheCosmos extends Analyzer {
  totalDamage = 0;
  totcBuffedAbilities: { [key: number]: number } = {};
  savedAP = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.DF1);

    Object.values(AFFECTED_CAST).forEach((spell) => {
      this.totcBuffedAbilities[spell.id] = 0;
    });
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(AFFECTED_CAST), this.onCast);
  }

  onCast(event: CastEvent) {
    const hasTouchCosmos = this.selectedCombatant.hasBuff(SPELLS.TOUCH_THE_COSMOS.id);
    if (!hasTouchCosmos) {
      return;
    }

    this.totcBuffedAbilities[event.ability.guid] += 1;
    if (event.ability.guid === SPELLS.STARSURGE_MOONKIN.id) {
      this.savedAP += STARSURGE_BASE_COST;
    }
    if (event.ability.guid === SPELLS.STARFALL_CAST.id) {
      this.savedAP += STARFALL_BASE_COST;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(11)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Ability</th>
                  <th>Number of Free Casts</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(this.totcBuffedAbilities).map((e) => (
                  <tr key={e}>
                    <th>
                      <SpellLink spell={Number(e)} />
                    </th>
                    <td>{this.totcBuffedAbilities[Number(e)]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.TOUCH_THE_COSMOS}>
          <>
            {formatNumber(this.savedAP)} <small>Astral Power accounted in Pulsar</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default TouchTheCosmos;
