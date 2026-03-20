'use strict'
/* eslint-disable no-unused-vars */
// eslint-disable-next-line no-unused-vars

/**Fonts */
//import { fontChs } from './fonts/fontChs.js';
import fontLatin  from './fonts/fontLatin.js';
import fontCh  from './fonts/fontCht.js';
import fontJpn  from './fonts/fontJpn.js';
import fontKor  from './fonts/fontKor.js';
import text1 from './fonts/font1.js'
import text2 from './fonts/font2.js';
import text3  from './fonts/font3.js';
/**Fonts */

import pokedex from './resources/Showdown/pokedex.js';
import natures from './resources/Showdown/natures.js';
import PokeTranslator from './resources/Pokes/TranslatorPokes.js';
import AbilityTranslator from './resources/Abilities/TranslatorAbilities.js';
import TypeTranslator from './resources/Types/TranslatorTypes.js';
import ItemTranslator from './resources/Items/TranslatorItems.js';
import MoveTranslator from './resources/Moves/TranslatorMoves.js';

import { jsPDF } from 'jspdf';
import { Koffing } from './koff.mjs';


export async function generateTeamPDF(data) {
  const {
    playerName,
    trainerName,
    teamName,
    switchName,
    playerId,
    birth,
    ageDivision,
    sheet,
    lang,
    paste
  } = data;

  const fontMap = {
    Cht: fontCh,
    Chs: fontCh,
    Jpn: fontJpn,
    Kor: fontKor
  }

  //const selectedFont = fontMap[lang] || fontLatin

  if (!sheet || !paste || !lang) {
    throw new Error('Missing required data')
  }

  let msg, x, y, mygap;

  const parsedTeam = Koffing.parse(paste)

  const doc = new jsPDF();

  loadBaseFonts(doc)

  let chosenLang = '';

  let pokes = parsedTeam.teams[0].pokemon;

  let ivs = {'hp': 31, 'atk': 31, 'def': 31, 'spa': 31, 'spd': 31, 'spe': 31};
  let evs = {'hp': 0, 'atk': 0, 'def': 0, 'spa': 0, 'spd': 0, 'spe': 0};
  let level = 100;
  let nature = 'Serious';

  let statX = 100;
  let pokeY = 67;
  let levelY = pokeY + 9.5;
  let gapx = 21;


  if (sheet == 'open' || sheet == 'staff'){
    chosenLang = lang;

    const selectedFont = fontMap[lang] || fontLatin

    doc.addFileToVFS("customFont.ttf", selectedFont)
    doc.addFont("customFont.ttf", "customFont", "normal")
    doc.setFont("customFont", "normal")

    doc.setFontSize(7);
    doc.setFont("text2", 'normal');
    msg = "All Pokémon must be listed exactly as they appear in the Battle Team,";
    doc.text(50, 272, msg);

    doc.setFont("text1", 'normal');
    msg = "at the level they are in the game.";
    doc.text(120.5, 272, msg);

    doc.setFontSize(13);
    doc.setFont("text1", 'normal');
    msg = "Pokémon Video Game Team List";
    doc.text(73, 12.5, msg);

    doc.setLineWidth(0.3);
    x = 45;
    y = 34.5;
    mygap = 7;
    for (let i = 0; i < 4; i++) {
        doc.line(x, y+mygap*i, x+65, y+mygap*i);
    }

    doc.setFontSize(12);
    doc.setFont("text1", 'normal');

    msg = "Player Name: ";
    doc.text(45, 33, msg, "right");

    doc.setFontSize(9);

    msg = "Trainer Name in Game: ";
    doc.text(45, 40, msg, "right");

    msg = "Battle Team Number / Name: ";
    doc.text(45, 47, msg, "right");

    msg = "Switch Profile Name: ";
    doc.text(45, 54, msg, "right");

    x = 155;
    gapx = 21;
    for (let i = 0; i < 3; i++) {
        doc.rect(x + gapx * i, 30, 4, 4);
    }

    msg = "Age Division: ";
    doc.text(140, 33, msg, "right");
    msg = "Juniors ";
    doc.text(154, 33, msg, "right");
    msg = "Seniors ";
    doc.text(175, 33, msg, "right");
    msg = "Masters ";
    doc.text(196, 33, msg, "right");

    doc.setFont("text2", 'normal');
    doc.setFontSize(13);
    doc.text(playerName, 47, 33);
    doc.text(trainerName, 47, 40);
    doc.text(teamName, 47, 47);
    doc.text(switchName, 47, 54);

    for (let i = 0; i < 6; i++) {
        doc.setLineWidth(0.6);
        x = 6.5 + 99 * (i%2);
        y = 59.5 + 70 * Math.floor(i/2);
        doc.rect(x, y, 95, 68);

        doc.setLineWidth(0.4);
        let startY = 12;
        mygap = 8;
        for (let b = 0; b < 7; b++) {
            doc.line(x, y+startY+mygap*b, x+95, y+startY+mygap*b);
        }
    }

    if (ageDivision !== undefined && ageDivision !== null){
        //ageDivision = ageDivision.value;
        doc.setLineWidth(1);
        let posX = 154 + 21 * ageDivision;
        doc.line(posX, 29, posX+6, 35);
        doc.line(posX+6, 29, posX, 35);
    }

    const t = await loadTranslations(lang);

    for (let i = 0; i < pokes.length; i++) {

      let textX = 35;
      statX = 100;
      let gapX = 100;
      let textXX = 27.5;

      pokeY = 67;
      let teraY = pokeY + 9.5;
      levelY = pokeY + 9.5;
      let abilityY = pokeY + 18;
      let itemY = pokeY + 26;
      let gapY = 70;

      let moveY = pokeY + 34;
      let moveGapY = 8;

      let nameId = PokeTranslator[pokes[i].name];
      let abilityId = AbilityTranslator[pokes[i].ability];
      let teraTypeId = TypeTranslator[pokes[i].teraType];

      let itemId = 'NOITEM';
      if (pokes[i].item){
          itemId = ItemTranslator[pokes[i].item];
      }

      if (pokes[i].nature){
          nature = pokes[i].nature;
      }

      if (pokes[i].level){
        level = pokes[i].level;
      }

      if (pokes[i].ivs) {
        for (const [key, value] of Object.entries(pokes[i].ivs)){
          ivs[key] = value;
        }
      }

      if (pokes[i].evs){
        for (const [key, value] of Object.entries(pokes[i].evs)){
          evs[key] = value;
        }
      }

      if (!pokedex[pokes[i].name]){
        throw new Error('ERROR IN PASTE')
      }      

      let name = t.pokes[nameId];
      let teraType = t.types[teraTypeId];
      let ability = t.abilities[abilityId];

      let item = 'NO ITEM';
      if (itemId != 'NOITEM'){
          item = t.items[itemId];
      }
      let movs = [];
      for (let x = 0; x < pokes[i].moves.length; x++){
          let moveId = MoveTranslator[pokes[i].moves[x]];
          movs.push(t.moves[moveId]);
      }

      //Nombre
      doc.setFontSize(13);
      doc.setFont("text1", 'normal');
      doc.text("Pokémon", textXX + (i%2) * gapX, pokeY + (Math.floor(i/2)) * gapY, "right");
      doc.setFontSize(12);
      doc.setFont("customFont", 'normal');
      doc.text(name, textX + (i%2) * gapX, pokeY + (Math.floor(i/2)) * gapY);

      //TeraType
      doc.setFontSize(13);
      doc.setFont("text1", 'normal');
      doc.text("Tera Type", textXX + (i%2) * gapX, teraY + (Math.floor(i/2)) * gapY, "right");
      doc.setFontSize(11);
      doc.setFont("customFont", 'normal');
      doc.text(teraType, textX + (i%2) * gapX, teraY + (Math.floor(i/2)) * gapY);

      //Ability
      doc.setFontSize(13);
      doc.setFont("text1", 'normal');
      doc.text("Ability", textXX + (i%2) * gapX, abilityY + (Math.floor(i/2)) * gapY, "right");
      doc.setFontSize(11);
      doc.setFont("customFont", 'normal');
      doc.text(ability, textX + (i%2) * gapX, abilityY + (Math.floor(i/2)) * gapY);

      //Item
      doc.setFontSize(13);
      doc.setFont("text1", 'normal');
      doc.text("Held Item", textXX + (i%2) * gapX, itemY + (Math.floor(i/2)) * gapY, "right");
      doc.setFontSize(11);
      doc.setFont("customFont", 'normal');
      doc.text(item, textX + (i%2) * gapX, itemY + (Math.floor(i/2)) * gapY);

      for (let j = 0; j < movs.length; j++) {
        doc.setFontSize(13);
        doc.setFont("text1", 'normal');
        doc.text("Move " + (j+1), textXX + (i%2) * gapX, moveY + (Math.floor(i/2)) * gapY + j * moveGapY, "right");
        doc.setFontSize(11);
        doc.setFont("customFont", 'normal');
        doc.text(movs[j], textX + (i%2) * gapX, moveY + (Math.floor(i/2)) * gapY + j * moveGapY);
      }
    }
    
  }

  if (sheet === 'open') {
      doc.setFontSize(13);
      doc.setFont("text1", 'normal');
      msg = "2 of 2: ";
      doc.text(83, 18, msg);

      doc.setFont("text3", 'normal');
      msg = "For Opponents";
      doc.text(96, 18, msg);

      doc.setFontSize(10);
      doc.setFont("text3", 'normal');
      msg = "Do not lose this page! Keep it throughout the tournament, sharing it with your opponent each round.";
      doc.text(31, 24, msg);

      doc.save(playerId+"-"+playerName+"-openTeamSheet.pdf");

  }

  if (sheet == 'staff') {
      doc.setFontSize(13);
      doc.setFont("text1", 'normal');
      msg = "1 of 2: ";
      doc.text(77, 18, msg);

      doc.setFont("text3", 'normal');
      msg = "For Tournament Staff";
      doc.text(90, 18, msg);

      doc.setFontSize(10);
      doc.setFont("text3", 'normal');
      msg = "Complete both pages of this document. Submit this page to event staff before the tournament, at the time set by the Organizer.";
      doc.text(12, 24, msg);

      doc.setLineWidth(0.3);
      doc.setFontSize(9);
      doc.setFont("text1", 'normal');
      msg = "Player ID: ";
      doc.text(140, 43, msg, "right");
      doc.line(140, 44.5, 180, 44.5);
      doc.setFontSize(13);
      doc.setFont("text2", 'normal');
      doc.text(playerId, 142, 43);

      doc.setFontSize(9);
      doc.setFont("text1", 'normal');
      msg = "Date of Birth: ";
      doc.text(140, 51, msg, "right");
      doc.line(140, 52.5, 180, 52.5);
      doc.setFontSize(13);
      doc.setFont("text2", 'normal');
      doc.text(birth, 142, 51);


      for (let i = 0; i < 6; i++) {
          doc.setLineWidth(0.4);
          x = 6.5 + 99 * (i%2);
          y = 59.5 + 70 * Math.floor(i/2);

          doc.line(x+80, y+12, x+80, y+68);
          doc.setFontSize(6);
          doc.setFont("text1", 'normal');
          doc.text(x+81, y+14, "Level");
          doc.text(x+81, y+22, "HP");
          doc.text(x+81, y+30, "Atk");
          doc.text(x+81, y+38, "Def");
          doc.text(x+81, y+46, "Sp. Atk");
          doc.text(x+81, y+54, "Sp. Def");
          doc.text(x+81, y+62, "Speed");
      }

      doc.setFontSize(11);
      doc.setFont("customFont", 'normal');

      for (let i = 0; i < pokes.length; i++) {

        let stats = getStats(pokes[i].name, pokes[i].ivs, pokes[i].evs, pokes[i].level, pokes[i].nature);

        let gapX = 100, gapY = 70;

        let statY = pokeY + 19;
        let statGapY = 8;


        let level = pokes[i].level ? pokes[i].level : 100;

        doc.text(level.toString(), statX + (i%2) * (gapX-1), levelY + (Math.floor(i/2)) * gapY, 'right');

        let j = 0;
        for (const [key, value] of Object.entries(stats)){
            doc.text(value.toString(), statX + (i%2) * (gapX-1), statY + (Math.floor(i/2)) * gapY + j * statGapY, 'right');

            j = j + 1;
        }
      }
      doc.save(playerId+"-"+playerName+"-closedTeamSheet.pdf");

  }
}


function getStats( poke, ivs = {}, evs = {}, level = 100, nat) {
  ivs = validateIVs(normalizeIVs(ivs));
  evs = validateEVs(normalizeEVs(evs));

  let ret = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  let baseStats = pokedex[poke];
  let nature = natures[nat];
  let stat = 0;

  for (const [key, value] of Object.entries(baseStats)) {
    if (key == 'hp') {
      stat = Math.floor(((((2 * baseStats.hp) + (evs.hp / 4) + ivs.hp) * level) / 100) + level + 10);
      ret['hp'] = stat;
    } else {
      stat = Math.floor(
        Math.floor(((((2 * baseStats[key]) + (evs[key] / 4) + ivs[key]) * level) / 100) + 5)
        * nature[key]
      );
      ret[key] = stat;
    }
  }

  return ret;
}


function normalizeEVs(evs = {}) {
  const defaultEVs = {
    hp: 0,
    atk: 0,
    def: 0,
    spa: 0,
    spd: 0,
    spe: 0
  };

  return { ...defaultEVs, ...evs };
}

function normalizeIVs(ivs = {}) {
  const defaultIVs = {
    hp: 31,
    atk: 31,
    def: 31,
    spa: 31,
    spd: 31,
    spe: 31
  };

  return { ...defaultIVs, ...ivs };
}

function validateIVs(ivs) {
  for (const key in ivs) {
    if (ivs[key] > 31) ivs[key] = 31;
    if (ivs[key] < 0) ivs[key] = 0;
  }
  return ivs;
}

function validateEVs(evs) {
  let total = 0;

  for (const key in evs) {
    if (evs[key] > 252) evs[key] = 252;
    if (evs[key] < 0) evs[key] = 0;
    total += evs[key];
  }

  if (total > 510) {
    console.warn('Total EVs excede 510');
  }

  return evs;
}


async function loadTranslations(lang) {
  const [types, abilities, items, moves, pokes] = await Promise.all([
    import(`./resources/Types/Types${lang}.js`),
    import(`./resources/Abilities/Abilities${lang}.js`),
    import(`./resources/Items/Items${lang}.js`),
    import(`./resources/Moves/Moves${lang}.js`),
    import(`./resources/Pokes/Pokes${lang}.js`)
  ])

  return {
    types: types.default,
    abilities: abilities.default,
    items: items.default,
    moves: moves.default,
    pokes: pokes.default
  }
}

function loadBaseFonts(doc) {
  doc.addFileToVFS("text1.ttf", text1)
  doc.addFont("text1.ttf", "text1", "normal")

  doc.addFileToVFS("text2.ttf", text2)
  doc.addFont("text2.ttf", "text2", "normal")

  doc.addFileToVFS("text3.ttf", text3)
  doc.addFont("text3.ttf", "text3", "normal")
}