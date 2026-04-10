import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const article = JSON.parse(readFileSync('squads/security-carousel-pro/pipeline/data/article.json', 'utf8'));
const cover = 'squads/security-carousel-pro/pipeline/output/cover/cover.png';

const args = [
    'skills/linkedin-publisher/scripts/publish.js',
    '--type', 'article',
    '--title', article.title,
    '--content', article.content,
    '--cover', cover
];

console.log('🚀 Iniciando script de publicação via wrapper...');
const child = spawn('node', args, { stdio: 'inherit' });

child.on('close', (code) => {
    process.exit(code);
});
