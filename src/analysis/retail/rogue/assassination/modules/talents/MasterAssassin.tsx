import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { SuggestionFactory, ThresholdStyle, When } from 'parser/core/ParseResults';
import StatTracker from 'parser/shared/modules/StatTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import { ABILITIES_AFFECTED_BY_DAMAGE_INCREASES } from '../../constants';
import StealthCasts from './StealthCasts';

const CRIT_BONUS = 0.5;

const CASTS_POSSIBLE = 3;
const GOOD_MASTER_ASSASSIN_ABILITIES = [
  SPELLS.MUTILATE.id,
  SPELLS.ENVENOM.id,
  SPELLS.FAN_OF_KNIVES.id,
];
const GOOD_OPENER_CASTS = [...GOOD_MASTER_ASSASSIN_ABILITIES, SPELLS.GARROTE.id, SPELLS.RUPTURE.id];

class MasterAssassin extends StealthCasts {
  static dependencies = {
    ...StealthCasts.dependencies,
    statTracker: StatTracker,
  };

  protected statTracker!: StatTracker;

  bonusDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MASTER_ASSASSIN_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(ABILITIES_AFFECTED_BY_DAMAGE_INCREASES),
      this.addBonusDamageIfBuffed,
    );
  }

  addBonusDamageIfBuffed(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.MASTER_ASSASSIN_BUFF.id)) {
      return;
    }
    const critChance = this.statTracker.currentCritPercentage;
    const critBonusFromMasterAssassin = Math.min(CRIT_BONUS, 1 - critChance);
    const damageBonus =
      critBonusFromMasterAssassin / (1 + critBonusFromMasterAssassin + critChance);
    this.bonusDamage += calculateEffectiveDamage(event, damageBonus);
  }

  get goodStealthCasts() {
    let goodCasts = 0;
    this.stealthSequences.forEach((sequence: CastEvent[]) => {
      const goodSpells =
        sequence === this.stealthSequences[0] ||
        (this.usedStealthOnPull && sequence === this.stealthSequences[1])
          ? GOOD_OPENER_CASTS
          : GOOD_MASTER_ASSASSIN_ABILITIES;
      let goodCastsSeq = 0;
      sequence.forEach((e: CastEvent) => {
        if (goodSpells.includes(e.ability.guid)) {
          goodCastsSeq += 1;
        }
      });
      goodCasts += Math.min(goodCastsSeq, CASTS_POSSIBLE);
    });
    return goodCasts;
  }

  get stealthCasts() {
    return this.stealthSequences.length;
  }

  get percentGoodCasts() {
    return this.goodStealthCasts / (this.stealthCasts * CASTS_POSSIBLE) || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentGoodCasts,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion(
      (suggest: SuggestionFactory, actual: number | boolean, recommended: number | boolean) =>
        suggest(
          <>
            You failed to take full advantage of <SpellLink id={SPELLS.MASTER_ASSASSIN_TALENT.id} />
            . Make sure to prioritize spending the buff on <SpellLink
              id={SPELLS.MUTILATE.id}
            /> or <SpellLink id={SPELLS.ENVENOM.id} /> (<SpellLink id={SPELLS.FAN_OF_KNIVES.id} />{' '}
            is acceptable for AOE). During your opener <SpellLink id={SPELLS.GARROTE.id} />,{' '}
            <SpellLink id={SPELLS.RUPTURE.id} /> is also okay.
          </>,
        )
          .icon(SPELLS.MASTER_ASSASSIN_TALENT.icon)
          .actual(
            t({
              id: 'rogue.assassination.suggestions.masterAssassin.efficiency',
              message: `${formatPercentage(actual as number)}% good casts during Master Assassin`,
            }),
          )
          .recommended(`>${formatPercentage(recommended as number)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <BoringSpellValueText spellId={SPELLS.MASTER_ASSASSIN_TALENT.id}>
          <ItemDamageDone amount={this.bonusDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MasterAssassin;
