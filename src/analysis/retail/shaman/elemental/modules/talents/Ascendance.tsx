import { formatNumber, formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

import Abilities from '../Abilities';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  RefreshBuffEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

class Ascendance extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    enemies: Enemies,
    spellUsable: SpellUsable,
  };

  justEnteredAscendance = false;
  checkDelay = 0;
  numCasts = {
    [TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id]: 0,
    [TALENTS.LAVA_BURST_TALENT.id]: 0,
    [TALENTS.EARTH_SHOCK_TALENT.id]: 0,
    [TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id]: 0,
    others: 0,
  };
  protected abilities!: Abilities;
  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;

  private ascendanceIsActive: boolean = false;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS.ASCENDANCE_ELEMENTAL_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ELEMENTAL_TALENT),
      this.onApplyAscendance,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ELEMENTAL_TALENT),
      this.onApplyAscendance,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ELEMENTAL_TALENT),
      () => (this.ascendanceIsActive = false),
    );
    this.addEventListener(Events.UpdateSpellUsable, this.onLvBUpdateSpellUsable);
  }

  onLvBUpdateSpellUsable(event: UpdateSpellUsableEvent) {
    const spellId = TALENTS.LAVA_BURST_TALENT.id;
    if (!this.ascendanceIsActive || event.ability.guid !== spellId) {
      return;
    }

    if (
      event.updateType === UpdateSpellUsableType.UseCharge ||
      event.updateType === UpdateSpellUsableType.BeginCooldown
    ) {
      this.spellUsable.endCooldown(spellId, event.timestamp, true, true);
    }
  }

  onApplyAscendance(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.ascendanceIsActive = true;
    this.numCasts[event.ability.guid] += 1;
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;

    if (this.numCasts[spellId] !== undefined) {
      this.numCasts[spellId] += 1;
    } else {
      this.numCasts.others += 1;
    }
  }

  get AscendanceUptime() {
    return (
      this.selectedCombatant.getBuffUptime(TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id) /
      this.owner.fightDuration
    );
  }

  get averageLavaBurstCasts() {
    return (
      this.numCasts[TALENTS.LAVA_BURST_TALENT.id] /
        this.numCasts[TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id] || 0
    );
  }

  get suggestionThresholds() {
    return {
      actual: this.numCasts.others,
      isGreaterThan: {
        major: 0,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  statistic() {
    const hasEB = this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT);

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            With a uptime of: {formatPercentage(this.AscendanceUptime)} %<br />
            Casts while Ascendance was up:
            <ul>
              <li>Lava Burst: {this.numCasts[TALENTS.LAVA_BURST_TALENT.id]}</li>
              {(hasEB && (
                <li>
                  Elemental Blast: {this.numCasts[TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id]}
                </li>
              )) || <li>Earth Shock: {this.numCasts[TALENTS.EARTH_SHOCK_TALENT.id]}</li>}
              <li>Other Spells: {this.numCasts.others}</li>
            </ul>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.ASCENDANCE_ELEMENTAL_TALENT}>
          <>
            On average {formatNumber(this.averageLavaBurstCasts)} Lava Bursts cast during
            Ascendance.
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when: When) {
    const abilities = `Lava Burst ${
      this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT)
        ? `, Elemental Blast `
        : ``
    } and Earth Shock`;
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(<span>Maximize your damage during ascendance by only using ${abilities}.</span>)
        .icon(TALENTS.ASCENDANCE_ELEMENTAL_TALENT.icon)
        .actual(`${actual} other casts during Ascendence`)
        .recommended(`Only cast ${abilities} during Ascendence.`),
    );
  }
}

export default Ascendance;
