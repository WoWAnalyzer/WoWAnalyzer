import cssComponent from "interface/utils/css-component";
import styles from "./Button.module.scss";
import * as design from 'interface/design-system';

const Button = cssComponent("button", styles.Button, [] as const);

export default Button;
