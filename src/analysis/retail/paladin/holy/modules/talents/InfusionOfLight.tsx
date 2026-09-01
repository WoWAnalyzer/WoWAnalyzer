import type { JSX } from 'react';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/paladin';
import { SpellLink } from 'interface';
import CastOverview from 'interface/guide/components/CastOverview';
import GuideSection from 'interface/guide/components/GuideSection';
import StackedBar, { StackedBarSegment } from 'interface/guide/components/StackedBar';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { AnyEvent, CastEvent, GetRelatedEvent } from 'parser/core/Events';
import { INFUSION_OF_LIGHT_CONSUME } from '../../normalizers/EventLinks/EventLinkConstants';
import { SPELL_COLORS } from '../../constants';
import { GUIDE_CORE_EXPLANATION_PERCENT } from '../../guide/Guide';

const WASTED_COLOR = '#A93226';

/** Only Judgment and Flash of Light consume a proc. Holy Light no longer does. */
const SPENDERS: Spell[] = [SPELLS.FLASH_OF_LIGHT, SPELLS.JUDGMENT_CAST_HOLY];

const SPENDER_COLORS: Record<number, string> = {
  [SPELLS.FLASH_OF_LIGHT.id]: SPELL_COLORS.FLASH_OF_LIGHT,
  [SPELLS.JUDGMENT_CAST_HOLY.id]: SPELL_COLORS.JUDGMENT,
};

/**
 * Infusion of Light
 *
 * A flat chance for a Holy Shock cast to empower your next Judgment or Flash of Light.
 * It holds a single charge, or two with Inflorescence of the Sunwell.
 *
 * Procs and charges are not the same thing. With Inflorescence the buff is applied already
 * carrying two stacks, so one proc is one application worth two charges, and the log shows
 * it as applybuff, then removebuffstack, then removebuff. Procs are counted as the buff
 * arrives; charges are counted as they leave.
 *
 * Charges are counted as they leave the buff rather than by checking whether the buff
 * happened to be up at the time of a cast -- a single proc can sit through several
 * eligible casts, so only the cast the normalizer links to the removal actually spent it.
 *
 * A proc that lands while already at max charges only refreshes the buff, and the buff is
 * flagged Do Not Log Aura Refresh, so nothing is logged for it. Those procs cannot be counted.
 */
class InfusionOfLight extends Analyzer {
  /** Procs, counted as the buff being applied or gaining a stack. */
  procsGained = 0;
  /** Charges spent on a cast. */
  chargesUsed = 0;
  /** Charges that ran out before being spent. */
  chargesExpired = 0;
  castsBySpender: Record<number, number> = {};

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.INFUSION_OF_LIGHT_TALENT);
    if (!this.active) {
      return;
    }

    // One proc per application. A stack being added is a proc that found a charge already
    // held, so only one of its two charges had room.
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.INFUSION_OF_LIGHT),
      this.onProc,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.INFUSION_OF_LIGHT),
      this.onProc,
    );
    // Every charge leaves via one of these, whether it was spent or expired.
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.INFUSION_OF_LIGHT),
      this.onChargeRemoved,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(SPELLS.INFUSION_OF_LIGHT),
      this.onChargeRemoved,
    );
  }

  onProc() {
    this.procsGained += 1;
  }

  onChargeRemoved(event: AnyEvent) {
    const spender = GetRelatedEvent<CastEvent>(event, INFUSION_OF_LIGHT_CONSUME);
    if (!spender) {
      this.chargesExpired += 1;
      return;
    }

    this.chargesUsed += 1;
    const spellId = spender.ability.guid;
    this.castsBySpender[spellId] = (this.castsBySpender[spellId] ?? 0) + 1;
  }

  /** Every charge the fight gave you, spent or not. */
  get charges() {
    return this.chargesUsed + this.chargesExpired;
  }

  get chargesUsedPercentage() {
    return this.charges === 0 ? 0 : this.chargesUsed / this.charges;
  }

  private get maxCharges() {
    return this.selectedCombatant.hasTalent(TALENTS.INFLORESCENCE_OF_THE_SUNWELL_TALENT) ? 2 : 1;
  }

  private get explanation() {
    return (
      <>
        <p>
          <SpellLink spell={TALENTS.INFUSION_OF_LIGHT_TALENT} /> gives{' '}
          <SpellLink spell={TALENTS.HOLY_SHOCK_TALENT} /> a chance to empower your next{' '}
          <SpellLink spell={SPELLS.JUDGMENT_CAST_HOLY} /> or{' '}
          <SpellLink spell={SPELLS.FLASH_OF_LIGHT} />. It holds{' '}
          {this.maxCharges === 2 ? (
            <>
              two charges, thanks to{' '}
              <SpellLink spell={TALENTS.INFLORESCENCE_OF_THE_SUNWELL_TALENT} />, and each proc
              brings both
            </>
          ) : (
            'a single charge'
          )}
          .
        </p>
        <p>
          <SpellLink spell={SPELLS.FLASH_OF_LIGHT} /> is the better home for a charge, but{' '}
          <SpellLink spell={SPELLS.JUDGMENT_CAST_HOLY} /> is a reasonable one when nobody needs the
          healing. Either beats letting it expire.
        </p>
        <p>
          Spend your charges before they expire, and don't sit at max charges. A proc that lands
          while you are capped only refreshes the buff, so it is lost -- and it does not even show
          up in the log, so it is not counted here.
        </p>
      </>
    );
  }

  private get stats() {
    return [
      {
        value: `${this.procsGained}`,
        label: 'Procs',
        tooltip: (
          <>
            Times <SpellLink spell={TALENTS.INFUSION_OF_LIGHT_TALENT} /> procced, counted from the
            buff being applied or gaining a stack.
            {this.maxCharges === 2 && (
              <>
                {' '}
                With <SpellLink spell={TALENTS.INFLORESCENCE_OF_THE_SUNWELL_TALENT} /> each proc
                carries two charges.
              </>
            )}
          </>
        ),
      },
      {
        value: `${this.chargesUsed}`,
        label: 'Charges Used',
        tooltip: (
          <>{formatPercentage(this.chargesUsedPercentage, 0)}% of your charges were spent.</>
        ),
      },
      {
        value: `${this.chargesExpired}`,
        label: 'Charges Expired',
        tooltip: <>Charges that ran out before you spent them.</>,
      },
    ];
  }

  private get spenderSegments(): StackedBarSegment[] {
    const segments: StackedBarSegment[] = SPENDERS.map((spell) => ({
      spell,
      casts: this.castsBySpender[spell.id] ?? 0,
    }))
      .filter(({ casts }) => casts > 0)
      .sort((a, b) => b.casts - a.casts)
      .map(({ spell, casts }) => ({
        label: spell.name,
        value: casts,
        color: SPENDER_COLORS[spell.id],
        tooltip: (
          <>
            {casts} charges spent on <SpellLink spell={spell} />
            {spell.id === SPELLS.JUDGMENT_CAST_HOLY.id && (
              <div>
                Worth less than <SpellLink spell={SPELLS.FLASH_OF_LIGHT} />, but a fine home for a
                charge when nobody needs the healing.
              </div>
            )}
          </>
        ),
      }));

    if (this.chargesExpired > 0) {
      segments.push({
        label: 'Expired',
        value: this.chargesExpired,
        color: WASTED_COLOR,
        tooltip: <>{this.chargesExpired} charges expired before you spent them.</>,
      });
    }

    return segments;
  }

  get guideSubsection(): JSX.Element {
    return (
      <GuideSection
        explanation={this.explanation}
        explanationPercent={GUIDE_CORE_EXPLANATION_PERCENT}
      >
        <CastOverview
          spell={SPELLS.INFUSION_OF_LIGHT}
          title="Infusion of Light Overview"
          stats={this.stats}
          additionalContent={{
            title: 'Charge Usage',
            content: <StackedBar segments={this.spenderSegments} />,
          }}
        />
      </GuideSection>
    );
  }
}

export default InfusionOfLight;
