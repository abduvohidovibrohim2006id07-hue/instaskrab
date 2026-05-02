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

        // 3. Client Hints (Zamonaviy telefon modelini aniqlash)
        let highEntropyModel = "";
        try {
            if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
                const hints = await navigator.userAgentData.getHighEntropyValues(['model', 'platformVersion']);
                highEntropyModel = hints.model;
            }
        } catch (e) {}

        const info = {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            referrer: document.referrer || 'Direct',
            gpu: gpu,
            battery: battery,
            ram: navigator.deviceMemory || "Noma'lum",
            cores: navigator.hardwareConcurrency || "Noma'lum",
            exactModel: highEntropyModel
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
