import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import SpellLink from 'interface/SpellLink';
import { SEPSIS_DEBUFF_DURATION } from '../../normalizers/SepsisLinkNormalizer';
import { ExplanationSection } from 'analysis/retail/demonhunter/shared/guide/CommonComponents';
import { Expandable } from 'interface';
import { SectionHeader } from 'interface/guide';
import formatSeconds from './formatSeconds';
import { SHIV_DURATION } from './Sepsis';

type Props = {
  usingLightweightShiv: boolean;
};

const SepsisDescription = ({ usingLightweightShiv }: Props) => {
  return (
    <>
      <ExplanationSection>
        <p>
          <strong>
            <SpellLink spell={TALENTS.SEPSIS_TALENT} />
          </strong>{' '}
          is a strong cooldown that allows for much higher uptime on
          <SpellLink spell={TALENTS.IMPROVED_GARROTE_TALENT} /> in fights.
        </p>
      </ExplanationSection>
      <ExplanationSection>
        <Expandable
          header={
            <SectionHeader>
              <strong>The first buff</strong>
            </SectionHeader>
          }
          element="section"
        >
          <div>
            The first buff from <SpellLink spell={TALENTS.SEPSIS_TALENT} /> should always be
            consumed by <SpellLink spell={TALENTS.IMPROVED_GARROTE_TALENT} /> as the very next
            ability cast. This empowers your <SpellLink spell={SPELLS.GARROTE} /> as early as
            possible.
          </div>
        </Expandable>
        <Expandable
          header={
            <SectionHeader>
              <strong>The second buff</strong>
            </SectionHeader>
          }
          element="section"
        >
          <div>
            The second buff from <SpellLink spell={TALENTS.SEPSIS_TALENT} /> should always be held
            onto as long as possible before being consumed by{' '}
            <SpellLink spell={TALENTS.IMPROVED_GARROTE_TALENT} />. This ensures the maximum uptime
            of the effect. If the empowered <SpellLink spell={SPELLS.GARROTE} /> from the previous{' '}
            <SpellLink spell={TALENTS.SEPSIS_TALENT} /> buff is in pandemic range with less than 5.4
            seconds remaining, you may refresh at that point as well.
          </div>
        </Expandable>

        {usingLightweightShiv && (
          <Expandable
            header={
              <SectionHeader>
                <strong>Shiv Interaction</strong>
              </SectionHeader>
            }
            element="section"
          >
            <div>
              When using the <SpellLink spell={TALENTS.LIGHTWEIGHT_SHIV_TALENT} /> talent you should
              hold a <SpellLink spell={SPELLS.SHIV} /> charge to empower the debuff from{' '}
              <SpellLink spell={TALENTS.SEPSIS_TALENT} />. Aim to get the full{' '}
              {formatSeconds(SHIV_DURATION)} seconds of the{' '}
              <SpellLink spell={TALENTS.IMPROVED_SHIV_TALENT} /> inside of the{' '}
              {formatSeconds(SEPSIS_DEBUFF_DURATION)} second{' '}
              <SpellLink spell={TALENTS.SEPSIS_TALENT} /> debuff window. With a 1s GCD this means
              you should be looking to cast <SpellLink spell={SPELLS.SHIV} /> 1-2 globals after
              applying <SpellLink spell={TALENTS.SEPSIS_TALENT} />.
            </div>
          </Expandable>
        )}
      </ExplanationSection>
    </>
  );
};

export default SepsisDescription;
