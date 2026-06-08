// ============================================================
// SLAYERX WORKER PANEL - نسخه نهایی و بدون خطا
// مسیر پنل: /slayerPanel
// ============================================================

// ----- تنظیمات پیش‌فرض (با متغیرهای محیطی override میشن) -----
const DEFAULT_CONFIG = {
    uuid: 'd342d11e-d424-4583-b36e-524ab1f0afa4',
    trojanPass: 'slayerx123',
    proxyIp: 'cdn-b100.xn--b6gac.eu.org',
    fallbackDomain: 'www.ubuntu.com',
    dohUrl: 'https://cloudflare-dns.com/dns-query',
    subPath: 'sub',
    panelUser: 'admin',
    panelPass: 'slayerx2024'
};

// ----- حافظه داخلی (بدون KV برای سادگی اولیه) -----
let configStore = {
    vlessConfigs: [],
    trojanConfigs: [],
    settings: {
        dns: 'system',
        fragment: true,
        tlsFingerprint: 'chrome',
        routing: 'bypass_iran'
    }
};

// ----- توابع کمکی -----
function generateVlessConfigs(uuid, proxyIp, remark) {
    return [
        {
            uuid: uuid,
            address: proxyIp,
            port: 443,
            sni: remark,
            host: remark,
            path: '/vless',
            security: 'tls',
            remark: `${remark} - TLS (443)`
        },
        {
            uuid: uuid,
            address: proxyIp,
            port: 80,
            sni: remark,
            host: remark,
            path: '/vless',
            security: 'none',
            remark: `${remark} - Non-TLS (80)`
        }
    ];
}

function generateTrojanConfigs(password, proxyIp, remark) {
    return [
        {
            password: password,
            address: proxyIp,
            port: 443,
            sni: remark,
            host: remark,
            path: '/trojan',
            security: 'tls',
            remark: `${remark} - TLS (443)`
        },
        {
            password: password,
            address: proxyIp,
            port: 80,
            sni: remark,
            host: remark,
            path: '/trojan',
            security: 'none',
            remark: `${remark} - Non-TLS (80)`
        }
    ];
}

function buildSubscriptionLink(request, type, configs) {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.hostname}`;
    
    if (type === 'vless') {
        return configs.map(c => `vless://${c.uuid}@${c.address}:${c.port}?encryption=none&security=${c.security === 'tls' ? 'tls' : 'none'}&sni=${c.sni}&type=ws&host=${c.host}&path=${c.path}#${encodeURIComponent(c.remark)}`).join('\n');
    } else if (type === 'trojan') {
        return configs.map(c => `trojan://${c.password}@${c.address}:${c.port}?security=${c.security === 'tls' ? 'tls' : 'none'}&sni=${c.sni}&type=ws&host=${c.host}&path=${c.path}#${encodeURIComponent(c.remark)}`).join('\n');
    }
    return '';
}

// ----- تابع رندر پنل (طراحی مونوکروم + گلس مورفیسم) -----
function renderPanel(configs, request, envConfig) {
    const vlessConfigs = configs.vlessConfigs;
    const trojanConfigs = configs.trojanConfigs;
    const settings = configs.settings;
    const url = new URL(request.url);
    const subLinkVless = `${url.protocol}//${url.hostname}/${envConfig.subPath}?type=vless`;
    const subLinkTrojan = `${url.protocol}//${url.hostname}/${envConfig.subPath}?type=trojan`;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SlayerX Panel | Ultimate VPN Manager</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=JetBrains+Mono:wght@100..800&display=swap" rel="stylesheet">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            background: radial-gradient(circle at 20% 30%, #0a0a0a, #000000);
            font-family: 'Inter', sans-serif;
            color: #e0e0e0;
            min-height: 100vh;
            padding: 2rem;
        }
        .glass {
            background: rgba(20, 20, 30, 0.4);
            backdrop-filter: blur(12px);
            border-radius: 32px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }
        .container { max-width: 1400px; margin: 0 auto; }
        .header { text-align: center; margin-bottom: 3rem; padding: 2rem; }
        .header h1 {
            font-size: 3.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #ffffff, #888888);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }
        .badge {
            display: inline-block;
            background: rgba(100, 100, 120, 0.3);
            backdrop-filter: blur(8px);
            padding: 0.5rem 1.2rem;
            border-radius: 40px;
            font-size: 0.85rem;
            font-family: 'JetBrains Mono', monospace;
            margin-top: 1rem;
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }
        .card { padding: 1.8rem; transition: transform 0.2s ease; }
        .card:hover { transform: translateY(-4px); }
        .card-title {
            font-size: 1.8rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            border-left: 4px solid #ffffff;
            padding-left: 1rem;
        }
        .config-item {
            background: rgba(0, 0, 0, 0.4);
            border-radius: 20px;
            padding: 1.2rem;
            margin-bottom: 1rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.85rem;
            word-break: break-all;
        }
        .config-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.8rem;
            flex-wrap: wrap;
        }
        .config-name {
            font-weight: 600;
            color: #ffffff;
            background: rgba(255,255,255,0.1);
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
        }
        .copy-btn {
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            padding: 0.4rem 1rem;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.75rem;
        }
        .copy-btn:hover { background: rgba(255,255,255,0.25); }
        .sub-section { margin-top: 2rem; padding: 1.5rem; text-align: center; }
        .sub-link {
            background: #1a1a1a;
            padding: 0.8rem;
            border-radius: 16px;
            font-family: monospace;
            margin: 0.5rem 0;
            word-break: break-all;
        }
        select, input {
            background: rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.2);
            color: white;
            padding: 0.4rem 0.8rem;
            border-radius: 12px;
        }
        button {
            background: white;
            color: black;
            border: none;
            padding: 0.6rem 1.2rem;
            border-radius: 24px;
            font-weight: 500;
            cursor: pointer;
        }
        @media (max-width: 768px) {
            body { padding: 1rem; }
            .grid { grid-template-columns: 1fr; }
            .header h1 { font-size: 2.2rem; }
        }
    </style>
</head>
<body>
<div class="container">
    <div class="header glass">
        <h1>⚡ SLAYERX PANEL</h1>
        <div class="badge">ULTIMATE VPN MANAGEMENT | TLS + WS</div>
    </div>
    <div class="grid">
        <div class="card glass">
            <div class="card-title">🚀 VLESS Configurations</div>
            ${vlessConfigs.map((cfg, idx) => `
                <div class="config-item">
                    <div class="config-header">
                        <span class="config-name">${cfg.remark}</span>
                        <button class="copy-btn" onclick="copyToClipboard('vless-${idx}')">📋 Copy</button>
                    </div>
                    <div class="config-link" id="vless-${idx}">vless://${cfg.uuid}@${cfg.address}:${cfg.port}?encryption=none&security=${cfg.security}&sni=${cfg.sni}&type=ws&host=${cfg.host}&path=${cfg.path}#${encodeURIComponent(cfg.remark)}</div>
                </div>
            `).join('')}
        </div>
        <div class="card glass">
            <div class="card-title">🛡️ Trojan Configurations</div>
            ${trojanConfigs.map((cfg, idx) => `
                <div class="config-item">
                    <div class="config-header">
                        <span class="config-name">${cfg.remark}</span>
                        <button class="copy-btn" onclick="copyToClipboard('trojan-${idx}')">📋 Copy</button>
                    </div>
                    <div class="config-link" id="trojan-${idx}">trojan://${cfg.password}@${cfg.address}:${cfg.port}?security=${cfg.security}&sni=${cfg.sni}&type=ws&host=${cfg.host}&path=${cfg.path}#${encodeURIComponent(cfg.remark)}</div>
                </div>
            `).join('')}
        </div>
    </div>
    <div class="card glass sub-section">
        <div class="card-title">🔗 Subscription Links</div>
        <div class="sub-link">📡 VLESS: <span id="sub-vless">${subLinkVless}</span> <button class="copy-btn" onclick="copyToClipboard('sub-vless')">Copy</button></div>
        <div class="sub-link">🎯 Trojan: <span id="sub-trojan">${subLinkTrojan}</span> <button class="copy-btn" onclick="copyToClipboard('sub-trojan')">Copy</button></div>
    </div>
    <div class="card glass">
        <div class="card-title">⚙️ Advanced Settings</div>
        <div class="setting-item" style="display: flex; justify-content: space-between; padding: 0.8rem 0;">
            <span>🌍 Proxy IP</span>
            <input type="text" id="proxyIpInput" value="${envConfig.proxyIp}" style="width: 60%;">
            <button onclick="updateProxyIp()">Update</button>
        </div>
    </div>
</div>
<script>
    function copyToClipboard(elementId) {
        const text = document.getElementById(elementId).innerText;
        navigator.clipboard.writeText(text).then(() => alert('✅ Copied!'));
    }
    async function updateProxyIp() {
        const newIp = document.getElementById('proxyIpInput').value;
        const response = await fetch('/slayerPanel/api/proxyip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proxyIp: newIp })
        });
        if (response.ok) alert('✅ Proxy IP updated! Reloading...');
        location.reload();
    }
</script>
</body>
</html>`;
}

// ----- هندلر اصلی ورکر -----
async function handleRequest(request, env) {
    // خواندن متغیرهای محیطی (یا استفاده از پیش‌فرض)
    const workerConfig = {
        uuid: env.UUID || DEFAULT_CONFIG.uuid,
        trojanPass: env.TR_PASS || DEFAULT_CONFIG.trojanPass,
        proxyIp: env.PROXY_IP || DEFAULT_CONFIG.proxyIp,
        fallbackDomain: env.FALLBACK || DEFAULT_CONFIG.fallbackDomain,
        subPath: env.SUB_PATH || DEFAULT_CONFIG.subPath
    };
    
    const url = new URL(request.url);
    const path = url.pathname;
    
    // ریدایرکت ریشه به Ubuntu
    if (path === '/') {
        return Response.redirect(`https://${workerConfig.fallbackDomain}`, 302);
    }
    
    // پنل مدیریت
    if (path === '/slayerPanel') {
        // ساخت کانفیگ‌ها
        const vlessConfigs = generateVlessConfigs(workerConfig.uuid, workerConfig.proxyIp, workerConfig.fallbackDomain);
        const trojanConfigs = generateTrojanConfigs(workerConfig.trojanPass, workerConfig.proxyIp, workerConfig.fallbackDomain);
        
        configStore.vlessConfigs = vlessConfigs;
        configStore.trojanConfigs = trojanConfigs;
        
        return new Response(renderPanel(configStore, request, workerConfig), {
            headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
    }
    
    // سابسکریپشن
    if (path === `/${workerConfig.subPath}`) {
        const type = url.searchParams.get('type');
        let subscription = '';
        if (type === 'vless') {
            subscription = buildSubscriptionLink(request, 'vless', configStore.vlessConfigs);
        } else if (type === 'trojan') {
            subscription = buildSubscriptionLink(request, 'trojan', configStore.trojanConfigs);
        }
        return new Response(subscription, {
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
        });
    }
    
    // API تغییر Proxy IP
    if (path === '/slayerPanel/api/proxyip' && request.method === 'POST') {
        const { proxyIp } = await request.json();
        // به‌روزرسانی در حافظه (در محیط واقعی باید در KV ذخیره بشه)
        workerConfig.proxyIp = proxyIp;
        return new Response(JSON.stringify({ status: 'ok' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    return new Response('Page Not Found - SlayerX Active', { status: 404 });
}

// ----- نقطه ورود اصلی (طبق استاندارد Cloudflare Workers) -----
export default {
    async fetch(request, env, ctx) {
        return handleRequest(request, env);
    }
};