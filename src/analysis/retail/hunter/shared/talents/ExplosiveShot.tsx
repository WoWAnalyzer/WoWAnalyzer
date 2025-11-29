import type { JSX } from 'react';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import AverageTargetsHit from 'parser/ui/AverageTargetsHit';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellLink from 'interface/SpellLink';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Enemies from 'parser/shared/modules/Enemies';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { GetRelatedEvents } from 'parser/core/Events';
import { EXS_CAST_TO_DAMAGE } from '../normalizers/HunterEventLinkNormalizers';
// Guide Imports
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { BadColor, GoodColor } from 'interface/guide';
/**
 * Cost: 20 focus, 40 yd range. 30 Second cooldown.
 * Fires an explosive shot at your target. After 3 sec, the shot will explode, dealing (291% of Attack power) Fire damage to all enemies within 8 yds. Deals reduced damage beyond 5 targets.
 *
 * Existing Explosive Shot explodes on the target if a new application occurs.
 *
 * Example log:
 * https://www.warcraftlogs.com/reports/Rn9XxCYLm1q7KFNW#fight=3&type=damage-done&source=15&ability=212680
 */

class ExplosiveShot extends Analyzer {
  hits = 0;
  damage = 0;
  casts = 0;
  //SV tip tracking
  tippedCast = 0;
  useEntries: BoxRowEntry[] = [];
  static dependencies = {
    enemies: Enemies,
    spellUsable: SpellUsable,
  };
  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EXPLOSIVE_SHOT_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.EXPLOSIVE_SHOT_TALENT),
      this.onSVCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.EXPLOSIVE_SHOT_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.EXPLOSIVE_SHOT_DAMAGE),
      this.onDamage,
    );
  }
  //MM and BM
  onCast() {
    this.casts += 1;
  }
  onSVCast(event: CastEvent) {
    let value: QualitativePerformance = QualitativePerformance.Good;
    let perfExplanation: React.ReactNode = undefined;
    const targetName = this.owner.getTargetName(event);
    this.casts += 1;
    const focus = event.classResources?.find((x) => x.type === RESOURCE_TYPES.FOCUS.id);
    const focusAmount = focus?.amount ?? null;
    const targetsHit = GetRelatedEvents(event, EXS_CAST_TO_DAMAGE) as DamageEvent[];
    const multiHit = targetsHit.length > 1;
    const lowFocusCast = focusAmount && focusAmount < 30;
    const totalDamage = targetsHit.reduce(
      (accumulator, currentHit) => accumulator + currentHit.amount,
      0,
    );

    if (this.selectedCombatant.hasTalent(TALENTS.SENTINEL_TALENT)) {
      // Sentinel has no real good/bad casts in ST except if other abilities were available which is APL territory.
      // TODO: Set conditions for use in AoE now that targetsHit works.
      if (this.selectedCombatant.hasOwnBuff(SPELLS.TIP_OF_THE_SPEAR_CAST.id)) {
        this.tippedCast += 1;
        value = QualitativePerformance.Good;
        perfExplanation = (
          <div>
            <h5 style={{ color: GoodColor }}>Good Tipped Cast</h5>
            <p>
              Hit {targetsHit.length} target(s).
              <br />
              Dealt {totalDamage.toLocaleString()} damage.
            </p>
          </div>
        );
      } else {
        value = QualitativePerformance.Good;
        perfExplanation = (
          <div>
            <h5 style={{ color: GoodColor }}>Good Cast</h5>
            <p>
              Hit {targetsHit.length} target(s).
              <br />
              Dealt {totalDamage.toLocaleString()} damage.
            </p>
          </div>
        );
      }

      //End Sentinel
    } else {
      //Pack Leader
      if (
        (lowFocusCast &&
          !this.spellUsable.isAvailable(TALENTS.WILDFIRE_BOMB_TALENT.id) &&
          !this.spellUsable.isAvailable(TALENTS.KILL_COMMAND_SURVIVAL_TALENT.id)) ||
        multiHit
      ) {
        value = QualitativePerformance.Good;
        perfExplanation = (
          <div>
            <h5 style={{ color: GoodColor }}>Good Cast</h5>
            <p>
              {multiHit ? (
                <>
                  Hit {targetsHit.length} target{targetsHit.length > 1 ? 's' : ''}.
                </>
              ) : (
                <>You casted at {focusAmount} focus (&lt; 30).</>
              )}
              <br />
              Dealt {totalDamage.toLocaleString()} damage.
            </p>
          </div>
        );
      } else {
        value = QualitativePerformance.Fail;
        perfExplanation = (
          <div>
            <h5 style={{ color: BadColor }}>Bad Cast</h5>
            <p>
              <br />
              Hit {targetsHit.length} target(s).
              <br />
              Dealt {totalDamage.toLocaleString()} damage.
              <br />
              You casted at {focusAmount} focus. This is a good cast if not in melee.
            </p>
          </div>
        );
      }
      //End PL
    }
    const tooltip = (
      <>
        {perfExplanation}@ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong> targetting{' '}
        <strong>{targetName || 'unknown'}</strong>
        <br />
      </>
    );
    this.useEntries.push({
      value,
      tooltip,
    });
  }

  onDamage(event: DamageEvent) {
    this.hits += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.EXPLOSIVE_SHOT_TALENT}>
          <>
            <ItemDamageDone amount={this.damage} />
            <br />
            <AverageTargetsHit casts={this.casts} hits={this.hits} unique />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
  get guideSubsectionSVPL(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS.EXPLOSIVE_SHOT_TALENT} />
        </strong>{' '}
        should be only cast for lack of anything better to cast or during cleave.
      </p>
    );

    const data = (
      <div>
        <CastSummaryAndBreakdown
          spell={TALENTS.EXPLOSIVE_SHOT_TALENT}
          castEntries={this.useEntries}
          badExtraExplanation={<>or an expired proc</>}
          usesInsteadOfCasts
        />
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

export default ExplosiveShot;
