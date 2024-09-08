import { moduleSpreadParentDependencies } from './rules/module-spread-parent-dependencies.js';
import { spellLinkSpellObject } from './rules/spell-link-spell-object.js';
import { spellIconSpellObject } from './rules/spell-icon-spell-object.js';
import { boringSpellValueTextSpellObject } from './rules/boring-spell-value-text-spell-object.js';
import { linguiTMacroOutsideJsx } from './rules/lingui-t-macro-outside-jsx.js';
import { eventMetaInefficientCast } from './rules/event-meta-inefficient-cast.js';

/** @type {import('eslint').Plugin} */
const plugin = {
  meta: {
    name: 'wowanalyzer',
  },
  rules: {
    'module-spread-parent-dependencies': moduleSpreadParentDependencies,
    'spell-link-spell-object': spellLinkSpellObject,
    'spell-icon-spell-object': spellIconSpellObject,
    'boring-spell-value-text-spell-object': boringSpellValueTextSpellObject,
    'lingui-t-macro-outside-jsx': linguiTMacroOutsideJsx,
    'event-meta-inefficient-cast': eventMetaInefficientCast,
  },
  configs: {},
};

Object.assign(plugin.configs, {
  recommended: [
    {
      plugins: {
        wowanalyzer: plugin,
      },
      rules: {
        'wowanalyzer/module-spread-parent-dependencies': 'error',
        'wowanalyzer/spell-link-spell-object': 'error',
        'wowanalyzer/spell-icon-spell-object': 'error',
        'wowanalyzer/boring-spell-value-text-spell-object': 'error',
        'wowanalyzer/lingui-t-macro-outside-jsx': 'error',
        'wowanalyzer/event-meta-inefficient-cast': 'error',
      },
    },
  ],
});

export default plugin;
