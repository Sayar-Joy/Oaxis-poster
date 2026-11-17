/* Read-only export benchmark for the copied app. It does not trigger downloads. */
(() => {
  const panel = document.createElement('pre');
  panel.id = 'benchmark-results';
  panel.style.cssText = 'position:fixed;z-index:99999;inset:12px;overflow:auto;background:#111;color:#e8f7e8;padding:16px;font:13px/1.5 monospace;white-space:pre-wrap';
  document.body.appendChild(panel);

  const rows = [];
  const write = (message) => {
    rows.push(message);
    panel.textContent = rows.join('\n');
    console.log('[benchmark]', message);
  };
  const pause = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  const encode = (target, type, quality) => new Promise((resolve, reject) => {
    const start = performance.now();
    try {
      target.toBlob((blob) => {
        if (!blob) return reject(new Error('toBlob returned null'));
        resolve({ ms: performance.now() - start, bytes: blob.size });
      }, type, quality);
    } catch (error) {
      reject(error);
    }
  });
  const fmt = (n) => n.toFixed(1);
  const mb = (n) => (n / 1_000_000).toFixed(2);

  async function run() {
    const started = performance.now();
    write(`Browser: ${navigator.userAgent}`);
    write(`Canvas attributes: ${JSON.stringify(ctx.getContextAttributes?.() || {})}`);
    write(`Poster source: ${state.originalImage.width}x${state.originalImage.height}`);
    write('Timing render, blur drawing, PNG encoding and JPEG encoding. No files are saved.');

    const originalRatio = state.config.aspectRatio;
    const originalBlur = state.config.bgBlur;
    const originalBackground = drawBlurredBackground;
    let backgroundMs = 0;
    drawBlurredBackground = function (...args) {
      const start = performance.now();
      try { return originalBackground(...args); }
      finally { backgroundMs += performance.now() - start; }
    };

    try {
      for (const ratio of ['1:1', '16:9']) {
        for (let pass = 1; pass <= 3; pass++) {
          state.config.bgBlur = originalBlur;
          backgroundMs = 0;
          const renderStart = performance.now();
          setAspectRatio(ratio);
          const renderMs = performance.now() - renderStart;
          await pause();
          const png = await encode(canvas, 'image/png');
          write(`${ratio} pass ${pass}: render ${fmt(renderMs)}ms (background ${fmt(backgroundMs)}ms), PNG ${fmt(png.ms)}ms, ${mb(png.bytes)}MB`);
        }

        state.config.bgBlur = 0;
        backgroundMs = 0;
        const noBlurStart = performance.now();
        renderBanner();
        write(`${ratio} blur=0: render ${fmt(performance.now() - noBlurStart)}ms (background ${fmt(backgroundMs)}ms)`);

        state.config.bgBlur = originalBlur;
        renderBanner();
        await pause();
        const jpeg = await encode(canvas, 'image/jpeg', 0.85);
        write(`${ratio} JPEG q=.85: ${fmt(jpeg.ms)}ms, ${mb(jpeg.bytes)}MB`);

        if (ratio === '16:9') {
          for (const [width, height] of [[1600, 900], [1280, 720]]) {
            const scaled = document.createElement('canvas');
            scaled.width = width;
            scaled.height = height;
            scaled.getContext('2d').drawImage(canvas, 0, 0, width, height);
            const pngScaled = await encode(scaled, 'image/png');
            write(`16:9 scaled ${width}x${height} PNG: ${fmt(pngScaled.ms)}ms, ${mb(pngScaled.bytes)}MB (encoding only)`);
          }
        }
      }
      write(`DONE in ${fmt((performance.now() - started) / 1000)}s`);
    } catch (error) {
      write(`ERROR: ${error.stack || error}`);
    } finally {
      drawBlurredBackground = originalBackground;
      state.config.bgBlur = originalBlur;
      setAspectRatio(originalRatio);
    }
  }

  const ready = setInterval(() => {
    if (state.originalImage && state.logoImage) {
      clearInterval(ready);
      run();
    }
  }, 100);
})();
