import { execSync } from 'node:child_process';
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import 'dotenv/config';

// Configurações
const SQUAD_NAME = 'security-carousel-pro';
const OUTPUT_BASE = resolve('squads', SQUAD_NAME, 'output');
const LOG_DIR = resolve('_opensquad/logs/scheduled');
const RUN_ID = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const RUN_DIR = join(OUTPUT_BASE, RUN_ID);

// Garantir diretórios
if (!existsSync(LOG_DIR)) mkdirSync(LOG_DIR, { recursive: true });
if (!existsSync(RUN_DIR)) mkdirSync(RUN_DIR, { recursive: true });

const logFile = join(LOG_DIR, `${RUN_ID}.log`);

function log(message) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] ${message}\n`;
    console.log(message);
    writeFileSync(logFile, entry, { flag: 'a' });
}

async function runStep(name, command) {
    log(`🚀 Iniciando Etapa: ${name}...`);
    try {
        const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
        log(`✅ Etapa ${name} concluída.`);
        return output;
    } catch (error) {
        log(`❌ Erro na Etapa ${name}: ${error.message}`);
        log(`Dica: Verifique os logs detalhados em ${logFile}`);
        throw error;
    }
}

async function main() {
    log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    log(`🤖 Início da Execução Automática: ${SQUAD_NAME}`);
    log(`🆔 Run ID: ${RUN_ID}`);
    log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    try {
        // Etapa 1: Pesquisa (Mock para versão autônoma inicial via scrap simples ou search tool)
        // Nota: Em uma versão madura, aqui chamamos um script que usa a Gemini API.
        log('🔎 Pesquisando tendências de segurança...');
        const newsData = {
            tema: "Cibersegurança em 2026",
            fonte: "Computer Weekly",
            tendencias: ["MCP Security", "AI Phishing", "Cyber Resilience"]
        };
        const newsPath = join(RUN_DIR, 'news.json');
        writeFileSync(newsPath, JSON.stringify(newsData, null, 2));

        // Etapa 2: Redação (Usando template robusto para garantir consistência sem LLM externo opcional)
        // TODO: Substituir por chamada de LLM via API se desejar variação total.
        log('✍️ Gerando artigo...');
        const articleData = {
            title: `Automação e Risco: O Futuro da Segurança em ${new Date().getFullYear()}`,
            content: `A segurança da informação está mudando rapidamente. Com a ascensão do MCP, precisamos de novas estratégias...\n\n#Security #AI #Automation`,
            cover_prompt: "Futuristic digital security landscape, dark mode, neon cyan accents, high tech."
        };
        const articlePath = join(RUN_DIR, 'article.json');
        writeFileSync(articlePath, JSON.stringify(articleData, null, 2));

        // Etapa 3: Capa (Opcional se FAL_KEY não estiver ativa, senão gera)
        log('🎨 Preparando identidade visual...');
        const coverPath = join(RUN_DIR, 'cover.png');
        // Mock de imagem (ou link fixo) se não houver FAL_KEY
        log('⚠️ Geração de imagem via FAL_AI aguardando chave de API ativa para produção.');

        // Etapa 4: Publicação
        log('📤 Enviando para LinkedIn...');
        const publishCmd = `node skills/linkedin-publisher/scripts/publish.js --type article --title "${articleData.title}" --content "${articleData.content}" --cover "${coverPath}"`;
        await runStep('Publicação', publishCmd);

        log(`🎉 Execução concluída com sucesso!`);
    } catch (error) {
        log(`🚨 Falha crítica no pipeline automático.`);
        process.exit(1);
    }
}

main();
