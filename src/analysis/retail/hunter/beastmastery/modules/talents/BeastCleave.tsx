import { Trans } from '@lingui/macro';
import { MS_BUFFER_100 } from 'analysis/retail/hunter/shared';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  DamageEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

/**
 * After you Multi-Shot, your pet's melee attacks also strike all other nearby enemy targets for 100% as much for the next 4 sec.
 * Example log:
 * https://www.warcraftlogs.com/reports/MnzYCvDHdLGZJkAg#fight=7&type=damage-done&source=24&ability=118459
 *
 * This module also tracks the amount of multi-shot casts that did not trigger any beast cleave damage
 * Example log:
 * https://www.warcraftlogs.com/reports/bf3r17Yh86VvDLdF#fight=8&type=damage-done&source=1
 */
class BeastCleave extends Analyzer {
  damage = 0;
  cleaveUp = false;
  beastCleaveHits = 0;
  casts = 0;
  castsWithoutHits = 0;
  timestamp = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BEAST_CLEAVE_TALENT);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER_PET).spell(SPELLS.BEAST_CLEAVE_PET_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER_PET).spell(SPELLS.BEAST_CLEAVE_PET_BUFF),
      this.onRemoveBuff,
    );
    this.addEventListener(
      Events.refreshbuff.to(SELECTED_PLAYER_PET).spell(SPELLS.BEAST_CLEAVE_PET_BUFF),
      this.onRefreshBuff,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.BEAST_CLEAVE_DAMAGE),
      this.onBeastCleaveDamage,
    );
  }

  get beastCleavesWithoutHits() {
    return {
      actual: this.castsWithoutHits,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  get uptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.BEAST_CLEAVE_BUFF.id) / this.owner.fightDuration
    );
  }

  onApplyBuff(event: ApplyBuffEvent) {
    if (this.timestamp + MS_BUFFER_100 > event.timestamp) {
      return;
    }
    this.casts += 1;
    this.cleaveUp = true;
    this.beastCleaveHits = 0;
    this.timestamp = event.timestamp;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    if (this.timestamp + MS_BUFFER_100 > event.timestamp) {
      return;
    }
    this.checkAmountOfHits();
    this.cleaveUp = false;
    this.timestamp = event.timestamp;
  }

  onRefreshBuff(event: RefreshBuffEvent) {
    if (this.timestamp + MS_BUFFER_100 > event.timestamp) {
      return;
    }
    this.casts += 1;
    this.checkAmountOfHits();
    this.beastCleaveHits = 0;
    this.timestamp = event.timestamp;
  }

  onBeastCleaveDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
    this.beastCleaveHits += 1;
  }

  checkAmountOfHits() {
    if (this.beastCleaveHits === 0) {
      this.castsWithoutHits += 1;
    }
  }

  suggestions(when: When) {
    if (this.casts > 0) {
      when(this.beastCleavesWithoutHits).addSuggestion((suggest, actual, recommended) =>
        suggest(
          <>
            You cast <SpellLink id={TALENTS.MULTI_SHOT_BEAST_MASTERY_TALENT} /> {actual}{' '}
            {actual === 1 ? 'time' : 'times'} without your pets doing any{' '}
            <SpellLink id={SPELLS.BEAST_CLEAVE_PET_BUFF.id} /> damage onto additional targets. On
            single-target situations, avoid using{' '}
            <SpellLink id={TALENTS.MULTI_SHOT_BEAST_MASTERY_TALENT.id} />.
          </>,
        )
          .icon(TALENTS.MULTI_SHOT_BEAST_MASTERY_TALENT.icon)
          .actual(
            <Trans id="hunter.beastmastery.suggestions.beastCleave.efficiency">
              {actual} {actual === 1 ? 'cast' : 'casts'} without any Beast Cleave damage{' '}
            </Trans>,
          )
          .recommended(
            <Trans id="hunter.beastmastery.suggestions.beastCleave.recommended">
              {recommended} is recommended{' '}
            </Trans>,
          ),
      );
    }
  }

  statistic() {
    if (this.damage > 0) {
      return (
        <Statistic position={STATISTIC_ORDER.OPTIONAL(13)} size="flexible">
          <BoringSpellValueText spellId={SPELLS.BEAST_CLEAVE_BUFF.id}>
            <>
              <ItemDamageDone amount={this.damage} />
              <br />
              <UptimeIcon /> {formatPercentage(this.uptime)}% <small>uptime</small>
            </>
          </BoringSpellValueText>
        </Statistic>
      );
    }
    return null;
  }
}

export default BeastCleave;
