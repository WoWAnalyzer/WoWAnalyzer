/**
 * A simple component that shows the spell value in the most plain way possible.
 * Use this only as the last resort, prefer a custom layout instead.
 */
import Spell from 'common/SPELLS/Spell';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import { ReactNode } from 'react';

interface BaseProps {
  children: ReactNode;
  className?: string;
  ilvl?: number;
}

interface PropsWithSpellId extends BaseProps {
  /**
   * @deprecated use {@link spell} instead.
   */
  spellId: number | Spell;
  spell?: never;
}

interface PropsWithSpell extends BaseProps {
  /**
   * @deprecated use {@link spell} instead.
   */
  spellId?: never;
  spell: number | Spell;
}

type Props = PropsWithSpellId | PropsWithSpell;

const BoringSpellValueText = ({ spellId, spell, children, className, ilvl }: Props) => (
  <div className={`pad boring-text ${className || ''}`}>
    <label>
      <SpellIcon spell={spell ?? spellId} />{' '}
      <SpellLink spell={spell ?? spellId} ilvl={ilvl} icon={false} />
    </label>
    <div className="value">{children}</div>
  </div>
);

export default BoringSpellValueText;
