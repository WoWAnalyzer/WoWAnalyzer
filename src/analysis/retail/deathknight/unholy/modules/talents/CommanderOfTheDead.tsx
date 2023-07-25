import { defineMessage } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, SummonEvent } from 'parser/core/Events';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import { When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatPercentage } from 'common/format';

class CommanderOfTheDead extends Analyzer {
  commanderBuffs = 0;
  petSummons = 0;
  petSummonIDs = [
    SPELLS.MAGUS_SUMMON.id,
    SPELLS.APOC_SUMMON.id,
    SPELLS.ARMY_SUMMON.id,
    TALENTS.SUMMON_GARGOYLE_TALENT.id,
    SPELLS.DARK_ARBITER_TALENT_GLYPH.id,
  ];
  buffedPets: string[] = [];
  summonedPets: string[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.COMMANDER_OF_THE_DEAD_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.COMMANDER_OF_THE_DEAD_BUFF),
      this.onBuffEvent,
    );

    this.addEventListener(Events.summon.by(SELECTED_PLAYER), this.onSummonEvent);
  }

  onBuffEvent(event: ApplyBuffEvent) {
    const summonId = encodeEventTargetString(event) || ''; // This is needed since the buff sometimes applies twice to the same summon.
    if (!this.summonedPets.includes(summonId)) {
      // This is the rare case of a pet being summoned without a summon event (potentially pre-combat).
      this.summonedPets.push(summonId);
      this.petSummons += 1;
    }
    if (!this.buffedPets.includes(summonId)) {
      // Account for the case of double-buffing the same mob.
      this.commanderBuffs += 1;
      this.buffedPets.push(summonId);
    }
  }

  onSummonEvent(event: SummonEvent) {
    if (this.petSummonIDs.includes(event.ability.guid)) {
      // We keep track of what has been summoned in case of a buff event on a minion that doesn't have a proper summon event.
      const summonId = encodeEventTargetString(event) || '';
      this.summonedPets.push(summonId);
      this.petSummons += 1;
    }
  }

  get averageSummonBuffed() {
    return Number(this.commanderBuffs / this.petSummons);
  }

  suggestions(when: When) {
    // Buffing your pets with Commander of the Dead is vital to do optial DPS
    when(this.averageSummonBuffed)
      .isLessThan(1)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            You are not properly buffing your pets with{' '}
            <SpellLink spell={SPELLS.COMMANDER_OF_THE_DEAD_BUFF} />. Make sure to use{' '}
            <SpellLink spell={SPELLS.DARK_TRANSFORMATION} /> when you use{' '}
            <SpellLink spell={SPELLS.ARMY_OF_THE_DEAD} />,{' '}
            <SpellLink spell={TALENTS.SUMMON_GARGOYLE_TALENT} /> and{' '}
            <SpellLink spell={SPELLS.APOCALYPSE} />.
          </span>,
        )
          .icon(SPELLS.APOCALYPSE.icon)
          .actual(
            defineMessage({
              id: 'deathknight.unholy.suggestions.commanderofthedead.efficiency',
              message: `An average ${formatPercentage(
                this.averageSummonBuffed,
              )}% of summons were buffed with Commander of the Dead`,
            }),
          )
          .recommended(`${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05)
          .major(recommended - 0.1),
      );
  }

  statistic() {
    return (
      <Statistic
        tooltip={`You buffed ${this.commanderBuffs} out of ${this.petSummons} pets buffed with Commander of the Dead`}
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
      >
        <BoringSpellValueText spellId={SPELLS.COMMANDER_OF_THE_DEAD_BUFF.id}>
          <>
            {formatPercentage(this.averageSummonBuffed)}%{' '}
            <small>of pets buffed with Commander of the Dead</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CommanderOfTheDead;
