import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Events, {
  CastEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import SPECS from 'game/SPECS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SpellIcon, SpellLink } from 'interface';

const ARCANE_SPELLS = [
  SPELLS.MOONFIRE_CAST,
  SPELLS.STARFIRE,
  SPELLS.STARSURGE_MOONKIN,
  TALENTS_DRUID.STARFALL_TALENT,
  TALENTS_DRUID.STELLAR_FLARE_TALENT,
  TALENTS_DRUID.NEW_MOON_TALENT,
  SPELLS.HALF_MOON,
  SPELLS.FULL_MOON,
  TALENTS_DRUID.FURY_OF_ELUNE_TALENT,
  TALENTS_DRUID.LUNAR_BEAM_TALENT,
  // Lunar Calling 'Arcane Thrash' handled separately in constructor
];

const MOON_REDUCE_MS = 1_000;
const FOE_REDUCE_MS = 2_000;
const LUNAR_BEAM_REDUCE_MS = 3_000;

/**
 * **Lunation**
 * Hero Talent
 *
 *  Balance
 * Your Arcane abilities reduce the cooldown of Fury of Elune by 2.0 sec and the cooldown of New Moon, Half Moon, and Full Moon by 1.0 sec.
 *
 * Guardian
 * Your Arcane abilities reduce the cooldown of Lunar Beam by 3.0 sec.
 */
export default class Lunation extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  /** The spell whose CD will be reduced */
  spell: Spell | undefined = undefined;
  /** The amount to reduce the spell's CD by when an Arcane spell is cast */
  cdrMsPerCast: number = 0;
  /** CDR applied so far to the currently cooling down charge */
  pendingCdrMs: number = 0;
  /** Total CDR applied to charges that have finished cooling down */
  totalCdrMs: number = 0;
  /** Total 'raw' CDR, including reduction that couldn't apply because spell not on CD */
  totalRawCdr: number = 0;
  /** Total charges restored for the tracked spell */
  finishedCdCount: number = 0;

  testArcaneCastCount: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.LUNATION_TALENT);

    if (this.selectedCombatant.hasTalent(TALENTS_DRUID.NEW_MOON_TALENT)) {
      this.spell = TALENTS_DRUID.NEW_MOON_TALENT;
      this.cdrMsPerCast = MOON_REDUCE_MS;
    } else if (this.selectedCombatant.hasTalent(TALENTS_DRUID.FURY_OF_ELUNE_TALENT)) {
      this.spell = TALENTS_DRUID.FURY_OF_ELUNE_TALENT;
      this.cdrMsPerCast = FOE_REDUCE_MS;
    } else if (this.selectedCombatant.hasTalent(TALENTS_DRUID.LUNAR_BEAM_TALENT)) {
      this.spell = TALENTS_DRUID.LUNAR_BEAM_TALENT;
      this.cdrMsPerCast = LUNAR_BEAM_REDUCE_MS;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(ARCANE_SPELLS), this.onArcaneCast);
    if (
      this.selectedCombatant.spec === SPECS.GUARDIAN_DRUID &&
      this.selectedCombatant.hasTalent(TALENTS_DRUID.LUNAR_CALLING_TALENT)
    ) {
      // With this talent, Thrash becomes an arcane spell but cast ID doesn't change
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.THRASH_BEAR),
        this.onArcaneCast,
      );
    }
    if (this.spell) {
      this.addEventListener(
        Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(this.spell),
        this.onReducedCdUpdate,
      );
    }
  }

  onArcaneCast(event: CastEvent) {
    if (this.spell) {
      this.testArcaneCastCount += 1;
      this.pendingCdrMs += this.deps.spellUsable.reduceCooldown(this.spell.id, this.cdrMsPerCast);
      this.totalRawCdr += this.cdrMsPerCast;
    }
  }

  onReducedCdUpdate(event: UpdateSpellUsableEvent) {
    if (
      event.updateType === UpdateSpellUsableType.EndCooldown ||
      event.updateType === UpdateSpellUsableType.RestoreCharge
    ) {
      this.totalCdrMs += this.pendingCdrMs;
      this.pendingCdrMs = 0;
      this.finishedCdCount += 1;
    }
  }

  get cdrPerCast(): string {
    if (this.finishedCdCount === 0) {
      return 'N/A';
    } else {
      return (this.totalCdrMs / this.finishedCdCount / 1000).toFixed(1) + 's';
    }
  }

  statistic() {
    if (!this.spell) {
      return;
    }
    return (
      <Statistic
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
        tooltip={
          <>
            <p>
              This is the cooldown reduction per <SpellLink spell={this.spell} /> cast, averaged
              over the entire encounter. The total effective CDR over the entire encounter was{' '}
              <strong>{(this.totalCdrMs / 1000).toFixed(0)}s</strong>.
            </p>
            <p>
              The total 'raw' CDR over the entire encounter (including Arcane spells cast while{' '}
              <SpellLink spell={this.spell} /> was not on CD) was{' '}
              <strong>{(this.totalRawCdr / 1000).toFixed(0)}s</strong>.
            </p>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DRUID.LUNATION_TALENT}>
          <>
            <SpellIcon spell={this.spell} /> {this.cdrPerCast} <small>avg CDR per cast</small>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}
