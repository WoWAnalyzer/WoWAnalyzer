import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import Statistic from 'parser/ui/Statistic';

import Abilities from '../Abilities';
import { UptimeIcon } from 'interface/icons';
import TalentSpellText from 'parser/ui/TalentSpellText';
import typedKeys from 'common/typedKeys';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';

class StormElemental extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    enemies: Enemies,
  };
  stormElementalEndTime: number = 0;
  badFS = 0;
  checkDelay = 0;
  numCasts: Record<number, number> = {
    [TALENTS.STORM_ELEMENTAL_TALENT.id]: 0,
    [SPELLS.LIGHTNING_BOLT.id]: 0,
    [TALENTS.CHAIN_LIGHTNING_TALENT.id]: 0,
    [TALENTS.EARTH_SHOCK_TALENT.id]: 0,
    [TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT.id]: 0,
    [TALENTS.EARTHQUAKE_2_ELEMENTAL_TALENT.id]: 0,
    [SPELLS.TEMPEST_CAST.id]: 0,
    [TALENTS.LAVA_BURST_TALENT.id]: 0,
  };
  protected enemies!: Enemies;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.STORM_ELEMENTAL_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.STORM_ELEMENTAL_TALENT),
      this.onSECast,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  get stormEleUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.WIND_GUST_BUFF.id) / this.owner.fightDuration
    );
  }

  get averageLightningBoltCasts() {
    return (
      this.numCasts[SPELLS.LIGHTNING_BOLT.id] / this.numCasts[TALENTS.STORM_ELEMENTAL_TALENT.id] ||
      0
    );
  }

  get averageChainLightningCasts() {
    return (
      this.numCasts[TALENTS.CHAIN_LIGHTNING_TALENT.id] /
        this.numCasts[TALENTS.STORM_ELEMENTAL_TALENT.id] || 0
    );
  }

  onSECast(event: CastEvent) {
    this.numCasts[TALENTS.STORM_ELEMENTAL_TALENT.id] += 1;
    this.stormElementalEndTime =
      event.timestamp +
      20000 *
        (1 + (this.selectedCombatant.hasTalent(TALENTS.EVERLASTING_ELEMENTS_TALENT) ? 0.2 : 0));
  }

  onCast(event: CastEvent) {
    if (event.timestamp <= this.stormElementalEndTime) {
      const spellId = event.ability.guid;
      if (this.numCasts[spellId] !== undefined) {
        this.numCasts[spellId] += 1;
      }
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        tooltip={
          <>
            With a uptime of: {formatPercentage(this.stormEleUptime)} %<br />
            Casts while Storm Elemental was up:
            <ul>
              {typedKeys(this.numCasts)
                .filter((spellId) => this.numCasts[spellId] > 0)
                .map((spellId) => {
                  const ability = maybeGetTalentOrSpell(spellId)!;
                  return (
                    <li key={spellId}>
                      <SpellLink spell={ability} />: {this.numCasts[spellId]}
                    </li>
                  );
                })}
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.STORM_ELEMENTAL_TALENT}>
          <div style={{ fontSize: 22 }}>
            <UptimeIcon /> {formatNumber(this.averageLightningBoltCasts)}{' '}
            <SpellLink spell={SPELLS.LIGHTNING_BOLT} />
            <br />
            <small>
              average casts per <SpellLink spell={TALENTS.STORM_ELEMENTAL_TALENT} />
            </small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default StormElemental;
