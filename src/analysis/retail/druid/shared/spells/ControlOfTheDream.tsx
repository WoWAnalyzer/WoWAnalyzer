import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DRUID } from 'common/TALENTS';
import { Options } from 'parser/core/Module';
import Events, { UpdateSpellUsableEvent, UpdateSpellUsableType } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Abilities from 'parser/core/modules/Abilities';
import Statistic from 'parser/ui/Statistic';
import { Fragment } from 'react';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellIcon } from 'interface';

const MAJOR_SPELLS = [
  TALENTS_DRUID.FORCE_OF_NATURE_TALENT,
  TALENTS_DRUID.CELESTIAL_ALIGNMENT_TALENT,
  TALENTS_DRUID.INCARNATION_CHOSEN_OF_ELUNE_TALENT,
  TALENTS_DRUID.CONVOKE_THE_SPIRITS_TALENT,
  TALENTS_DRUID.NATURES_SWIFTNESS_TALENT,
  TALENTS_DRUID.INCARNATION_TREE_OF_LIFE_TALENT,
];

const MAX_CDR = 15_000;

/**
 * **Control of the Dream**
 * Keeper of the Grove Hero Talent
 *
 * Time elapsed while your major abilities are available to be used is subtracted from that
 * ability's cooldown after the next time you use it, up to 15 seconds.
 * Balance: Force of Nature, Celestial Alignment, Incarnation: CoE, Convoke the Spirits
 * Resto: Nature's Swiftness, Incarnation: ToL, Convoke the Spirits
 */
export default class ControlOfTheDream extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
  abilities: Abilities,
}) {
  /** Info about each 'major abilities' CDR, indexed by spellId */
  cdrSpellInfos: CdrSpellInfo[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT);

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(MAJOR_SPELLS),
      this.onMajorSpellCdUpdate,
    );

    // the unusual CD behavior requires a custom maxSpells in CastEfficiency
    // (one that basically ignores this abilities CDR except the first cast, as it evens out in the end)
    if (this.active) {
      MAJOR_SPELLS.forEach((spell) => {
        const ability = (options.abilities as Abilities).getAbility(spell.id);
        if (ability) {
          ability.castEfficiency.maxCasts = (cooldown) =>
            (this.owner.fightDuration + MAX_CDR) / (cooldown * 1_000);
        }
      });
    }
  }

  onMajorSpellCdUpdate(event: UpdateSpellUsableEvent) {
    const spellId = event.ability.guid;
    if (!this.cdrSpellInfos[spellId]) {
      this.cdrSpellInfos[spellId] = {
        earlyCasts: 0,
        totalEffectiveCdr: 0,
      };
    }
    const info = this.cdrSpellInfos[spellId];

    if (event.updateType === UpdateSpellUsableType.BeginCooldown) {
      // a major ability just used, update spell info
      if (info.naturalEnd && info.naturalEnd > this.owner.currentTimestamp) {
        info.earlyCasts += 1;
        info.totalEffectiveCdr += info.naturalEnd - this.owner.currentTimestamp;
      }
      info.naturalEnd =
        this.owner.currentTimestamp + this.deps.spellUsable.cooldownRemaining(spellId);
      // First cast always gets max CDR
      const cdr = !info.lastAvailable
        ? MAX_CDR
        : Math.min(MAX_CDR, this.owner.currentTimestamp - info.lastAvailable);
      this.deps.spellUsable.reduceCooldown(spellId, cdr);
    } else if (event.updateType === UpdateSpellUsableType.EndCooldown) {
      // a major ability just finished CD, register it
      info.lastAvailable = this.owner.currentTimestamp;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS_DRUID.CONTROL_OF_THE_DREAM_TALENT}>
          <>
            {this.cdrSpellInfos.map((cdrInfo, spellId) => (
              <Fragment key={spellId}>
                <SpellIcon spell={spellId} /> {(cdrInfo.totalEffectiveCdr / 1_000).toFixed(0)}s{' '}
                <small>eff. CDR</small> / {cdrInfo.earlyCasts} <small>early casts</small>
                <br />
              </Fragment>
            ))}
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

interface CdrSpellInfo {
  /** Timestamp spell last became available (cooldown finished) */
  lastAvailable?: number;
  /** Next timestamp spell would come off CD without this talent */
  naturalEnd?: number;
  /** Times spell was cast earlier than would have been possible without CotD */
  earlyCasts: number;
  /** Sum of effective 'early cast' CDR, in ms */
  totalEffectiveCdr: number;
}
