import { formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TALENTS from 'common/TALENTS/warrior';

const POSSIBLE_TALENTS_AFFECTED_BY_ANGER_MANAGEMENT = [
  TALENTS.AVATAR_PROTECTION_TALENT,
  TALENTS.SHIELD_WALL_TALENT,
];
const RAGE_NEEDED_FOR_A_PROC = 10;
const CDR_PER_PROC = 1000; // ms

class AngerManagement extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  totalRageSpend = 0;
  wastedReduction: { [spellId: number]: number } = {};
  effectiveReduction: { [spellId: number]: number } = {};
  protected spellUsable!: SpellUsable;
  COOLDOWNS_AFFECTED_BY_ANGER_MANAGEMENT: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ANGER_MANAGEMENT_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    POSSIBLE_TALENTS_AFFECTED_BY_ANGER_MANAGEMENT.forEach((e) => {
      if (this.selectedCombatant.hasTalent(e)) {
        this.COOLDOWNS_AFFECTED_BY_ANGER_MANAGEMENT.push(e.id);
      }
    });
    this.COOLDOWNS_AFFECTED_BY_ANGER_MANAGEMENT.forEach((e) => {
      this.wastedReduction[e] = 0;
      this.effectiveReduction[e] = 0;
    });
  }

  onCast(event: CastEvent) {
    const classResources = event.classResources?.find((e) => e.type === RESOURCE_TYPES.RAGE.id);
    if (!classResources || !classResources.cost) {
      return;
    }
    const rageSpend = classResources.cost / RAGE_NEEDED_FOR_A_PROC;
    const reduction = (rageSpend / RAGE_NEEDED_FOR_A_PROC) * CDR_PER_PROC;
    this.COOLDOWNS_AFFECTED_BY_ANGER_MANAGEMENT.forEach((e) => {
      if (!this.spellUsable.isOnCooldown(e)) {
        this.wastedReduction[e] += reduction;
      } else {
        const effectiveReduction = this.spellUsable.reduceCooldown(e, reduction);
        this.effectiveReduction[e] += effectiveReduction;
        this.wastedReduction[e] += reduction - effectiveReduction;
      }
    });
    this.totalRageSpend += rageSpend;
  }

  get tooltip() {
    return (
      <table className="table table-condensed">
        <thead>
          <tr>
            <th>Spell</th>
            <th>Effective</th>
            <th>Wasted</th>
          </tr>
        </thead>
        <tbody>
          {this.COOLDOWNS_AFFECTED_BY_ANGER_MANAGEMENT.map((value) => (
            <tr key={value}>
              <td>
                <SpellLink id={SPELLS[value].id} />
              </td>
              <td>{formatDuration(this.effectiveReduction[value])}</td>
              <td>{formatDuration(this.wastedReduction[value])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        wide
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringValueText
          label={
            <>
              <SpellLink id={TALENTS.ANGER_MANAGEMENT_TALENT.id} /> Possible cooldown reduction
            </>
          }
        >
          {this.tooltip}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default AngerManagement;
