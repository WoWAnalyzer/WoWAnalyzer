import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_DRUID } from 'common/TALENTS';
import { SpellLink } from 'interface';
import { STARFALL_BASE_COST, STARSURGE_BASE_COST } from '../../constants';

const AFFECTED_CAST = [SPELLS.STARSURGE_MOONKIN, SPELLS.STARFALL_CAST];

/**
 * **Starweaver**
 * Spec Talent
 *
 * Starsurge has a 20% chance to make Starfall free. Starfall has a 40% chance to make Starsurge free.
 */
class Starweaver extends Analyzer {
  freeAbilities: { [key: number]: number } = {};
  savedAP = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.STARWEAVER_TALENT);

    Object.values(AFFECTED_CAST).forEach((spell) => {
      this.freeAbilities[spell.id] = 0;
    });

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(AFFECTED_CAST), this.onCast);
  }

  onCast(event: CastEvent) {
    const hasTouchCosmos = this.selectedCombatant.hasBuff(SPELLS.TOUCH_THE_COSMOS.id);
    const hasStarweaverWarp = this.selectedCombatant.hasBuff(SPELLS.STARWEAVERS_WARP.id); // Free Starfall
    const hasStarweaverWeft = this.selectedCombatant.hasBuff(SPELLS.STARWEAVERS_WEFT.id); // Free Starsurge
    if (hasTouchCosmos || (!hasStarweaverWarp && !hasStarweaverWeft)) {
      return;
    }
    if (hasStarweaverWeft && event.ability.guid === SPELLS.STARSURGE_MOONKIN.id) {
      this.savedAP += STARSURGE_BASE_COST;
      this.freeAbilities[event.ability.guid] += 1;
    }
    if (hasStarweaverWarp && event.ability.guid === SPELLS.STARFALL_CAST.id) {
      this.savedAP += STARFALL_BASE_COST;
      this.freeAbilities[event.ability.guid] += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(12)}
        size="flexible"
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
                {Object.keys(this.freeAbilities).map((e) => (
                  <tr key={e}>
                    <th>
                      <SpellLink spell={Number(e)} />
                    </th>
                    <td>{this.freeAbilities[Number(e)]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.STARWEAVER_TALENT}>
          <>
            {formatNumber(this.savedAP)} <small> Astral Power accounted in Pulsar </small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Starweaver;
