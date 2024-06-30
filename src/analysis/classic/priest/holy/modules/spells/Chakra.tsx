import Spell from 'common/SPELLS/Spell';
import SPELLS from 'common/SPELLS/classic';
import { formatDuration } from 'common/format';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent } from 'parser/core/Events';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import Abilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ExecuteHelper from 'parser/shared/modules/helpers/ExecuteHelper';
import BoringValue from 'parser/ui/BoringValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';

const TOME_OF_LIGHT_CDR = 0.7;

export default class Chakra extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  private buffCounts: Record<number, number> = {};
  private cohCdr = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.spell([
        SPELLS.CHAKRA_SERENITY_BUFF,
        SPELLS.CHAKRA_SANCTUARY_BUFF,
        SPELLS.CHAKRA_CHASTISE_BUFF,
      ]),
      this.onChakraBuff,
    );

    this.addEventListener(Events.cast.spell(SPELLS.CIRCLE_OF_HEALING), this.maybeReduceCoHCooldown);
  }

  private onChakraBuff(event: ApplyBuffEvent) {
    const abilityId = event.ability.guid;
    if (!this.buffCounts[abilityId]) {
      this.buffCounts[abilityId] = 1;
    } else {
      this.buffCounts[abilityId] += 1;
    }
  }

  /**
   * If we see a CoH cast during Chakra: Sanctuary, reduce its cooldown.
   *
   * This is *maybe* incorrect if you change Chakras while this is on cooldown, but that is an extremely narrow edge case.
   */
  private maybeReduceCoHCooldown(_event: CastEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.CHAKRA_SANCTUARY_BUFF.id)) {
      this.cohCdr += this.deps.spellUsable.reduceCooldown(SPELLS.CIRCLE_OF_HEALING.id, 2000);
    }
  }

  statistic() {
    // subtract 1 because we start in a Chakra
    const chakraChanges = Object.values(this.buffCounts).reduce((a, b) => a + b, 0) - 1;
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        dropdown={
          <table className="table table-condensed">
            <thead>
              <tr>
                <th>Chakra</th>
                <th>Uptime</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(this.buffCounts).map((id) => {
                const spell = SPELLS[Number(id)];
                return (
                  <tr key={id}>
                    <td>
                      <SpellLink spell={spell} />
                    </td>
                    <td>{formatDuration(this.selectedCombatant.getBuffUptime(spell.id))}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        }
      >
        <BoringValue
          label={
            <>
              <SpellLink spell={SPELLS.CHAKRA} /> Usage
            </>
          }
        >
          {chakraChanges} <SpellLink spell={SPELLS.CHAKRA} /> change{chakraChanges === 1 ? '' : 's'}
        </BoringValue>
      </Statistic>
    );
  }
}

/**
 * Generate an analyzer that adjusts the max casts of a Holy Word based on the uptime of its Chakra.
 *
 * This has some weirdness because (for example) your max casts of Sanctuary is *technically* if you sat in Chakra: Sanctuary 100% of the time. However, if you do that then you have 0/0 max casts of Serenity and Chastise.
 */
function makeHolyWord(
  buff: Spell,
  holyWord: Spell,
  cooldown: number,
  extraSpellOpts: Partial<SpellbookAbility> = {},
) {
  return class ChakraHolyWord extends ExecuteHelper.withDependencies({
    abilities: Abilities,
  }) {
    static name = holyWord.name;
    static executeSources = SELECTED_PLAYER;
    static lowerThreshold = -1;
    static executeOutsideRangeEnablers = [buff];
    static modifiesDamage = false;
    static executeSpells = [holyWord];
    static countCooldownAsExecuteTime = true;

    maxCasts = 0; // unlike many other executes, we may never actually have a cast chance if we never switch to the right Chakra

    constructor(options: Options) {
      super(options);

      this.deps.abilities.add({
        spell: holyWord.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        cooldown,
        castEfficiency: {
          suggestion: false,
          recommendedEfficiency: 0.95,
          maxCasts: () => this.maxCasts,
        },
        ...extraSpellOpts,
      });

      this.addEventListener(Events.fightend, this.adjustMaxCasts);
    }

    protected adjustMaxCasts() {
      this.maxCasts += Math.ceil(this.totalExecuteDuration / (cooldown * 1000));
    }
  };
}

export const HolyWordSanctuary = makeHolyWord(
  SPELLS.CHAKRA_SANCTUARY_BUFF,
  SPELLS.HOLY_WORD_SANCTUARY,
  40 * TOME_OF_LIGHT_CDR,
  {
    healSpellIds: [SPELLS.HOLY_WORD_SANCTUARY_HEAL.id],
  },
);
export const HolyWordSerenity = makeHolyWord(
  SPELLS.CHAKRA_SERENITY_BUFF,
  SPELLS.HOLY_WORD_SERENITY,
  10 * TOME_OF_LIGHT_CDR,
);
export const HolyWordChastise = makeHolyWord(
  SPELLS.CHAKRA_CHASTISE_BUFF,
  SPELLS.HOLY_WORD_CHASTISE,
  10 * TOME_OF_LIGHT_CDR,
);
