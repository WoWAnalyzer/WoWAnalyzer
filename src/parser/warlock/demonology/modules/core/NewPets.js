import Analyzer from 'parser/core/Analyzer';

/*
  TEST LOGS:
    https://www.warcraftlogs.com/reports/4cBHbZACxz3ywnpk#fight=24&type=damage-done   - Flappslock - THE EVIL ONE (Bilescourge, Vilefiend, Inner Demons, Nether Portal)
    https://www.warcraftlogs.com/reports/QhqzaZTRmWj8d76p#fight=3&type=damage-done    - Katarinna - Vilefiend, Inner Demons, Nether Portal
    https://www.warcraftlogs.com/reports/ArRBmMzpYGbV3N7g#fight=11&type=damage-done   - Ddavee - Vilefiend, Inner Demons, Nether Portal     GERMAN LOG
    https://www.warcraftlogs.com/reports/mhaYtBqvg8WTr17A#fight=1&type=damage-done    - Toned - Vilefiend, Inner Demons, Nether Portal
    https://www.warcraftlogs.com/reports/TBGRJZ9aj4FzD7wW#fight=1&type=damage-done    - Mímir - Vilefiend, Inner Demons, Nether Portal
 */
/*
  REQUIRED MODULE API (old Demo issue #1806):
    getPetCount(timestamp, petId?): number - for Sacrificed Souls and perhaps Demonic Consumption
    getPetDamage(petId): number
    getPermanentPetDamage(): number
 */
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
}

export default NewPets;







































