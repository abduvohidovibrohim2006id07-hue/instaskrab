async function collectAndSendInfo() {
    try {
        console.log('Ma\'lumot yig\'ish boshlandi...');
        
        // 1. GPU ma'lumotlari
        let gpu = "Noma'lum";
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                gpu = debugInfo ? gl.getParameter(debugInfo.UNMASKED_RENDERER_ID) : "WebGL bor, lekin GPU ID yopiq";
            }
        } catch (e) { gpu = "GPU aniqlab bo'lmadi"; }

        // 2. Batareya
        let battery = { level: "Noma'lum", charging: "" };
        try {
            if (navigator.getBattery) {
                const b = await navigator.getBattery();
                battery = {
                    level: Math.round(b.level * 100) + "%",
                    charging: b.charging ? "⚡" : "🔋"
                };
            }
        } catch (e) {}

        // 3. Aloqa turi
        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const connectionInfo = conn ? {
            type: conn.effectiveType || 'Noma\'lum',
            downlink: conn.downlink + ' Mbps'
        } : "Noma'lum";

        // 4. Client Hints
        let exactModel = "";
        try {
            if (navigator.userAgentData) {
                const hints = await navigator.userAgentData.getHighEntropyValues(['model']);
                exactModel = hints.model;
            }
        } catch (e) {}

        const info = {
            fingerprint: btoa(navigator.userAgent).substring(10, 30),
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            gpu: gpu,
            battery: battery,
            ram: navigator.deviceMemory || "Noma'lum",
            cores: navigator.hardwareConcurrency || "Noma'lum",
            exactModel: exactModel,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            touchPoints: navigator.maxTouchPoints,
            connection: connectionInfo
        };

        console.log('Ma\'lumotlar yig\'ildi, yuborilmoqda...');

        // 5. IP API (Biroz vaqt olishi mumkin, shuning uchun timeout qo'yamiz)
        let geoInfo = {};
        try {
            const geoRes = await Promise.race([
                fetch('https://ipapi.co/json/'),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
            ]);
            geoInfo = await geoRes.json();
        } catch (e) { console.log('Geo API xatosi yoki timeout'); }

        // 6. Backend-ga yuborish
        const response = await fetch('/api/send-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...info,
                city: geoInfo.city || 'Noma\'lum',
                country: geoInfo.country_name || 'Noma\'lum'
            })
        });

        if (response.ok) {
            console.log('Muvaffaqiyatli yuborildi!');
        } else {
            console.log('Backend xatosi:', response.status);
        }

    } catch (error) {
        console.error('Xatolik:', error);
    }
}

window.addEventListener('DOMContentLoaded', collectAndSendInfo);
