const { chromium } = require('playwright');
const { writeFileSync } = require('fs');

(async () => {
    try {
        const browser = await chromium.launchPersistentContext('c:/Users/jefferson.almeida.JA/.antigravity/opensquad/_opensquad/_browser_profile', { 
            headless: false,
            channel: 'chrome' 
        });
        const page = await browser.newPage();
        await page.goto('https://www.linkedin.com/feed/');
        await page.waitForTimeout(5000);
        
        // Try to click the button
        await page.click('button:has-text("Escrever artigo")');
        await page.waitForTimeout(10000);
        
        // Screenshot to confirm we are there
        await page.screenshot({ path: 'c:/Users/jefferson.almeida.JA/.antigravity/opensquad/temp/accessibility_debug.png' });
        
        const snapshot = await page.accessibility.snapshot();
        writeFileSync('c:/Users/jefferson.almeida.JA/.antigravity/opensquad/temp/accessibility_tree.json', JSON.stringify(snapshot, null, 2));
        
        await browser.close();
        console.log('✅ Accessibility tree saved.');
    } catch (e) {
        console.error('❌ Error during accessibility snapshot:', e);
    }
})();
