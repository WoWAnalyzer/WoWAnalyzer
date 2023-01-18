import { t } from '@lingui/macro';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, SummonEvent } from 'parser/core/Events';
import { When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatPercentage } from 'common/format';

class CommanderOfTheDead extends Analyzer {
  commanderBuffs = 0;
  petSummons = 0;
  petSummonNames = ['Army of the Dead', 'Dark Arbiter', 'Summon Gargoyle', 'Army of the Damned'];
  buffedPets: string[] = [];

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
    let summonId = '';
    if (event.targetInstance) {
      summonId = event.targetID.toString() + '|' + event.targetInstance.toString(); // This is needed since the buff sometimes applies twice to the same summon
    } else {
      summonId = event.targetID.toString();
    }
    if (!this.buffedPets.includes(summonId)) {
      this.commanderBuffs += 1;
      this.buffedPets.push(summonId);
    }
  }

  onSummonEvent(event: SummonEvent) {
    console.log(event);
    if (this.petSummonNames.includes(event.ability.name)) {
      this.petSummons += 1;
    }
  }

  suggestions(when: When) {
    const averageSummonBuffed = Number(this.commanderBuffs / this.petSummons);
    // Buffing your pets with Commander of the Dead is vital to do optial DPS
    when(averageSummonBuffed)
      .isLessThan(1)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <span>
            You are not properly buffing your pets with{' '}
            <SpellLink id={SPELLS.COMMANDER_OF_THE_DEAD_BUFF.id} />. Make sure to use{' '}
            <SpellLink id={SPELLS.DARK_TRANSFORMATION.id} /> after casting{' '}
            <SpellLink id={SPELLS.APOCALYPSE.id} />,{' '}
            <SpellLink id={TALENTS.SUMMON_GARGOYLE_TALENT.id} /> and{' '}
            <SpellLink id={SPELLS.ARMY_OF_THE_DEAD.id} />.
          </span>,
        )
          .icon(SPELLS.APOCALYPSE.icon)
          .actual(
            t({
              id: 'deathknight.unholy.suggestions.commanderofthedead.efficiency',
              message: `An average ${(averageSummonBuffed * 100).toFixed(
                2,
              )}% of summons were buffed with Commander of the Dead`,
            }),
          )
          .recommended(`${recommended * 100}% is recommended`)
          .regular(recommended - 0.05)
          .major(recommended - 0.1),
      );
  }

  statistic() {
    const averageSummonBuffed = Number(this.commanderBuffs / this.petSummons);
    return (
      <Statistic
        tooltip={`You buffed ${this.commanderBuffs} out of ${this.petSummons} pets buffed with Commander of the Dead`}
        position={STATISTIC_ORDER.CORE(1)}
        size="flexible"
      >
        <BoringSpellValueText spellId={SPELLS.COMMANDER_OF_THE_DEAD_BUFF.id}>
          <>
            {formatPercentage(averageSummonBuffed)}%{' '}
            <small>of pets buffed with Commander of the Dead</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CommanderOfTheDead;
