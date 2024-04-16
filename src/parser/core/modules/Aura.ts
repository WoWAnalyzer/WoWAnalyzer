import PropTypes from 'prop-types';

export interface SpellbookAura {
  /**
   * The spell id. If an array of spell ids is provided, the first element in the array
   * will be what shows in suggestions / cast timeline. Multiple spell definitions in the same
   * ability can be used to tie multiple cast / buff IDs together as the same ability
   * (with a shared cooldown).
   */
  spellId: number | number[];
  /**
   * Whether the spell is enabled (available to the player) and should be displayed. This should
   * only be used for hiding spells that are unavailable, for example due to talents.
   * Defaults to true.
   */
  enabled?: boolean;
  /**
   * The spells that trigger this buff. Defaults to the same spell as the buff (this is most
   * commonly the same spell). Only configure this if it's different.
   */
  triggeredBySpellId?: number | number[];
  /**
   * Whether the spell should be highlighted on the timeline. You should only highlight important
   * buffs that may affect your cast behavior. Defaults to false.
   */
  timelineHighlight?: boolean;
}

class Aura {
  static propTypes: { [key: string]: any } = {
    /**
     * REQUIRED The spell id. If an array of spell ids is provided, the first element in the array will be what shows in suggestions / cast timeline. Multiple spell definitions in the same ability can be used to tie multiple cast / buff IDs together as the same ability (with a shared cooldown)
     */
    spellId: PropTypes.oneOfType([PropTypes.number, PropTypes.arrayOf(PropTypes.number)])
      .isRequired,
    /**
     * Whether the spell is enabled (available to the player) and should be displayed. This should only be used for hiding spells that are unavailable, for example due to talents. Defaults to true.
     */
    enabled: PropTypes.bool,
    /**
     * The spells that trigger this buff. Defaults to the same spell as the buff (this is most commonly the same spell). Only configure this if it's different.
     */
    triggeredBySpellId: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),
    /**
     * Whether the spell should be highlighted on the timeline. You should only highlight important buffs that may affect your cast behavior. Defaults to false.
     */
    timelineHighlight: PropTypes.bool,
  };

  spellId!: SpellbookAura['spellId'];
  enabled: SpellbookAura['enabled'] = true;
  triggeredBySpellId: SpellbookAura['triggeredBySpellId'];
  timelineHighlight: SpellbookAura['timelineHighlight'];

  /**
   * When extending this class you MUST copy-paste this function into the new class.
   * Otherwise your new props will not be set properly.
   * @param options
   */
  constructor(options: SpellbookAura) {
    this._setProps(options);
  }

  _setProps(props: SpellbookAura) {
    if (import.meta.env.DEV) {
      /**
       * We verify the sanity of the abilities props to avoid mistakes. First
       * we check the types by reusing React's PropTypes which prints to your
       * console, and next we verify if all the props of the abilities exist in
       * the possible proptypes. If not they're likely mislocated.
       */
      PropTypes.checkPropTypes(
        // eslint-disable-next-line react/forbid-foreign-prop-types
        (this.constructor as typeof Aura).propTypes,
        props,
        'prop',
        'Buff',
      );
      Object.keys(props).forEach((prop) => {
        if (
          // eslint-disable-next-line react/forbid-foreign-prop-types
          (this.constructor as typeof Aura).propTypes[prop] === undefined
        ) {
          console.log(prop);
          throw new Error(
            `Property not recognized in Buffs: ${prop} seems misplaced in ${JSON.stringify(
              props.spellId,
            )}`,
          );
        }
      });
    }
    Object.keys(props).forEach((prop) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      this._setProp(prop, props[prop]);
    });
  }
  _setProp(prop: string, value: any) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    this[prop] = value;
  }
}

export default Aura;
