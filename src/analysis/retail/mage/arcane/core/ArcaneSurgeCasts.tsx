import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import Events, { CastEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class ArcaneSurgeCasts extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    eventHistory: EventHistory,
  };
  protected abilityTracker!: AbilityTracker;
  protected eventHistory!: EventHistory;

  totalCastsDuringAS = 0;
  arcaneSurgeCasts: number[][] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    //Excludes any casts that are not casted during AS and casts that aren't casts (i.e. enchant procs, etc)
    if (
      !this.selectedCombatant.hasBuff(TALENTS.ARCANE_SURGE_TALENT.id) ||
      CASTS_THAT_ARENT_CASTS.includes(spellId)
    ) {
      return;
    }

    this.totalCastsDuringAS += 1;
    const index = this.arcaneSurgeCasts.findIndex((arr) => arr.includes(spellId));
    if (index !== -1) {
      this.arcaneSurgeCasts[index][1] += 1;
    } else {
      this.arcaneSurgeCasts.push([spellId, 1]);
    }
  }

  castPercentage(castCount: number) {
    return castCount / this.totalCastsDuringAS;
  }

  avgCastsPerAS(castCount: number) {
    return castCount / this.totalArcaneSurgeCasts;
  }

  get totalArcaneSurgeCasts() {
    return this.abilityTracker.getAbility(TALENTS.ARCANE_SURGE_TALENT.id).casts;
  }

  statistic() {
    return (
      <Statistic
        wide
        size="flexible"
        position={STATISTIC_ORDER.CORE(30)}
        tooltip={
          <>
            When Arcane Surge is active, you want to ensure you are only casting damage spells and
            spells that will allow you to get more casts in before Arcane Surge finishes. Typically,
            this would include spells like Arcane Blast, Arcane Missiles, Arcane Barrage, Arcane
            Orb, Presence of Mind, etc. Spells that will buff your Arcane Surge like Radiant Spark
            or Touch of the Magi should be cast before Arcane Surge.
          </>
        }
      >
        <BoringSpellValueText spellId={TALENTS.ARCANE_SURGE_TALENT.id}>
          <>
            <table className="table table-condensed">
              <tbody>
                <tr>
                  <td>
                    <small>Spells cast during AS</small>
                  </td>
                  <td>
                    <small>Total Casts</small>
                  </td>
                  <td>
                    <small>Casts per AS</small>
                  </td>
                  <td>
                    <small>% of Total AS Casts</small>
                  </td>
                </tr>
                {this.arcaneSurgeCasts
                  .sort((a, b) => b[1] - a[1])
                  .map((spell) => (
                    <tr key={Number(spell)} style={{ fontSize: 16 }}>
                      <td>
                        <SpellLink id={Number(spell[0])} />
                      </td>
                      <td style={{ textAlign: 'center' }}>{spell[1]}</td>
                      <td style={{ textAlign: 'center' }}>
                        {this.avgCastsPerAS(spell[1])
                          .toFixed(2)
                          .replace(/[.,]00$/, '')}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {formatPercentage(this.castPercentage(spell[1]))}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcaneSurgeCasts;
