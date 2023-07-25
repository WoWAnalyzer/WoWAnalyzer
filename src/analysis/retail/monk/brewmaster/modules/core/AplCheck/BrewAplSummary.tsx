import styled from '@emotion/styled';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { SpellLink } from 'interface';
import { useInfo } from 'interface/guide';
import { AplSummary } from 'interface/guide/components/Apl';
import { ComponentProps } from 'react';
import { BrewmasterApl, chooseApl } from '../AplCheck';

const BlockBorder = styled.section`
  border: 1px solid #333a;
  border-radius: 2px;
  padding: 0.5em;
  padding-bottom: 0;

  & > header {
    margin-top: calc(-0.5em + -1em / 0.85);
    margin-left: 0.25em;
    /* via color picker, unfortunately */
    background: #131210;
    width: max-content;
    font-weight: bold;
    font-size: 0.85em;
  }
`;

const Block = ({ label, children }: React.PropsWithChildren<{ label: React.ReactNode }>) => (
  <BlockBorder>
    <header>{label}</header>
    <div>{children}</div>
  </BlockBorder>
);

const SummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  gap: 1em;
  max-width: 42em;
  margin-bottom: 0.5em;
`;

function BoCTPSummary(): JSX.Element {
  return (
    <SummaryContainer>
      <Block label="Setup">
        <ol>
          <li>
            Use <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} /> to apply{' '}
            <SpellLink spell={talents.CHARRED_PASSIONS_TALENT} /> if it is missing
          </li>
        </ol>
      </Block>
      <Block label={<>Spend Cooldowns</>}>
        <ol>
          <li>
            Cast <SpellLink spell={SPELLS.BLACKOUT_KICK_BRM} /> to apply{' '}
            <SpellLink spell={talents.BLACKOUT_COMBO_TALENT} />
          </li>
          <li>
            In any order:{' '}
            <ul>
              <li>
                Spend any <strong>two</strong> cooldowns like{' '}
                <SpellLink spell={talents.RISING_SUN_KICK_TALENT} />,{' '}
                <SpellLink spell={talents.RUSHING_JADE_WIND_TALENT} />,{' '}
                <SpellLink spell={talents.WEAPONS_OF_ORDER_TALENT} /> or{' '}
                <SpellLink spell={talents.SUMMON_WHITE_TIGER_STATUE_TALENT}>
                  White Tiger Statue
                </SpellLink>
                .
              </li>
              <li>
                Cast <SpellLink spell={SPELLS.TIGER_PALM} /> to spend{' '}
                <SpellLink spell={SPELLS.BLACKOUT_COMBO_BUFF} />
              </li>
            </ul>
          </li>
          <li>
            Do the{' '}
            <strong>
              Maintain <SpellLink spell={talents.CHARRED_PASSIONS_TALENT} />
            </strong>{' '}
            block
          </li>
        </ol>
      </Block>
      <Block
        label={
          <>
            Maintain <SpellLink spell={talents.CHARRED_PASSIONS_TALENT} />
          </>
        }
      >
        <ol>
          <li>
            Cast <SpellLink spell={SPELLS.BLACKOUT_KICK_BRM} /> to apply{' '}
            <SpellLink spell={talents.BLACKOUT_COMBO_TALENT} />
          </li>
          <li>
            Cast <SpellLink spell={SPELLS.TIGER_PALM} /> to spend{' '}
            <SpellLink spell={SPELLS.BLACKOUT_COMBO_BUFF} /> <em>immediately</em>
          </li>
          <li>
            Cast <SpellLink spell={talents.KEG_SMASH_TALENT} /> to reset{' '}
            <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} />
            's cooldown
          </li>
          <li>
            Cast <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} /> to apply{' '}
            <SpellLink spell={talents.CHARRED_PASSIONS_TALENT} />
          </li>
          <li>
            Do the <strong>Spend Cooldowns</strong> block
          </li>
        </ol>
      </Block>
    </SummaryContainer>
  );
}

export default function BrewAplSummary(props: ComponentProps<typeof AplSummary>): JSX.Element {
  const info = useInfo();

  const aplChoice = info ? chooseApl(info) : undefined;

  if (aplChoice !== BrewmasterApl.BoC_TP) {
    return <AplSummary {...props} />;
  }

  return <BoCTPSummary />;
}
