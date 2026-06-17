import cssComponent from 'interface/utils/css-component';
import styles from './Highlight.module.scss';

/**
 * An inline text highlight. Like using the highlight functionality in Word or Docs.
 *
 * Or like using a highlighter, I guess.
 */
export const Highlight = cssComponent('span', styles.Highlight, ['color', 'textColor'] as const);
