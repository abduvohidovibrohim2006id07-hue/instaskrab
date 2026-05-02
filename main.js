async function collectAndSendInfo() {
    try {
        const info = {
            platform: navigator.platform,
            userAgent: navigator.userAgent,
            screenSize: `${window.screen.width}x${window.screen.height}`,
            referrer: document.referrer || 'Direct'
        };

        // 2. IP va Joylashuvni aniqlash (Tashqi API orqali mijoz tomonda ham tekshiramiz)
        let geoInfo = {};
        try {
            const response = await fetch('https://ipapi.co/json/');
            geoInfo = await response.json();
        } catch (e) {}

        // 3. Bizning xavfsiz API-ga yuborish
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
