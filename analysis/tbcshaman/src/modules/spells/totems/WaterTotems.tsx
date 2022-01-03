import * as SPELLS from '../../../SPELLS';
import { SpellLink } from 'interface';
import { TotemElements } from "../../../totemConstants";
import TotemTracker from "../../features/TotemTracker";
import { Options } from 'parser/core/Analyzer';
import BaseTotem from "./BaseTotem";

export default class WaterTotems extends BaseTotem {
    static dependencies = {
        totemTracker: TotemTracker,
    };

    protected totemTracker!: TotemTracker;

    constructor(options: Options) {
        super(options, TotemElements.Water);
    }
}
