import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';

class ArcanePowerCasts extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    eventHistory: EventHistory,
  };
  protected abilityTracker!: AbilityTracker;
  protected eventHistory!: EventHistory;

  totalCastsDuringAP = 0;
  arcanePowerCasts: number[][] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    //Excludes any casts that are not casted during AP and casts that aren't casts (i.e. enchant procs, etc)
    if (
      !this.selectedCombatant.hasBuff(SPELLS.ARCANE_POWER.id) ||
      CASTS_THAT_ARENT_CASTS.includes(spellId)
    ) {
      return;
    }

    this.totalCastsDuringAP += 1;
    const index = this.arcanePowerCasts.findIndex((arr) => arr.includes(spellId));
    if (index !== -1) {
      this.arcanePowerCasts[index][1] += 1;
    } else {
      this.arcanePowerCasts.push([spellId, 1]);
    }
  }

  castPercentage(castCount: number) {
    return castCount / this.totalCastsDuringAP;
  }

  avgCastsPerAP(castCount: number) {
    return castCount / this.totalArcanePowerCasts;
  }

  get totalArcanePowerCasts() {
    return this.abilityTracker.getAbility(SPELLS.ARCANE_POWER.id).casts;
  }

  statistic() {
    return (
      <Statistic
        wide
        size="flexible"
        position={STATISTIC_ORDER.CORE(30)}
        tooltip={
          <>
            When Arcane Power is active, you want to ensure you are only casting damage spells and
            spells that will allow you to get more casts in before Arcane Power finishes. Typically,
            this would include spells like Arcane Blast, Arcane Missiles, Arcane Barrage, Arcane
            Orb, Presence of Mind, etc. Spells that will buff your Arcane Power like Radiant Spark
            or Touch of the Magi should be cast before Arcane Power.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.ARCANE_POWER.id}>
          <>
            <table className="table table-condensed">
              <tbody>
                <tr>
                  <td>
                    <small>Spells cast during AP</small>
                  </td>
                  <td>
                    <small>Total Casts</small>
                  </td>
                  <td>
                    <small>Casts per AP</small>
                  </td>
                  <td>
                    <small>% of Total AP Casts</small>
                  </td>
                </tr>
                {this.arcanePowerCasts
                  .sort((a, b) => b[1] - a[1])
                  .map((spell) => (
                    <tr key={Number(spell)} style={{ fontSize: 16 }}>
                      <td>
                        <SpellLink id={Number(spell[0])} />
                      </td>
                      <td style={{ textAlign: 'center' }}>{spell[1]}</td>
                      <td style={{ textAlign: 'center' }}>
                        {this.avgCastsPerAP(spell[1])
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

export default ArcanePowerCasts;
