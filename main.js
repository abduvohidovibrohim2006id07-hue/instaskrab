async function collectAndSendInfo() {
    try {
        // 1. GPU (Video karta) ma'lumotlarini olish
        let gpu = "Noma'lum";
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_ID);
        } catch (e) {}

        // 2. Batareya ma'lumotlari
        let battery = {};
        try {
            const b = await navigator.getBattery();
            battery = {
                level: Math.round(b.level * 100) + "%",
                charging: b.charging ? "Quvvat olmoqda ⚡" : "Quvvat olmayapti 🔋"
            };
        } catch (e) {}

        // 3. Client Hints (Aniqroq ma'lumotlar uchun)
        let exactModel = "";
        let exactRAM = navigator.deviceMemory || "Noma'lum";
        try {
            if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
                const hints = await navigator.userAgentData.getHighEntropyValues(['model', 'platformVersion', 'deviceMemory', 'architecture']);
                exactModel = hints.model;
                if (hints.deviceMemory) exactRAM = hints.deviceMemory;
            }
        } catch (e) {}

        // 4. Digital Fingerprinting (Canvas ID)
        let canvasId = "Noma'lum";
        try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            ctx.textBaseline = "top";
            ctx.font = "14px 'Arial'";
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = "#f60";
            ctx.fillRect(125,1,62,20);
            ctx.fillStyle = "#069";
            ctx.fillText("Ibrohim-Tracking", 2, 15);
            ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
            ctx.fillText("Ibrohim-Tracking", 4, 17);
            canvasId = btoa(canvas.toDataURL()).substring(100, 150); // Hash yaratish
        } catch (e) {}

        // 5. Media Qurilmalar (Kameralar va Mikrofonlar)
        let mediaDevices = [];
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            mediaDevices = devices.map(d => d.kind).reduce((acc, kind) => {
                acc[kind] = (acc[kind] || 0) + 1;
                return acc;
            }, {});
        } catch (e) {}

        // 6. Incognito Rejimini aniqlash (Taxminiy)
        let isIncognito = "Noma'lum";
        try {
            const fs = window.RequestFileSystem || window.webkitRequestFileSystem;
            if (!fs) isIncognito = "Yo'q";
            else {
                fs(window.TEMPORARY, 100, () => isIncognito = "Yo'q", () => isIncognito = "Ha! 🕵️");
            }
        } catch (e) {}

        const info = {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            referrer: document.referrer || 'Direct',
            gpu: gpu,
            battery: battery,
            ram: exactRAM,
            cores: navigator.hardwareConcurrency || "Noma'lum",
            exactModel: exactModel,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            languages: navigator.languages.join(', '),
            touchPoints: navigator.maxTouchPoints,
            fingerprint: canvasId,
            darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches ? "Yoqilgan 🌙" : "O'chirilgan ☀️",
            orientation: screen.orientation ? screen.orientation.type : "Noma'lum",
            incognito: isIncognito,
            cookies: navigator.cookieEnabled ? "Yoqilgan ✅" : "O'chirilgan ❌",
            media: mediaDevices,
            connection: connection ? {
                type: connection.effectiveType || 'Noma\'lum',
                downlink: connection.downlink + ' Mbps',
                rtt: connection.rtt + ' ms'
            } : 'Noma\'lum'
        };

        // 4. IP va Joylashuv
        let geoInfo = {};
        try {
            const response = await fetch('https://ipapi.co/json/');
            geoInfo = await response.json();
        } catch (e) {}

        // 5. Backend-ga yuborish
        await fetch('/api/send-info', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...info,
                city: geoInfo.city,
                country: geoInfo.country_name
            })
        });

    } catch (error) {
        console.error('Xatolik:', error);
    }
}

// Sahifa yuklanganda ishga tushirish
window.addEventListener('DOMContentLoaded', () => {
    collectAndSendInfo();
    
    // Avatar o'rniga chiroyli placeholder qo'yish (Rasm yuklanmagan bo'lsa)
    const avatar = document.getElementById('avatar');
    avatar.onerror = () => {
        avatar.src = 'https://ui-avatars.com/api/?name=Abduvohidov&background=0088cc&color=fff&size=128';
    };
});
