import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/warrior';
import SPELLS from 'common/SPELLS/warrior';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, {
  CastEvent,
  DamageEvent,
  GetRelatedEvent,
  RefreshBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import { DEMOLISH_DAMAGE_CAST } from '../../normalizers/DemolishNormalizer';
import SpellLink from 'interface/SpellLink';
import { defineMessage } from '@lingui/macro';
import { DEFAULT_EXECUTE_THRESHOLD, MASSACRE_EXECUTE_THRESHOLD } from '../core/AplCheck';

const COLOSSAL_MIGHT_MAX_STACKS = 10;
const COLOSSAL_MIGHT_CD_REDUCTION = 2000; // ms

class Demolish extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  badDemolishes: number = 0;
  executeThreshold: number = 0;
  inExecuteRange: boolean = false;
  colossusSmashDebuffActive: boolean = false;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DEMOLISH_TALENT);
    this.executeThreshold = this.selectedCombatant.hasTalent(TALENTS.MASSACRE_SPEC_TALENT)
      ? MASSACRE_EXECUTE_THRESHOLD
      : DEFAULT_EXECUTE_THRESHOLD;

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.COLOSSAL_MIGHT),
      this.colossalMightRefresh,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DEMOLISH_DAMAGE),
      this.onDemolishCast,
    );

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.COLOSSUS_SMASH_DEBUFF),
      this.colossusSmashApplied,
    );

    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.COLOSSUS_SMASH_DEBUFF),
      this.colossusSmashRemoved,
    );
  }

  // buff listener -> reduce demolish cd
  colossalMightRefresh(event: RefreshBuffEvent) {
    const stacks = this.selectedCombatant.getBuffStacks(SPELLS.COLOSSAL_MIGHT);

    // when colossal might is refreshed at max stacks, reduce demolish cd by 2 seconds
    if (stacks === COLOSSAL_MIGHT_MAX_STACKS) {
      this.spellUsable.reduceCooldown(SPELLS.DEMOLISH.id, COLOSSAL_MIGHT_CD_REDUCTION);
    }
  }

  colossusSmashApplied() {
    this.colossusSmashDebuffActive = true;
  }

  colossusSmashRemoved() {
    this.colossusSmashDebuffActive = false;
  }

  // in execute -> wait for CS first
  onDemolishCast(event: DamageEvent) {
    if (event.hitPoints && event.maxHitPoints) {
      if (event.hitPoints / event.maxHitPoints < this.executeThreshold) {
        this.inExecuteRange = true;
      }
    }

    const demolishCastEvent: CastEvent | undefined = GetRelatedEvent(event, DEMOLISH_DAMAGE_CAST);

    if (this.inExecuteRange && !this.colossusSmashDebuffActive) {
      this.badDemolishes += 1;
      if (demolishCastEvent) {
        addInefficientCastReason(
          demolishCastEvent,
          'Demolish was used within execute range without the Colossus Smash debuff',
        );
      }
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.badDemolishes,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          There were {actual} times you used <SpellLink spell={SPELLS.DEMOLISH} /> in execute range
          without the <SpellLink spell={SPELLS.COLOSSUS_SMASH} /> debuff active.
        </>,
      )
        .icon(SPELLS.DEMOLISH.icon)
        .actual(
          defineMessage({
            id: 'warrior.arms.suggestions.demolish.colossussmash',
            message: `${actual} Demolishes used in execute range without the Colossus Smash debuff`,
          }),
        )
        .recommended(`${recommended} is recommended.`),
    );
  }
}

export default Demolish;
