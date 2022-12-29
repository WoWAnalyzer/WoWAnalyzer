import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { getBuffedCasts } from '../../normalizers/EssenceBreakNormalizer';
import { SpellLink } from 'interface';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import TalentSpellText from 'parser/ui/TalentSpellText';

/*
  example report: https://www.warcraftlogs.com/reports/LvmF6W4C3TgcZxj8/#fight=last
 */

const DAMAGE_SPELLS = [
  SPELLS.CHAOS_STRIKE_MH_DAMAGE,
  SPELLS.CHAOS_STRIKE_OH_DAMAGE,
  SPELLS.ANNIHILATION_MH_DAMAGE,
  SPELLS.ANNIHILATION_OH_DAMAGE,
  SPELLS.BLADE_DANCE_DAMAGE,
  SPELLS.BLADE_DANCE_DAMAGE_LAST_HIT,
  SPELLS.DEATH_SWEEP_DAMAGE,
  SPELLS.DEATH_SWEEP_DAMAGE_LAST_HIT,
];
const DAMAGE_INCREASE = 0.4;

class EssenceBreak extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  badCasts = 0;
  extraDamage = 0;
  protected enemies!: Enemies;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(DAMAGE_SPELLS), this.damage);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT),
      this.cast,
    );
  }

  cast(event: CastEvent) {
    const buffedCasts = getBuffedCasts(event);
    if (buffedCasts.length < 2) {
      this.badCasts += 1;
    }
  }

  damage(event: DamageEvent) {
    const target = this.enemies.getEntity(event);
    if (!target) {
      return;
    }
    const hasEssenceBreakDebuff = target.hasBuff(SPELLS.ESSENCE_BREAK_DAMAGE.id, event.timestamp);

    if (hasEssenceBreakDebuff) {
      this.extraDamage += calculateEffectiveDamage(event, DAMAGE_INCREASE);
    }
  }

  get suggestionThresholds() {
    return {
      actual: this.badCasts,
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
          Try to fit at least 2 casts of <SpellLink id={SPELLS.CHAOS_STRIKE.id} /> /{' '}
          <SpellLink id={SPELLS.ANNIHILATION.id} />
          /
          <SpellLink id={SPELLS.BLADE_DANCE.id} /> / <SpellLink id={SPELLS.DEATH_SWEEP.id} /> during
          your <SpellLink id={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT.id} /> window.
        </>,
      )
        .icon(TALENTS_DEMON_HUNTER.BLIND_FURY_TALENT.icon)
        .actual(
          <>
            {actual} bad <SpellLink id={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT.id} /> casts.
          </>,
        )
        .recommended('No bad casts is recommended.'),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(6)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={`${formatThousands(this.extraDamage)} total damage`}
      >
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.ESSENCE_BREAK_TALENT}>
          <ItemDamageDone amount={this.extraDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default EssenceBreak;
