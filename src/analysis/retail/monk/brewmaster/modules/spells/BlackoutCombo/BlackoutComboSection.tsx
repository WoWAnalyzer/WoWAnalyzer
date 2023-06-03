import styled from '@emotion/styled';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { SpellLink, TooltipElement } from 'interface';
import { SubSection, useAnalyzer } from 'interface/guide';
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
  ComboEffect.BreathOfFire,
  ComboEffect.KegSmash,
  ComboEffect.TigerPalm,
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

  const reasons = useMemo(() => {
    if (!analyzer?.active) {
      return [];
    }

    return Object.entries(analyzer.spellsBOCWasUsedOn).flatMap(([spellId, count]) =>
      Array.from({ length: count }, () => ({ reason: parseInt(spellId) as ComboEffect })),
    );
  }, [analyzer]);

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
            <li>
              <div>
                <strong>
                  <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} />: Always.
                </strong>
              </div>
              <div>
                The 50%{' '}
                <TooltipElement
                  content={
                    <>
                      The <SpellLink spell={talents.BLACKOUT_COMBO_TALENT} /> tooltip is
                      incorrect&mdash;it buffs the initial hit of{' '}
                      <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} />, not the ticking damage.
                    </>
                  }
                >
                  damage boost
                </TooltipElement>{' '}
                is very good, as is the extra 5% DR.
              </div>
            </li>
            <li>
              <div>
                <strong>
                  <SpellLink spell={talents.KEG_SMASH_TALENT} />
                </strong>{' '}
                or{' '}
                <strong>
                  <SpellLink spell={SPELLS.TIGER_PALM} />: Frequently.
                </strong>
              </div>
              <div>
                Only used when <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} /> isn't available,
                but both effects are decent.
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
                      These are stacks of{' '}
                      <SpellLink spell={talents.IMPROVED_CELESTIAL_BREW_TALENT} />, which is limited
                      to 10 stacks total (including the 3 bonus from{' '}
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
                come up often.
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
            possibleReasons={comboEffectOrder}
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
