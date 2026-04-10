#!/usr/bin/env node
import { chromium } from 'playwright';
import { resolve } from 'node:path';
import { existsSync, writeFileSync } from 'node:fs';

const SESSION_PATH = resolve('_opensquad/_browser_profile/linkedin.json');

async function login(page) {
    console.log('🔍 Verificando sessão do LinkedIn...');
    await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 60000 });

    if (page.url().includes('login')) {
        console.log('⚠️ Sessão inválida ou expirada. Realize o login manualmente.');
        await page.waitForURL('**/feed/**', { timeout: 0 });
        
        const storage = await page.context().storageState();
        writeFileSync(SESSION_PATH, JSON.stringify(storage));
        console.log('✅ Sessão salva em', SESSION_PATH);
    } else {
        console.log('✅ Sessão ativa.');
    }
}

async function publishArticle(title, content, coverImage) {
    const userDataDir = resolve('_opensquad/_browser_profile');
    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        channel: 'chrome',
        args: ['--start-maximized']
    });

    const page = await context.newPage();
    
    const contentSelectors = [
        '.editor-content__editor [contenteditable="true"]',
        '.ql-editor[contenteditable="true"]',
        'div[role="textbox"][aria-label="Corpo do artigo"]',
        '.editor-content__editor'
    ];

    try {
        await login(page);

        console.log('📝 Iniciando criação de artigo...');
        await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(15000); 

        const articleButtonSelectors = [
            'button:has-text("Escrever artigo")',
            'span:has-text("Escrever artigo")',
            'button:has-text("Write article")',
            'span:has-text("Write article")',
            '[data-control-name="write_article_launch"]',
            '.share-box-feed-entry__trigger--article'
        ];

        let articleButtonFound = false;
        try {
            console.log('🎯 Tentando localizar botão "Escrever artigo" via JavaScript...');
            articleButtonFound = await page.evaluate(() => {
                const elements = Array.from(document.querySelectorAll('span, button, div, a'));
                const target = elements.find(el => {
                    const text = el.textContent.trim().toLowerCase();
                    return text === 'escrever artigo' || text === 'write article';
                });
                if (target) {
                    target.click();
                    return true;
                }
                return false;
            });
            
            if (articleButtonFound) {
                console.log('✅ Botão clicado via JS. Aguardando carregamento do editor...');
                await page.waitForTimeout(10000); // Wait longer for the editor to open
                await page.screenshot({ path: resolve('temp/after_click_article.png') });
            }
        } catch (e) {
            console.log('ℹ️ Erro ao tentar clicar via JS.');
        }

        if (!articleButtonFound) {
            console.log('⚠️ Botão não encontrado via JS. Tentando seletores padrão e URL direta...');
            await page.goto('https://www.linkedin.com/pulse/article/new', { waitUntil: 'load', timeout: 60000 });
            await page.waitForTimeout(5000);
        }

        // Handle Publishing Identity Overlay (Profile vs Page)
        console.log('👤 Verificando seleção de identidade...');
        const identitySelectors = [
            'button:has-text("Próximo")',
            'button:has-text("Next")',
            '.artdeco-button--primary',
            '[data-test-modal-close-button]'
        ];
        
        try {
            const overlayVisible = await page.isVisible('.publishing-identity-selection , .artdeco-modal');
            if (overlayVisible) {
                console.log('🎯 Overlay de identidade detectado. Confirmando...');
                for (const selector of identitySelectors) {
                    if (await page.isVisible(selector)) {
                        await page.click(selector);
                        break;
                    }
                }
                await page.waitForTimeout(5000);
            }
        } catch (e) {
            console.log('ℹ️ Overlay de identidade não apareceu.');
        }

        console.log('✍️ Escrevendo título...');
        const headlineSelectors = [
            'div[aria-label="Título do artigo"]',
            'div[aria-label="Headline"]',
            '.editor-content__title [contenteditable="true"]',
            '[data-test-article-title-input]',
            'a[id="headline"]',
            'textarea.artdeco-text-input__input',
            'h1[role="textbox"]',
            'h1'
        ];
        
        let headlineFound = false;
        
        // Attempt 1: Multi-strategy Focus (Role + Coordinates + Text)
        const targets = [page, ...page.frames()];
        await page.evaluate(() => window.scrollTo(0, 0));
        
        for (const target of targets) {
            if (headlineFound) break;
            try {
                // Deep search for the Draft.js title editor
                console.log(`🔬 Buscando editor Draft.js em ${target === page ? 'main' : 'iframe'}...`);
                const titleFilled = await target.evaluate((t) => {
                    const editables = Array.from(document.querySelectorAll('[contenteditable="true"]'));
                    // Title is typically the first one or contains "Título" in placeholder
                    const titleField = editables.find(el => 
                        el.getAttribute('data-placeholder')?.includes('Título') || 
                        el.getAttribute('aria-label')?.includes('Título') ||
                        el.tagName === 'H1'
                    ) || editables[0];

                    if (titleField) {
                        titleField.focus();
                        document.execCommand('selectAll', false, null);
                        document.execCommand('delete', false, null);
                        document.execCommand('insertText', false, t);
                        titleField.dispatchEvent(new Event('input', { bubbles: true }));
                        titleField.dispatchEvent(new Event('blur', { bubbles: true }));
                        return true;
                    }
                    return false;
                }, title);

                if (titleFilled) {
                    console.log('✅ Título injetado via JavaScript exaustivo.');
                    headlineFound = true;
                    await page.waitForTimeout(1000);
                }
            } catch (e) {}
        }

        // Attempt 2: Keyboard Relative Navigation (The "Pro" Way)
        if (!headlineFound) {
            console.log('⌨️ Tentando navegação relativa (Corpo -> Shift+Tab -> Título)...');
            // 1. Focus the content area first (which we know usually works)
            for (const selector of contentSelectors) {
                const contentEl = await page.$(selector);
                if (contentEl) {
                    await contentEl.click();
                    await page.waitForTimeout(500);
                    
                    // 2. Shift+Tab should move to Title
                    await page.keyboard.press('Shift+Tab');
                    await page.waitForTimeout(500);
                    
                    // 3. Select all and type
                    await page.keyboard.down('Control');
                    await page.keyboard.press('A');
                    await page.keyboard.up('Control');
                    await page.keyboard.press('Backspace');
                    await page.keyboard.type(title, { delay: 50 });
                    
                    headlineFound = true;
                    break;
                }
            }
        }
        
        if (!headlineFound) {
             console.log('⚠️ Tentativa final: evaluate em h1 genérico...');
             try {
                 await page.evaluate((val) => {
                     const h1 = document.querySelector('h1');
                     if (h1) {
                         h1.innerText = val;
                         h1.dispatchEvent(new Event('input', { bubbles: true }));
                     }
                 }, title);
                 headlineFound = true;
             } catch (e) {}
        }

        await page.waitForTimeout(2000);
        await page.screenshot({ path: resolve('temp/debug_title_filled.png') });

        if (!headlineFound) throw new Error('Não foi possível encontrar o campo de título do artigo.');

        // Imagem de capa
        if (coverImage && existsSync(resolve(coverImage))) {
            console.log('🖼️ Fazendo upload da capa...');
            let coverUploaded = false;
            const coverSelectors = ['button:has-text("Carregar do computador")', '.cover-image-upload__button', 'button:has-text("Add a cover image")'];
            
            // Try main page
            for (const selector of coverSelectors) {
                try {
                    if (await page.isVisible(selector)) {
                        const [fileChooser] = await Promise.all([
                            page.waitForEvent('filechooser', { timeout: 10000 }),
                            page.click(selector)
                        ]);
                        await fileChooser.setFiles(resolve(coverImage));
                        coverUploaded = true;
                        break;
                    }
                } catch (e) {}
            }

            // Try iframes
            if (!coverUploaded) {
                const frames = page.frames();
                for (const frame of frames) {
                    for (const selector of coverSelectors) {
                        try {
                            if (await frame.isVisible(selector)) {
                                const [fileChooser] = await Promise.all([
                                    page.waitForEvent('filechooser', { timeout: 10000 }),
                                    frame.click(selector)
                                ]);
                                await fileChooser.setFiles(resolve(coverImage));
                                coverUploaded = true;
                                break;
                            }
                        } catch (e) {}
                    }
                    if (coverUploaded) break;
                }
            }
            if (coverUploaded) await page.waitForTimeout(5000);
        }

        // Conteúdo
        console.log('📄 Inserindo conteúdo...');
        let contentFound = false;
        // Try main page
        for (const selector of contentSelectors) {
            try {
                if (await page.isVisible(selector)) {
                    await page.click(selector);
                    await page.fill(selector, content);
                    contentFound = true;
                    break;
                }
            } catch (e) {}
        }

        // Try iframes
        if (!contentFound) {
            const frames = page.frames();
            for (const frame of frames) {
                for (const selector of contentSelectors) {
                    try {
                        if (await frame.isVisible(selector)) {
                            await frame.click(selector);
                            await frame.fill(selector, content);
                            contentFound = true;
                            break;
                        }
                    } catch (e) {}
                }
                if (contentFound) break;
            }
        }

        // Publicar
        console.log('📤 Publicando...');
        const advanceSelectors = [
            'button:has-text("Avançar")',
            'button:has-text("Next")',
            '.artdeco-button--primary'
        ];

        let advanced = false;
        // Try multiple methods and ALL FRAMES to click "Avançar"
        let modalOpened = false;
        console.log('🔘 Iniciando tentativa de transição para modal de publicação (Multiframe)...');
        
        const possibleTargets = [page, ...page.frames()];
        
        for (let i = 0; i < 3; i++) {
            for (const target of possibleTargets) {
                try {
                    const nextBtn = target.getByRole('button', { name: /Avançar|Next/i }).first();
                    if (await nextBtn.isVisible()) {
                        console.log(`   - Botão encontrado em ${target === page ? 'main' : 'iframe'}. Clicando...`);
                        await nextBtn.scrollIntoViewIfNeeded();
                        await nextBtn.click({ force: true });
                    } else {
                        await target.evaluate(() => {
                            const btns = Array.from(document.querySelectorAll('button, span'));
                            const btn = btns.find(b => b.innerText.includes('Avançar') || b.innerText.includes('Next'));
                            if (btn) btn.click();
                        });
                    }
                } catch (e) {}
                
                // Check if already published (URL or buttons)
                const currentUrl = page.url();
                const publishedElements = await page.isVisible('button:has-text("Gostei"), .pulse-article-engagement');
                
                if (currentUrl.includes('/pulse/') && !currentUrl.includes('/article/new') && publishedElements) {
                    modalOpened = true; 
                    console.log('✅ Artigo detectado como PUBLICADO (via URL de visualização).');
                    break;
                }

                // Check if modal appeared on main page
                try {
                    const modal = await page.waitForSelector('.artdeco-modal, .share-actions__primary-action, .share-box-social-action-bar__post-button, .feed-shared-post-meta', { timeout: 3000 });
                    if (modal) {
                        modalOpened = true;
                        console.log('✅ Modal de publicação ou confirmação de postagem detectada!');
                        break;
                    }
                } catch (e) {}
            }
            if (modalOpened) break;
            console.log(`   - Aguardando modal (tentativa ${i+1})...`);
            await page.waitForTimeout(2000);
        }
        
        if (!modalOpened) {
            await page.screenshot({ path: resolve('temp/debug_no_modal.png'), fullPage: true });
            throw new Error('Não foi possível abrir a modal de publicação. Verifique o screenshot debug_no_modal.png');
        }

        await page.waitForTimeout(2000);
        // LinkedIn Article Publish usually requires a second click for confirmation or hashtags
        console.log('🚀 Confirmação final...');
        const finalPublishSelectors = [
            'button.share-actions__primary-action',
            'button:has-text("Publicar")',
            'button:has-text("Publish")',
            'button:has-text("Publicar agora")',
            'button:has-text("Publish now")',
            '.artdeco-modal__actionbar button--primary',
            '[aria-label="Publicar artigo"]',
            '[aria-label="Publish article"]'
        ];

        let finallyPublished = false;
        // Wait for modal transition
        await page.waitForTimeout(2000);

        for (const selector of finalPublishSelectors) {
            try {
                const btn = page.locator(selector).first();
                if (await btn.isVisible()) {
                    console.log(`🚀 Confirmando publicação via: ${selector}`);
                    await btn.click({ force: true });
                    finallyPublished = true;
                    break;
                }
            } catch (e) {}
        }

        if (!finallyPublished) {
             throw new Error('Botão final de "Publicar" não localizado na modal de confirmação.');
        }

        console.log('✅ Artigo enviado com sucesso! Aguardando confirmação do LinkedIn...');
        try {
            await page.waitForSelector('.artdeco-toast-item--success, .share-box-social-action-bar__post-button--disabled', { timeout: 15000 });
            console.log('✅ Artigo publicado com sucesso!');
        } catch (e) {
            console.log('⚠️ Aviso: Timeout aguardando confirmação visual, mas o comando de publicação foi enviado.');
            await page.screenshot({ path: resolve('temp/debug_final_state.png') });
        }

    } catch (error) {
        console.error('❌ Erro ao publicar artigo:', error);
        await page.screenshot({ path: resolve('temp/article_error.png'), fullPage: true });
    } finally {
        await page.waitForTimeout(5000);
        await context.close();
    }
}

async function publishCarousel(images, caption) {
    const userDataDir = resolve('_opensquad/_browser_profile');
    const context = await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        channel: 'chrome',
        args: ['--start-maximized']
    });

    const page = await context.newPage();
    try {
        await login(page);

        console.log('🚀 Iniciando postagem de carrossel...');
        await page.goto('https://www.linkedin.com/feed/', { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(5000);

        const postSelectors = [
            'button.share-box-feed-entry__trigger',
            'button:has-text("Começar publicação")',
            'button:has-text("Start a post")'
        ];

        let postButtonFound = await page.isVisible('.ql-editor');
        if (!postButtonFound) {
            for (const selector of postSelectors) {
                try {
                    await page.waitForSelector(selector, { timeout: 5000 });
                    await page.click(selector);
                    postButtonFound = true;
                    await page.waitForSelector('.ql-editor', { timeout: 10000 });
                    break;
                } catch (e) {}
            }
        }

        if (!postButtonFound) throw new Error('Não foi possível iniciar a postagem.');

        console.log('📸 Fazendo upload das imagens...');
        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            page.click('button[aria-label="Adicionar mídia"], .share-promoted-detour-button')
        ]);
        
        const absolutePaths = images.split(',').map(p => resolve(p.trim()));
        await fileChooser.setFiles(absolutePaths);

        await page.waitForTimeout(3000); 
        await page.click('button:has-text("Avançar"), button:has-text("Next")');

        console.log('📝 Inserindo legenda...');
        await page.fill('.ql-editor', caption);

        console.log('📤 Enviando...');
        await page.click('button.share-actions__primary-action, button:has-text("Publicar")');
        
        await page.waitForSelector('.artdeco-toast-item', { timeout: 15000 });
        console.log('✅ Carrossel publicado com sucesso!');

    } catch (error) {
        console.error('❌ Erro no carrossel:', error);
        await page.screenshot({ path: resolve('temp/carousel_error.png'), fullPage: true });
    } finally {
        await page.waitForTimeout(5000);
        await context.close();
    }
}

// CLI arg parsing
const args = process.argv.slice(2);
let type = 'carousel';
let images = '';
let caption = '';
let title = '';
let content = '';
let cover = '';

for (let i = 0; i < args.length; i++) {
    if (args[i] === '--type') type = args[++i];
    if (args[i] === '--images') images = args[++i];
    if (args[i] === '--caption') caption = args[++i];
    if (args[i] === '--title') title = args[++i];
    if (args[i] === '--content') content = args[++i];
    if (args[i] === '--cover') cover = args[++i];
}

if (type === 'article') {
    if (!title || !content) {
        console.log('Usage: publish.js --type article --title "Title" --content "Content" [--cover "path.jpg"]');
        process.exit(1);
    }
    publishArticle(title, content, cover);
} else {
    if (!images || !caption) {
        console.log('Usage: publish.js --type carousel --images "p1.jpg,p2.jpg" --caption "Hello"');
        process.exit(1);
    }
    publishCarousel(images, caption);
}
