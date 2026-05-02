async function collectAndSendInfo() {
    try {
        // 1. GPU ma'lumotlari (Xatosiz variant)
        let gpu = "Noma'lum";
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) {
                    gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_ID);
                }
            }
        } catch (e) {}

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

        // 3. Media va Aloqa
        let media = {};
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            media = devices.map(d => d.kind).reduce((acc, k) => { acc[k] = (acc[k] || 0) + 1; return acc; }, {});
        } catch (e) {}

        const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

        // 4. Client Hints va Fingerprint
        let exactModel = "";
        try {
            if (navigator.userAgentData) {
                const h = await navigator.userAgentData.getHighEntropyValues(['model']);
                exactModel = h.model;
            }
        } catch (e) {}

        const info = {
            fingerprint: btoa(navigator.userAgent).substring(15, 35),
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
            cookies: navigator.cookieEnabled ? "Ha" : "Yo'q",
            orientation: screen.orientation ? screen.orientation.type : "Noma'lum",
            media: media,
            connection: conn ? { type: conn.effectiveType, downlink: conn.downlink } : "Noma'lum",
            referrer: document.referrer || 'Direct'
        };

        // 5. Geo API
        let geo = {};
        try {
            const res = await fetch('https://ipapi.co/json/');
            geo = await res.json();
        } catch (e) {}

        // 6. Yuborish
        await fetch('/api/send-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...info, city: geo.city, country: geo.country_name })
        });

    } catch (error) {
        console.error('Xatolik:', error);
    }
}

window.addEventListener('DOMContentLoaded', collectAndSendInfo);
