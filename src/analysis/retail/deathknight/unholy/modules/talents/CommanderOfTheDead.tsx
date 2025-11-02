import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, SummonEvent } from 'parser/core/Events';
import { encodeEventTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatPercentage } from 'common/format';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Spell from 'common/SPELLS/Spell';

class CommanderOfTheDead extends Analyzer {
  private commanderBuffs = 0;
  private petSummons = 0;
  private petSummonIDs: number[] = [
    SPELLS.MAGUS_SUMMON.id,
    SPELLS.APOC_SUMMON.id,
    SPELLS.ARMY_SUMMON.id,
    TALENTS.SUMMON_GARGOYLE_TALENT.id,
    SPELLS.DARK_ARBITER_TALENT_GLYPH.id,
  ];
  private buffedPets: string[] = [];
  private summonedPets: string[] = [];

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

  statistic() {
    return (
      <Statistic
        tooltip={`You buffed ${this.commanderBuffs} out of ${this.petSummons} pets buffed with Commander of the Dead`}
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={SPELLS.COMMANDER_OF_THE_DEAD_BUFF.id}>
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
