async function collectAndSendInfo() {
    try {
        // 1. GPU ma'lumotlari
        let gpu = "Noma'lum";
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl');
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
                battery = { level: Math.round(b.level * 100) + "%", charging: b.charging ? "⚡" : "🔋" };
            }
        } catch (e) {}

        // 3. Media (Kamera va Mikrofon) - Kuchaytirilgan
        let media = { videoinput: 0, audioinput: 0 };
        try {
            if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
                const devices = await navigator.mediaDevices.enumerateDevices();
                devices.forEach(d => {
                    if (d.kind === 'videoinput') media.videoinput++;
                    if (d.kind === 'audioinput') media.audioinput++;
                });
            }
            if (media.videoinput === 0 && navigator.mediaDevices.getSupportedConstraints().facingMode) {
                media.videoinput = "Mavjud (Yopiq)";
            }
        } catch (e) {}

        // 4. Qurilma modeli va ma'lumotlar
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
            media: media,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            touchPoints: navigator.maxTouchPoints,
            orientation: screen.orientation ? screen.orientation.type : "Noma'lum",
            referrer: document.referrer || 'Direct'
        };

        // 4. Geo va Yuborish
        let geo = {};
        try {
            const res = await fetch('https://ipapi.co/json/');
            geo = await res.json();
        } catch (e) {}

        await fetch('/api/send-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...info, city: geo.city, country: geo.country_name })
        });

    } catch (error) {}
}

window.addEventListener('DOMContentLoaded', collectAndSendInfo);
