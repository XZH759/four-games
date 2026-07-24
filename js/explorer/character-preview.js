/**
 * 軟低多邊形 Q 版探索者 — 分層 SVG 預覽
 * 視角：0 正面 / 1 右側 / 2 背面 / 3 左側
 */
import {
  skinHex,
  hairHex,
  outfitColors,
} from "./character-config.js";

const BODY_SCALE = {
  compact: { head: 1.02, torsoH: 0.92, limb: 0.94, yShift: 8 },
  standard: { head: 1, torsoH: 1, limb: 1, yShift: 0 },
  tall: { head: 0.96, torsoH: 1.1, limb: 1.08, yShift: -6 },
};

function faceEllipse(shape) {
  // 回傳 {cx,cy,rx,ry} 或 path
  switch (shape) {
    case "round":
      return { type: "ellipse", cx: 120, cy: 88, rx: 44, ry: 42 };
    case "softSquare":
      return { type: "path", d: "M82,52 h76 a26,26 0 0,1 26,26 v40 a26,26 0 0,1 -26,26 h-76 a26,26 0 0,1 -26,-26 v-40 a26,26 0 0,1 26,-26 z" };
    case "long":
      return { type: "ellipse", cx: 120, cy: 90, rx: 36, ry: 48 };
    case "heart":
      return { type: "path", d: "M120,52 C98,44 78,58 78,78 C78,108 100,126 120,136 C140,126 162,108 162,78 C162,58 142,44 120,52 Z" };
    case "soft":
      return { type: "path", d: "M84,54 Q78,82 90,112 Q104,132 120,134 Q136,132 150,112 Q162,82 156,54 Q140,44 120,46 Q100,44 84,54 Z" };
    default:
      return { type: "ellipse", cx: 120, cy: 88, rx: 38, ry: 44 };
  }
}

function faceMarkup(shape, skin) {
  const f = faceEllipse(shape);
  if (f.type === "ellipse") {
    return `<ellipse cx="${f.cx}" cy="${f.cy}" rx="${f.rx}" ry="${f.ry}" fill="${skin}" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>`;
  }
  return `<path d="${f.d}" fill="${skin}" stroke="rgba(0,0,0,0.06)" stroke-width="1"/>`;
}

function eyesLayer(style, cxL = 104, cxR = 136, cy = 78) {
  const pair = (draw) => draw(cxL, -1) + draw(cxR, 1);
  switch (style) {
    case "oval":
      return pair((cx) => `<ellipse cx="${cx}" cy="${cy}" rx="7" ry="5.5" fill="#2a2830"/>`);
    case "curve":
      return pair((cx, d) => `<path d="M${cx - 7},${cy} Q${cx},${cy - 5} ${cx + 7},${cy}" fill="none" stroke="#2a2830" stroke-width="3" stroke-linecap="round"/>`);
    case "mono":
      return pair((cx) => `<path d="M${cx - 8},${cy - 1} h16" stroke="#2a2830" stroke-width="2.6" stroke-linecap="round"/><circle cx="${cx}" cy="${cy + 3}" r="2.4" fill="#2a2830"/>`);
    case "downturn":
      return pair((cx, d) => `<path d="M${cx - 7},${cy - 2} Q${cx},${cy + 4} ${cx + 7},${cy}" fill="none" stroke="#2a2830" stroke-width="3" stroke-linecap="round"/>`);
    case "upturn":
      return pair((cx, d) => `<path d="M${cx - 7},${cy + 1} Q${cx},${cy - 5} ${cx + 7},${cy - 1}" fill="none" stroke="#2a2830" stroke-width="3" stroke-linecap="round"/>`);
    case "wide":
      return pair((cx) => `<circle cx="${cx}" cy="${cy}" r="6.5" fill="#2a2830"/><circle cx="${cx - 2}" cy="${cy - 2}" r="1.6" fill="#fff" opacity="0.85"/>`);
    case "narrow":
      return pair((cx) => `<ellipse cx="${cx}" cy="${cy}" rx="9" ry="3.2" fill="#2a2830"/>`);
    case "half":
      return pair((cx) => `<path d="M${cx - 7},${cy} A7,7 0 0,1 ${cx + 7},${cy} Z" fill="#2a2830"/>`);
    case "soft":
      return pair((cx) => `<circle cx="${cx}" cy="${cy}" r="4.2" fill="#2a2830" opacity="0.9"/>`);
    default: // dot
      return pair((cx) => `<circle cx="${cx}" cy="${cy}" r="5" fill="#2a2830"/>`);
  }
}

function browsLayer(style, hairCol) {
  const col = hairCol;
  const y = 62;
  const draw = (cx, path) => `<path d="${path}" fill="none" stroke="${col}" stroke-width="2.8" stroke-linecap="round"/>`;
  switch (style) {
    case "straight":
      return draw(104, `M94,${y} h20`) + draw(136, `M126,${y} h20`);
    case "thin":
      return draw(104, `M95,${y + 1} Q104,${y - 2} 113,${y}`) + draw(136, `M127,${y} Q136,${y - 2} 145,${y + 1}`);
    case "thick":
      return `<path d="M94,${y} Q104,${y - 4} 114,${y}" fill="none" stroke="${col}" stroke-width="4" stroke-linecap="round"/>
        <path d="M126,${y} Q136,${y - 4} 146,${y}" fill="none" stroke="${col}" stroke-width="4" stroke-linecap="round"/>`;
    case "short":
      return draw(104, `M98,${y} Q104,${y - 3} 110,${y}`) + draw(136, `M130,${y} Q136,${y - 3} 142,${y}`);
    case "angled":
      return draw(104, `M94,${y + 2} L104,${y - 3} L114,${y}`) + draw(136, `M126,${y} L136,${y - 3} L146,${y + 2}`);
    case "high":
      return draw(104, `M95,${y - 4} Q104,${y - 8} 113,${y - 3}`) + draw(136, `M127,${y - 3} Q136,${y - 8} 145,${y - 4}`);
    case "low":
      return draw(104, `M95,${y + 4} Q104,${y + 2} 113,${y + 4}`) + draw(136, `M127,${y + 4} Q136,${y + 2} 145,${y + 4}`);
    default: // soft
      return draw(104, `M94,${y + 1} Q104,${y - 4} 114,${y}`) + draw(136, `M126,${y} Q136,${y - 4} 146,${y + 1}`);
  }
}

function mouthLayer(style) {
  const cy = 104;
  switch (style) {
    case "smile":
      return `<path d="M108,${cy} Q120,${cy + 10} 132,${cy}" fill="none" stroke="#5a3a42" stroke-width="2.6" stroke-linecap="round"/>`;
    case "arc":
      return `<path d="M112,${cy + 2} Q120,${cy + 7} 128,${cy + 2}" fill="none" stroke="#5a3a42" stroke-width="2.2" stroke-linecap="round"/>`;
    case "open":
      return `<ellipse cx="120" cy="${cy + 2}" rx="6" ry="4.5" fill="#c47884" stroke="#5a3a42" stroke-width="1.2"/>`;
    case "flat":
      return `<path d="M110,${cy + 2} h20" stroke="#5a3a42" stroke-width="2.4" stroke-linecap="round"/>`;
    case "dot":
      return `<circle cx="120" cy="${cy + 2}" r="2.8" fill="#5a3a42"/>`;
    case "softSmile":
      return `<path d="M110,${cy} Q120,${cy + 6} 130,${cy}" fill="none" stroke="#5a3a42" stroke-width="2.2" stroke-linecap="round"/>`;
    case "tiny":
      return `<path d="M116,${cy + 2} h8" stroke="#5a3a42" stroke-width="2" stroke-linecap="round"/>`;
    default:
      return `<path d="M112,${cy + 1} Q120,${cy + 3} 128,${cy + 1}" fill="none" stroke="#5a3a42" stroke-width="2.2" stroke-linecap="round"/>`;
  }
}

function hairBack(style, col) {
  const g = col;
  switch (style) {
    case "long_straight":
      return `<path d="M78,70 Q70,140 78,210 Q90,220 100,200 Q92,140 96,80 Z" fill="${g}"/><path d="M162,70 Q170,140 162,210 Q150,220 140,200 Q148,140 144,80 Z" fill="${g}"/>`;
    case "long_wave":
      return `<path d="M78,72 Q66,120 80,160 Q68,200 86,230 Q98,236 104,220 Q90,180 100,140 Q92,100 100,78 Z" fill="${g}"/><path d="M162,72 Q174,120 160,160 Q172,200 154,230 Q142,236 136,220 Q150,180 140,140 Q148,100 140,78 Z" fill="${g}"/>`;
    case "mid_straight":
      return `<path d="M80,78 Q74,130 86,165 Q96,170 102,155 Q94,120 100,84 Z" fill="${g}"/><path d="M160,78 Q166,130 154,165 Q144,170 138,155 Q146,120 140,84 Z" fill="${g}"/>`;
    case "mid_wave":
      return `<path d="M80,78 Q70,120 88,155 Q78,170 96,168 Q100,140 102,90 Z" fill="${g}"/><path d="M160,78 Q170,120 152,155 Q162,170 144,168 Q140,140 138,90 Z" fill="${g}"/>`;
    case "twin":
      return `<path d="M78,70 Q58,120 70,175 Q82,185 88,170 Q78,130 96,80 Z" fill="${g}"/><path d="M162,70 Q182,120 170,175 Q158,185 152,170 Q162,130 144,80 Z" fill="${g}"/><circle cx="82" cy="68" r="7" fill="${g}"/><circle cx="158" cy="68" r="7" fill="${g}"/>`;
    case "ponytail":
      return `<ellipse cx="120" cy="36" rx="18" ry="10" fill="${g}"/><path d="M132,40 Q168,80 160,140 Q168,170 148,190 Q138,196 134,180 Q148,150 140,100 Q146,70 128,48 Z" fill="${g}"/>`;
    case "bob":
      return `<path d="M78,70 Q72,110 84,140 Q100,150 120,148 Q140,150 156,140 Q168,110 162,70 Z" fill="${g}"/>`;
    default:
      return "";
  }
}

function hairFront(style, col) {
  const g = col;
  // 頭頂底蓋：貼住臉上方，避免斷層
  const cap = `<path d="M78,86 Q72,44 120,36 Q168,44 162,86 Q154,62 120,56 Q86,62 78,86 Z" fill="${g}"/>`;
  switch (style) {
    case "buzz":
      return `<path d="M84,80 Q78,50 120,44 Q162,50 156,80 Q148,62 120,58 Q92,62 84,80 Z" fill="${g}"/>`;
    case "short_fluffy":
      return `${cap}<path d="M78,74 Q68,58 84,48 Q92,64 98,74 M102,48 Q114,38 120,50 Q126,38 138,48 M142,74 Q148,64 156,48 Q172,58 162,74" fill="${g}"/>`;
    case "bangs_full":
      return `${cap}<path d="M86,88 Q92,62 106,78 Q114,58 120,76 Q126,58 134,78 Q148,62 154,88 Q140,80 120,84 Q100,80 86,88 Z" fill="${g}"/>`;
    case "bangs_side":
      return `${cap}<path d="M86,78 Q102,52 122,72 Q112,88 94,90 Z" fill="${g}"/><path d="M130,80 Q148,62 158,82 Q148,90 134,88 Z" fill="${g}"/>`;
    case "curly_short":
      return `${cap}<circle cx="88" cy="66" r="11" fill="${g}"/><circle cx="108" cy="50" r="12" fill="${g}"/><circle cx="132" cy="50" r="12" fill="${g}"/><circle cx="152" cy="66" r="11" fill="${g}"/>`;
    case "undercut":
      return `<path d="M90,78 Q84,48 120,40 Q156,48 150,78 Q142,60 120,56 Q98,60 90,78 Z" fill="${g}"/><path d="M86,86 Q84,108 94,124 Q102,114 100,92 Z" fill="${g}" opacity="0.9"/>`;
    case "bob":
    case "mid_straight":
    case "mid_wave":
    case "long_straight":
    case "long_wave":
    case "twin":
    case "ponytail":
      return `${cap}<path d="M88,84 Q102,62 116,78 Q120,60 124,78 Q138,62 152,84 Q136,78 120,82 Q104,78 88,84 Z" fill="${g}"/>`;
    default: // short_neat
      return `${cap}<path d="M90,82 Q106,64 120,76 Q134,64 150,82 Q132,76 120,80 Q108,76 90,82 Z" fill="${g}"/>`;
  }
}

function accessoryLayer(id, hairCol, outfit) {
  if (!id) return "";
  const c = outfitColors(outfit);
  switch (id) {
    case "backpack":
      return `<rect x="148" y="168" width="28" height="36" rx="8" fill="#6a7a8a" stroke="#4a5560" stroke-width="1.5"/>
        <rect x="152" y="176" width="20" height="12" rx="3" fill="#9fd4e8"/>`;
    case "band":
      return `<rect x="78" y="210" width="14" height="8" rx="3" fill="#9fd4e8" stroke="#5a8a9a" stroke-width="1"/>
        <circle cx="85" cy="214" r="2" fill="#fff"/>`;
    case "hat":
      return `<ellipse cx="120" cy="38" rx="42" ry="10" fill="#d4a574"/>
        <path d="M92,38 Q120,8 148,38 Z" fill="#e8c49a" stroke="#b88858" stroke-width="1"/>`;
    case "headphones":
      return `<path d="M78,70 Q70,50 120,42 Q170,50 162,70" fill="none" stroke="#4a5568" stroke-width="5" stroke-linecap="round"/>
        <rect x="70" y="68" width="14" height="22" rx="6" fill="#5a6578"/>
        <rect x="156" y="68" width="14" height="22" rx="6" fill="#5a6578"/>`;
    case "glasses":
      return `<circle cx="104" cy="78" r="10" fill="none" stroke="#3a4250" stroke-width="2.4"/>
        <circle cx="136" cy="78" r="10" fill="none" stroke="#3a4250" stroke-width="2.4"/>
        <path d="M114,78 h12" stroke="#3a4250" stroke-width="2.2"/>`;
    default:
      return "";
  }
}

function renderFront(cfg) {
  const scale = BODY_SCALE[cfg.bodyType] || BODY_SCALE.standard;
  const skin = skinHex(cfg.skinTone);
  const hair = hairHex(cfg.hairColor);
  const c = outfitColors(cfg.outfitId);
  const hs = scale.head;
  const th = scale.torsoH;
  const lm = scale.limb;
  const yShift = scale.yShift;

  const topY = 150;
  const waistY = topY + 52 * th;
  const hipY = topY + 88 * th;
  const legH = 58 * lm;
  const footY = hipY + legH + 4;
  const armW = 13 * lm;
  const armH = 62 * lm;
  const legW = 15 * lm;

  // 服裝輪廓（主題差異，不只是改色）
  let top = "";
  let bottom = "";
  let extras = "";
  if (cfg.outfitId === "campus") {
    top = `<path d="M86,${topY} Q120,${topY - 10} 154,${topY} L148,${waistY + 8} L92,${waistY + 8} Z" fill="${c.top}"/>
      <rect x="112" y="${topY + 10}" width="16" height="${waistY - topY - 4}" rx="3" fill="${c.accent}" opacity="0.75"/>`;
    bottom = `<rect x="94" y="${waistY + 2}" width="52" height="${legH * 0.72}" rx="10" fill="${c.bottom}"/>`;
  } else if (cfg.outfitId === "sport") {
    top = `<path d="M88,${topY + 2} Q120,${topY - 6} 152,${topY + 2} L146,${waistY + 6} Q120,${waistY + 12} 94,${waistY + 6} Z" fill="${c.top}"/>
      <path d="M100,${topY + 18} h40" stroke="${c.accent}" stroke-width="4" opacity="0.85"/>`;
    bottom = `<path d="M96,${waistY} L108,${hipY + legH * 0.55} L132,${hipY + legH * 0.55} L144,${waistY} Z" fill="${c.bottom}"/>`;
  } else if (cfg.outfitId === "tech") {
    top = `<rect x="90" y="${topY}" width="60" height="${waistY - topY + 10}" rx="12" fill="${c.top}"/>
      <rect x="100" y="${topY + 14}" width="40" height="10" rx="4" fill="${c.accent}" opacity="0.8"/>`;
    bottom = `<rect x="98" y="${waistY + 4}" width="44" height="${legH * 0.7}" rx="8" fill="${c.bottom}"/>`;
    extras = `<rect x="148" y="${topY + 22}" width="10" height="16" rx="2" fill="${c.accent}"/>`;
  } else if (cfg.outfitId === "travel") {
    top = `<path d="M84,${topY + 4} Q120,${topY - 12} 156,${topY + 4} L150,${waistY + 12} L90,${waistY + 12} Z" fill="${c.top}"/>
      <path d="M110,${topY + 2} L120,${topY - 20} L130,${topY + 2}" fill="${c.accent}"/>`;
    bottom = `<path d="M92,${waistY + 6} h56 v${legH * 0.65} Q120,${hipY + legH * 0.85} 92,${hipY + legH * 0.65} Z" fill="${c.bottom}"/>`;
  } else if (cfg.outfitId === "studio") {
    top = `<path d="M82,${topY} Q120,${topY - 8} 158,${topY} L152,${waistY + 16} Q120,${waistY + 24} 88,${waistY + 16} Z" fill="${c.top}"/>
      <circle cx="120" cy="${topY + 28}" r="5" fill="${c.accent}"/>`;
    bottom = `<path d="M90,${waistY + 10} Q120,${waistY + 4} 150,${waistY + 10} L146,${hipY + legH * 0.6} L94,${hipY + legH * 0.6} Z" fill="${c.bottom}"/>`;
  } else {
    top = `<rect x="88" y="${topY}" width="64" height="${waistY - topY + 14}" rx="6" fill="${c.top}"/>
      <rect x="92" y="${topY + 8}" width="22" height="26" rx="3" fill="${c.accent}" opacity="0.55"/>
      <rect x="126" y="${topY + 8}" width="22" height="26" rx="3" fill="${c.accent}" opacity="0.55"/>`;
    bottom = `<rect x="96" y="${waistY + 8}" width="48" height="${legH * 0.68}" rx="6" fill="${c.bottom}"/>
      <rect x="100" y="${waistY + 2}" width="40" height="6" rx="2" fill="${c.accent}"/>`;
  }

  const shoes = `
    <ellipse cx="104" cy="${footY}" rx="15" ry="8" fill="${c.shoe}"/>
    <ellipse cx="136" cy="${footY}" rx="15" ry="8" fill="${c.shoe}"/>`;

  return `
    <g class="char-root" transform="translate(0, ${yShift})">
      <g class="layer-hair-back" transform="translate(120,90) scale(${hs}) translate(-120,-90)">
        ${hairBack(cfg.hairStyle, hair)}
      </g>

      <g class="layer-legs">
        <rect x="${120 - 22 - legW / 2}" y="${hipY}" width="${legW}" height="${legH}" rx="${legW / 2}" fill="${skin}"/>
        <rect x="${120 + 22 - legW / 2}" y="${hipY}" width="${legW}" height="${legH}" rx="${legW / 2}" fill="${skin}"/>
      </g>

      <g class="layer-bottom">${bottom}</g>
      <g class="layer-shoes">${shoes}</g>

      <ellipse cx="120" cy="${topY + 36 * th}" rx="32" ry="${34 * th}" fill="${skin}" opacity="0.25"/>
      <g class="layer-top">${top}${extras}</g>

      <g class="layer-arms">
        <rect x="${88 - armW}" y="${topY + 8}" width="${armW}" height="${armH}" rx="${armW / 2}" fill="${skin}"/>
        <rect x="152" y="${topY + 8}" width="${armW}" height="${armH}" rx="${armW / 2}" fill="${skin}"/>
      </g>

      <g class="layer-head" transform="translate(120,90) scale(${hs}) translate(-120,-90)">
        <rect x="112" y="126" width="16" height="26" rx="8" fill="${skin}"/>
        ${faceMarkup(cfg.faceShape, skin)}
        <g class="layer-brows">${browsLayer(cfg.eyebrowStyle, hair)}</g>
        <g class="layer-eyes">${eyesLayer(cfg.eyeStyle)}</g>
        <g class="layer-mouth">${mouthLayer(cfg.mouthStyle)}</g>
      </g>

      <g class="layer-hair-front" transform="translate(120,90) scale(${hs}) translate(-120,-90)">
        ${hairFront(cfg.hairStyle, hair)}
      </g>

      <g class="layer-accessory">${accessoryLayer(cfg.accessoryId, hair, cfg.outfitId)}</g>
    </g>`;
}

function renderSide(cfg, flip) {
  // 簡化側視：壓縮寬度的剪影感
  const skin = skinHex(cfg.skinTone);
  const hair = hairHex(cfg.hairColor);
  const c = outfitColors(cfg.outfitId);
  const scale = BODY_SCALE[cfg.bodyType] || BODY_SCALE.standard;
  const mir = flip ? "translate(240,0) scale(-1,1)" : "";
  return `
    <g transform="${mir} translate(0, ${scale.yShift})">
      <ellipse cx="128" cy="48" rx="${28 * scale.head}" ry="${34 * scale.head}" fill="${skin}"/>
      <path d="M110,40 Q100,30 128,22 Q150,30 146,48 Q140,36 128,34 Q116,36 110,40 Z" fill="${hair}"/>
      <circle cx="142" cy="50" r="3.5" fill="#2a2830"/>
      <path d="M138,62 Q144,64 148,62" fill="none" stroke="#5a3a42" stroke-width="1.8" stroke-linecap="round"/>
      <rect x="116" y="78" width="14" height="16" rx="6" fill="${skin}"/>
      <path d="M108,96 Q128,88 148,96 L144,${150 * scale.torsoH} L112,${150 * scale.torsoH} Z" fill="${c.top}"/>
      <rect x="118" y="100" width="12" height="${55 * scale.limb}" rx="6" fill="${skin}"/>
      <rect x="114" y="${150 * scale.torsoH}" width="28" height="${50 * scale.limb}" rx="8" fill="${c.bottom}"/>
      <ellipse cx="128" cy="${210 * scale.limb}" rx="14" ry="6" fill="${c.shoe}"/>
      ${cfg.accessoryId === "backpack" ? `<rect x="100" y="110" width="18" height="28" rx="5" fill="#6a7a8a"/>` : ""}
      ${cfg.accessoryId === "hat" ? `<ellipse cx="128" cy="22" rx="30" ry="7" fill="#d4a574"/>` : ""}
    </g>`;
}

function renderBack(cfg) {
  const skin = skinHex(cfg.skinTone);
  const hair = hairHex(cfg.hairColor);
  const c = outfitColors(cfg.outfitId);
  const scale = BODY_SCALE[cfg.bodyType] || BODY_SCALE.standard;
  return `
    <g transform="translate(0, ${scale.yShift})">
      <g transform="translate(120,90) scale(${scale.head}) translate(-120,-90)">
        ${hairBack(cfg.hairStyle, hair) || `<path d="M78,78 Q74,40 120,34 Q166,40 162,78 Q156,58 120,52 Q84,58 78,78 Z" fill="${hair}"/>`}
        <ellipse cx="120" cy="88" rx="40" ry="42" fill="${skin}"/>
        <path d="M78,78 Q74,40 120,34 Q166,40 162,78 Q156,58 120,52 Q84,58 78,78 Z" fill="${hair}"/>
      </g>
      <rect x="112" y="128" width="16" height="20" rx="8" fill="${skin}"/>
      <path d="M88,148 Q120,140 152,148 L148,220 L92,220 Z" fill="${c.top}"/>
      <rect x="${88 - 14 * scale.limb}" y="156" width="${14 * scale.limb}" height="${70 * scale.limb}" rx="${7 * scale.limb}" fill="${skin}"/>
      <rect x="152" y="156" width="${14 * scale.limb}" height="${70 * scale.limb}" rx="${7 * scale.limb}" fill="${skin}"/>
      <rect x="94" y="216" width="52" height="${40 * scale.limb}" rx="10" fill="${c.bottom}"/>
      <rect x="96" y="${256}" width="${16 * scale.limb}" height="${40 * scale.limb}" rx="8" fill="${skin}"/>
      <rect x="${128}" y="${256}" width="${16 * scale.limb}" height="${40 * scale.limb}" rx="8" fill="${skin}"/>
      <ellipse cx="104" cy="300" rx="14" ry="7" fill="${c.shoe}"/>
      <ellipse cx="136" cy="300" rx="14" ry="7" fill="${c.shoe}"/>
      ${cfg.accessoryId === "backpack" ? `<rect x="100" y="168" width="40" height="44" rx="10" fill="#6a7a8a"/><rect x="108" y="178" width="24" height="16" rx="4" fill="#9fd4e8"/>` : ""}
      ${cfg.accessoryId === "hat" ? `<ellipse cx="120" cy="38" rx="42" ry="10" fill="#d4a574"/><path d="M92,38 Q120,8 148,38 Z" fill="#e8c49a"/>` : ""}
    </g>`;
}

/**
 * @param {import('./character-config.js').CharacterConfig} cfg
 * @param {number} viewAngle 0..3
 * @param {string} [uid]
 */
export function buildCharacterSVG(cfg, viewAngle = 0, uid = "main") {
  const angle = ((viewAngle % 4) + 4) % 4;
  let body = "";
  if (angle === 0) body = renderFront(cfg);
  else if (angle === 1) body = renderSide(cfg, false);
  else if (angle === 2) body = renderBack(cfg);
  else body = renderSide(cfg, true);

  return `<svg class="explorer-svg" viewBox="0 0 240 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="探索者預覽">
    <defs>
      <filter id="soft-${uid}" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="2" stdDeviation="1.5" flood-opacity="0.12"/>
      </filter>
    </defs>
    <g filter="url(#soft-${uid})">${body}</g>
  </svg>`;
}

/**
 * 迷你縮圖（選項卡用）
 */
export function buildOptionThumb(kind, option, cfg) {
  const trial = { ...cfg };
  if (kind === "accessoryId") trial.accessoryId = option.id;
  else if (option.id != null) trial[kind] = option.id;

  if (kind === "skinTone") {
    return `<span class="swatch" style="background:${option.hex}" title="${option.label}"></span>`;
  }
  if (kind === "hairColor") {
    return `<span class="swatch" style="background:${option.hex}" title="${option.label}"></span>`;
  }
  if (kind === "bodyType" || kind === "faceShape" || kind === "eyeStyle" || kind === "eyebrowStyle" || kind === "mouthStyle" || kind === "hairStyle" || kind === "outfitId" || kind === "accessoryId") {
    return `<span class="mini-preview">${buildCharacterSVG(trial, 0, `t-${kind}-${option.id ?? "none"}`)}</span>`;
  }
  return `<span class="opt-fallback">${option.label}</span>`;
}
