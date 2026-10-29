// SIS Sync — builds native Figma components from the SIS tokens, exports a
// structure baseline, and diffs it. The comparison channel between the design
// and code sides of the SIS design system.

figma.showUI(__html__, { width: 380, height: 520 });

// Token values, baked from foundations/sis-ejust-palette.tokens.json (light theme).
const T = {
  brand600: "#CD1722", brand700: "#AB1420", brand800: "#8E1621", brand50: "#FFF1F2",
  canvas: "#FAFAFA", surface: "#FFFFFF", raised: "#FFFFFF", subtle: "#F4F4F5",
  ink: "#18181B", ink2: "#52525B", muted: "#A1A1AA", inverse: "#FFFFFF",
  border: "#D4D4D8", borderSubtle: "#E4E4E7", borderStrong: "#71717A",
  danger: "#B91C1C", dangerBg: "#FEF2F2", focus: "#0B83B9",
  successBg: "#ECFDF5", successText: "#047857", successBorder: "#A7F3D0",
  warningBg: "#FFFBEB", warningText: "#B45309", warningBorder: "#FDE68A",
  dangerBg2: "#FEF2F2", dangerText: "#B91C1C", dangerBorder: "#FECACA",
  infoBg: "#EFF6FF", infoText: "#1D4ED8", infoBorder: "#BFDBFE",
  neutralBg: "#F4F4F5", neutralText: "#52525B", neutralBorder: "#E4E4E7"
};

function solid(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { type: "SOLID", color: { r, g, b }, opacity: opacity === undefined ? 1 : opacity };
}
function text(chars, size, weight, hexColor) {
  const t = figma.createText();
  t.fontName = { family: "Inter", style: weight === 700 ? "Bold" : weight === 600 ? "Semi Bold" : "Medium" };
  t.characters = chars;
  t.fontSize = size;
  t.fills = [solid(hexColor)];
  return t;
}
function autoLayout(name, dir, padding, gap) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = dir;
  f.paddingLeft = f.paddingRight = padding;
  f.paddingTop = f.paddingBottom = padding;
  f.itemSpacing = gap;
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.cornerRadius = 10;
  return f;
}
function getPage() {
  let page = figma.root.children.find(p => p.name === "Core Components");
  if (!page) { page = figma.createPage(); page.name = "Core Components"; }
  figma.currentPage = page;
  return page;
}
function upsertComponentSet(name, buildVariants) {
  const page = getPage();
  const existing = page.findOne(n => n.name === name && n.type === "COMPONENT_SET");
  if (existing) existing.remove();
  const set = figma.createComponent();
  set.name = name;
  set.layoutMode = "HORIZONTAL";
  set.itemSpacing = 24;
  set.paddingLeft = set.paddingRight = set.paddingTop = set.paddingBottom = 32;
  set.primaryAxisSizingMode = "AUTO";
  set.counterAxisSizingMode = "AUTO";
  set.fills = [];
  buildVariants(set);
  page.appendChild(set);
  set.x = 40;
  return set;
}

function buildButton(variant, label, bg, fg, border, disabled) {
  const c = figma.createComponent();
  c.name = "State=" + variant;
  c.layoutMode = "HORIZONTAL";
  c.primaryAxisAlignItems = "CENTER";
  c.counterAxisAlignItems = "CENTER";
  c.paddingLeft = c.paddingRight = 24;
  c.paddingTop = c.paddingBottom = 12;
  c.primaryAxisSizingMode = "AUTO";
  c.counterAxisSizingMode = "AUTO";
  c.cornerRadius = 10;
  c.fills = [solid(disabled ? T.neutralBg : bg)];
  if (border) c.strokes = [solid(border)];
  c.effects = disabled ? [] : [{ type: "DROP_SHADOW", color: { r: 0.035, g: 0.035, b: 0.043, a: 0.10 }, offset: { x: 0, y: 2 }, radius: 6, spread: 0, visible: true, blendMode: "NORMAL" }];
  const t = text(label, 14, 600, disabled ? T.muted : fg);
  t.name = "label";
  c.appendChild(t);
  return c;
}

function buildTextField(variant) {
  const c = figma.createComponent();
  c.name = "State=" + variant;
  c.layoutMode = "VERTICAL";
  c.itemSpacing = 6;
  c.primaryAxisSizingMode = "AUTO";
  c.counterAxisSizingMode = "AUTO";
  c.fills = [];
  const label = text(variant === "error" ? "Student ID" : "University email", 14, 500,
    variant === "error" ? T.dangerText : T.ink);
  c.appendChild(label);
  const box = figma.createFrame();
  box.layoutMode = "HORIZONTAL";
  box.paddingLeft = box.paddingRight = 12;
  box.paddingTop = box.paddingBottom = 12;
  box.primaryAxisSizingMode = "FIXED";
  box.counterAxisSizingMode = "AUTO";
  box.resize(260, box.height);
  box.cornerRadius = 10;
  box.fills = [solid(variant === "error" ? T.dangerBg2 : T.surface)];
  box.strokes = [solid(variant === "error" ? T.danger : variant === "focus" ? T.focus : T.border)];
  const value = text(variant === "error" ? "20" : "name@ejust.edu.eg", 14, 400,
    variant === "error" ? T.dangerText : T.muted);
  box.appendChild(value);
  c.appendChild(box);
  if (variant === "error") {
    const hint = text("The student ID has eight digits.", 13, 400, T.dangerText);
    c.appendChild(hint);
  } else {
    const hint = text("Use your institutional address.", 13, 400, T.muted);
    c.appendChild(hint);
  }
  return c;
}

function buildBadge(tone, label, bg, fg, border) {
  const c = figma.createComponent();
  c.name = "Tone=" + tone;
  c.layoutMode = "HORIZONTAL";
  c.primaryAxisAlignItems = "CENTER";
  c.counterAxisAlignItems = "CENTER";
  c.paddingLeft = c.paddingRight = 10;
  c.paddingTop = c.paddingBottom = 3;
  c.primaryAxisSizingMode = "AUTO";
  c.counterAxisSizingMode = "AUTO";
  c.cornerRadius = 999;
  c.fills = [solid(bg)];
  c.strokes = [solid(border)];
  c.appendChild(text(label, 13, 500, fg));
  return c;
}

figma.ui.onmessage = (msg) => {
  if (msg.type === "build") {
    const created = [];
    upsertComponentSet("Button", (set) => {
      set.appendChild(buildButton("primary", "Enroll student", T.brand600, T.inverse));
      set.appendChild(buildButton("secondary", "Save draft", T.surface, T.ink, T.border));
      set.appendChild(buildButton("ghost", "Cancel", T.surface, T.ink2));
      set.appendChild(buildButton("destructive", "Drop course", T.danger, T.inverse));
      set.appendChild(buildButton("loading", "Enroll student", T.brand600, T.inverse));
      set.appendChild(buildButton("disabled", "Enroll student", T.neutralBg, T.muted, null, true));
      created.push("Button (6 variants)");
    });
    upsertComponentSet("TextField", (set) => {
      set.appendChild(buildTextField("default"));
      set.appendChild(buildTextField("focus"));
      set.appendChild(buildTextField("error"));
      set.appendChild(buildTextField("disabled"));
      created.push("TextField (4 variants)");
    });
    upsertComponentSet("Badge", (set) => {
      set.appendChild(buildBadge("success", "Registered", T.successBg, T.successText, T.successBorder));
      set.appendChild(buildBadge("warning", "On hold", T.warningBg, T.warningText, T.warningBorder));
      set.appendChild(buildBadge("danger", "Failed", T.dangerBg2, T.dangerText, T.dangerBorder));
      set.appendChild(buildBadge("info", "Pending", T.infoBg, T.infoText, T.infoBorder));
      set.appendChild(buildBadge("neutral", "Neutral", T.neutralBg, T.neutralText, T.neutralBorder));
      created.push("Badge (5 tones)");
    });
    figma.ui.postMessage({ type: "done", created });
    figma.notify("SIS Sync: built " + created.join(", "));
  }

  if (msg.type === "baseline") {
    const page = getPage();
    const out = { exportedAt: new Date().toISOString(), file: figma.root.name, componentSets: [] };
    for (const node of page.children) {
      if (node.type !== "COMPONENT_SET") continue;
      const set = { name: node.name, components: [] };
      for (const child of node.children) {
        if (child.type !== "COMPONENT") continue;
        const comp = { name: child.name, width: Math.round(child.width), height: Math.round(child.height), fills: [], texts: [] };
        for (const f of child.fills || []) {
          if (f.type === "SOLID" && f.visible !== false) {
            const c = f.color;
            const hexc = "#" + [c.r, c.g, c.b].map(v => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
            comp.fills.push(hexc);
          }
        }
        for (const t of child.findAll(n => n.type === "TEXT")) comp.texts.push(t.characters);
        set.components.push(comp);
      }
      out.componentSets.push(set);
    }
    figma.ui.postMessage({ type: "baseline", json: JSON.stringify(out, null, 1) });
  }

  if (msg.type === "compare") {
    const baseline = JSON.parse(msg.json);
    const page = getPage();
    const report = { added: [], removed: [], changed: [] };
    const current = {};
    for (const node of page.children) {
      if (node.type !== "COMPONENT_SET") continue;
      for (const child of node.children) {
        if (child.type !== "COMPONENT") continue;
        const fills = (child.fills || []).filter(f => f.type === "SOLID" && f.visible !== false)
          .map(f => "#" + [f.color.r, f.color.g, f.color.b].map(v => Math.round(v * 255).toString(16).padStart(2, "0")).join(""));
        current[node.name + " / " + child.name] = { width: Math.round(child.width), height: Math.round(child.height), fills, texts: child.findAll(n => n.type === "TEXT").map(t => t.characters) };
      }
    }
    const baseMap = {};
    for (const set of baseline.componentSets || []) {
      for (const comp of set.components || []) baseMap[set.name + " / " + comp.name] = comp;
    }
    for (const key of Object.keys(current)) {
      if (!baseMap[key]) { report.added.push(key); continue; }
      const b = baseMap[key], c = current[key];
      if (b.width !== c.width || b.height !== c.height ||
          JSON.stringify(b.fills) !== JSON.stringify(c.fills) ||
          JSON.stringify(b.texts) !== JSON.stringify(c.texts)) {
        report.changed.push({ key, before: b, after: c });
      }
    }
    for (const key of Object.keys(baseMap)) {
      if (!current[key]) report.removed.push(key);
    }
    figma.ui.postMessage({ type: "compareResult", report });
  }
};
