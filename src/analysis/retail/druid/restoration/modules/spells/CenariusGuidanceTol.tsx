import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentHealingDone from 'parser/ui/ItemPercentHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { TALENTS_DRUID } from 'common/TALENTS';
import GroveGuardians from 'analysis/retail/druid/restoration/modules/spells/GroveGuardians';
import { SpellIcon } from 'interface';
import Events, {
  EventType,
  SummonEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import EventFilter from 'parser/core/EventFilter';

const TOL_CDR_MS = 5000;

const deps = {
  groveGuardians: GroveGuardians,
  spellUsable: SpellUsable,
};

/**
 * **Cenarius Guidance (Tree of Life)**
 * Spec Talent Tier 9
 *
 * During Incarnation: Tree of Life, you summon a Grove Guardian every 10 sec.
 * The cooldown of Incarnation: Tree of Life is reduced by 5.0 sec when Grove Guardians fade.
 */
export default class CenariusGuidanceTol extends Analyzer.withDependencies(deps) {
  /** CDR applied to the current ToL cooling down */
  cdrOnCurrCast: number = 0;
  /** CDR applied to prior ToL cooldowns */
  cdrPerCast: number[] = [];

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_DRUID.CENARIUS_GUIDANCE_TALENT) &&
      this.selectedCombatant.hasTalent(TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT);

    // TODO this is a placeholder until we can trigger on the correct thing, which is GG death
    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(TALENTS_DRUID.GROVE_GUARDIANS_TALENT),
      this.onGGSummon,
    );
    this.addEventListener(
      new EventFilter(EventType.UpdateSpellUsable)
        .by(SELECTED_PLAYER)
        .spell(TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT),
      this.onTolCdUpdate,
    );
  }

  onGGSummon(event: SummonEvent) {
    this.cdrOnCurrCast += this.deps.spellUsable.reduceCooldown(
      TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT.id,
      TOL_CDR_MS,
    );
  }

  onTolCdUpdate(event: UpdateSpellUsableEvent) {
    if (
      event.updateType === UpdateSpellUsableType.EndCooldown &&
      this.owner.currentTimestamp < this.owner.fight.end_time
    ) {
      this.cdrPerCast.push(this.cdrOnCurrCast);
      this.cdrOnCurrCast = 0;
    }
  }

  get tolCdrPerCast() {
    return this.cdrPerCast.length === 0
      ? undefined
      : this.cdrPerCast.reduce((p, c) => p + c, 0) / this.cdrPerCast.length;
  }

  statistic() {
    const avgCdr = this.tolCdrPerCast;
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(9)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <p>
              This is the healing from Grove Guardians summoned due to this talent's effect. The
              heal number does not include the additional benefits of the cooldown reduction effect.
            </p>
            <p>
              CDR per cast expresses the average amount you reduced ToL's cooldown.{' '}
              <strong>It only counts cooldowns that finished during the selected encounter.</strong>
              {avgCdr === undefined && (
                <strong>
                  {' '}
                  This shows 'N/A' because no ToL cooldowns finished during the encounter.
                </strong>
              )}
            </p>
            <p>
              <strong>
                CDR is listed as approximate because due to difficulties tracking Grove Guardian
                death events, we have to guess precisely when the CDR occurs.
              </strong>
            </p>
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS_DRUID.CENARIUS_GUIDANCE_TALENT}>
          <SpellIcon spell={TALENTS_DRUID.GROVE_GUARDIANS_TALENT} />{' '}
          <ItemPercentHealingDone amount={this.deps.groveGuardians.cgHealing} />
          <br />
          <>
            <SpellIcon spell={TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT} />{' '}
            {avgCdr === undefined ? 'N/A' : `≈${(avgCdr / 1000).toFixed(1)}s`}{' '}
            <small>CDR per cast</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
