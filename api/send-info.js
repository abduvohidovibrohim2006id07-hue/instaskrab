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
🚀 *Yangi Tashrif (Tahlil qilingan)*
----------------------------
🕒 *Vaqt:* ${uzTime}
📱 *Qurilma:* ${deviceModel}
🌐 *Ilova:* ${browserName}
🌍 *IP:* ${ip}
📍 *Joylashuv:* ${data.city || ''}, ${data.country || ''}
🖥 *Ekran:* ${data.screenSize || 'Noma\'lum'}
🔗 *Referrer:* ${data.referrer || 'Direct'}
----------------------------
`;

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
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
