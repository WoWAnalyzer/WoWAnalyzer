import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

export default class ActiveDruidForm extends Analyzer {

    private currentForm: DruidForm;

    constructor(options: Options) {
        super(options);
        this.active = true
        
        this.currentForm = "noform"
        //Balance
        this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.MOONKIN_FORM_AFFINITY, SPELLS.MOONKIN_FORM]), this.moonkinActivated)
        this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell([SPELLS.MOONKIN_FORM_AFFINITY, SPELLS.MOONKIN_FORM]), this.noform)
    
        //Feral
        this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.CAT_FORM]), this.catActivated)
        this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell([SPELLS.CAT_FORM]), this.noform)
        
        //Guardian
        this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.BEAR_FORM]), this.bearActivated)
        this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell([SPELLS.BEAR_FORM]), this.noform)
    
    }

    get form() {
        return this.currentForm;
    }

    moonkinActivated() {
        this.currentForm = "moonkin"
    }

    bearActivated() {
        this.currentForm = "bear"
    }

    catActivated() {
        this.currentForm = "cat"
    }

    noform() {
        this.currentForm = "noform"
    }
}

export type DruidForm = "cat" | "moonkin" | "bear" | "noform"