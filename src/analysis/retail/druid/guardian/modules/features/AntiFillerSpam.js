import { t } from '@lingui/macro';
import { formatPercentage, formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';

import Abilities from '../Abilities';
import ActiveTargets from './ActiveTargets';

const debug = false;

// Determines whether a variable is a function or not, and returns its value
function resolveValue(maybeFunction, ...args) {
  if (typeof maybeFunction === 'function') {
    return maybeFunction(...args);
  }

  return maybeFunction;
}

class AntiFillerSpam extends Analyzer {
  get fillerSpamPercentage() {
    return this._unnecessaryFillerSpells / this._totalGCDSpells;
  }

  static dependencies = {
    enemies: Enemies,
    activeTargets: ActiveTargets,
    spellUsable: SpellUsable,
    abilities: Abilities,
  };
  _totalGCDSpells = 0;
  _totalFillerSpells = 0;
  _unnecessaryFillerSpells = 0;

  constructor(options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onCast(event) {
    const spellId = event.ability.guid;
    const ability = this.abilities.getAbility(spellId);
    if (!ability || !ability.gcd) {
      return;
    }

    this._totalGCDSpells += 1;
    const targets = this.activeTargets
      .getActiveTargets(event.timestamp)
      .map((enemyID) => this.enemies.enemies[enemyID])
      .filter((enemy) => Boolean(enemy));
    const combatant = this.selectedCombatant;

    let isFiller = false;
    if (ability.antiFillerSpam) {
      if (typeof ability.antiFillerSpam.isFiller === 'function') {
        isFiller = ability.antiFillerSpam.isFiller(event, combatant, targets);
      } else {
        isFiller = ability.antiFillerSpam.isFiller;
      }
    }

    if (!isFiller) {
      return;
    }

    debug &&
      console.group(
        `[FILLER SPELL] - ${spellId} ${SPELLS[spellId].name} - ${formatDuration(
          event.timestamp - this.owner.fight.start_time,
        )}`,
      );

    this._totalFillerSpells += 1;
    const availableSpells = [];

    this.abilities.abilities
      .filter((ability) => ability.antiFillerSpam)
      .forEach((gcdSpell) => {
        const gcdSpellId = gcdSpell.primarySpell;
        if (ability.primarySpell === gcdSpellId) {
          return;
        }

        const isOffCooldown = this.spellUsable.isAvailable(gcdSpellId);
        const args = [event, combatant, targets];
        const isHighPriority =
          gcdSpell.antiFillerSpam.isHighPriority !== undefined
            ? resolveValue(gcdSpell.antiFillerSpam.isHighPriority, ...args)
            : false;

        if (!isOffCooldown || !isHighPriority) {
          return;
        }

        debug &&
          console.warn(`
          [Available non-filler]
          - ${gcdSpellId} ${SPELLS[gcdSpellId].name}
          - offCD: ${isOffCooldown}
          - isHighPriority: ${isHighPriority}
        `);
        availableSpells.push(gcdSpell);
      });

    if (availableSpells.length > 0) {
      this._unnecessaryFillerSpells += 1;
      let text = '';
      for (let i = 0; i < availableSpells.length; i += 1) {
        if (availableSpells[i].primarySpell === SPELLS.MOONFIRE_CAST.id) {
          text += 'a Galactic Guardian proc';
        } else {
          text += availableSpells[i].name;
        }
        if (i + 2 < availableSpells.length) {
          text += ', ';
        } else if (i + 1 < availableSpells.length) {
          text += ' and ';
        }
      }
      event.meta = event.meta || {};
      event.meta.isInefficientCast = true;
      event.meta.inefficientCastReason = `This spell was cast while ${text} was available.`;
    }
    debug && console.groupEnd();
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip={
          <>
            You cast <strong>{this._unnecessaryFillerSpells}</strong> unnecessary filler spells out
            of <strong>{this._totalGCDSpells}</strong> total GCDs. Filler spells (Swipe, Moonfire
            without a GG proc, or Moonfire outside of pandemic if talented into Incarnation) do far
            less damage than your main rotational spells, and should be minimized whenever possible.
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellIcon id={SPELLS.SWIPE_BEAR.id} /> Unnecessary Fillers{' '}
            </>
          }
        >
          {`${formatPercentage(this.fillerSpamPercentage)}%`}
        </BoringValueText>
      </Statistic>
    );
  }

  suggestions(when) {
    when(this.fillerSpamPercentage)
      .isGreaterThan(0.1)
      .addSuggestion((suggest, actual, recommended) =>
        suggest(
          <>
            You are casting too many unnecessary filler spells. Try to plan your casts two or three
            GCDs ahead of time to anticipate your main rotational spells coming off cooldown, and to
            give yourself time to react to <SpellLink id={SPELLS.GORE_BEAR.id} /> and{' '}
            <SpellLink id={SPELLS.GALACTIC_GUARDIAN_TALENT.id} /> procs.
          </>,
        )
          .icon(SPELLS.SWIPE_BEAR.icon)
          .actual(
            t({
              id: 'druid.guardian.suggestions.fillerSpells.efficiency',
              message: `${formatPercentage(actual)}% unnecessary filler spells cast`,
            }),
          )
          .recommended(`${formatPercentage(recommended, 0)}% or less is recommended`)
          .regular(recommended + 0.05)
          .major(recommended + 0.1),
      );
  }
}

export default AntiFillerSpam;
