import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { SpellIcon, SpellLink } from 'interface';
import { SubSection, useInfo } from 'interface/guide';
import * as AplCheck from '../AplCheck';
import { SpellSeq } from 'parser/ui/SpellSeq';

import { AplSectionData } from 'interface/guide/components/Apl';
import { useMemo, type JSX } from 'react';
import styled from '@emotion/styled';

const blank = {
  id: -1,
  name: 'Blank',
  icon: 'inv_misc_questionmark',
};

// hack around annoying nesting issue. why is P not a proper container?
const DivP = styled.div`
  margin-bottom: 1rem;
`;

const StandardDescription = () => {
  const info = useInfo();
  if (!info) {
    return null;
  }

  if (info.combatant.hasTalent(talents.BLACKOUT_COMBO_TALENT)) {
    return (
      <>
        <p>
          Using <SpellLink spell={talents.BLACKOUT_COMBO_TALENT} /> adds an extra layer to the
          Brewmaster rotation. You <em>almost always</em> want to spend the{' '}
          <SpellLink spell={talents.BLACKOUT_COMBO_TALENT}>Combo</SpellLink> on either{' '}
          <SpellLink spell={SPELLS.TIGER_PALM} /> (in single-target) or{' '}
          <SpellLink spell={talents.BREATH_OF_FIRE_TALENT} /> (with 3+ targets).{' '}
        </p>
        <DivP>
          It can help to think of your rotation as small sequences like{' '}
          <SpellSeq spells={[SPELLS.BLACKOUT_KICK_BRM, blank, blank, blank]} />. You start the
          sequence with <SpellLink spell={SPELLS.BLACKOUT_KICK_BRM} />, and then fill in the blanks
          like this:
        </DivP>
        <ol>
          <li>
            Always fill one <SpellIcon spell={blank} /> with{' '}
            <SpellLink spell={SPELLS.TIGER_PALM}>TP</SpellLink> to spend your{' '}
            <SpellLink spell={SPELLS.BLACKOUT_COMBO_BUFF} />, even in AoE
          </li>
          <li>
            If you fill a <SpellIcon spell={blank} /> with{' '}
            <SpellLink spell={talents.KEG_SMASH_TALENT} />, it should be <em>after</em>{' '}
            <SpellLink spell={SPELLS.TIGER_PALM}>TP</SpellLink>
          </li>
          <li>
            Fill all other <SpellIcon spell={blank} />s with your normal rotation
          </li>
        </ol>
        <DivP>
          so{' '}
          <SpellSeq
            spells={[
              SPELLS.BLACKOUT_KICK_BRM,
              SPELLS.TIGER_PALM,
              talents.KEG_SMASH_TALENT,
              talents.RISING_SUN_KICK_TALENT,
            ]}
          />{' '}
          and{' '}
          <SpellSeq
            spells={[
              SPELLS.BLACKOUT_KICK_BRM,
              talents.RISING_SUN_KICK_TALENT,
              SPELLS.TIGER_PALM,
              talents.KEG_SMASH_TALENT,
            ]}
          />{' '}
          would both be fine, but{' '}
          <SpellSeq
            spells={[
              SPELLS.BLACKOUT_KICK_BRM,
              talents.KEG_SMASH_TALENT,
              talents.RISING_SUN_KICK_TALENT,
              SPELLS.TIGER_PALM,
            ]}
          />{' '}
          would not.
        </DivP>
      </>
    );
  }
  return <></>;
};

const Description = ({ aplChoice }: { aplChoice: AplCheck.BrewmasterApl }) => {
  switch (aplChoice) {
    case AplCheck.BrewmasterApl.Standard:
      return <StandardDescription />;
  }
};

export default function AplChoiceDescription(): JSX.Element {
  const info = useInfo();
  const aplChoice = useMemo(() => (info ? AplCheck.chooseApl(info) : undefined), [info]);
  if (aplChoice === undefined || !info) {
    return <></>;
  }

  if (info.combatant.hasTalent(talents.PRESS_THE_ADVANTAGE_TALENT)) {
    return (
      <>
        Analysis of the <SpellLink spell={talents.PRESS_THE_ADVANTAGE_TALENT} /> rotation has
        limited support.
      </>
    );
  }

  return (
    <>
      <p>
        The Brewmaster rotation is driven by <SpellLink spell={SPELLS.BLACKOUT_KICK_BRM} />. It
        grants <SpellLink spell={talents.SHUFFLE_TALENT} />, triggers{' '}
        <SpellLink spell={talents.SPIRIT_OF_THE_OX_TALENT} />, and does a lot of damage.{' '}
        <strong>
          <SpellLink spell={SPELLS.BLACKOUT_KICK_BRM}>BoK</SpellLink> is your most important
          ability.
        </strong>
      </p>
      <p>
        After pushing <SpellLink spell={SPELLS.BLACKOUT_KICK_BRM} />, you follow a simple priority
        focused on using strong, low-cooldown abilities like{' '}
        <SpellLink spell={talents.KEG_SMASH_TALENT} /> and{' '}
        <SpellLink spell={talents.RISING_SUN_KICK_TALENT} /> as often as possible.
      </p>
      <Description aplChoice={aplChoice} />
      <SubSection>
        <AplSectionData checker={AplCheck.check} apl={AplCheck.apl(info)} />
      </SubSection>
    </>
  );
}
