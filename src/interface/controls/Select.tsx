import cssComponent from 'interface/utils/css-component';
import styles from './Select.module.scss';

const Select = cssComponent('select', styles.Select, [] as const);

export default Select;
