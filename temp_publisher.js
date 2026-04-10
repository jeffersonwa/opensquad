import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

async function run() {
    const data = JSON.parse(await readFile('squads/security-carousel-pro/output/2026-04-10-080800/v1/article.json', 'utf-8'));
    const coverPath = resolve('squads/security-carousel-pro/output/2026-04-10-080800/v1/cover.png');
    
    let fullContent = `${data.introducao}\n\n`;
    for (const section of data.corpo) {
        fullContent += `${section.subtitulo}\n${section.texto}\n\n`;
    }
    fullContent += `Análise Técnica\n${data.analise}\n\n`;
    fullContent += `Recomendações\n${data.recomendacoes.map(r => `• ${r}`).join('\n')}\n\n`;
    fullContent += `${data.conclusao}\n\n`;
    fullContent += `${data.cta}`;

    const args = [
        'skills/linkedin-publisher/scripts/publish.js',
        '--type', 'article',
        '--title', data.titulo,
        '--content', fullContent,
        '--cover', coverPath
    ];

    console.log('🚀 Iniciando publicação via sub-processo...');
    const child = spawn('node', args, { stdio: 'inherit' });

    child.on('close', (code) => {
        process.exit(code);
    });
}

run();
