import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/hunter';
import SPECS from 'game/SPECS';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { KILL_SHOT_EXECUTE_RANGE } from '../constants';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
// Guide Imports
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { BadColor, GoodColor, OkColor } from 'interface/guide';
import SpellLink from 'interface/SpellLink';
class KillShot extends ExecuteHelper {
  static executeSources = SELECTED_PLAYER;
  static lowerThreshold = KILL_SHOT_EXECUTE_RANGE;
  static singleExecuteEnablers: Spell[] = [TALENTS.HUNTERS_PREY_TALENT, SPELLS.DEATHBLOW_BUFF];
  static modifiesDamage = false;
  useEntries: BoxRowEntry[] = [];
  static dependencies = {
    ...ExecuteHelper.dependencies,
    abilities: Abilities,
  };

  maxCasts = 0;

  activeKillShotSpell =
    this.selectedCombatant.spec === SPECS.SURVIVAL_HUNTER
      ? TALENTS.KILL_SHOT_SURVIVAL_TALENT
      : TALENTS.KILL_SHOT_SHARED_TALENT;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = !this.selectedCombatant.hasTalent(TALENTS.BLACK_ARROW_TALENT);
    this.selectedCombatant.hasTalent(TALENTS.KILL_SHOT_SHARED_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.KILL_SHOT_SURVIVAL_TALENT);
    const ctor = this.constructor as typeof ExecuteHelper;
    ctor.executeSpells.push(this.activeKillShotSpell);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.KILL_SHOT_SURVIVAL_TALENT),
      this.onSVCast,
    );

    (options.abilities as Abilities).add({
      spell: this.activeKillShotSpell.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      charges: 1,
      cooldown: 10,
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.85,
        maxCasts: () => this.totalCasts,
      },
    });
  }

  onSVCast(event: CastEvent) {
    let value: QualitativePerformance = QualitativePerformance.Good;
    let perfExplanation: React.ReactNode = undefined;
    const targetName = this.owner.getTargetName(event);
    this.casts += 1;
    const focus = event.classResources?.find((x) => x.type === RESOURCE_TYPES.FOCUS.id);
    const focusAmount = focus?.amount ?? null;

    if (this.selectedCombatant.hasTalent(TALENTS.SENTINEL_TALENT)) {
      if (
        this.selectedCombatant.hasOwnBuff(SPELLS.MONGOOSE_FURY.id) &&
        focusAmount &&
        focusAmount > 30
      ) {
        value = QualitativePerformance.Fail;
        perfExplanation = (
          <div>
            <h5 style={{ color: BadColor }}>Good Tipped Cast</h5>
            <p>Don't cast Kill Shot during Mongoose Fury Unless Out of Focus!</p>
          </div>
        );
      } else if (!this.selectedCombatant.hasOwnBuff(SPELLS.MONGOOSE_FURY.id)) {
        value = QualitativePerformance.Good;
        perfExplanation = (
          <div>
            <h5 style={{ color: GoodColor }}>Good Cast</h5>
            <p>Cast Killshot outside of Mongoose Fury before starting another window.</p>
          </div>
        );
      } else {
        value = QualitativePerformance.Ok;
        perfExplanation = (
          <div>
            <h5 style={{ color: OkColor }}>Good Cast</h5>
            <p>
              Cast Killshot Inside Fury but at low focus. Try to avoid this situation with focus
              management.
            </p>
          </div>
        );
      }

      //End Sentinel
    } else {
      //Pack Leader
      if (focusAmount && focusAmount < 30) {
        value = QualitativePerformance.Good;
        perfExplanation = (
          <div>
            <h5 style={{ color: GoodColor }}>Good Cast</h5>
            <p>Cast at {focusAmount} focus. Low focus cast or out of melee.</p>
          </div>
        );
      } else {
        value = QualitativePerformance.Fail;
        perfExplanation = (
          <h5 style={{ color: BadColor }}>
            Cast in single target above 30 focus.
            <br />
          </h5>
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

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={this.activeKillShotSpell}>
          <ItemDamageDone amount={this.damage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
  get guideSubsectionSV(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={TALENTS.KILL_SHOT_SURVIVAL_TALENT} />
        </strong>{' '}
        should be only cast for lack of anything better to cast.
      </p>
    );
    const data = (
      <div>
        <CastSummaryAndBreakdown
          spell={TALENTS.KILL_SHOT_SURVIVAL_TALENT}
          castEntries={this.useEntries}
          badExtraExplanation={<>or an expired proc</>}
          usesInsteadOfCasts
        />
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

export default KillShot;
