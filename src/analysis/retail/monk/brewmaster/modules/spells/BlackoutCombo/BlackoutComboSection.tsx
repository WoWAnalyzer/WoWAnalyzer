import styled from '@emotion/styled';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { SpellLink, TooltipElement } from 'interface';
import { SubSection, useAnalyzer, useInfo } from 'interface/guide';
import CastReasonBreakdownTableContents from 'interface/guide/components/CastReasonBreakdownTableContents';
import ExplanationRow from 'interface/guide/components/ExplanationRow';
import PassFailBar from 'interface/guide/components/PassFailBar';
import { useMemo } from 'react';
import BlackoutCombo from './index';

enum ComboEffect {
  BreathOfFire = talents.BREATH_OF_FIRE_TALENT.id,
  KegSmash = talents.KEG_SMASH_TALENT.id,
  TigerPalm = SPELLS.TIGER_PALM.id,
  CelestialBrew = talents.CELESTIAL_BREW_TALENT.id,
  PurifyingBrew = talents.PURIFYING_BREW_TALENT.id,
}

const comboEffectOrder = [
  ComboEffect.TigerPalm,
  ComboEffect.BreathOfFire,
  ComboEffect.KegSmash,
  ComboEffect.CelestialBrew,
  ComboEffect.PurifyingBrew,
];

const comboEffectLabel = (effect: ComboEffect) => <SpellLink spell={effect} />;

const ComboUsageTable = styled.table`
  width: max-content;
  height: max-content;
  margin: 0 2em;

  td {
    padding-left: 1em;
  }

  td:first-child {
    padding-left: 0;
  }
`;

export default function BlackoutComboSection(): JSX.Element | null {
  const analyzer = useAnalyzer(BlackoutCombo);
  const info = useInfo();

  const hasPta = info?.combatant.hasTalent(talents.PRESS_THE_ADVANTAGE_TALENT);

  const reasons = useMemo(() => {
    if (!analyzer?.active) {
      return [];
    }

    return Object.entries(analyzer.spellsBOCWasUsedOn).flatMap(([spellId, count]) =>
      Array.from({ length: count }, () => ({ reason: parseInt(spellId) as ComboEffect })),
    );
  }, [analyzer]);

  const possibleCombos = useMemo(
    () =>
      hasPta
        ? comboEffectOrder.filter((effect) => effect !== ComboEffect.TigerPalm)
        : comboEffectOrder,
    [hasPta],
  );

  if (!analyzer?.active) {
    return null;
  }
  return (
    <SubSection title={talents.BLACKOUT_COMBO_TALENT.name}>
      <ExplanationRow leftPercent={45}>
        <div>
          <p>
            The recommended way to use <SpellLink spell={talents.BLACKOUT_COMBO_TALENT} />
            's combo bonuses is:
          </p>
          <ul>
            <li style={{ opacity: hasPta ? 0.5 : 1 }}>
              <div>
                <strong>
                  <SpellLink spell={SPELLS.TIGER_PALM} />: On Single-Target.
                </strong>
              </div>
              <div>
                Comboing <SpellLink spell={SPELLS.TIGER_PALM} /> is the best way to use{' '}
                <SpellLink spell={talents.BLACKOUT_COMBO_TALENT} /> for damage in single-target and
                light AoE settings. You will frequently see high ranked raiders using this option.
              </div>
            </li>
            <li>
              <div>
                <strong>
                  <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} />: Sometimes.
                </strong>
              </div>
              <div>
                The main value of comboing <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} /> is in
                the bonus 5% damage reduction. The damage bonus only applies to a single target.{' '}
                <em>However,</em> the extra damage reduction will be removed the next time you
                re-apply <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} />.
              </div>
            </li>
            <li>
              <div>
                <strong>
                  <SpellLink spell={talents.KEG_SMASH_TALENT} />: Sometimes.
                </strong>
              </div>
              <div>
                Purely defensive, but not bad. This is often used incidentally multi-target settings
                where <SpellLink spell={SPELLS.TIGER_PALM} /> is less valuable.
              </div>
            </li>
            <li>
              <div>
                <strong>
                  <SpellLink spell={talents.CELESTIAL_BREW_TALENT} />: Rarely.
                </strong>
              </div>
              <div>
                Great when you need it, but the{' '}
                <TooltipElement
                  hoverable
                  content={
                    <>
                      These are stacks of <SpellLink spell={SPELLS.PURIFIED_CHI} />, which is
                      limited to 10 stacks total (including the 3 bonus from{' '}
                      <SpellLink spell={talents.BLACKOUT_COMBO_TALENT} />
                      ).
                    </>
                  }
                >
                  stack cap
                </TooltipElement>{' '}
                still applies so you rarely do.
              </div>
            </li>
            <li>
              <div>
                <strong>
                  <SpellLink spell={talents.PURIFYING_BREW_TALENT} />: Effectively Never.
                </strong>
              </div>
              <div>
                Pausing <SpellLink spell={SPELLS.STAGGER} /> is extremely niche, so this doesn't
                come up often. Most uses you see of this in top logs are accidental.
              </div>
            </li>
          </ul>
        </div>
        <ComboUsageTable>
          <tbody>
            <tr>
              <td>
                <TooltipElement
                  content={
                    <>
                      <SpellLink spell={SPELLS.BLACKOUT_COMBO_BUFF} /> is a buff. If you wait long
                      enough before using a combo spell, it will expire and do nothing!
                    </>
                  }
                >
                  Combos Used
                </TooltipElement>
              </td>
              <td>
                {analyzer.blackoutComboConsumed} / {analyzer.blackoutComboBuffs}
              </td>
              <td>
                <PassFailBar
                  pass={analyzer.blackoutComboConsumed}
                  total={analyzer.blackoutComboBuffs}
                />
              </td>
            </tr>
          </tbody>
          <tbody>
            <tr>
              <th colSpan={3}>Spell Combo Breakdown</th>
            </tr>
          </tbody>
          <CastReasonBreakdownTableContents
            casts={reasons}
            label={comboEffectLabel}
            possibleReasons={possibleCombos}
            badReason={ComboEffect.PurifyingBrew}
          />
          <tbody>
            <tr>
              <td colSpan={3} style={{ paddingTop: '1em' }}>
                <em>Work in Progress</em>
              </td>
            </tr>
          </tbody>
        </ComboUsageTable>
      </ExplanationRow>
    </SubSection>
  );
}
