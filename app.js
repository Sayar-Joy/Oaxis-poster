/**
 * OAXISMM Poster Generator Studio
 * Core Canvas Engine & Responsive Application Controller
 */

// Application State
const state = {
  originalImage: null,
  croppedImage: null,
  logoImage: null,
  cropperInstance: null,
  cropImageSrc: null,
  currentScaleX: 1,
  currentScaleY: 1,

  config: {
    // Aspect Ratio format
    aspectRatio: "16:9", // '16:9' or '1:1'

    // Flexible inputs
    mainHeader: "Super Man",
    headerFont: "ThuNgalTan",
    mainHeaderSize: 118,
    mainHeaderYOffset: 0,

    caption: "An Alien or a Human ?",
    captionSize: 70,

    // Visual Tuning & Effects
    bgBlur: 28,
    bgDarkness: 0.25,
    posterRadius: 28,
    strokeWidth: 11,
    showLogo: true,
    posterShadow: true,
    exportFormat: "png"
  },

  zoomMode: "fit", // 'fit' or numerical scale
  activeMobileTab: "controls",
  isRendering: false
};

// DOM Elements
const canvas = document.getElementById("posterCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });
const canvasWrapper = document.getElementById("canvasWrapper");
const viewport = document.getElementById("viewport");
const renderLoading = document.getElementById("renderLoading");

// Form inputs - Poster
const posterFileInput = document.getElementById("posterFileInput");
const dropzone = document.getElementById("dropzone");
const openCropModalBtn = document.getElementById("openCropModalBtn");

// Form inputs - Flexible Middle Header & Caption
const mainHeaderInput = document.getElementById("mainHeaderInput");
const clearMainHeaderBtn = document.getElementById("clearMainHeaderBtn");
const mainHeaderCharCount = document.getElementById("mainHeaderCharCount");
const headerFontSelect = document.getElementById("headerFontSelect");

const captionInput = document.getElementById("captionInput");
const clearCaptionBtn = document.getElementById("clearCaptionBtn");
const captionCharCount = document.getElementById("captionCharCount");

// Fine-tuning inputs
const bgBlurRange = document.getElementById("bgBlurRange");
const bgBlurVal = document.getElementById("bgBlurVal");
const bgDarknessRange = document.getElementById("bgDarknessRange");
const bgDarknessVal = document.getElementById("bgDarknessVal");
const posterRadiusRange = document.getElementById("posterRadiusRange");
const posterRadiusVal = document.getElementById("posterRadiusVal");
const mainHeaderSizeRange = document.getElementById("mainHeaderSizeRange");
const mainHeaderSizeVal = document.getElementById("mainHeaderSizeVal");
const captionSizeRange = document.getElementById("captionSizeRange");
const captionSizeVal = document.getElementById("captionSizeVal");
const mainHeaderYOffsetRange = document.getElementById("mainHeaderYOffsetRange");
const mainHeaderYOffsetVal = document.getElementById("mainHeaderYOffsetVal");
const strokeWidthRange = document.getElementById("strokeWidthRange");
const strokeWidthVal = document.getElementById("strokeWidthVal");
const showLogoToggle = document.getElementById("showLogoToggle");
const posterShadowToggle = document.getElementById("posterShadowToggle");

// Navigation & Action Buttons
const quickSampleBtn = document.getElementById("quickSampleBtn");
const resetAllBtn = document.getElementById("resetAllBtn");
const copyImageBtn = document.getElementById("copyImageBtn");
const downloadBannerBtn = document.getElementById("downloadBannerBtn");
const downloadBannerBtn2 = document.getElementById("downloadBannerBtn2");
const downloadBothBtn = document.getElementById("downloadBothBtn");
const mobileDownloadBtn = document.getElementById("mobileDownloadBtn");
const mobileCopyBtn = document.getElementById("mobileCopyBtn");

// Ratio Switcher Elements
const activeRatioBadge = document.getElementById("activeRatioBadge");
const resolutionBadge = document.getElementById("resolutionBadge");
const exportDimensionMeta = document.getElementById("exportDimensionMeta");
const exportTargetMeta = document.getElementById("exportTargetMeta");

// Mobile Tab Switcher
const mobileTabsBar = document.getElementById("mobileTabsBar");
const tabControlsBtn = document.getElementById("tabControlsBtn");
const tabPreviewBtn = document.getElementById("tabPreviewBtn");

// Zoom controls
const zoomInBtn = document.getElementById("zoomInBtn");
const zoomOutBtn = document.getElementById("zoomOutBtn");
const zoomFitBtn = document.getElementById("zoomFitBtn");
const zoomLevelDisplay = document.getElementById("zoomLevelDisplay");

// Modal Elements
const cropModal = document.getElementById("cropModal");
const closeCropModalBtn = document.getElementById("closeCropModalBtn");
const cancelCropBtn = document.getElementById("cancelCropBtn");
const applyCropBtn = document.getElementById("applyCropBtn");
const cropImageElement = document.getElementById("cropImageElement");
const cropRotateLeftBtn = document.getElementById("cropRotateLeftBtn");
const cropRotateRightBtn = document.getElementById("cropRotateRightBtn");
const cropFlipHBtn = document.getElementById("cropFlipHBtn");
const cropResetBtn = document.getElementById("cropResetBtn");

// Toast
const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");

/**
 * Show a sleek toast message
 */
let toastTimeout;
function showToast(msg, duration = 3000) {
  if (!toast || !toastMessage) return;
  if (toastTimeout) clearTimeout(toastTimeout);
  toastMessage.textContent = msg;
  toast.classList.remove("hidden");
  toastTimeout = setTimeout(() => {
    toast.classList.add("hidden");
  }, duration);
}

/**
 * Register Custom Fonts (A10_YoeShin and ThuNgalTan)
 */
async function loadCustomFonts() {
  try {
    const yoeShin = new FontFace("A10_YoeShin", "url(A10_YoeShin-Bold.ttf)", {
      weight: "100 900",
      style: "normal"
    });
    const loadedYoeShin = await yoeShin.load();
    document.fonts.add(loadedYoeShin);
    console.log("A10_YoeShin font registered successfully");
  } catch (err) {
    console.warn("A10_YoeShin FontFace load issue, browser @font-face fallback:", err);
  }

  try {
    const thuNgalTan = new FontFace("ThuNgalTan", "url(ThuNgalTan-Font-Regular.ttf)", {
      weight: "100 900",
      style: "normal"
    });
    const loadedThuNgalTan = await thuNgalTan.load();
    document.fonts.add(loadedThuNgalTan);
    console.log("ThuNgalTan font registered successfully");
  } catch (err) {
    console.warn("ThuNgalTan FontFace load issue, browser @font-face fallback:", err);
  }
}

/**
 * Load corner logo image (logo.png) with offline-safe embedded fallback
 */
function loadLogoImage() {
  return new Promise((resolve) => {
    // Prefer offline data URI if available to avoid file:// CORS blocks and canvas tainting
    const src = (typeof EMBEDDED_LOGO_DATA_URI !== "undefined" && EMBEDDED_LOGO_DATA_URI)
      ? EMBEDDED_LOGO_DATA_URI
      : "logo.png";
    const img = new Image();
    if (!src.startsWith("data:") && window.location.protocol.startsWith("http")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      state.logoImage = img;
      resolve(img);
    };
    img.onerror = () => {
      if (typeof EMBEDDED_LOGO_DATA_URI !== "undefined" && src !== EMBEDDED_LOGO_DATA_URI) {
        const fallback = new Image();
        fallback.onload = () => {
          state.logoImage = fallback;
          renderBanner();
          resolve(fallback);
        };
        fallback.src = EMBEDDED_LOGO_DATA_URI;
      } else {
        console.warn("Corner logo image could not be loaded");
        resolve(null);
      }
    };
    img.src = src;
  });
}

/**
 * Initialize application assets, fonts & initial poster
 */
async function initApp() {
  // Sync state from inputs if prefilled
  if (mainHeaderInput) {
    state.config.mainHeader = mainHeaderInput.value;
    if (mainHeaderCharCount) mainHeaderCharCount.textContent = `${mainHeaderInput.value.length} chars`;
  }
  if (captionInput) {
    state.config.caption = captionInput.value;
    if (captionCharCount) captionCharCount.textContent = `${captionInput.value.length} chars`;
  }
  if (headerFontSelect) {
    state.config.headerFont = headerFontSelect.value;
    updateInputFontPreview(mainHeaderInput, headerFontSelect.value);
    updateInputFontPreview(captionInput, headerFontSelect.value);
  }

  bindEventListeners();
  setupMobileTabs();

  // Check URL params for initial ratio
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const ratioParam = urlParams.get("ratio");
    if (ratioParam === "1:1" || ratioParam === "square") {
      state.config.aspectRatio = "1:1";
      canvas.width = 1080;
      canvas.height = 1080;
      document.querySelectorAll("[data-ratio]").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.ratio === "1:1");
      });
      if (activeRatioBadge) activeRatioBadge.textContent = "1:1 Square";
      if (resolutionBadge) resolutionBadge.textContent = "1080 × 1080";
      if (exportDimensionMeta) exportDimensionMeta.innerHTML = "1080 × 1080 px (1:1)";
      if (exportTargetMeta) exportTargetMeta.innerHTML = "Social & Feed Post";
    }

    const tabParam = urlParams.get("tab");
    if (tabParam === "preview" && typeof tabPreviewBtn !== "undefined" && tabPreviewBtn) {
      setTimeout(() => tabPreviewBtn.click(), 100);
    }
  } catch (e) {}

  updateDownloadButtonLabels();

  // Load custom Burmese fonts
  await loadCustomFonts();

  try {
    if (document.fonts && document.fonts.ready) {
      await document.fonts.ready;
    }
  } catch (err) {
    console.warn("Font loading notification:", err);
  }

  // Load corner logo
  await loadLogoImage();

  // Load sample cinematic poster (Superman)
  await loadSamplePoster();

  renderBanner();
  updateViewportScale();
}

/**
 * Load sample poster on start with offline-safe embedded fallback
 */
function loadSamplePoster() {
  return new Promise((resolve) => {
    const src = (typeof EMBEDDED_SAMPLE_DATA_URI !== "undefined" && EMBEDDED_SAMPLE_DATA_URI)
      ? EMBEDDED_SAMPLE_DATA_URI
      : "sample-poster.jpg";
    const img = new Image();
    if (!src.startsWith("data:") && window.location.protocol.startsWith("http")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => {
      state.originalImage = img;
      state.croppedImage = img;
      state.cropImageSrc = img.src;
      if (openCropModalBtn) openCropModalBtn.disabled = false;
      resolve(img);
    };
    img.onerror = () => {
      if (typeof EMBEDDED_SAMPLE_DATA_URI !== "undefined" && src !== EMBEDDED_SAMPLE_DATA_URI) {
        const retry = new Image();
        retry.onload = () => {
          state.originalImage = retry;
          state.croppedImage = retry;
          state.cropImageSrc = retry.src;
          if (openCropModalBtn) openCropModalBtn.disabled = false;
          renderBanner();
          resolve(retry);
        };
        retry.onerror = () => {
          createProceduralDemo();
          resolve(null);
        };
        retry.src = EMBEDDED_SAMPLE_DATA_URI;
      } else {
        createProceduralDemo();
        resolve(null);
      }
    };
    img.src = src;
  });
}

/**
 * Procedural demo image fallback
 */
function createProceduralDemo() {
  const offCanvas = document.createElement("canvas");
  offCanvas.width = 650;
  offCanvas.height = 890;
  const octx = offCanvas.getContext("2d");
  const grad = octx.createLinearGradient(0, 0, 650, 890);
  grad.addColorStop(0, "#0284c7");
  grad.addColorStop(0.5, "#1e3a8a");
  grad.addColorStop(1, "#b91c1c");
  octx.fillStyle = grad;
  octx.fillRect(0, 0, 650, 890);

  const img = new Image();
  img.onload = () => {
    state.originalImage = img;
    state.croppedImage = img;
    state.cropImageSrc = img.src;
    if (openCropModalBtn) openCropModalBtn.disabled = false;
    renderBanner();
  };
  img.src = offCanvas.toDataURL();
}

/**
 * Switch Aspect Ratio (16:9 Banner vs 1:1 Square Post)
 */
function setAspectRatio(ratio) {
  state.config.aspectRatio = ratio;
  const isSquare = ratio === "1:1";

  // Update canvas internal buffer dimensions
  canvas.width = isSquare ? 1080 : 1920;
  canvas.height = 1080;

  // Sync all ratio buttons across UI
  document.querySelectorAll("[data-ratio]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.ratio === ratio);
  });

  if (activeRatioBadge) {
    activeRatioBadge.textContent = isSquare ? "1:1 Square" : "16:9 Banner";
  }
  if (resolutionBadge) {
    resolutionBadge.textContent = isSquare ? "1080 × 1080" : "1920 × 1080";
  }
  if (exportDimensionMeta) {
    exportDimensionMeta.innerHTML = isSquare ? "1080 × 1080 px (1:1)" : "1920 × 1080 px (16:9)";
  }
  if (exportTargetMeta) {
    exportTargetMeta.innerHTML = isSquare ? "Social & Feed Post" : "oaxismm.com banner";
  }

  updateDownloadButtonLabels();
  renderBanner();
  updateViewportScale();
}

/**
 * Update dynamic download button labels with format & ratio
 */
function updateDownloadButtonLabels() {
  const isSquare = state.config.aspectRatio === "1:1";
  const format = (state.config.exportFormat || "png").toUpperCase();

  if (downloadBannerBtn) {
    const textSpan = downloadBannerBtn.querySelector(".btn-text");
    if (textSpan) textSpan.textContent = `Download (${format})`;
  }
  if (downloadBannerBtn2) {
    const textSpan = downloadBannerBtn2.querySelector("span");
    if (textSpan) textSpan.textContent = `Download ${isSquare ? "1:1 Square" : "16:9 Banner"} (${format})`;
  }
  if (mobileDownloadBtn) {
    const mobileTextSpan = mobileDownloadBtn.querySelector("span");
    if (mobileTextSpan) mobileTextSpan.textContent = `Download (${format})`;
  }
}

/**
 * Main Rendering Engine: Renders 16:9 banner or 1:1 square post
 */
function renderBanner() {
  if (!state.originalImage && !state.croppedImage) return;

  const isSquare = state.config.aspectRatio === "1:1";
  const width = isSquare ? 1080 : 1920;
  const height = 1080;

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  if (isSquare) {
    renderSquareLayout(width, height);
  } else {
    renderBanner16x9Layout(width, height);
  }
}

/**
 * 16:9 Landscape Banner Layout (1920x1080)
 */
function renderBanner16x9Layout(width, height) {
  // 1. Draw Blurred Background
  drawBlurredBackground(width, height);

  // 2. Draw Sharp Poster Card on the Right
  drawPosterCard(width, height);

  // 3. Draw Fixed Upper Branding (/oaxismm.com မှဘာသာပြန်တင်ဆက်သည် in A10_YoeShin)
  drawUpperFixedBranding();

  // 4. Draw Corner Logo Badge (Top-Right)
  if (state.config.showLogo && state.logoImage) {
    drawCornerLogo(width);
  }

  // 5. Draw Flexible Middle Header & Caption (A10_YoeShin, multi-line support)
  drawMiddleContent();

  // 6. Draw Fixed Bottom Contacts (Vip ဝင်ရန် Telegram - OAXis69 Viber - 09 668 668 584 in A10_YoeShin)
  drawBottomFixedText(width, height);
}

/**
 * 1:1 Square Post Layout (1080x1080)
 * Exact geometry matching reference square post
 */
function renderSquareLayout(width, height) {
  // 1. Draw Blurred Background
  drawBlurredBackground(width, height);

  // 2. Draw Landscape Poster Card at the Top
  drawSquarePosterCard(width, height);

  // 3. Draw Fixed Upper Branding at Top Left
  drawSquareUpperBranding();

  // 4. Draw Corner Logo Badge at Top Right
  if (state.config.showLogo && state.logoImage) {
    drawSquareCornerLogo();
  }

  // 5. Draw Flexible Middle Header & Caption in Lower Half
  drawSquareMiddleContent(width, height);

  // 6. Draw Fixed Bottom VIP Contacts
  drawSquareBottomFixedText(width, height);
}

/**
 * Draw blurred background with dim tint overlay & subtle vignette
 */
function drawBlurredBackground(width, height) {
  const bgImg = state.originalImage || state.croppedImage;
  if (!bgImg) return;

  ctx.save();

  // Extra padding to eliminate blurry canvas boundary artifacts
  const padding = 120;
  const targetW = width + padding * 2;
  const targetH = height + padding * 2;
  const imgRatio = bgImg.width / bgImg.height;
  const canvasRatio = targetW / targetH;

  let drawW, drawH;
  if (imgRatio > canvasRatio) {
    drawH = targetH;
    drawW = targetH * imgRatio;
  } else {
    drawW = targetW;
    drawH = targetW / imgRatio;
  }

  const drawX = (width - drawW) / 2;
  const drawY = (height - drawH) / 2;

  // Gaussian blur
  const blur = Math.max(0, state.config.bgBlur);
  if (blur > 0) {
    ctx.filter = `blur(${blur}px)`;
  }
  ctx.drawImage(bgImg, drawX, drawY, drawW, drawH);
  ctx.filter = "none";

  // Dim overlay
  const darkness = Math.min(Math.max(0, state.config.bgDarkness), 0.95);
  ctx.fillStyle = `rgba(0, 0, 0, ${darkness})`;
  ctx.fillRect(0, 0, width, height);

  // Cinematic radial vignette
  const vignette = ctx.createRadialGradient(
    width / 2, height / 2, width * 0.25,
    width / 2, height / 2, width * 0.8
  );
  vignette.addColorStop(0, "rgba(0, 0, 0, 0)");
  vignette.addColorStop(1, "rgba(0, 0, 0, 0.45)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
}

/**
 * Draw sharp cropped poster card on the right
 */
function drawPosterCard(canvasW, canvasH) {
  const posterImg = state.croppedImage || state.originalImage;
  if (!posterImg) return;

  // Geometry matching reference image exactly:
  // Positioned on the right side with vertical centering
  const cardW = 650;
  const cardH = 890;
  const rightMargin = 86;
  const cardX = canvasW - cardW - rightMargin;
  const cardY = (canvasH - cardH) / 2;
  const radius = state.config.posterRadius;

  ctx.save();

  // Drop shadow
  if (state.config.posterShadow) {
    ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
    ctx.shadowBlur = 45;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 16;
  }

  roundedRectPath(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = "#0c0d14";
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.clip();

  // Cover fit inside card
  const imgRatio = posterImg.width / posterImg.height;
  const cardRatio = cardW / cardH;
  let sWidth, sHeight, sx, sy;

  if (imgRatio > cardRatio) {
    sHeight = posterImg.height;
    sWidth = posterImg.height * cardRatio;
    sx = (posterImg.width - sWidth) / 2;
    sy = 0;
  } else {
    sWidth = posterImg.width;
    sHeight = posterImg.width / cardRatio;
    sx = 0;
    sy = (posterImg.height - sHeight) / 2;
  }

  ctx.drawImage(posterImg, sx, sy, sWidth, sHeight, cardX, cardY, cardW, cardH);

  // Subtle clean inner border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.16)";
  ctx.lineWidth = 2.5;
  roundedRectPath(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw Fixed Upper Branding Text:
 * "/oaxismm.com မှဘာသာပြန်တင်ဆက်သည်"
 * Font: A10_YoeShin Bold
 * Colors: "/oaxismm.com" in warm yellow (#ffb703) + " မှဘာသာပြန်တင်ဆက်သည်" in white (#ffffff)
 * Both with bold black stroke outline (#000000)
 */
function drawUpperFixedBranding() {
  ctx.save();

  const upX = 68;
  const upY = 82;
  const fontSize = 52;

  ctx.font = `bold ${fontSize}px 'A10_YoeShin', 'ThuNgalTan', sans-serif`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;

  // 1. Yellow Part: "/oaxismm.com"
  const yellowText = "/oaxismm.com";
  ctx.lineWidth = 10.5;
  ctx.strokeStyle = "#000000";
  ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.strokeText(yellowText, upX, upY);

  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#ffb703";
  ctx.fillText(yellowText, upX, upY);

  const yellowW = ctx.measureText(yellowText).width;

  // 2. White Part: " မှဘာသာပြန်တင်ဆက်သည်"
  const whiteText = " မှဘာသာပြန်တင်ဆက်သည်";
  ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 2;
  ctx.lineWidth = 10.5;
  ctx.strokeStyle = "#000000";
  ctx.strokeText(whiteText, upX + yellowW, upY);

  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(whiteText, upX + yellowW, upY);

  ctx.restore();
}

/**
 * Draw Top-Right Circular Logo Badge
 */
function drawCornerLogo(canvasW) {
  const logo = state.logoImage;
  if (!logo) return;

  ctx.save();

  const diameter = 124;
  const rightMargin = 72;
  const topMargin = 50;
  const cx = canvasW - rightMargin - diameter / 2;
  const cy = topMargin + diameter / 2;
  const radius = diameter / 2;

  // Drop shadow behind circular emblem
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 6;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  // Clip to circle and draw logo
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  const scale = 1.12;
  const drawD = diameter * scale;
  const drawX = cx - drawD / 2;
  const drawY = cy - drawD / 2;
  ctx.drawImage(logo, drawX, drawY, drawD, drawD);

  ctx.restore();

  // Crisp white outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
  ctx.stroke();

  ctx.restore();
}

/**
 * Helper to draw stroked and filled text line centered at (x, y)
 * Automatically scales horizontally if line exceeds maxWidth to prevent touching poster card
 */
function drawTextLineWithOutline(line, x, y, strokeW, fontColor, maxW = 1060) {
  const measuredW = ctx.measureText(line).width;
  ctx.save();
  if (measuredW > maxW && maxW > 0) {
    const scale = maxW / measuredW;
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    // Stroke outline
    ctx.lineWidth = strokeW;
    ctx.strokeStyle = "#000000";
    ctx.strokeText(line, 0, 0);

    // Text fill
    ctx.fillStyle = fontColor;
    ctx.fillText(line, 0, 0);
  } else {
    // Stroke outline
    ctx.lineWidth = strokeW;
    ctx.strokeStyle = "#000000";
    ctx.strokeText(line, x, y);

    // Text fill
    ctx.fillStyle = fontColor;
    ctx.fillText(line, x, y);
  }
  ctx.restore();
}

/**
 * Draw Flexible Middle Header & Caption in the center of the left region
 * GUARANTEED NO-OVERLAP: Captions strictly stack below header lines.
 */
function drawMiddleContent() {
  const headerRaw = (state.config.mainHeader || "").trim();
  const captionRaw = (state.config.caption || "").trim();

  if (!headerRaw && !captionRaw) return;

  // Center of left region: poster card starts at 1184, so center = 1184 / 2 = 592
  const leftCenter = 592;
  const headerSize = state.config.mainHeaderSize || 118;
  const captionSize = state.config.captionSize || 70;
  const strokeWidth = state.config.strokeWidth || 11;
  const yOffset = state.config.mainHeaderYOffset || 0;
  const fontFamily = getFontFamilyString(state.config.headerFont);

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;

  // Split lines (supporting Enter / multi-line breaks)
  const headerLines = headerRaw ? headerRaw.split("\n").map(l => l.trim()).filter(l => l.length > 0) : [];
  const captionLines = captionRaw ? captionRaw.split("\n").map(l => l.trim()).filter(l => l.length > 0) : [];

  const headerLineHeight = Math.round(headerSize * 1.25);
  let captionLineHeight = Math.round(captionSize * 1.32);

  // Vertical layout centered in blank space (top branding at ~120, VIP text at ~990 -> center = 550)
  const blankCenterY = 550 + yOffset;
  const gapBetween = Math.round(headerSize * 0.65 + captionSize * 0.65 + 38); // Clean, comfortable gap between header & caption

  let headerStartY = blankCenterY;
  let captionStartY = blankCenterY;

  if (headerLines.length > 0 && captionLines.length > 0) {
    const totalHeaderH = (headerLines.length - 1) * headerLineHeight;
    const totalCaptionH = (captionLines.length - 1) * captionLineHeight;
    const totalBlockH = totalHeaderH + gapBetween + totalCaptionH;

    // Centering the block vertically in the blank space
    const visualBalance = Math.round((captionSize - headerSize) * 0.22);
    headerStartY = Math.round(blankCenterY - (totalBlockH / 2) - visualBalance);
    const lastHeaderY = headerStartY + totalHeaderH;

    // Caption starts at gap distance below last header line
    captionStartY = lastHeaderY + gapBetween;

    // Boundary check: ensure caption doesn't collide with bottom VIP text (Y=1032, top ~990)
    let lastCaptionY = captionStartY + (captionLines.length - 1) * captionLineHeight;
    let lastCaptionBottom = lastCaptionY + Math.round(captionSize * 0.45);
    const maxBottom = 975;

    if (lastCaptionBottom > maxBottom) {
      const overflow = lastCaptionBottom - maxBottom;
      const firstHeaderTop = headerStartY - Math.round(headerSize * 0.5);
      const maxShiftUp = Math.max(0, firstHeaderTop - 140);
      const shiftUp = Math.min(overflow, maxShiftUp);

      if (shiftUp > 0) {
        headerStartY -= shiftUp;
        captionStartY -= shiftUp;
        lastCaptionY -= shiftUp;
        lastCaptionBottom -= shiftUp;
      }

      if (lastCaptionBottom > maxBottom && captionLines.length > 1) {
        const remainingOverflow = lastCaptionBottom - maxBottom;
        const perGapReduction = remainingOverflow / (captionLines.length - 1);
        captionLineHeight = Math.max(Math.round(captionSize * 0.98), captionLineHeight - perGapReduction);
      }
    }
  } else if (headerLines.length > 0 && captionLines.length === 0) {
    const totalHeaderH = (headerLines.length - 1) * headerLineHeight;
    headerStartY = blankCenterY - Math.round(totalHeaderH / 2);
  } else if (headerLines.length === 0 && captionLines.length > 0) {
    const totalCaptionH = (captionLines.length - 1) * captionLineHeight;
    captionStartY = blankCenterY - Math.round(totalCaptionH / 2);
  }

  // 1. Draw Header Lines
  if (headerLines.length > 0) {
    ctx.font = `bold ${headerSize}px ${fontFamily}`;
    const headerStrokeW = Math.max(8, strokeWidth * 1.35);

    let curY = headerStartY;
    for (let i = 0; i < headerLines.length; i++) {
      ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      drawTextLineWithOutline(headerLines[i], leftCenter, curY, headerStrokeW, "#ffffff", 1060);
      curY += headerLineHeight;
    }
  }

  // 2. Draw Caption Lines (Strict downward flow, ZERO overlap!)
  if (captionLines.length > 0) {
    ctx.font = `bold ${captionSize}px ${fontFamily}`;
    const captionStrokeW = Math.max(6, strokeWidth * 0.95);

    let curY = captionStartY;
    for (let i = 0; i < captionLines.length; i++) {
      ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 3;
      drawTextLineWithOutline(captionLines[i], leftCenter, curY, captionStrokeW, "#ffffff", 1060);
      curY += captionLineHeight;
    }
  }

  ctx.restore();
}

/**
 * Draw Fixed Bottom VIP Contacts Text:
 * "Vip ဝင်ရန် Telegram - OAXis69   Viber - 09 668 668 584"
 * Font: A10_YoeShin Bold
 * Color: White (#ffffff) with black stroke outline (#000000)
 * Position: Centered horizontally at the bottom
 */
function drawBottomFixedText(width, height) {
  ctx.save();

  const bottomText = "Vip ဝင်ရန် Telegram - OAXis69   Viber - 09 668 668 584";
  const fontSize = 56;
  const bottomY = 1032;
  const centerX = width / 2;

  ctx.font = `bold ${fontSize}px 'A10_YoeShin', 'ThuNgalTan', sans-serif`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;

  // Black stroke outline
  ctx.lineWidth = 10;
  ctx.strokeStyle = "#000000";
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;
  ctx.strokeText(bottomText, centerX, bottomY);

  // Crisp white fill
  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(bottomText, centerX, bottomY);

  ctx.restore();
}

/**
 * 1:1 Square: Draw landscape poster card in upper portion
 */
function drawSquarePosterCard(canvasW, canvasH) {
  const posterImg = state.croppedImage || state.originalImage;
  if (!posterImg) return;

  const cardW = 926;
  const cardH = 464;
  const cardX = (canvasW - cardW) / 2; // 77
  const cardY = 88;
  const radius = Math.min(cardH / 2, Math.round(state.config.posterRadius * (22 / 28)));

  ctx.save();

  // Drop shadow
  if (state.config.posterShadow) {
    ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
    ctx.shadowBlur = 38;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 14;
  }

  roundedRectPath(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.fillStyle = "#0c0d14";
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.clip();

  // Cover fit inside landscape card
  const imgRatio = posterImg.width / posterImg.height;
  const cardRatio = cardW / cardH;
  let sWidth, sHeight, sx, sy;

  if (imgRatio > cardRatio) {
    sHeight = posterImg.height;
    sWidth = posterImg.height * cardRatio;
    sx = (posterImg.width - sWidth) / 2;
    sy = 0;
  } else {
    sWidth = posterImg.width;
    sHeight = posterImg.width / cardRatio;
    sx = 0;
    sy = (posterImg.height - sHeight) / 2;
  }

  ctx.drawImage(posterImg, sx, sy, sWidth, sHeight, cardX, cardY, cardW, cardH);

  // Inner border
  ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
  ctx.lineWidth = 2.5;
  roundedRectPath(ctx, cardX, cardY, cardW, cardH, radius);
  ctx.stroke();

  ctx.restore();
}

/**
 * 1:1 Square: Draw Upper Fixed Branding at Top Left
 */
function drawSquareUpperBranding() {
  ctx.save();

  const upX = 48;
  const upY = 56;
  const fontSize = 36;

  ctx.font = `bold ${fontSize}px 'A10_YoeShin', 'ThuNgalTan', sans-serif`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;

  // Yellow part: "/oaxismm.com"
  const yellowText = "/oaxismm.com";
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#000000";
  ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.strokeText(yellowText, upX, upY);

  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#ffb703";
  ctx.fillText(yellowText, upX, upY);

  const yellowW = ctx.measureText(yellowText).width;

  // White part: " မှဘာသာပြန်တင်ဆက်သည်"
  const whiteText = " မှဘာသာပြန်တင်ဆက်သည်";
  ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#000000";
  ctx.strokeText(whiteText, upX + yellowW, upY);

  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(whiteText, upX + yellowW, upY);

  ctx.restore();
}

/**
 * 1:1 Square: Draw Corner Logo Badge at Top Right
 */
function drawSquareCornerLogo() {
  const logo = state.logoImage;
  if (!logo) return;

  ctx.save();

  const diameter = 82;
  const cx = 1000;
  const cy = 58;
  const radius = diameter / 2;

  // Drop shadow behind circular emblem
  ctx.save();
  ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.restore();

  // Clip to circle and draw logo
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();

  const scale = 1.12;
  const drawD = diameter * scale;
  const drawX = cx - drawD / 2;
  const drawY = cy - drawD / 2;
  ctx.drawImage(logo, drawX, drawY, drawD, drawD);

  ctx.restore();

  // Crisp white outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
  ctx.stroke();

  ctx.restore();
}

/**
 * 1:1 Square: Draw Flexible Middle Header & Caption in Lower Half
 * Strict downward flow with zero overlap guarantee
 */
function drawSquareMiddleContent(canvasW, canvasH) {
  const headerRaw = (state.config.mainHeader || "").trim();
  const captionRaw = (state.config.caption || "").trim();

  if (!headerRaw && !captionRaw) return;

  const centerX = canvasW / 2; // 540
  const headerSize = Math.round((state.config.mainHeaderSize || 118) * (80 / 118));
  const captionSize = Math.round((state.config.captionSize || 70) * (54 / 70));
  const strokeWidth = Math.max(6, Math.round((state.config.strokeWidth || 11) * 0.8));
  const yOffset = Math.round((state.config.mainHeaderYOffset || 0) * 0.8);
  const fontFamily = getFontFamilyString(state.config.headerFont);

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;

  const headerLines = headerRaw ? headerRaw.split("\n").map(l => l.trim()).filter(l => l.length > 0) : [];
  const captionLines = captionRaw ? captionRaw.split("\n").map(l => l.trim()).filter(l => l.length > 0) : [];

  const headerLineHeight = Math.round(headerSize * 1.25);
  let captionLineHeight = Math.round(captionSize * 1.32);

  // Vertical layout centered in blank space (card bottom at ~565, VIP text at ~980 -> center = 770)
  const blankCenterY = 770 + yOffset;
  const gapBetween = Math.round(headerSize * 0.6 + captionSize * 0.6 + 32); // ~112px, clean, comfortable gap

  let headerStartY = blankCenterY;
  let captionStartY = blankCenterY;

  if (headerLines.length > 0 && captionLines.length > 0) {
    const totalHeaderH = (headerLines.length - 1) * headerLineHeight;
    const totalCaptionH = (captionLines.length - 1) * captionLineHeight;
    const totalBlockH = totalHeaderH + gapBetween + totalCaptionH;

    const visualBalance = Math.round((captionSize - headerSize) * 0.22);
    headerStartY = Math.round(blankCenterY - (totalBlockH / 2) - visualBalance);
    const lastHeaderY = headerStartY + totalHeaderH;

    captionStartY = lastHeaderY + gapBetween;

    // Bottom bound clamp (safe boundary before VIP footer at y=1008):
    let lastCaptionY = captionStartY + (captionLines.length - 1) * captionLineHeight;
    let lastCaptionBottom = lastCaptionY + Math.round(captionSize * 0.45);
    const maxBottom = 965;

    if (lastCaptionBottom > maxBottom) {
      const overflow = lastCaptionBottom - maxBottom;
      const firstHeaderTop = headerStartY - Math.round(headerSize * 0.5);
      const maxShiftUp = Math.max(0, firstHeaderTop - 565);
      const shiftUp = Math.min(overflow, maxShiftUp);

      if (shiftUp > 0) {
        headerStartY -= shiftUp;
        captionStartY -= shiftUp;
        lastCaptionY -= shiftUp;
        lastCaptionBottom -= shiftUp;
      }

      if (lastCaptionBottom > maxBottom && captionLines.length > 1) {
        const remainingOverflow = lastCaptionBottom - maxBottom;
        const perGapReduction = remainingOverflow / (captionLines.length - 1);
        captionLineHeight = Math.max(Math.round(captionSize * 0.96), captionLineHeight - perGapReduction);
      }
    }
  } else if (headerLines.length > 0 && captionLines.length === 0) {
    const totalHeaderH = (headerLines.length - 1) * headerLineHeight;
    headerStartY = blankCenterY - Math.round(totalHeaderH / 2);
  } else if (headerLines.length === 0 && captionLines.length > 0) {
    const totalCaptionH = (captionLines.length - 1) * captionLineHeight;
    captionStartY = blankCenterY - Math.round(totalCaptionH / 2);
  }

  // Draw Header Lines
  if (headerLines.length > 0) {
    ctx.font = `bold ${headerSize}px ${fontFamily}`;
    const headerStrokeW = Math.max(7, strokeWidth * 1.15);

    let curY = headerStartY;
    for (let i = 0; i < headerLines.length; i++) {
      ctx.shadowColor = "rgba(0, 0, 0, 0.75)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 3;
      drawTextLineWithOutline(headerLines[i], centerX, curY, headerStrokeW, "#ffffff", 960);
      curY += headerLineHeight;
    }
  }

  // Draw Caption Lines
  if (captionLines.length > 0) {
    ctx.font = `bold ${captionSize}px ${fontFamily}`;
    const captionStrokeW = Math.max(5.5, strokeWidth * 0.8);

    let curY = captionStartY;
    for (let i = 0; i < captionLines.length; i++) {
      ctx.shadowColor = "rgba(0, 0, 0, 0.65)";
      ctx.shadowBlur = 7;
      ctx.shadowOffsetY = 2;
      drawTextLineWithOutline(captionLines[i], centerX, curY, captionStrokeW, "#ffffff", 960);
      curY += captionLineHeight;
    }
  }

  ctx.restore();
}

/**
 * 1:1 Square: Draw Fixed Bottom VIP Contacts
 */
function drawSquareBottomFixedText(width, height) {
  ctx.save();

  const bottomText = "Vip ဝင်ရန် Telegram - OAXis69 • Viber - 09 668 668 584";
  const fontSize = 36;
  const bottomY = 1008;
  const centerX = width / 2;

  ctx.font = `bold ${fontSize}px 'A10_YoeShin', 'ThuNgalTan', sans-serif`;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;

  ctx.lineWidth = 7.5;
  ctx.strokeStyle = "#000000";
  ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
  ctx.shadowBlur = 7;
  ctx.shadowOffsetY = 2;
  ctx.strokeText(bottomText, centerX, bottomY);

  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(bottomText, centerX, bottomY);

  ctx.restore();
}

/**
 * Helper to resolve CSS font-family string from font key
 */
function getFontFamilyString(fontKey) {
  switch (fontKey) {
    case "A10_YoeShin":
    default:
      return "'A10_YoeShin', 'ThuNgalTan', 'Noto Sans Myanmar', 'Padauk', sans-serif";
    case "ThuNgalTan":
      return "'ThuNgalTan', 'A10_YoeShin', 'Noto Sans Myanmar', 'Padauk', sans-serif";
    case "Noto Sans Myanmar":
      return "'Noto Sans Myanmar', 'Padauk', sans-serif";
    case "Padauk":
      return "'Padauk', 'Noto Sans Myanmar', sans-serif";
    case "Outfit":
      return "'Outfit', 'Montserrat', sans-serif";
  }
}

/**
 * Update input field font preview styling based on chosen font
 */
function updateInputFontPreview(inputEl, fontKey) {
  if (!inputEl) return;
  inputEl.classList.remove(
    "font-preview-yoeshin",
    "font-preview-thungaltan",
    "font-preview-noto",
    "font-preview-padauk",
    "font-preview-outfit"
  );
  switch (fontKey) {
    case "A10_YoeShin":
    default:
      inputEl.classList.add("font-preview-yoeshin");
      break;
    case "ThuNgalTan":
      inputEl.classList.add("font-preview-thungaltan");
      break;
    case "Noto Sans Myanmar":
      inputEl.classList.add("font-preview-noto");
      break;
    case "Padauk":
      inputEl.classList.add("font-preview-padauk");
      break;
    case "Outfit":
      inputEl.classList.add("font-preview-outfit");
      break;
  }
}

/**
 * Helper: Create rounded rectangle path on canvas
 */
function roundedRectPath(context, x, y, width, height, radius) {
  radius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.arcTo(x + width, y, x + width, y + radius, radius);
  context.lineTo(x + width, y + height - radius);
  context.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  context.lineTo(x + radius, y + height);
  context.arcTo(x, y + height, x, y + height - radius, radius);
  context.lineTo(x, y + radius);
  context.arcTo(x, y, x + radius, y, radius);
  context.closePath();
}

/**
 * Responsive Zoom & Fit Preview
 */
function updateViewportScale() {
  if (!viewport || !canvasWrapper) return;
  const isMobile = window.innerWidth < 900;
  const pad = isMobile ? 24 : 60;
  
  const maxAvailW = isMobile ? Math.max(260, window.innerWidth - 24) : Math.max(300, window.innerWidth - 490);
  const vpWidth = viewport.clientWidth > pad ? Math.min(viewport.clientWidth - pad, maxAvailW) : maxAvailW;

  const maxAvailH = isMobile ? Math.max(260, window.innerHeight - 200) : Math.max(300, window.innerHeight - 150);
  const vpHeight = viewport.clientHeight > pad ? Math.min(viewport.clientHeight - pad, maxAvailH) : maxAvailH;

  const canvasW = canvas.width || (state.config.aspectRatio === "1:1" ? 1080 : 1920);
  const canvasH = canvas.height || 1080;

  let scale = 1;
  if (state.zoomMode === "fit") {
    scale = Math.min(vpWidth / canvasW, vpHeight / canvasH, 1);
  } else {
    scale = state.zoomMode;
  }

  const dispW = Math.round(canvasW * scale);
  const dispH = Math.round(canvasH * scale);

  canvasWrapper.style.width = `${dispW}px`;
  canvasWrapper.style.height = `${dispH}px`;
  canvasWrapper.style.transform = "none";

  if (zoomLevelDisplay) {
    zoomLevelDisplay.textContent = `${Math.round(scale * 100)}%`;
  }
}

/**
 * Mobile Tab Switcher (Controls vs Live Preview)
 */
function setupMobileTabs() {
  const jumpToPreviewBtn = document.getElementById("mobileJumpToPreviewBtn");
  const jumpToControlsBtn = document.getElementById("mobileJumpToControlsBtn");

  function setTab(tabName) {
    state.activeMobileTab = tabName;
    document.body.setAttribute("data-active-tab", tabName);

    if (tabControlsBtn) tabControlsBtn.classList.toggle("active", tabName === "controls");
    if (tabPreviewBtn) tabPreviewBtn.classList.toggle("active", tabName === "preview");

    // Re-scale canvas smoothly when tab changes
    setTimeout(updateViewportScale, 60);
  }

  if (tabControlsBtn) tabControlsBtn.addEventListener("click", () => setTab("controls"));
  if (tabPreviewBtn) tabPreviewBtn.addEventListener("click", () => setTab("preview"));
  if (jumpToPreviewBtn) jumpToPreviewBtn.addEventListener("click", () => setTab("preview"));
  if (jumpToControlsBtn) jumpToControlsBtn.addEventListener("click", () => setTab("controls"));
}

/**
 * Interactive Cropper.js Workflow
 */
function openCropModal() {
  if (!state.cropImageSrc) {
    showToast("Please upload an image first!");
    return;
  }

  cropImageElement.src = state.cropImageSrc;
  cropModal.classList.remove("hidden");

  // Destroy previous cropper if exists
  if (state.cropperInstance) {
    state.cropperInstance.destroy();
    state.cropperInstance = null;
  }

  const isSquare = state.config.aspectRatio === "1:1";
  const defaultCropRatio = isSquare ? (926 / 464) : (650 / 890);

  // Sync active chip in crop modal
  document.querySelectorAll(".aspect-ratio-selector .btn-chip").forEach((btn) => {
    const r = parseFloat(btn.dataset.ratio);
    btn.classList.toggle("active", Math.abs(r - defaultCropRatio) < 0.05);
  });

  cropImageElement.onload = () => {
    state.currentScaleX = 1;
    state.currentScaleY = 1;

    state.cropperInstance = new Cropper(cropImageElement, {
      aspectRatio: defaultCropRatio,
      viewMode: 1,
      dragMode: "move",
      autoCropArea: 0.95,
      restore: false,
      guides: true,
      center: true,
      highlight: false,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false
    });
  };
}

function closeCropModal() {
  cropModal.classList.add("hidden");
  if (state.cropperInstance) {
    state.cropperInstance.destroy();
    state.cropperInstance = null;
  }
}

function applyCrop() {
  if (!state.cropperInstance) return;

  const croppedCanvas = state.cropperInstance.getCroppedCanvas({
    maxWidth: 2560,
    maxHeight: 2560,
    imageSmoothingEnabled: true,
    imageSmoothingQuality: "high"
  });

  if (!croppedCanvas) {
    showToast("Failed to generate cropped image");
    return;
  }

  const croppedDataUrl = croppedCanvas.toDataURL("image/png");
  const newImg = new Image();
  newImg.onload = () => {
    state.croppedImage = newImg;
    closeCropModal();
    renderBanner();
    showToast("Poster cropped and updated successfully!");
  };
  newImg.src = croppedDataUrl;
}

/**
 * Handle File Upload (Input, Drag & Drop, Clipboard)
 */
function handleFileSelect(file) {
  if (!file || !file.type.startsWith("image/")) {
    showToast("Please select a valid image file");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const img = new Image();
    img.onload = () => {
      state.originalImage = img;
      state.croppedImage = img;
      state.cropImageSrc = dataUrl;
      if (openCropModalBtn) openCropModalBtn.disabled = false;
      renderBanner();
      showToast("Image loaded! Click 'Crop & Frame' to adjust framing.");
    };
    img.src = dataUrl;
  };
  reader.readAsDataURL(file);
}

/**
 * Download current canvas state as a file
 */
function downloadCurrentCanvasPromise(fileSuffix) {
  return new Promise((resolve) => {
    const format = state.config.exportFormat || "png";
    const mimeType = format === "jpeg" ? "image/jpeg" : "image/png";
    const quality = 0.95;

    canvas.toBlob((blob) => {
      if (!blob) {
        resolve(false);
        return;
      }
      const slug = (state.config.mainHeader || "oaxis")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");

      const ext = format === "jpeg" ? "jpg" : "png";
      const filename = `oaxismm-${slug || "poster"}-${fileSuffix}.${ext}`;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve(true);
    }, mimeType, quality);
  });
}

/**
 * Export & Download Active Banner Image
 */
function downloadBanner() {
  const isSquare = state.config.aspectRatio === "1:1";
  const suffix = isSquare ? "square-1080" : "banner-16x9";
  const format = state.config.exportFormat || "png";

  if (renderLoading) renderLoading.classList.remove("hidden");

  setTimeout(async () => {
    const ok = await downloadCurrentCanvasPromise(suffix);
    if (renderLoading) renderLoading.classList.add("hidden");
    if (ok) {
      showToast(`Downloaded ${isSquare ? "1:1 Square" : "16:9 Banner"} (${format.toUpperCase()})!`);
    } else {
      showToast("Error generating image blob");
    }
  }, 60);
}

/**
 * Export & Download Both Ratios (16:9 Banner + 1:1 Square Post)
 */
async function downloadBothRatios() {
  const originalRatio = state.config.aspectRatio;
  if (renderLoading) renderLoading.classList.remove("hidden");

  try {
    // 1. Download 16:9 Banner
    setAspectRatio("16:9");
    await new Promise((r) => setTimeout(r, 120));
    await downloadCurrentCanvasPromise("banner-16x9");

    // 2. Download 1:1 Square
    await new Promise((r) => setTimeout(r, 200));
    setAspectRatio("1:1");
    await new Promise((r) => setTimeout(r, 120));
    await downloadCurrentCanvasPromise("square-1080");

    // Restore previous ratio
    setAspectRatio(originalRatio);
    if (renderLoading) renderLoading.classList.add("hidden");
    showToast("Downloaded both 16:9 Banner & 1:1 Square images!");
  } catch (err) {
    console.error("Batch download error:", err);
    setAspectRatio(originalRatio);
    if (renderLoading) renderLoading.classList.add("hidden");
    showToast("Error during batch download: " + err.message);
  }
}

/**
 * Copy Image to Clipboard
 */
async function copyImageToClipboard() {
  if (!navigator.clipboard || !window.ClipboardItem) {
    showToast("Clipboard copy not supported in this browser");
    return;
  }

  try {
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob })
      ]);
      showToast("High-resolution poster copied to clipboard!");
    }, "image/png");
  } catch (err) {
    console.error("Clipboard copy error:", err);
    showToast("Could not copy to clipboard: " + err.message);
  }
}

/**
 * Bind UI Event Listeners
 */
function bindEventListeners() {
  // File upload input
  if (posterFileInput) {
    posterFileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files[0]) {
        handleFileSelect(e.target.files[0]);
      }
    });
  }

  // Drag and drop dropzone
  if (dropzone) {
    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });
    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });
    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFileSelect(e.dataTransfer.files[0]);
      }
    });
  }

  // Paste from clipboard (Ctrl+V anywhere)
  window.addEventListener("paste", (e) => {
    if (e.clipboardData && e.clipboardData.items) {
      for (const item of e.clipboardData.items) {
        if (item.type.indexOf("image") !== -1) {
          const file = item.getAsFile();
          handleFileSelect(file);
          break;
        }
      }
    }
  });

  // Crop modal triggers
  if (openCropModalBtn) openCropModalBtn.addEventListener("click", openCropModal);
  if (closeCropModalBtn) closeCropModalBtn.addEventListener("click", closeCropModal);
  if (cancelCropBtn) cancelCropBtn.addEventListener("click", closeCropModal);
  if (applyCropBtn) applyCropBtn.addEventListener("click", applyCrop);

  // Crop aspect ratios
  document.querySelectorAll(".aspect-ratio-selector .btn-chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".aspect-ratio-selector .btn-chip").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      if (state.cropperInstance) {
        const ratio = parseFloat(btn.dataset.ratio);
        state.cropperInstance.setAspectRatio(ratio);
      }
    });
  });

  // Crop transformations
  if (cropRotateLeftBtn) {
    cropRotateLeftBtn.addEventListener("click", () => {
      if (state.cropperInstance) state.cropperInstance.rotate(-90);
    });
  }
  if (cropRotateRightBtn) {
    cropRotateRightBtn.addEventListener("click", () => {
      if (state.cropperInstance) state.cropperInstance.rotate(90);
    });
  }
  if (cropFlipHBtn) {
    cropFlipHBtn.addEventListener("click", () => {
      if (state.cropperInstance) {
        state.currentScaleX = -state.currentScaleX;
        state.cropperInstance.scaleX(state.currentScaleX);
      }
    });
  }
  if (cropResetBtn) {
    cropResetBtn.addEventListener("click", () => {
      if (state.cropperInstance) {
        state.currentScaleX = 1;
        state.currentScaleY = 1;
        state.cropperInstance.reset();
      }
    });
  }

  // Middle Header input
  if (mainHeaderInput) {
    mainHeaderInput.addEventListener("input", (e) => {
      state.config.mainHeader = e.target.value;
      if (mainHeaderCharCount) mainHeaderCharCount.textContent = `${e.target.value.length} chars`;
      renderBanner();
    });
  }
  if (clearMainHeaderBtn) {
    clearMainHeaderBtn.addEventListener("click", () => {
      mainHeaderInput.value = "";
      state.config.mainHeader = "";
      if (mainHeaderCharCount) mainHeaderCharCount.textContent = "0 chars";
      renderBanner();
    });
  }
  if (headerFontSelect) {
    headerFontSelect.addEventListener("change", (e) => {
      state.config.headerFont = e.target.value;
      updateInputFontPreview(mainHeaderInput, e.target.value);
      updateInputFontPreview(captionInput, e.target.value);
      renderBanner();
    });
  }

  // Quick Header suggestion chips
  document.querySelectorAll(".chip-header").forEach((chip) => {
    chip.addEventListener("click", () => {
      const text = chip.dataset.text;
      mainHeaderInput.value = text;
      state.config.mainHeader = text;
      if (mainHeaderCharCount) mainHeaderCharCount.textContent = `${text.length} chars`;
      renderBanner();
      showToast("Middle Header updated!");
    });
  });

  // Middle Caption / Sub-title input
  if (captionInput) {
    captionInput.addEventListener("input", (e) => {
      state.config.caption = e.target.value;
      if (captionCharCount) captionCharCount.textContent = `${e.target.value.length} chars`;
      renderBanner();
    });
  }
  if (clearCaptionBtn) {
    clearCaptionBtn.addEventListener("click", () => {
      captionInput.value = "";
      state.config.caption = "";
      if (captionCharCount) captionCharCount.textContent = "0 chars";
      renderBanner();
    });
  }

  // Quick Caption suggestion chips
  document.querySelectorAll(".chip-caption").forEach((chip) => {
    chip.addEventListener("click", () => {
      const text = chip.dataset.text.replace(/&#10;/g, "\n");
      captionInput.value = text;
      state.config.caption = text;
      if (captionCharCount) captionCharCount.textContent = `${text.length} chars`;
      renderBanner();
      showToast("Sub-title updated!");
    });
  });

  // Sliders
  if (bgBlurRange) {
    bgBlurRange.addEventListener("input", (e) => {
      state.config.bgBlur = parseInt(e.target.value, 10);
      if (bgBlurVal) bgBlurVal.textContent = `${e.target.value}px`;
      renderBanner();
    });
  }

  if (bgDarknessRange) {
    bgDarknessRange.addEventListener("input", (e) => {
      const val = parseInt(e.target.value, 10);
      state.config.bgDarkness = val / 100;
      if (bgDarknessVal) bgDarknessVal.textContent = `${val}%`;
      renderBanner();
    });
  }

  if (posterRadiusRange) {
    posterRadiusRange.addEventListener("input", (e) => {
      state.config.posterRadius = parseInt(e.target.value, 10);
      if (posterRadiusVal) posterRadiusVal.textContent = `${e.target.value}px`;
      renderBanner();
    });
  }

  if (mainHeaderSizeRange) {
    mainHeaderSizeRange.addEventListener("input", (e) => {
      state.config.mainHeaderSize = parseInt(e.target.value, 10);
      if (mainHeaderSizeVal) mainHeaderSizeVal.textContent = `${e.target.value}px`;
      renderBanner();
    });
  }

  if (captionSizeRange) {
    captionSizeRange.addEventListener("input", (e) => {
      state.config.captionSize = parseInt(e.target.value, 10);
      if (captionSizeVal) captionSizeVal.textContent = `${e.target.value}px`;
      renderBanner();
    });
  }

  if (mainHeaderYOffsetRange) {
    mainHeaderYOffsetRange.addEventListener("input", (e) => {
      state.config.mainHeaderYOffset = parseInt(e.target.value, 10);
      if (mainHeaderYOffsetVal) mainHeaderYOffsetVal.textContent = `${e.target.value}px`;
      renderBanner();
    });
  }

  if (strokeWidthRange) {
    strokeWidthRange.addEventListener("input", (e) => {
      state.config.strokeWidth = parseInt(e.target.value, 10);
      if (strokeWidthVal) strokeWidthVal.textContent = `${e.target.value}px`;
      renderBanner();
    });
  }

  if (showLogoToggle) {
    showLogoToggle.addEventListener("change", (e) => {
      state.config.showLogo = e.target.checked;
      renderBanner();
    });
  }

  if (posterShadowToggle) {
    posterShadowToggle.addEventListener("change", (e) => {
      state.config.posterShadow = e.target.checked;
      renderBanner();
    });
  }

  // Export format radios
  document.querySelectorAll('input[name="exportFormat"]').forEach((radio) => {
    radio.addEventListener("change", (e) => {
      state.config.exportFormat = e.target.value;
      const label = e.target.value === "jpeg" ? "JPG" : "PNG";
      if (downloadBannerBtn) {
        const textSpan = downloadBannerBtn.querySelector(".btn-text");
        if (textSpan) textSpan.textContent = `Download (${label})`;
      }
      if (mobileDownloadBtn) {
        const mobileTextSpan = mobileDownloadBtn.querySelector("span");
        if (mobileTextSpan) mobileTextSpan.textContent = `Download (${label})`;
      }
    });
  });

  // Ratio switcher buttons (Cards in sidebar & Pills in toolbar)
  document.querySelectorAll("[data-ratio]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setAspectRatio(btn.dataset.ratio);
    });
  });

  // Action Buttons
  if (downloadBannerBtn) downloadBannerBtn.addEventListener("click", downloadBanner);
  if (downloadBannerBtn2) downloadBannerBtn2.addEventListener("click", downloadBanner);
  if (downloadBothBtn) downloadBothBtn.addEventListener("click", downloadBothRatios);
  if (mobileDownloadBtn) mobileDownloadBtn.addEventListener("click", downloadBanner);
  if (copyImageBtn) copyImageBtn.addEventListener("click", copyImageToClipboard);
  if (mobileCopyBtn) mobileCopyBtn.addEventListener("click", copyImageToClipboard);

  // Quick Sample & Reset
  if (quickSampleBtn) {
    quickSampleBtn.addEventListener("click", async () => {
      await loadSamplePoster();
      renderBanner();
      showToast("Superman reference poster loaded!");
    });
  }

  if (resetAllBtn) {
    resetAllBtn.addEventListener("click", () => {
      state.config.mainHeader = "Super Man";
      state.config.caption = "An Alien or a Human ?";
      state.config.headerFont = "ThuNgalTan";
      state.config.mainHeaderSize = 118;
      state.config.captionSize = 70;
      state.config.mainHeaderYOffset = 0;
      state.config.bgBlur = 28;
      state.config.bgDarkness = 0.25;
      state.config.posterRadius = 28;
      state.config.strokeWidth = 11;
      state.config.showLogo = true;
      state.config.posterShadow = true;

      if (mainHeaderInput) {
        mainHeaderInput.value = "Super Man";
        if (mainHeaderCharCount) mainHeaderCharCount.textContent = "9 chars";
      }
      if (captionInput) {
        captionInput.value = "An Alien or a Human ?";
        if (captionCharCount) captionCharCount.textContent = "21 chars";
      }
      if (headerFontSelect) {
        headerFontSelect.value = "ThuNgalTan";
        updateInputFontPreview(mainHeaderInput, "ThuNgalTan");
        updateInputFontPreview(captionInput, "ThuNgalTan");
      }

      if (bgBlurRange) {
        bgBlurRange.value = 28;
        if (bgBlurVal) bgBlurVal.textContent = "28px";
      }
      if (bgDarknessRange) {
        bgDarknessRange.value = 25;
        if (bgDarknessVal) bgDarknessVal.textContent = "25%";
      }
      if (posterRadiusRange) {
        posterRadiusRange.value = 28;
        if (posterRadiusVal) posterRadiusVal.textContent = "28px";
      }
      if (mainHeaderSizeRange) {
        mainHeaderSizeRange.value = 118;
        if (mainHeaderSizeVal) mainHeaderSizeVal.textContent = "118px";
      }
      if (captionSizeRange) {
        captionSizeRange.value = 70;
        if (captionSizeVal) captionSizeVal.textContent = "70px";
      }
      if (mainHeaderYOffsetRange) {
        mainHeaderYOffsetRange.value = 0;
        if (mainHeaderYOffsetVal) mainHeaderYOffsetVal.textContent = "0px";
      }
      if (strokeWidthRange) {
        strokeWidthRange.value = 11;
        if (strokeWidthVal) strokeWidthVal.textContent = "11px";
      }
      if (showLogoToggle) showLogoToggle.checked = true;
      if (posterShadowToggle) posterShadowToggle.checked = true;

      renderBanner();
      showToast("Settings reset to defaults");
    });
  }

  // Zoom controls
  if (zoomInBtn) {
    zoomInBtn.addEventListener("click", () => {
      const current = state.zoomMode === "fit" ? 0.6 : state.zoomMode;
      state.zoomMode = Math.min(1.5, current + 0.15);
      updateViewportScale();
    });
  }

  if (zoomOutBtn) {
    zoomOutBtn.addEventListener("click", () => {
      const current = state.zoomMode === "fit" ? 0.6 : state.zoomMode;
      state.zoomMode = Math.max(0.15, current - 0.15);
      updateViewportScale();
    });
  }

  if (zoomFitBtn) {
    zoomFitBtn.addEventListener("click", () => {
      state.zoomMode = "fit";
      updateViewportScale();
    });
  }

  window.addEventListener("resize", updateViewportScale);
  window.addEventListener("orientationchange", () => {
    setTimeout(updateViewportScale, 150);
  });
}

// Start application
window.addEventListener("DOMContentLoaded", initApp);
