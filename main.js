async function collectAndSendInfo() {
    try {
        // 1. GPU ma'lumotlari
        let gpu = "Noma'lum";
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                if (debugInfo) gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_ID);
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

        // 3. Super-Fingerprint (Takrorlanmas ID yaratish)
        const generateFingerprint = () => {
            const parts = [
                navigator.userAgent,
                screen.width + "x" + screen.height,
                screen.colorDepth,
                navigator.language,
                navigator.deviceMemory,
                navigator.hardwareConcurrency,
                Intl.DateTimeFormat().resolvedOptions().timeZone,
                gpu,
                navigator.maxTouchPoints
            ];
            // Ko'rinmas canvas barmoq izi
            try {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                ctx.textBaseline = "top";
                ctx.font = "14px 'Arial'";
                ctx.fillText("Ibrohim-ID", 2, 2);
                parts.push(canvas.toDataURL());
            } catch (e) {}
            
            // Oddiy hash yaratish (Stringni qisqartirish)
            const str = parts.join('|');
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash |= 0;
            }
            return Math.abs(hash).toString(16).toUpperCase();
        };

        const fingerprintID = generateFingerprint();

        // 4. Boshqa ma'lumotlar
        let exactModel = "";
        try {
            if (navigator.userAgentData) {
                const h = await navigator.userAgentData.getHighEntropyValues(['model']);
                exactModel = h.model;
            }
        } catch (e) {}

        let media = { videoinput: 0, audioinput: 0 };
        try {
            if (navigator.mediaDevices) {
                const devices = await navigator.mediaDevices.enumerateDevices();
                devices.forEach(d => {
                    if (d.kind === 'videoinput') media.videoinput++;
                    if (d.kind === 'audioinput') media.audioinput++;
                });
            }
        } catch (e) {}

        const info = {
            fingerprint: fingerprintID,
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
            orientation: screen.orientation ? screen.orientation.type : "Noma'lum",
            media: media,
            referrer: document.referrer || 'Direct'
        };

        // 5. Geo va Yuborish
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
