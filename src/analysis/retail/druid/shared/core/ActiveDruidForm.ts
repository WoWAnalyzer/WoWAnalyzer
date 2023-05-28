import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { TALENTS_DRUID as TALENTS } from 'common/TALENTS/druid';

export default class ActiveDruidForm extends Analyzer {
  private currentForm: DruidForm = 'No Form';

  constructor(options: Options) {
    super(options);

    //Balance
    this.addEventListener(
      Events.applybuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.MOONKIN_FORM_AFFINITY, SPELLS.MOONKIN_FORM]),
      this.moonkinActivated,
    );
    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.MOONKIN_FORM_AFFINITY, SPELLS.MOONKIN_FORM]),
      this.noformActivated,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell([TALENTS.INCARNATION_CHOSEN_OF_ELUNE_TALENT]),
      this.incarnMoonkinActivated,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell([TALENTS.INCARNATION_CHOSEN_OF_ELUNE_TALENT]),
      this.noformActivated,
    );

    //Feral
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.CAT_FORM]),
      this.catActivated,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell([SPELLS.CAT_FORM]),
      this.noformActivated,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell([TALENTS.INCARNATION_AVATAR_OF_ASHAMANE_TALENT]),
      this.incarnCatActivated,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell([TALENTS.INCARNATION_AVATAR_OF_ASHAMANE_TALENT]),
      this.noformActivated,
    );

    //Guardian
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell([SPELLS.BEAR_FORM]),
      this.bearActivated,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell([SPELLS.BEAR_FORM]),
      this.noformActivated,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell([TALENTS.INCARNATION_GUARDIAN_OF_URSOC_TALENT]),
      this.incarnBearActivated,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell([TALENTS.INCARNATION_GUARDIAN_OF_URSOC_TALENT]),
      this.noformActivated,
    );

    //Resto
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell([TALENTS.INCARNATION_TREE_OF_LIFE_TALENT]),
      this.incarnTOLActivated,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell([TALENTS.INCARNATION_TREE_OF_LIFE_TALENT]),
      this.noformActivated,
    );
  }

  get form() {
    return this.currentForm;
  }

  incarnTOLActivated() {
    this.currentForm = 'Tree of Life';
  }

  incarnBearActivated() {
    this.currentForm = 'Incarnation: Bear';
  }

  incarnCatActivated() {
    this.currentForm = 'Incarnation: Cat';
  }

  incarnMoonkinActivated() {
    this.currentForm = 'Incarnation: Moonkin';
  }

  moonkinActivated() {
    this.currentForm = 'Moonkin';
  }

  bearActivated() {
    this.currentForm = 'Bear';
  }

  catActivated() {
    this.currentForm = 'Cat';
  }

  noformActivated() {
    this.currentForm = 'No Form';
  }
}

export type DruidForm =
  | 'Cat'
  | 'Moonkin'
  | 'Bear'
  | 'No Form'
  | 'Tree of Life'
  | 'Incarnation: Cat'
  | 'Incarnation: Bear'
  | 'Incarnation: Moonkin';
