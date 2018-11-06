import Analyzer from 'parser/core/Analyzer';

/*
  TEST LOGS:
    https://www.warcraftlogs.com/reports/4cBHbZACxz3ywnpk#fight=24&type=damage-done   - Flappslock - THE EVIL ONE (Bilescourge, Vilefiend, Inner Demons, Nether Portal)
    https://www.warcraftlogs.com/reports/QhqzaZTRmWj8d76p#fight=3&type=damage-done    - Katarinna - Vilefiend, Inner Demons, Nether Portal
    https://www.warcraftlogs.com/reports/ArRBmMzpYGbV3N7g#fight=11&type=damage-done   - Ddavee - Vilefiend, Inner Demons, Nether Portal     GERMAN LOG
    https://www.warcraftlogs.com/reports/mhaYtBqvg8WTr17A#fight=1&type=damage-done    - Toned - Vilefiend, Inner Demons, Nether Portal
    https://www.warcraftlogs.com/reports/TBGRJZ9aj4FzD7wW#fight=1&type=damage-done    - Mímir - Vilefiend, Inner Demons, Nether Portal
    https://www.warcraftlogs.com/reports/KFmxXfWN8GtrJT3Y#fight=9&type=damage-done    - Galé  - Soul Strike, Inner Demons, Nether Portal
    https://www.warcraftlogs.com/reports/Lp8vNgYFXdmMqT21#fight=4&type=damage-done    - Cincinnatus - Soul Strike, Inner Demons, Nether Portal
 */
/*
  REQUIRED MODULE API (old Demo issue #1806):
    getPetCount(timestamp, petId?): number - for Sacrificed Souls and perhaps Demonic Consumption
    getPetDamage(petId): number
    getPermanentPetDamage(): number
 */
const KNOWN_PETS_GUID = {
  WILD_IMP_HOG: 55659,
  DREADSTALKER: 98035,
  DEMONIC_TYRANT: 135002,
  VILEFIEND: 135816, // verified on 2 logs without Vilefiend, either I'm unlucky (and Vilefiend can be summoned from ID/NP with the same guid), but more likely is that it's the talent's Vilefiend guid
};
const debug = true;

class NewPets extends Analyzer {
  /*
    sesbirane informace (z logu Katarinny):
      1) this.owner.playerPets - mel by obsahovat vsechny "this.owner.report.friendlyPets" kde petOwner = playerId
        - je to pole objektu tvaru
          {
            name: string,
            id: number,
            guid: number,
            petOwner: number,
            type: string (pokazde "Pet" ale),
            fights: [
              {
                id: number, (mozna odpovida this.owner.fight.id)
                instances: number
              },
              ...
            ]
        pro tento konkretni log/fight to dela tabulku:

        name                |   id    |   guid
        -------------------------------------------
        Wild Imp            |   55    |   55659
        Dreadstalker        |   46    |   98035
        Demonic Tyrant      |   50    |   135002
        Vilefiend           |   44    |   135816
        Illidari Satyr      |   37    |   136398
        Vicious Hellhound   |   45    |   136399
        Shivarra            |   54    |   136406
        Ur'zul              |   66    |   136402
        Void Terror         |   69    |   136403
        Bilescourge         |   57    |   136404  // NEMA TALENT, takze z ID/NP
        Wrathguard          |   47    |   136407
        Darkhound           |   60    |   136408
        Wild Imp            |   38    |   143622
        Arix-barash         |   36    |   34658669

        pro jiny log (Toned), stejne (relevantni) talenty to da jinou tabulku:

        name                |   id    |   guid
        -------------------------------------------
        Wild Imp            |   45    |   55659
        Dreadstalker        |   47    |   98035
        Demonic Tyrant      |   57    |   135002
        Vilefiend           |   38    |   135816
        Void Terror         |   53    |   136403
        Shivarra            |   52    |   136406
        Wrathguard          |   56    |   136407
        Wild Imp            |   12    |   143622
        Krenkrill           |   19    |   15997656

        pro dalsi log (Mímir) takto (ukazuje to demonic Gateway taky jako pety, id: (83|84), guid (59262|59271)):

        name                |   id    |   guid
        -------------------------------------------
        Wild Imp            |   37    |   55659
        Dreadstalker        |   46    |   98035
        Demonic Tyrant      |   49    |   135002
        Vilefiend           |   48    |   135816
        Illidari Satyr      |   50    |   136398
        Vicious Hellhound   |   43    |   136399
        Ur'zul              |   41    |   136402
        Void Terror         |   90    |   136403
        Bilescourge         |   65    |   136404
        Shivarra            |   52    |   136406
        Wrathguard          |   47    |   136407
        Darkhound           |   64    |   136408
        Wild Imp            |   36    |   143622
        Jhuuzugul           |   32    |   31613885

      Shodne fakta:
        - pokazde vybocuje jeden pet co se tyce guid, predpokladam ze se jedna o permanent peta
        - id nesedi (treba 37 je na jednom logu Illidari Satyr, na jinem Wild Imp)
        - guid ovsem sedi napric logy
          - nekteri peti se asi daji odhadnout na ty baseline:
            - HOG Wild Imp - 55659
            - Dreadstalker - 98035
            - Demonic Tyrant - 135002
            - Vilefiend - 135816
          - prakticky jakykoli jiny pet je random ale jejich guid stale sedi!

  2) parser/shared/modules/Pets - tezce nedostacuje, pro prvni log (Katarinna) loguje pouze id 36 a 46 (Arix-barash, Dreadstalker) - ale to je mozna protoze se to loguje az pri volani get(Source)?Entity()

  3) zatim se neda na prvni pohled zjistit, co z toho je z Inner Demons nebo Nether Portal
   */
  _petDamage = {
    /*
     [pet guid]: {
        name: string,
        instances: {
          [pet instance]: number
        }
        total: number,
     }
     */
  };

  on_byPlayerPet_damage(event) {
    const petInfo = this._getPetInfo(event.sourceID);
    if (!petInfo) {
      debug && this.log(`Pet damage event with nonexistant pet id ${event.sourceID}`);
      return;
    }
    const damage = event.amount + (event.absorbed || 0);
    this._assertPetInstanceFieldExists(petInfo.guid, petInfo.name, event.sourceInstance);
    this._petDamage[petInfo.guid].instances[event.sourceInstance] += damage;
    this._petDamage[petInfo.guid].total += damage;
  }

  on_finished() {
    this.log('this._petDamage = ', this._petDamage);
    this.log('test this.permanentPetDamage', this.permanentPetDamage);
  }

  getPetDamage(guid) {
    if (!this._petDamage[guid]) {
      debug && this.log(`this.getPetDamage() called with nonexistant guid ${guid}`);
      return 0;
    }
    return Object.values(this._petDamage[guid].instances).reduce((total, current) => total + current, 0);
  }

  get permanentPetDamage() {
    // haven't observed any real rule for permanent pet guids except the fact, that they're the longest (other pet guids are either 5 or 6 digits)
    let total = 0;
    Object.entries(this._petDamage).filter(([guid]) => guid.length > 6).forEach(([guid, pet]) => {
      total += Object.values(pet.instances).reduce((total, current) => total + current, 0);
    });
    return total;
  }

  _assertPetInstanceFieldExists(guid, name, instance) {
    this._petDamage[guid] = this._petDamage[guid] || { name, instances: {}, total: 0 };
    this._petDamage[guid].instances[instance] = this._petDamage[guid].instances[instance] || 0;
  }

  _getPetInfo(id, guid = false) {
    let pet;
    if (guid) {
      pet = this.owner.playerPets.find(pet => pet.guid === id);
    }
    else {
      pet = this.owner.playerPets.find(pet => pet.id === id);
    }
    if (!pet) {
      debug && this.log(`NewPets._getPetInfo() called with nonexistant pet ${guid ? 'gu' : ''}id ${id}`);
      return null;
    }
    return pet;
  }

  _getPetGuid(id, guid = false) {
    const pet = this._getPetInfo(id, guid);
    return pet ? pet.guid : null;
  }
}

export default NewPets;
