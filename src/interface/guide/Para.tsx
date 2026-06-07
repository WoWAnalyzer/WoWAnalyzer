import cssComponent from "interface/utils/css-component";
import styles from "./Para.module.scss";

/**
 * A `div` with `p`-style padding.
 *
 * This can be used to address DOM nesting errors while preserving padding.
 */
const Para = cssComponent("div", styles.Para, [] as const);

export default Para;
