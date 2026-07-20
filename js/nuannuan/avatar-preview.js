/**
 * 暖暖风分层 SVG 角色预览（功能原型）
 * 图层：发后 → 腿 → 鞋 → 裙/上装 → 颈脸 → 五官 → 臂/袖 → 刘海 → 配饰
 */
import {
  findById,
  HAIR_COLORS,
  SKIN_TONES,
  EYE_STYLES,
  STARTER_OUTFITS,
  BODY_TYPES,
} from "./avatar-config.js";

const BODY_PARAMS = {
  slender: { sh: 26, waist: 17, hip: 25, armW: 9, legW: 13, legLen: 500, bust: 0 },
  slim: { sh: 26, waist: 17, hip: 25, armW: 9, legW: 13, legLen: 500, bust: 0 },
  balanced: { sh: 30, waist: 21, hip: 30, armW: 10.5, legW: 16, legLen: 494, bust: 2 },
  standard: { sh: 30, waist: 21, hip: 30, armW: 10.5, legW: 16, legLen: 494, bust: 2 },
  lively: { sh: 34, waist: 26, hip: 35, armW: 12, legW: 19, legLen: 482, bust: 4 },
};

const HAIR_STYLE_IDX = {
  wave_long: 0, princess: 1, twin: 2, bob: 3, side_braid: 4,
  short_neat: 3, soft_part: 0, messy: 1, pony_low: 5, curtain: 2, high_tail: 5,
};
const FACE_IDX = { standard: 0, round: 1, soft: 0, sharp: 2, oval: 0 };
const OUTFIT_IDX = { scholar: 0, traveler: 1, night: 2 };
const ACC_IDX = {
  bow: 0, lace: 1, star: 2, pearl: 1, flower: 0,
  brooch: 2, glasses: 1, earcuff: 2, pendant: 1, band: 0,
};

function facePath(i) {
  if (i === 1) {
    return "M105,88 Q105,126 122,142 Q136,155 150,156 Q164,155 178,142 Q195,126 195,88 Q193,46 150,41 Q107,46 105,88 Z";
  }
  if (i === 2) {
    return "M108,84 Q106,120 126,138 Q140,148 150,157 Q160,148 174,138 Q194,120 192,84 Q192,46 150,41 Q108,46 108,84 Z";
  }
  return "M108,86 Q107,122 123,139 Q136,152 150,153 Q164,152 177,139 Q193,122 192,86 Q192,48 150,43 Q108,48 108,86 Z";
}

function eyes(uid, E, faceIdx) {
  const ry = faceIdx === 1 ? 12.8 : 12;
  const one = (cx, f) => `
    <path d="M${cx + f * 9},96 Q${cx},92 ${cx - f * 8},95.5" fill="none" stroke="#caa4b2" stroke-width="1.1" opacity="0.8"/>
    <ellipse cx="${cx}" cy="110" rx="10" ry="${ry}" fill="#fff" stroke="#decfda" stroke-width="0.6"/>
    <ellipse cx="${cx}" cy="111" rx="8" ry="10.5" fill="url(#iris-${uid})"/>
    <ellipse cx="${cx}" cy="105" rx="8" ry="5" fill="${E.rim}" opacity="0.45"/>
    <ellipse cx="${cx}" cy="112" rx="3.8" ry="5" fill="#221623"/>
    <ellipse cx="${cx}" cy="117" rx="4.4" ry="2" fill="${E.iris}" opacity="0.55"/>
    <circle cx="${cx - 3}" cy="104.5" r="3" fill="#fff" opacity="0.95"/>
    <circle cx="${cx + 3.4}" cy="115" r="1.8" fill="#fff" opacity="0.85"/>
    <path d="M${cx + f * 12},104 Q${cx},94.5 ${cx - f * 10},102" fill="none" stroke="#2c1f28" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M${cx + f * 11.6},104.4 Q${cx + f * 15},101 ${cx + f * 16.4},96.8" fill="none" stroke="#2c1f28" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M${cx + f * 8},121.5 Q${cx},124.5 ${cx - f * 7},122.5" fill="none" stroke="#b895a8" stroke-width="1.3" opacity="0.8"/>`;
  return one(130, -1) + one(170, 1);
}

function browsAndMouth(H, S, faceIdx) {
  const blush = faceIdx === 1 ? 0.5 : faceIdx === 2 ? 0.22 : 0.32;
  return `
    <path d="M119,88.5 Q130,83.5 139,87" fill="none" stroke="${H.dark}" stroke-width="2" stroke-linecap="round"/>
    <path d="M161,87 Q170,83.5 181,88.5" fill="none" stroke="${H.dark}" stroke-width="2" stroke-linecap="round"/>
    <path d="M150.5,123 q1.6,2 0,3.8" fill="none" stroke="${S.shade}" stroke-width="1.3" stroke-linecap="round"/>
    <path d="M144.5,135 Q150,139.8 155.5,135" fill="none" stroke="#c26875" stroke-width="2.2" stroke-linecap="round"/>
    <ellipse cx="122" cy="123" rx="7" ry="3.6" fill="#f7a8b8" opacity="${blush}"/>
    <ellipse cx="178" cy="123" rx="7" ry="3.6" fill="#f7a8b8" opacity="${blush}"/>`;
}

function hairSet(styleIdx, uid, H) {
  const g = `url(#hair-${uid})`;
  const cap = `<path d="M104,98 Q95,34 150,28 Q205,34 196,98 Q192,64 150,54 Q108,64 104,98 Z" fill="${g}" stroke="${H.dark}" stroke-width="1.3"/>`;
  const bangs = `
    <path d="M104,94 Q104,48 150,42 Q196,48 196,94 Q189,84 181,92 Q175,66 163,87 Q154,64 146,87 Q135,66 125,91 Q113,83 104,94 Z" fill="${g}" stroke="${H.dark}" stroke-width="1.3"/>
    <path d="M120,60 Q150,50 180,60" fill="none" stroke="${H.light}" stroke-width="2.2" stroke-linecap="round" opacity="0.55"/>`;

  let back = "";
  if (styleIdx === 0) {
    back = `
      <path d="M104,78 Q78,140 88,205 Q74,268 90,330 Q78,392 96,442 Q108,452 114,438 Q100,386 112,330 Q100,270 114,210 Q104,144 118,84 Z" fill="${g}" stroke="${H.dark}" stroke-width="1.3"/>
      <path d="M196,78 Q222,140 212,205 Q226,268 210,330 Q222,392 204,442 Q192,452 186,438 Q200,386 188,330 Q200,270 186,210 Q196,144 182,84 Z" fill="${g}" stroke="${H.dark}" stroke-width="1.3"/>`;
  } else if (styleIdx === 1) {
    back = `
      <path d="M104,82 Q86,150 94,225 Q88,272 98,306 L120,296 Q110,255 116,205 Q108,148 118,86 Z" fill="${g}" stroke="${H.dark}" stroke-width="1.3"/>
      <path d="M196,82 Q214,150 206,225 Q212,272 202,306 L180,296 Q190,255 184,205 Q192,148 182,86 Z" fill="${g}" stroke="${H.dark}" stroke-width="1.3"/>
      <circle cx="100" cy="316" r="13" fill="${g}"/><circle cx="200" cy="316" r="13" fill="${g}"/>
      <circle cx="100" cy="336" r="10" fill="${g}"/><circle cx="200" cy="336" r="10" fill="${g}"/>`;
  } else if (styleIdx === 2) {
    back = `
      <path d="M106,66 Q64,130 76,205 Q62,272 84,330 Q96,340 102,326 Q88,274 100,214 Q92,142 116,74 Z" fill="${g}" stroke="${H.dark}" stroke-width="1.3"/>
      <path d="M194,66 Q236,130 224,205 Q238,272 216,330 Q204,340 198,326 Q212,274 200,214 Q208,142 184,74 Z" fill="${g}" stroke="${H.dark}" stroke-width="1.3"/>
      <circle cx="108" cy="63" r="6.5" fill="#e88ab0"/><circle cx="192" cy="63" r="6.5" fill="#e88ab0"/>`;
  } else if (styleIdx === 3) {
    back = `
      <path d="M104,80 Q92,134 98,172 Q102,190 122,184 Q112,154 114,100 Z" fill="${g}" stroke="${H.dark}" stroke-width="1.3"/>
      <path d="M196,80 Q208,134 202,172 Q198,190 178,184 Q188,154 186,100 Z" fill="${g}" stroke="${H.dark}" stroke-width="1.3"/>`;
  } else if (styleIdx === 4) {
    back = `
      <path d="M196,80 Q206,130 200,166 Q194,182 180,176 Q188,148 184,98 Z" fill="${g}" stroke="${H.dark}" stroke-width="1.3"/>
      <path d="M104,80 Q96,126 102,164 L120,156 Q112,128 114,96 Z" fill="${g}" stroke="${H.dark}" stroke-width="1.3"/>
      <ellipse cx="104" cy="188" rx="11" ry="9" fill="${g}"/><ellipse cx="102" cy="210" rx="10" ry="8" fill="${g}"/>
      <ellipse cx="100" cy="230" rx="9" ry="7" fill="${g}"/><circle cx="99" cy="252" r="5" fill="#e26a9a"/>`;
  } else {
    back = `
      <ellipse cx="150" cy="26" rx="22" ry="12" fill="${g}" stroke="${H.dark}" stroke-width="1.2"/>
      <path d="M162,30 Q208,74 200,145 Q214,205 194,266 Q184,278 178,264 Q192,208 180,152 Q188,92 152,40 Z" fill="${g}" stroke="${H.dark}" stroke-width="1.3"/>
      <path d="M158,26 Q166,18 174,26 Q166,34 158,26 Z" fill="#e26a9a"/>`;
  }
  return { back: back + cap, front: bangs };
}

function scallop(xL, xR, y, n, d) {
  const wd = (xR - xL) / n;
  let p = "";
  for (let i = 0; i < n; i++) p += ` Q${xL + wd * (i + 0.5)},${y + d} ${xL + wd * (i + 1)},${y}`;
  return p;
}

function outfitSet(idx, uid, B, pal) {
  const w = B.waist, sh = B.sh, hip = B.hip, L = B.legLen;
  const cxL = 150 - hip * 0.42, cxR = 150 + hip * 0.42;
  const exd = (d) => 150 + d * (sh + 13);
  const hxd = (d) => 150 + d * (sh + 7);
  const bustArcs = `<path d="M${150 - 14 - B.bust},205 q7,6 14,0 M${150 + B.bust},205 q7,6 14,0" fill="none" stroke="${pal.deep}" stroke-width="1.2" opacity="0.45"/>`;

  if (idx === 0) {
    const pump = (cx) => `
      <path d="M${cx - 7},${L - 5} Q${cx},${L - 10} ${cx + 7},${L - 5} Q${cx + 10},${L + 5} ${cx},${L + 9} Q${cx - 10},${L + 5} ${cx - 7},${L - 5} Z" fill="${pal.main}" stroke="${pal.deep}" stroke-width="1.2"/>
      <rect x="${cx - 1.6}" y="${L + 8}" width="3.4" height="7" rx="1.4" fill="${pal.deep}"/>`;
    return {
      shoes: pump(cxL) + pump(cxR),
      behind: `
        <path d="M${150 - w - 2},240 C${150 - 56},282 ${150 - 76},330 ${150 - 80},404 ${scallop(150 - 80, 150 + 80, 404, 7, 11)} C${150 + 76},330 ${150 + 56},282 ${150 + w + 2},240 Z" fill="${pal.light}" stroke="${pal.deep}" stroke-width="1"/>
        <path d="M${150 - w - 1},238 C${150 - 50},276 ${150 - 66},318 ${150 - 70},378 ${scallop(150 - 70, 150 + 70, 378, 6, 13)} C${150 + 66},318 ${150 + 50},276 ${150 + w + 1},238 Z" fill="url(#skirt-${uid})" stroke="${pal.deep}" stroke-width="1.2"/>
        <path d="M${150 - 60},306 Q150,332 ${150 + 60},306" fill="none" stroke="${pal.trim}" stroke-width="2.4"/>
        <path d="M${150 - sh + 4},188 Q150,182 ${150 + sh - 4},188 L${150 + w + 1},238 L${150 - w - 1},238 Z" fill="${pal.main}" stroke="${pal.deep}" stroke-width="1.2"/>
        ${bustArcs}
        <path d="M${150 - 8},190 L${150 + 8},190 L${150 + 6},236 L${150 - 6},236 Z" fill="${pal.light}"/>
        <circle cx="150" cy="200" r="2.2" fill="${pal.accent}"/><circle cx="150" cy="212" r="2.2" fill="${pal.accent}"/><circle cx="150" cy="224" r="2.2" fill="${pal.accent}"/>
        <path d="M${150 - w - 1},232 L${150 + w + 1},232 L${150 + w - 1},240 L${150 - w + 1},240 Z" fill="${pal.accent}"/>
        <g transform="translate(${150 + w + 3},246) rotate(12)">
          <path d="M0,0 Q-13,-9 -6,-17 Q2,-11 0,0 Q13,-9 6,-17 Q-2,-11 0,0 Z" fill="${pal.accent}"/>
          <circle r="3" fill="#8f6cc0"/>
        </g>`,
      over: `
        <ellipse cx="${150 - sh}" cy="194" rx="12" ry="10" fill="${pal.light}" stroke="${pal.deep}" stroke-width="1.1"/>
        <ellipse cx="${150 + sh}" cy="194" rx="12" ry="10" fill="${pal.light}" stroke="${pal.deep}" stroke-width="1.1"/>`,
    };
  }

  if (idx === 1) {
    return {
      shoes: "",
      behind: `
        <path d="M${150 - w},240 Q${150 - 108},380 ${150 - 72},545 Q150,560 ${150 + 72},545 Q${150 + 108},380 ${150 + w},240 Z" fill="${pal.accent}" opacity="0.16"/>
        <path d="M${150 - w - 1},238 C${150 - 54},320 ${150 - 70},440 ${150 - 76},546 Q150,564 ${150 + 76},546 C${150 + 70},440 ${150 + 54},320 ${150 + w + 1},238 Z" fill="url(#skirt-${uid})" stroke="${pal.deep}" stroke-width="1.1"/>
        <path d="M150,252 Q${150 - 38},400 ${150 - 32},536 Q150,552 ${150 + 32},536 Q${150 + 38},400 150,252 Z" fill="${pal.light}" opacity="0.85"/>
        <path d="M${150 - sh - 3},196 Q150,187 ${150 + sh + 3},196 L${150 + w + 1},238 L${150 - w - 1},238 Z" fill="${pal.light}" stroke="${pal.deep}" stroke-width="1.1"/>
        ${bustArcs}
        <g transform="translate(150,222)">
          <path d="M0,0 Q-14,-10 -6,-18 Q2,-12 0,0 Q14,-10 6,-18 Q-2,-12 0,0 Z" fill="${pal.accent}"/>
          <circle r="3.2" fill="#5f7fc0"/>
        </g>`,
      over: `
        <path d="M${exd(-1)},243 Q${150 - (sh + 13)},270 ${hxd(-1)},294" fill="none" stroke="${pal.light}" stroke-width="${B.armW * 0.82 + 1.5}" stroke-linecap="round"/>
        <path d="M${exd(1)},243 Q${150 + (sh + 13)},270 ${hxd(1)},294" fill="none" stroke="${pal.light}" stroke-width="${B.armW * 0.82 + 1.5}" stroke-linecap="round"/>
        <ellipse cx="${hxd(-1)}" cy="298" rx="${B.armW * 0.5 + 1}" ry="${B.armW * 0.62 + 1}" fill="${pal.light}"/>
        <ellipse cx="${hxd(1)}" cy="298" rx="${B.armW * 0.5 + 1}" ry="${B.armW * 0.62 + 1}" fill="${pal.light}"/>`,
    };
  }

  const tier = (yBot, halfBot, fill, n, op) => `
    <path d="M${150 - w - 1},238 C${150 - halfBot + 8},264 ${150 - halfBot},${yBot - 30} ${150 - halfBot},${yBot} ${scallop(150 - halfBot, 150 + halfBot, yBot, n, 10)} C${150 + halfBot},${yBot - 30} ${150 + halfBot - 8},264 ${150 + w + 1},238 Z" fill="${fill}" stroke="#151020" stroke-width="1.1" opacity="${op}"/>`;
  const boot = (cx) => `
    <path d="M${cx - 7.5},${L - 78} L${cx + 7.5},${L - 78} Q${cx + 9},${L - 30} ${cx + 8},${L - 6} Q${cx + 11},${L + 4} ${cx + 3},${L + 9} Q${cx - 9},${L + 9} ${cx - 8},${L - 6} Q${cx - 9},${L - 30} ${cx - 7.5},${L - 78} Z" fill="${pal.trim}" stroke="#151020" stroke-width="1.2"/>
    <path d="M${cx - 8},${L - 78} h16 l-1,6 h-14 Z" fill="${pal.accent}"/>`;
  return {
    shoes: boot(cxL) + boot(cxR),
    behind: `
      ${tier(410, 82, pal.main, 7, 1)}
      ${tier(365, 68, pal.accent, 6, 0.9)}
      ${tier(322, 52, pal.light, 5, 1)}
      <path d="M${150 - sh + 3},190 Q150,184 ${150 + sh - 3},190 L${150 + w + 1},238 L${150 - w - 1},238 Z" fill="${pal.main}" stroke="#151020" stroke-width="1.2"/>
      <path d="M${150 - 9},204 L${150 + 9},214 M${150 + 9},204 L${150 - 9},214 M${150 - 9},214 L${150 + 9},224 M${150 + 9},214 L${150 - 9},224" stroke="${pal.accent}" stroke-width="1.7"/>
      ${bustArcs}`,
    over: `
      <path d="M${exd(-1)},243 Q${150 - (sh + 13)},270 ${hxd(-1)},292" fill="none" stroke="${pal.main}" stroke-width="${B.armW * 0.82 + 2}" stroke-linecap="round" opacity="0.92"/>
      <path d="M${exd(1)},243 Q${150 + (sh + 13)},270 ${hxd(1)},292" fill="none" stroke="${pal.main}" stroke-width="${B.armW * 0.82 + 2}" stroke-linecap="round" opacity="0.92"/>
      <path d="M143,160 Q150,164 157,160" fill="none" stroke="${pal.accent}" stroke-width="3"/>`,
  };
}

function accessorySVG(idx) {
  if (idx === 0) {
    return `<g transform="translate(185,50) rotate(18)">
      <path d="M0,0 Q-16,-11 -7,-20 Q2,-13 0,0 Q16,-11 7,-20 Q-2,-13 0,0 Z" fill="#f4a0b8" stroke="#d4788f" stroke-width="1.3"/>
      <circle r="3.6" fill="#d4788f"/>
    </g>`;
  }
  if (idx === 1) {
    return `<path d="M103,68 Q150,44 197,68" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity="0.92"/>
      <circle cx="110" cy="64" r="2.8" fill="#fff"/><circle cx="150" cy="47" r="3.2" fill="#fff"/><circle cx="190" cy="64" r="2.8" fill="#fff"/>`;
  }
  if (idx === 2) {
    return `<text x="106" y="74" font-size="16" fill="#e8c34f">✦</text><text x="184" y="80" font-size="12" fill="#e8c34f">✦</text>`;
  }
  return "";
}

/**
 * @param {import('./avatar-config.js').AvatarConfig} cfg
 * @param {string} [uid]
 */
export function buildAvatarSVG(cfg, uid = "main") {
  const B = BODY_PARAMS[cfg.bodyType] || BODY_PARAMS.balanced;
  const H = findById(HAIR_COLORS, cfg.hairColor);
  const S = findById(SKIN_TONES, cfg.skinTone);
  const E = findById(EYE_STYLES, cfg.eyeStyle);
  const O = findById(STARTER_OUTFITS, cfg.starterOutfit);
  const hair = hairSet(HAIR_STYLE_IDX[cfg.hairStyle] ?? 0, uid, H);
  const fit = outfitSet(OUTFIT_IDX[cfg.starterOutfit] ?? 0, uid, B, O.pal);
  const faceI = FACE_IDX[cfg.faceShape] ?? 0;
  const accI = cfg.accessory == null ? -1 : (ACC_IDX[cfg.accessory] ?? -1);
  const hip = B.hip;
  const cxL = 150 - hip * 0.42, cxR = 150 + hip * 0.42;
  const t = B.legW / 2, k = B.legW * 0.36, a = B.legW * 0.24;
  const L = B.legLen;
  const skirtTop = cfg.starterOutfit === "traveler" ? "#ffffff" : O.pal.light;
  const skirtBot = cfg.starterOutfit === "traveler" ? O.pal.trim : O.pal.main;
  const sh = B.sh, w = B.waist;

  const leg = (cx, dir) => `
    <path d="M${cx - t},266 Q${cx - t - 1},330 ${cx - k},385 Q${cx - a - 1},440 ${cx - a},${L} L${cx + a},${L} Q${cx + a + 1},440 ${cx + k},385 Q${cx + t + 1},330 ${cx + t},266 Z" fill="${S.base}"/>
    <ellipse cx="${cx + dir * 3}" cy="${L + 5}" rx="9" ry="5.5" fill="${S.base}"/>`;
  const arm = (dir) => {
    const sx = 150 + dir * (sh - 3);
    const ex = 150 + dir * (sh + 13);
    const hx = 150 + dir * (sh + 7);
    return `
      <path d="M${sx},192 Q${150 + dir * (sh + 8)},215 ${ex},243" fill="none" stroke="${S.base}" stroke-width="${B.armW}" stroke-linecap="round"/>
      <path d="M${ex},243 Q${150 + dir * (sh + 13)},270 ${hx},294" fill="none" stroke="${S.base}" stroke-width="${B.armW * 0.82}" stroke-linecap="round"/>
      <ellipse cx="${hx}" cy="299" rx="${B.armW * 0.5}" ry="${B.armW * 0.62}" fill="${S.base}"/>`;
  };

  return `<svg class="avatar-svg" viewBox="0 0 300 620" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="角色形象预览">
    <defs>
      <radialGradient id="iris-${uid}" cx="50%" cy="40%" r="62%">
        <stop offset="0%" stop-color="${E.iris}"/><stop offset="100%" stop-color="${E.rim}"/>
      </radialGradient>
      <linearGradient id="hair-${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${H.light}"/><stop offset="35%" stop-color="${H.base}"/><stop offset="100%" stop-color="${H.dark}"/>
      </linearGradient>
      <linearGradient id="skirt-${uid}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${skirtTop}"/><stop offset="100%" stop-color="${skirtBot}"/>
      </linearGradient>
    </defs>
    <ellipse cx="150" cy="${L + 16}" rx="82" ry="11" fill="#6a4e8a" opacity="0.18"/>
    ${hair.back}
    <path d="M144,138 L143.5,172 Q150,178 156.5,172 L156,138 Z" fill="${S.base}"/>
    <path d="M141,166 Q${150 - sh + 3},173 ${150 - sh},188 Q${150 - sh + 3},214 ${150 - w},236 Q${150 - hip},252 ${150 - hip + 2},272 L${150 + hip - 2},272 Q${150 + hip},252 ${150 + w},236 Q${150 + sh - 3},214 ${150 + sh},188 Q${150 + sh - 3},173 159,166 Z" fill="${S.base}"/>
    ${leg(cxL, -1)}${leg(cxR, 1)}
    ${fit.shoes}
    ${fit.behind}
    <path d="${facePath(faceI)}" fill="${S.base}" stroke="${S.shade}" stroke-width="1.4"/>
    ${eyes(uid, E, faceI)}
    ${browsAndMouth(H, S, faceI)}
    ${arm(-1)}${arm(1)}
    ${fit.over}
    ${hair.front}
    ${accessorySVG(accI)}
  </svg>`;
}

export function outfitAura(outfitId) {
  return findById(STARTER_OUTFITS, outfitId).aura;
}

export function bodyLabel(id) {
  return findById(BODY_TYPES, id).label;
}
