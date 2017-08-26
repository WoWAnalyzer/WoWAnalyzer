/**
 * This can't go in the DrapeOfShame.js file as a constant since both DrapeOfShame and CritEffectBonus modules rely on this, while DrapeOfShame has CritEffectBonus as a dependency, so importing the constant from the DrapeOfShame.js file would cause a circular reference that Webpack can't resolve. This causes Webpack to fail silently and return an undefined value from the import.
 */
export default 0.05;
