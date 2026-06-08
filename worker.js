// ============================================================
// SLayerX Worker Panel - Version 3.0
// حرفه‌ای‌ترین پنل مدیریت کانفیگ Vless/Trojan روی کلادفلر ورکر
// مسیر پنل: /slayerPanel
// ============================================================

// ----- تنظیمات محیطی (از متغیرهای کلادفلر) -----
const CONFIG = {
    // از environment variables کلادفلر می‌خونه
    uuid: env.UUID || 'd342d11e-d424-4583-b36e-524ab1f0afa4',
    trojanPass: env.TR_PASS || 'slayerx123',
    proxyIp: env.PROXY_IP || 'cdn.slayervpn.xyz',
    fallbackDomain: env.FALLBACK || 'www.ubuntu.com',
    dohUrl: env.DOH_URL || 'https://cloudflare-dns.com/dns-query',
    subPath: env.SUB_PATH || 'sub',
    panelUser: env.PANEL_USER || 'admin',
    panelPass: env.PANEL_PASS || 'slayerx2024'
};

// ----- کانفیگ‌های اصلی (روی KV یا حافظه) -----
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

// ----- تابع تولید UUID تصادفی -----
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// ----- تابع مبهم‌سازی کد (Obfuscation Layer 1) -----
function obfuscateCode(code) {
    // تبدیل به هگز و استفاده از eval در لایه‌های مختلف
    let hex = '';
    for (let i = 0; i < code.length; i++) {
        hex += code.charCodeAt(i).toString(16);
    }
    return `eval(decodeURIComponent('%6a%61%76%61%73%63%72%69%70%74'))((function(){return atob('${btoa(hex)}');})())`;
}

// ----- تابع ساخت لینک ساب -----
function buildSubscriptionLink(request, type, configs) {
    const url = new URL(request.url);
    const baseUrl = `${url.protocol}//${url.hostname}`;
    
    if (type === 'vless') {
        return configs.map(c => `vless://${c.uuid}@${c.address}:${c.port}?encryption=none&security=tls&sni=${c.sni}&type=ws&host=${c.host}&path=${c.path}#${encodeURIComponent(c.remark)}`).join('\n');
    } else if (type === 'trojan') {
        return configs.map(c => `trojan://${c.password}@${c.address}:${c.port}?security=tls&sni=${c.sni}&type=ws&host=${c.host}&path=${c.path}#${encodeURIComponent(c.remark)}`).join('\n');
    }
    return '';
}

// ----- جنریتور کانفیگ Vless (با پورت ۸۰ و ۴۴۳) -----
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

// ----- جنریتور کانفیگ Trojan (با پورت ۸۰ و ۴۴۳) -----
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

// ----- پنل گرافیکی (با طراحی مونوکروم + گلس مورفیسم) -----
function renderPanel(configs, request) {
    const vlessConfigs = configs.vlessConfigs;
    const trojanConfigs = configs.trojanConfigs;
    const settings = configs.settings;
    const url = new URL(request.url);
    const subLinkVless = `${url.protocol}//${url.hostname}/${CONFIG.subPath}?type=vless`;
    const subLinkTrojan = `${url.protocol}//${url.hostname}/${CONFIG.subPath}?type=trojan`;
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">
    <title>SlayerX Panel | Ultimate VPN Manager</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap" rel="stylesheet">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            background: radial-gradient(circle at 20% 30%, #0a0a0a, #000000);
            font-family: 'Inter', sans-serif;
            color: #e0e0e0;
            min-height: 100vh;
            padding: 2rem;
        }

        /* Glossy Glassmorphism Effect */
        .glass {
            background: rgba(20, 20, 30, 0.4);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-radius: 32px;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
        }

        /* Header Section */
        .header {
            text-align: center;
            margin-bottom: 3rem;
            padding: 2rem;
        }

        .header h1 {
            font-size: 3.5rem;
            font-weight: 700;
            background: linear-gradient(135deg, #ffffff, #888888);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            letter-spacing: -0.02em;
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
            border: 1px solid rgba(255,255,255,0.1);
        }

        /* Cards Grid */
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            gap: 2rem;
            margin-bottom: 2rem;
        }

        .card {
            padding: 1.8rem;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .card:hover {
            transform: translateY(-4px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .card-title {
            font-size: 1.8rem;
            font-weight: 600;
            margin-bottom: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.8rem;
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
            border: 1px solid rgba(255,255,255,0.05);
        }

        .config-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.8rem;
            flex-wrap: wrap;
            gap: 0.5rem;
        }

        .config-name {
            font-weight: 600;
            color: #ffffff;
            background: rgba(255,255,255,0.1);
            padding: 0.3rem 0.8rem;
            border-radius: 20px;
            font-size: 0.8rem;
        }

        .config-link {
            font-size: 0.75rem;
            color: #aaa;
            margin-bottom: 0.8rem;
            line-height: 1.5;
        }

        .copy-btn {
            background: rgba(255,255,255,0.1);
            border: none;
            color: white;
            padding: 0.4rem 1rem;
            border-radius: 20px;
            cursor: pointer;
            font-size: 0.75rem;
            transition: all 0.2s;
            font-family: 'Inter', sans-serif;
        }

        .copy-btn:hover {
            background: rgba(255,255,255,0.25);
            transform: scale(1.02);
        }

        /* Settings Section */
        .settings-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
        }

        .setting-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.8rem 0;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        select, input {
            background: rgba(0,0,0,0.5);
            border: 1px solid rgba(255,255,255,0.2);
            color: white;
            padding: 0.4rem 0.8rem;
            border-radius: 12px;
            font-family: 'Inter', sans-serif;
        }

        .sub-section {
            margin-top: 2rem;
            padding: 1.5rem;
            text-align: center;
        }

        .sub-link {
            background: #1a1a1a;
            padding: 0.8rem;
            border-radius: 16px;
            font-family: monospace;
            margin: 0.5rem 0;
            word-break: break-all;
        }

        button {
            background: white;
            color: black;
            border: none;
            padding: 0.6rem 1.2rem;
            border-radius: 24px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }

        button:hover {
            transform: scale(1.02);
            opacity: 0.9;
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
        <div class="badge">ULTIMATE VPN MANAGEMENT | TLS + WS | FRAGMENT READY</div>
    </div>

    <div class="grid">
        <!-- VLESS Configs Card -->
        <div class="card glass">
            <div class="card-title">
                🚀 VLESS Configurations
            </div>
            ${vlessConfigs.map((cfg, idx) => `
                <div class="config-item">
                    <div class="config-header">
                        <span class="config-name">${cfg.remark}</span>
                        <button class="copy-btn" onclick="copyToClipboard('vless-${idx}')">📋 Copy</button>
                    </div>
                    <div class="config-link" id="vless-${idx}">vless://${cfg.uuid}@${cfg.address}:${cfg.port}?encryption=none&security=${cfg.security === 'tls' ? 'tls' : 'none'}&sni=${cfg.sni}&type=ws&host=${cfg.host}&path=${cfg.path}#${encodeURIComponent(cfg.remark)}</div>
                </div>
            `).join('')}
        </div>

        <!-- Trojan Configs Card -->
        <div class="card glass">
            <div class="card-title">
                🛡️ Trojan Configurations
            </div>
            ${trojanConfigs.map((cfg, idx) => `
                <div class="config-item">
                    <div class="config-header">
                        <span class="config-name">${cfg.remark}</span>
                        <button class="copy-btn" onclick="copyToClipboard('trojan-${idx}')">📋 Copy</button>
                    </div>
                    <div class="config-link" id="trojan-${idx}">trojan://${cfg.password}@${cfg.address}:${cfg.port}?security=${cfg.security === 'tls' ? 'tls' : 'none'}&sni=${cfg.sni}&type=ws&host=${cfg.host}&path=${cfg.path}#${encodeURIComponent(cfg.remark)}</div>
                </div>
            `).join('')}
        </div>
    </div>

    <!-- Subscription Links -->
    <div class="card glass sub-section">
        <div class="card-title" style="border-left-color: #888;">🔗 Subscription Links</div>
        <div class="sub-link">📡 VLESS: <span id="sub-vless">${subLinkVless}</span> <button class="copy-btn" onclick="copyToClipboard('sub-vless')">Copy</button></div>
        <div class="sub-link">🎯 Trojan: <span id="sub-trojan">${subLinkTrojan}</span> <button class="copy-btn" onclick="copyToClipboard('sub-trojan')">Copy</button></div>
        <div style="margin-top: 1rem; font-size: 0.8rem; opacity: 0.7;">پشتیبانی از کلاینت‌های v2rayNG, Nekoray, Streisand, Sing-box</div>
    </div>

    <!-- Advanced Settings -->
    <div class="card glass">
        <div class="card-title">⚙️ Advanced Settings</div>
        <div class="settings-grid">
            <div class="setting-item">
                <span>🌐 DNS Server</span>
                <select id="dnsSetting">
                    <option value="system" ${settings.dns === 'system' ? 'selected' : ''}>System Default</option>
                    <option value="1.1.1.1" ${settings.dns === '1.1.1.1' ? 'selected' : ''}>Cloudflare (1.1.1.1)</option>
                    <option value="8.8.8.8" ${settings.dns === '8.8.8.8' ? 'selected' : ''}>Google (8.8.8.8)</option>
                </select>
            </div>
            <div class="setting-item">
                <span>🔧 Fragment</span>
                <select id="fragmentSetting">
                    <option value="true" ${settings.fragment ? 'selected' : ''}>Enabled</option>
                    <option value="false" ${!settings.fragment ? 'selected' : ''}>Disabled</option>
                </select>
            </div>
            <div class="setting-item">
                <span>🖥️ TLS Fingerprint</span>
                <select id="fingerprintSetting">
                    <option value="chrome" ${settings.tlsFingerprint === 'chrome' ? 'selected' : ''}>Chrome</option>
                    <option value="firefox" ${settings.tlsFingerprint === 'firefox' ? 'selected' : ''}>Firefox</option>
                    <option value="random" ${settings.tlsFingerprint === 'random' ? 'selected' : ''}>Random</option>
                </select>
            </div>
            <div class="setting-item">
                <span>🌍 Proxy IP</span>
                <input type="text" id="proxyIpInput" value="${CONFIG.proxyIp}" placeholder="Enter Proxy IP/Domain">
                <button onclick="updateProxyIp()">Update</button>
            </div>
        </div>
        <div style="margin-top: 1.5rem; text-align: right;">
            <button onclick="saveSettings()">💾 Save All Settings</button>
        </div>
    </div>
</div>

<script>
    function copyToClipboard(elementId) {
        const element = document.getElementById(elementId);
        const text = element.innerText || element.textContent;
        navigator.clipboard.writeText(text).then(() => {
            alert('✅ Copied to clipboard!');
        });
    }

    async function saveSettings() {
        const settings = {
            dns: document.getElementById('dnsSetting').value,
            fragment: document.getElementById('fragmentSetting').value === 'true',
            tlsFingerprint: document.getElementById('fingerprintSetting').value
        };
        const response = await fetch('/slayerPanel/api/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        if (response.ok) alert('✅ Settings saved successfully!');
        else alert('❌ Error saving settings');
    }

    async function updateProxyIp() {
        const newIp = document.getElementById('proxyIpInput').value;
        const response = await fetch('/slayerPanel/api/proxyip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ proxyIp: newIp })
        });
        if (response.ok) {
            alert('✅ Proxy IP updated! Page will reload.');
            location.reload();
        } else alert('❌ Error updating Proxy IP');
    }
</script>
</body>
</html>`;
}

// ----- هندلر اصلی ورکر -----
async function handleRequest(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // ریدایرکت روت به Ubuntu.com
    if (path === '/' || path === '') {
        return Response.redirect('https://www.ubuntu.com', 302);
    }
    
    // پنل گرافیکی
    if (path === '/slayerPanel') {
        // ساخت کانفیگ‌ها با UUID و Proxy IP از متغیرها
        const vlessConfigs = generateVlessConfigs(env.UUID || CONFIG.uuid, env.PROXY_IP || CONFIG.proxyIp, env.FALLBACK || CONFIG.fallbackDomain);
        const trojanConfigs = generateTrojanConfigs(env.TR_PASS || CONFIG.trojanPass, env.PROXY_IP || CONFIG.proxyIp, env.FALLBACK || CONFIG.fallbackDomain);
        
        configStore.vlessConfigs = vlessConfigs;
        configStore.trojanConfigs = trojanConfigs;
        
        return new Response(renderPanel(configStore, request), {
            headers: { 'Content-Type': 'text/html;charset=UTF-8' }
        });
    }
    
    // سابسکریپشن لینک
    if (path === `/${CONFIG.subPath}`) {
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
    
    // API برای ذخیره تنظیمات
    if (path === '/slayerPanel/api/settings' && request.method === 'POST') {
        const newSettings = await request.json();
        configStore.settings = { ...configStore.settings, ...newSettings };
        return new Response(JSON.stringify({ status: 'ok' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    // API برای تغییر Proxy IP
    if (path === '/slayerPanel/api/proxyip' && request.method === 'POST') {
        const { proxyIp } = await request.json();
        // به‌روزرسانی کانفیگ‌ها با IP جدید
        const vlessConfigs = generateVlessConfigs(env.UUID || CONFIG.uuid, proxyIp, env.FALLBACK || CONFIG.fallbackDomain);
        const trojanConfigs = generateTrojanConfigs(env.TR_PASS || CONFIG.trojanPass, proxyIp, env.FALLBACK || CONFIG.fallbackDomain);
        configStore.vlessConfigs = vlessConfigs;
        configStore.trojanConfigs = trojanConfigs;
        return new Response(JSON.stringify({ status: 'ok' }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
    
    // هندلر پیش‌فرض WebSocket برای پروکسی
    if (request.method === 'POST' || url.pathname.includes('vless') || url.pathname.includes('trojan')) {
        // اینجا کد پروکسی وب‌سوکت رو می‌تونید اضافه کنید (مشابه BPB Panel)
        return new Response('SlayerX Proxy Active', { status: 200 });
    }
    
    return new Response('Page Not Found', { status: 404 });
}

// ----- اجرای اصلی -----
export default {
    async fetch(request, env, ctx) {
        // اضافه کردن env به CONFIG
        CONFIG.uuid = env.UUID || CONFIG.uuid;
        CONFIG.trojanPass = env.TR_PASS || CONFIG.trojanPass;
        CONFIG.proxyIp = env.PROXY_IP || CONFIG.proxyIp;
        CONFIG.fallbackDomain = env.FALLBACK || CONFIG.fallbackDomain;
        
        return handleRequest(request, env);
    }
};