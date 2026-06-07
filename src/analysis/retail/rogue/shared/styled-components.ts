import cssComponent from "interface/utils/css-component";
import styles from "./styled-components.module.scss";
import { RoundedPanel } from 'interface/guide/components/GuideDivs';

export const RoundedPanelWithBottomMargin = cssComponent(RoundedPanel, styles.RoundedPanelWithBottomMargin, [] as const);

export const ExplanationSection = cssComponent("section", styles.ExplanationSection, [] as const);
