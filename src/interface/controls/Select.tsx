import cssComponent from "interface/utils/css-component";
import styles from "./Select.module.scss";
import * as design from 'interface/design-system';

const Select = cssComponent("select", styles.Select, [] as const);

export default Select;
