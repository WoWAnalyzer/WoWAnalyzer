import { Spec, isRetailSpec } from 'game/SPECS';
import Combatant from 'parser/core/Combatant';

/**
 * Takes name of a player class, {@link Spec}, or {@link Combatant} and
 * returns a `className` that can be used to color the text in the
 * appropiate class color.
 *
 * > The css classes themselves are defined in
 * > [src\interface\Game.scss](../interface/Game.scss#L1-L39)
 */
export default function classColor(input: string | Combatant | Spec): string {
  if (typeof input === 'string') {
    return input.replace(' ', '');
  } else if (input instanceof Combatant) {
    if (input.spec == null) {
      throw new Error(`[classColor] Combatant ${input.name} has no spec`);
    }
    return classColor(input.spec);
  } else {
    const base = isRetailSpec(input) ? input.wclClassName : input.type;
    if (!base) {
      console.error('Spec has nothing to base class color on', input);
      return '';
    }
    return classColor(base);
  }
}

/**
 * Takes name of a player class, {@link Spec}, or {@link Combatant} and
 * returns a `className` that can be used to color the background in the
 * appropiate class color.
 *
 * > The css classes themselves are defined in
 * > [src\interface\Game.scss](../interface/Game.scss#L41-L79)
 */
export function classBgColor(input: string | Combatant | Spec): string {
  return `${classColor(input)}-bg`;
}
