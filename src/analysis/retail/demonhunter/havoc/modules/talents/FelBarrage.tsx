import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS/demonhunter';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

/**
 * Example Report: https://www.warcraftlogs.com/reports/Mz8cTFgNkxXaJt3j/#fight=4&source=18
 */

class FelBarrage extends Analyzer {
  damage = 0;
  casts = 0;
  badCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.FEL_BARRAGE_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEL_BARRAGE_DAMAGE),
      this.felBarrage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_DEMON_HUNTER.FEL_BARRAGE_TALENT),
      this.felBarrageCasts,
    );
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

  felBarrage(event: DamageEvent) {
    this.damage += event.amount;
  }

  felBarrageCasts(event: CastEvent) {
    this.casts += 1;

    const hasMetaBuff = this.selectedCombatant.hasBuff(
      SPELLS.METAMORPHOSIS_HAVOC_BUFF.id,
      event.timestamp,
    );

    if (!hasMetaBuff) {
      this.badCasts += 1;
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual) =>
      suggest(
        <>
          Try to cast <SpellLink spell={TALENTS_DEMON_HUNTER.FEL_BARRAGE_TALENT} /> during{' '}
          <SpellLink spell={SPELLS.METAMORPHOSIS_HAVOC} />.
        </>,
      )
        .icon(TALENTS_DEMON_HUNTER.FEL_BARRAGE_TALENT.icon)
        .actual(
          <>
            {actual} bad <SpellLink spell={TALENTS_DEMON_HUNTER.FEL_BARRAGE_TALENT} /> casts without{' '}
            <SpellLink spell={SPELLS.METAMORPHOSIS_HAVOC} />.
          </>,
        )
        .recommended(`No bad casts is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(6)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            A bad cast is casting Fel Barage without Metamorphosis up.
            <br />
            <br />
            {formatThousands(this.damage)} total damage
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.FEL_BARRAGE_TALENT}>
          {this.badCasts}{' '}
          <small>
            casts without <SpellLink spell={SPELLS.METAMORPHOSIS_HAVOC} />{' '}
          </small>{' '}
          <br />
          {this.owner.formatItemDamageDone(this.damage)}
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default FelBarrage;
