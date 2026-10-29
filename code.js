// SIS Sync — builds the complete native Figma design system from the canonical
// token values: foundations pages, core components with variants, dark mirrors.
// Also exports a structure baseline and diffs it against a saved baseline.

figma.showUI(__html__, { width: 380, height: 560 });

const T = {
  brand50: "#FFF1F2", brand100: "#FFE0E2", brand200: "#FFC4C7", brand300: "#FF9BA0",
  brand400: "#FF6B73", brand500: "#EA232B", brand600: "#CD1722", brand700: "#AB1420",
  brand800: "#8E1621", brand900: "#7A1116", brand950: "#430A10",
  neutral0: "#FFFFFF", neutral50: "#FAFAFA", neutral100: "#F4F4F5", neutral200: "#E4E4E7",
  neutral300: "#D4D4D8", neutral400: "#A1A1AA", neutral500: "#71717A", neutral600: "#52525B",
  neutral700: "#3F3F46", neutral800: "#27272A", neutral900: "#18181B", neutral950: "#09090B",
  successBg: "#ECFDF5", successText: "#047857", successBorder: "#A7F3D0",
  warningBg: "#FFFBEB", warningText: "#B45309", warningBorder: "#FDE68A",
  dangerBg: "#FEF2F2", dangerText: "#B91C1C", dangerBorder: "#FECACA",
  infoBg: "#EFF6FF", infoText: "#1D4ED8", infoBorder: "#BFDBFE",
  focus: "#0B83B9", skeleton: "#E4E4E7"
};
const dark = {
  canvas: "#09090B", surface: "#18181B", raised: "#27272A", ink: "#FAFAFA",
  ink2: "#D4D4D8", muted: "#A1A1AA", border: "#3F3F46", borderSubtle: "#27272A",
  primary: "#EA232B", primaryFg: "#FFFFFF", subtle: "#27272A",
  successBg: "#052E16", successText: "#6EE7A0", successBorder: "#14532D",
  warningBg: "#451A03", warningText: "#FCD34D", warningBorder: "#78350F",
  dangerBg: "#450A0A", dangerText: "#FCA5A5", dangerBorder: "#7F1D1D",
  infoBg: "#172554", infoText: "#93C5FD", infoBorder: "#1E3A8A",
  neutralBg: "#27272A", neutralText: "#D4D4D8", neutralBorder: "#3F3F46"
};
const light = {
  canvas: "#FAFAFA", surface: "#FFFFFF", raised: "#FFFFFF", ink: "#18181B",
  ink2: "#52525B", muted: "#A1A1AA", border: "#D4D4D8", borderSubtle: "#E4E4E7",
  primary: "#CD1722", primaryFg: "#FFFFFF", subtle: "#F4F4F5",
  successBg: "#ECFDF5", successText: "#047857", successBorder: "#A7F3D0",
  warningBg: "#FFFBEB", warningText: "#B45309", warningBorder: "#FDE68A",
  dangerBg: "#FEF2F2", dangerText: "#B91C1C", dangerBorder: "#FECACA",
  infoBg: "#EFF6FF", infoText: "#1D4ED8", infoBorder: "#BFDBFE",
  neutralBg: "#F4F4F5", neutralText: "#52525B", neutralBorder: "#E4E4E7"
};

function solid(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return { type: "SOLID", color: { r, g, b }, opacity: opacity === undefined ? 1 : opacity };
}
function mkText(chars, size, style, color) {
  const t = figma.createText();
  t.fontName = { family: "Inter", style: style };
  t.characters = chars;
  t.fontSize = size;
  t.fills = [solid(color)];
  return t;
}
function frame(name, dir, pad, gap, fill) {
  const f = figma.createFrame();
  f.name = name;
  f.layoutMode = dir;
  f.paddingLeft = f.paddingRight = f.paddingTop = f.paddingBottom = pad;
  f.itemSpacing = gap;
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.fills = fill ? [solid(fill)] : [];
  return f;
}
function sectionLabel(chars) {
  return mkText(chars, 13, "Bold", light.muted);
}
function ensurePage(name) {
  let page = figma.root.children.find(p => p.name === name);
  if (!page) { page = figma.createPage(); page.name = name; }
  figma.currentPage = page;
  for (const child of [...page.children]) child.remove();
  return page;
}

// ---------- FOUNDATIONS ----------
async function buildFoundations() {
  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Medium" }),
    figma.loadFontAsync({ family: "Inter", style: "Semi Bold" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" })
  ]);
  const page = ensurePage("Foundations");
  page.backgrounds = [solid(light.canvas)];

  // Color ramps
  page.appendChild(sectionLabel("COLOR — REFERENCE RAMPS"));
  const families = {
    brand: T.brand50, neutral: T.neutral0,
    success: ["#ECFDF5", "#D1FAE5", "#A7F3D0", "#6EE7B7", "#34D399", "#10B981", "#059669", "#047857", "#065F46", "#064E3B", "#022C22"],
    warning: ["#FFFBEB", "#FEF3C7", "#FDE68A", "#FCD34D", "#FBBF24", "#F59E0B", "#D97706", "#B45309", "#92400E", "#78350F", "#451A03"],
    danger: ["#FEF2F2", "#FEE2E2", "#FECACA", "#FCA5A5", "#F87171", "#EF4444", "#DC2626", "#B91C1C", "#991B1B", "#7F1D1D", "#450A0A"],
    info: ["#EFF6FF", "#DBEAFE", "#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6", "#2563EB", "#1D4ED8", "#1E40AF", "#1E3A8A", "#172554"]
  };
  const brandRamp = { "50": T.brand50, "100": T.brand100, "200": T.brand200, "300": T.brand300, "400": T.brand400, "500": T.brand500, "600": T.brand600, "700": T.brand700, "800": T.brand800, "900": T.brand900, "950": T.brand950 };
  const neutralRamp = { "0": T.neutral0, "50": T.neutral50, "100": T.neutral100, "200": T.neutral200, "300": T.neutral300, "400": T.neutral400, "500": T.neutral500, "600": T.neutral600, "700": T.neutral700, "800": T.neutral800, "900": T.neutral900, "950": T.neutral950 };
  const ramps = [["brand", brandRamp], ["neutral", neutralRamp],
    ["success", families.success], ["warning", families.warning],
    ["danger", families.danger], ["info", families.info]];
  for (const [fam, steps] of ramps) {
    const row = frame("ramp-" + fam, "HORIZONTAL", 0, 8);
    const col = frame("ramp-label", "VERTICAL", 0, 4);
    col.appendChild(mkText(fam, 14, "Semi Bold", light.ink));
    for (const [step, hexv] of Object.entries(steps)) {
      const sw = frame("swatch-" + fam + "-" + step, "VERTICAL", 8, 2);
      sw.resize(96, 88);
      sw.cornerRadius = 8;
      sw.fills = [solid(hexv)];
      sw.strokes = [solid(light.borderSubtle)];
      sw.appendChild(mkText(String(step), 10, "Medium", hexv === light.neutral0 || step === "50" || step === "100" ? light.ink : light.neutral0));
      sw.appendChild(mkText(hexv, 9, "Regular", light.ink2));
      row.appendChild(sw);
    }
    page.appendChild(row);
    page.appendChild(col);
  }
  page.appendChild(mkText(" ", 12, "Regular", light.ink));

  // Type scale
  page.appendChild(sectionLabel("TYPE SCALE — IBM PLEX SANS ARABIC (rendered in Inter here)"));
  const roles = [
    ["page-title", 28, 600, "Page title — Registration dashboard"],
    ["section-heading", 20, 600, "Section heading"],
    ["subsection-heading", 16, 600, "Subsection heading"],
    ["body", 14, 400, "Body text — the quick brown fox jumps over the lazy dog 0123456789"],
    ["field-label", 14, 500, "Field label"],
    ["button", 14, 500, "Button"],
    ["navigation", 14, 500, "Navigation item"],
    ["table-heading", 14, 500, "Table heading"],
    ["table", 14, 400, "Table cell 0123456789"],
    ["help", 14, 400, "Help text — use your institutional address."]
  ];
  const typeFrame = frame("type-scale", "VERTICAL", 24, 14, light.surface);
  typeFrame.cornerRadius = 12;
  typeFrame.strokes = [solid(light.borderSubtle)];
  for (const [role, size, weight, sample] of roles) {
    const row = frame("type-" + role, "HORIZONTAL", 0, 24);
    row.counterAxisAlignItems = "CENTER";
    const spec = mkText(role + " · " + size + "px · " + weight, 11, "Regular", light.muted);
    spec.resize(180, spec.height);
    row.appendChild(spec);
    row.appendChild(mkText(sample, size, weight === 400 ? "Regular" : weight === 500 ? "Medium" : weight === 600 ? "Semi Bold" : "Bold", light.ink));
    typeFrame.appendChild(row);
  }
  page.appendChild(typeFrame);

  // Spacing, radius, motion
  page.appendChild(sectionLabel("SPACING SCALE (×16px steps)"));
  const spaceRow = frame("spacing", "VERTICAL", 0, 8);
  for (const [name, px] of [["0", 0], ["2", 2], ["4", 4], ["6", 6], ["8", 8], ["12", 12], ["16", 16], ["24", 24], ["32", 32], ["48", 48], ["64", 64]]) {
    const row = frame("space-" + name, "HORIZONTAL", 0, 12);
    row.appendChild(mkText("space-" + name, 11, "Regular", light.muted)).resize(120, 16);
    const bar = figma.createRectangle();
    bar.resize(px || 1, 12);
    bar.fills = [solid(T.brand500)];
    row.appendChild(bar);
    row.appendChild(mkText(px + "px", 11, "Regular", light.ink2));
    spaceRow.appendChild(row);
  }
  page.appendChild(spaceRow);

  page.appendChild(sectionLabel("RADIUS"));
  const radiusRow = frame("radius", "HORIZONTAL", 0, 24);
  for (const [name, r] of [["small 4", 4], ["control 8", 8], ["panel 12", 12], ["large 16", 16], ["pill 999", 999]]) {
    const box = frame("radius-" + name, "VERTICAL", 12, 2);
    box.resize(84, 72);
    box.cornerRadius = Math.min(r, 42);
    box.fills = [solid(T.brand50)];
    box.strokes = [solid(T.brand600)];
    box.appendChild(mkText(String(name), 10, "Medium", light.ink2));
    radiusRow.appendChild(box);
  }
  page.appendChild(radiusRow);

  page.appendChild(sectionLabel("MOTION — DURATIONS"));
  const motionRow = frame("motion", "HORIZONTAL", 0, 16);
  for (const [name, ms] of [["fast 120ms", 120], ["standard 180ms", 180], ["slow 240ms", 240]]) {
    const chip = frame("motion-" + name, "VERTICAL", 12, 2);
    chip.fills = [solid(light.subtle)];
    chip.cornerRadius = 8;
    chip.appendChild(mkText(String(name), 11, "Medium", light.ink2));
    const bar = figma.createRectangle();
    bar.resize(ms / 2, 4);
    bar.cornerRadius = 2;
    bar.fills = [solid(T.brand600)];
    chip.appendChild(bar);
    motionRow.appendChild(chip);
  }
  page.appendChild(motionRow);

  figma.viewport.scrollAndZoomIntoView(page.children);
  return "Foundations built";
}

// ---------- COMPONENTS ----------
function buttonVariant(set, state, theme, label, bg, fg, border, disabled) {
  const c = figma.createComponent();
  c.name = "State=" + state;
  c.description = "SIS button, " + state + " state, " + theme + " theme.";
  c.layoutMode = "HORIZONTAL";
  c.primaryAxisAlignItems = "CENTER";
  c.counterAxisAlignItems = "CENTER";
  c.paddingLeft = c.paddingRight = 24;
  c.paddingTop = c.paddingBottom = 12;
  c.primaryAxisSizingMode = "AUTO";
  c.counterAxisSizingMode = "AUTO";
  c.cornerRadius = 10;
  c.fills = [solid(disabled ? (theme === "dark" ? dark.neutralBg : light.neutralBg) : bg)];
  if (border) c.strokes = [solid(border)];
  if (!disabled) {
    c.effects = [{ type: "DROP_SHADOW", color: { r: 0.035, g: 0.035, b: 0.043, a: theme === "dark" ? 0.4 : 0.1 }, offset: { x: 0, y: 2 }, radius: 6, spread: 0, visible: true, blendMode: "NORMAL" }];
  }
  c.appendChild(mkText(label, 14, "Semi Bold", disabled ? (theme === "dark" ? dark.muted : light.muted) : fg));
  set.appendChild(c);
}
function buildButtonSet(parent, x, y, theme) {
  const th = theme === "dark" ? dark : light;
  const set = figma.createComponent();
  set.name = theme === "dark" ? "Button / Dark" : "Button";
  set.layoutMode = "HORIZONTAL";
  set.itemSpacing = 20;
  set.paddingLeft = set.paddingRight = set.paddingTop = set.paddingBottom = 28;
  set.primaryAxisSizingMode = "AUTO";
  set.counterAxisSizingMode = "AUTO";
  set.fills = [solid(theme === "dark" ? dark.surface : light.surface)];
  set.cornerRadius = 16;
  set.x = x; set.y = y;
  parent.appendChild(set);
  buttonVariant(set, "primary", theme, "Enroll student", th.primary, th.primaryFg);
  buttonVariant(set, "secondary", theme, "Save draft", theme === "dark" ? dark.raised : light.surface, th.ink, th.border);
  buttonVariant(set, "ghost", theme, "Cancel", null, th.ink);
  buttonVariant(set, "destructive", theme, "Drop course", T.danger, th.primaryFg);
  buttonVariant(set, "loading", theme, "Enroll student", th.primary, th.primaryFg);
  buttonVariant(set, "disabled", theme, "Enroll student", th.neutralBg, th.muted, th.neutralBorder, true);
  return set;
}
function badgeVariant(set, tone, theme, label) {
  const th = theme === "dark" ? dark : light;
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
  c.fills = [solid(th[tone + "Bg"])];
  c.strokes = [solid(th[tone + "Border"])];
  c.appendChild(mkText(label, 13, "Medium", th[tone + "Text"]));
  set.appendChild(c);
}
function buildBadgeSet(parent, x, y, theme) {
  const set = figma.createComponent();
  set.name = theme === "dark" ? "Badge / Dark" : "Badge";
  set.layoutMode = "HORIZONTAL";
  set.itemSpacing = 12;
  set.paddingLeft = set.paddingRight = set.paddingTop = set.paddingBottom = 28;
  set.primaryAxisSizingMode = "AUTO";
  set.counterAxisSizingMode = "AUTO";
  set.fills = [solid(theme === "dark" ? dark.surface : light.surface)];
  set.cornerRadius = 16;
  set.x = x; set.y = y;
  parent.appendChild(set);
  badgeVariant(set, "success", theme, "Registered");
  badgeVariant(set, "warning", theme, "On hold");
  badgeVariant(set, "danger", theme, "Failed");
  badgeVariant(set, "info", theme, "Pending");
  badgeVariant(set, "neutral", theme, "Neutral");
  return set;
}
function fieldVariant(set, state, theme) {
  const th = theme === "dark" ? dark : light;
  const c = figma.createComponent();
  c.name = "State=" + state;
  c.layoutMode = "VERTICAL";
  c.itemSpacing = 6;
  c.primaryAxisSizingMode = "AUTO";
  c.counterAxisSizingMode = "AUTO";
  c.fills = [];
  c.appendChild(mkText(state === "error" ? "Student ID" : "University email", 14, "Medium",
    state === "error" ? th.dangerText : th.ink));
  const box = frame("input", "HORIZONTAL", 12, 0, state === "error" ? th.dangerBg : (theme === "dark" ? dark.raised : light.surface));
  box.resize(260, 44);
  box.cornerRadius = 10;
  box.strokes = [solid(state === "error" ? T.danger : state === "focus" ? T.focus : th.border)];
  box.counterAxisAlignItems = "CENTER";
  box.appendChild(mkText(state === "error" ? "20" : "name@ejust.edu.eg", 14, "Regular",
    state === "error" ? th.dangerText : th.muted));
  c.appendChild(box);
  c.appendChild(mkText(state === "error" ? "The student ID has eight digits." : "Use your institutional address.",
    13, "Regular", state === "error" ? th.dangerText : th.muted));
  set.appendChild(c);
}
function buildFieldSet(parent, x, y, theme) {
  const set = figma.createComponent();
  set.name = theme === "dark" ? "TextField / Dark" : "TextField";
  set.layoutMode = "HORIZONTAL";
  set.itemSpacing = 20;
  set.paddingLeft = set.paddingRight = set.paddingTop = set.paddingBottom = 28;
  set.primaryAxisSizingMode = "AUTO";
  set.counterAxisSizingMode = "AUTO";
  set.fills = [solid(theme === "dark" ? dark.surface : light.surface)];
  set.cornerRadius = 16;
  set.x = x; set.y = y;
  parent.appendChild(set);
  fieldVariant(set, "default", theme);
  fieldVariant(set, "focus", theme);
  fieldVariant(set, "error", theme);
  fieldVariant(set, "disabled", theme);
  return set;
}
function alertVariant(set, tone, theme, label) {
  const th = theme === "dark" ? dark : light;
  const c = figma.createComponent();
  c.name = "Tone=" + tone;
  c.layoutMode = "HORIZONTAL";
  c.itemSpacing = 8;
  c.paddingLeft = c.paddingRight = 16;
  c.paddingTop = c.paddingBottom = 12;
  c.primaryAxisSizingMode = "AUTO";
  c.counterAxisSizingMode = "AUTO";
  c.cornerRadius = 12;
  c.fills = [solid(th[tone + "Bg"])];
  c.strokes = [solid(th[tone + "Border"])];
  c.appendChild(mkText(label, 14, "Regular", th[tone + "Text"]));
  set.appendChild(c);
}

async function buildComponents() {
  await Promise.all([
    figma.loadFontAsync({ family: "Inter", style: "Regular" }),
    figma.loadFontAsync({ family: "Inter", style: "Medium" }),
    figma.loadFontAsync({ family: "Inter", style: "Semi Bold" }),
    figma.loadFontAsync({ family: "Inter", style: "Bold" })
  ]);
  const page = ensurePage("Core Components");
  page.backgrounds = [solid(light.canvas)];
  const lightFrame = frame("Light theme", "VERTICAL", 40, 48, light.canvas);
  const darkFrame = frame("Dark theme", "VERTICAL", 40, 48, dark.canvas);
  page.appendChild(lightFrame);
  page.appendChild(darkFrame);
  lightFrame.x = 40; lightFrame.y = 60;
  darkFrame.x = 40; darkFrame.y = lightFrame.y + lightFrame.height + 80;

  buildButtonSet(lightFrame, 0, 0, "light");
  buildBadgeSet(lightFrame, 0, 120, "light");
  buildFieldSet(lightFrame, 420, 0, "light");
  buildButtonSet(darkFrame, 0, 0, "dark");
  buildBadgeSet(darkFrame, 0, 120, "dark");
  buildFieldSet(darkFrame, 420, 0, "dark");

  // Alerts light + dark
  const alertLight = figma.createComponent();
  alertLight.name = "Alert";
  alertLight.layoutMode = "VERTICAL";
  alertLight.itemSpacing = 16;
  alertLight.paddingTop = alertLight.paddingBottom = 28;
  alertLight.primaryAxisSizingMode = "AUTO";
  alertLight.counterAxisSizingMode = "AUTO";
  alertLight.fills = [solid(light.surface)];
  alertLight.cornerRadius = 16;
  alertLight.x = 880; alertLight.y = 60;
  page.appendChild(alertLight);
  alertVariant(alertLight, "success", "light", "Saved. Schedule updated.");
  alertVariant(alertLight, "warning", "light", "A hold blocks registration.");
  alertVariant(alertLight, "danger", "light", "Registration failed. Retry?");
  alertVariant(alertLight, "info", "light", "Term opens on 1 September.");
  const alertDark = figma.createComponent();
  alertDark.name = "Alert / Dark";
  alertDark.layoutMode = "VERTICAL";
  alertDark.itemSpacing = 16;
  alertDark.paddingTop = alertDark.paddingBottom = 28;
  alertDark.primaryAxisSizingMode = "AUTO";
  alertDark.counterAxisSizingMode = "AUTO";
  alertDark.fills = [solid(dark.surface)];
  alertDark.cornerRadius = 16;
  alertDark.x = 880; alertDark.y = 60 + alertLight.height + 48;
  page.appendChild(alertDark);
  alertVariant(alertDark, "success", "dark", "Saved. Schedule updated.");
  alertVariant(alertDark, "warning", "dark", "A hold blocks registration.");
  alertVariant(alertDark, "danger", "dark", "Registration failed. Retry?");
  alertVariant(alertDark, "info", "dark", "Term opens on 1 September.");

  figma.viewport.scrollAndZoomIntoView(page.children);
  return "Core Components built: Button, Badge, TextField, Alert — light and dark";
}

// ---------- BASELINE + COMPARE ----------
function serialize(pageName) {
  const page = figma.root.children.find(p => p.name === pageName);
  const out = { exportedAt: new Date().toISOString(), page: pageName, componentSets: [], frames: [] };
  if (!page) return out;
  for (const node of page.children) {
    if (node.type === "COMPONENT_SET") {
      const set = { name: node.name, components: [] };
      for (const child of node.children) {
        if (child.type !== "COMPONENT") continue;
        set.components.push(serializeNode(child));
      }
      out.componentSets.push(set);
    } else if (node.type === "FRAME") {
      out.frames.push({ name: node.name, width: Math.round(node.width), height: Math.round(node.height), children: node.children.length });
    }
  }
  return out;
}
function serializeNode(node) {
  return {
    name: node.name,
    width: Math.round(node.width), height: Math.round(node.height),
    fills: (node.fills || []).filter(f => f.type === "SOLID" && f.visible !== false)
      .map(f => "#" + [f.color.r, f.color.g, f.color.b].map(v => Math.round(v * 255).toString(16).padStart(2, "0")).join("")),
    texts: node.findAll(n => n.type === "TEXT").map(t => t.characters)
  };
}

figma.ui.onmessage = async (msg) => {
  try {
    if (msg.type === "build-foundations") {
      const r = await buildFoundations();
      figma.ui.postMessage({ type: "done", text: r });
    }
    if (msg.type === "build-components") {
      const r = await buildComponents();
      figma.ui.postMessage({ type: "done", text: r });
    }
    if (msg.type === "build-all") {
      const r1 = await buildFoundations();
      const r2 = await buildComponents();
      figma.ui.postMessage({ type: "done", text: r1 + "; " + r2 });
    }
    if (msg.type === "baseline") {
      const out = { components: serialize("Core Components"), foundations: serialize("Foundations") };
      figma.ui.postMessage({ type: "baseline", json: JSON.stringify(out, null, 1) });
    }
    if (msg.type === "compare") {
      const baseline = JSON.parse(msg.json);
      const current = { components: serialize("Core Components"), foundations: serialize("Foundations") };
      const report = { added: [], removed: [], changed: [] };
      const flat = (tree) => {
        const map = {};
        for (const set of tree.componentSets || []) for (const c of set.components || []) map[set.name + "/" + c.name] = c;
        for (const f of tree.frames || []) map["frame:" + f.name] = f;
        return map;
      };
      const base = flat(baseline), cur = flat(current);
      for (const key of Object.keys(cur)) {
        if (!base[key]) { report.added.push(key); continue; }
        if (JSON.stringify(base[key]) !== JSON.stringify(cur[key])) report.changed.push(key);
      }
      for (const key of Object.keys(base)) if (!cur[key]) report.removed.push(key);
      figma.ui.postMessage({ type: "compareResult", report });
    }
  } catch (error) {
    figma.ui.postMessage({ type: "error", text: String(error && error.message || error) });
  }
};
