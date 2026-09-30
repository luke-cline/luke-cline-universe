import { chromium } from 'playwright';
(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  page.on('pageerror', err => { console.log('PAGEERR:', err.message); });
  page.on('console', msg => { if (msg.type() === 'error') console.log('ERR:', msg.text()); });
  
  await page.goto('http://localhost:3000/#personal', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // Check hero videos
  const videos = await page.$$('.hero-video');
  console.log('Hero videos found:', videos.length);
  
  for (let i = 0; i < videos.length; i++) {
    const info = await videos[i].evaluate(el => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      return {
        id: el.id || 'no-id',
        visible: rect.width > 0 && rect.height > 0,
        rect: { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) },
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        zIndex: style.zIndex,
        position: style.position,
        autoplay: el.autoplay,
        muted: el.muted,
        loop: el.loop,
        paused: el.paused,
        readyState: el.readyState,
        networkState: el.networkState,
        duration: el.duration,
        currentSrc: el.currentSrc || (el.querySelector('source')?.getAttribute('src') || 'none'),
        videoWidth: el.videoWidth,
        videoHeight: el.videoHeight,
        offsetParent: el.offsetParent ? 'visible' : 'null',
        parentOverflow: getComputedStyle(el.parentElement).overflow,
        parentDisplay: getComputedStyle(el.parentElement).display
      };
    });
    console.log(`Video[${i}]:`, JSON.stringify(info, null, 2));
  }
  
  // Check if the hero-glass is covering the video
  const heroGlass = await page.$('.hero-glass');
  if (heroGlass) {
    const box = await heroGlass.boundingBox();
    console.log('\n.hero-glass box:', JSON.stringify(box));
    const bg = await heroGlass.evaluate(el => getComputedStyle(el).background);
    const zIndex = await heroGlass.evaluate(el => getComputedStyle(el).zIndex);
    console.log('.hero-glass zIndex:', zIndex);
    console.log('.hero-glass bg:', bg.substring(0, 100));
  }
  
  // Check the video element's parent chain for visibility
  const firstVid = await page.$('.hero-video');
  if (firstVid) {
    const visibilityChain = await firstVid.evaluate(el => {
      const chain = [];
      let node = el.parentElement;
      for (let i = 0; i < 5 && node; i++) {
        const style = getComputedStyle(node);
        chain.push({
          tag: node.tagName,
          class: node.className,
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          overflow: style.overflow,
          zIndex: style.zIndex
        });
        node = node.parentElement;
      }
      return chain;
    });
    console.log('\nParent chain:');
    visibilityChain.forEach((p, i) => console.log(`  ${i}: <${p.tag}.${p.class}> display=${p.display} visibility=${p.visibility} opacity=${p.opacity} overflow=${p.overflow} z=${p.zIndex}`));
  }
  
  // Take screenshot
  await page.screenshot({ path: 'video-test.png', fullPage: true });
  console.log('\nScreenshot saved: video-test.png');
  
  await browser.close();
})();
