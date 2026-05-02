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

    const message = `
🚀 *Yangi Tashrif (Vercel Backend)*
----------------------------
🕒 *Vaqt:* ${uzTime}
📱 *Qurilma:* ${data.platform || 'Noma\'lum'}
🌍 *IP:* ${ip}
📍 *Joylashuv:* ${data.city || ''}, ${data.country || ''}
🖥 *Ekran:* ${data.screenSize || 'Noma\'lum'}
🌐 *Brauzer:* ${data.userAgent?.substring(0, 50)}...
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
