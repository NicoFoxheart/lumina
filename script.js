// Canvas setup
const canvas = document.getElementById('luminaCanvas');
const ctx = canvas.getContext('2d');
const messageEl = document.getElementById('message');

// Resize canvas to window
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Particle class
class Particle {
    constructor(x, y, isStar = false) {
        this.x = x;
        this.y = y;
        this.baseX = x;
        this.baseY = y;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = isStar ? -Math.random() * 0.3 : Math.random() * 0.5;
        this.size = Math.random() * 2 + 1;
        this.isStar = isStar;
        this.opacity = Math.random() * 0.5 + 0.3;
        this.brightness = 0;
        this.life = 1;
    }

    update(mouseX, mouseY, interactionLevel) {
        // Mouse interaction
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 150;

        if (distance < maxDistance) {
            const force = (maxDistance - distance) / maxDistance;
            this.brightness = Math.min(this.brightness + force * 0.1, 1);
            
            // Transform tears to stars near mouse
            if (!this.isStar && force > 0.5) {
                this.isStar = true;
                this.vy = -Math.abs(this.vy);
            }
        } else {
            this.brightness *= 0.95;
        }

        // Movement
        if (this.isStar) {
            this.vy -= 0.01; // Stars rise
            this.opacity = Math.min(this.opacity + 0.01, 0.9);
        } else {
            this.vy += 0.005; // Tears fall
        }

        this.x += this.vx;
        this.y += this.vy;

        // Boundary wrapping
        if (this.y > canvas.height + 50) {
            this.y = -50;
            this.x = Math.random() * canvas.width;
        }
        if (this.y < -50) {
            this.y = canvas.height + 50;
            this.x = Math.random() * canvas.width;
        }
        if (this.x > canvas.width + 50) this.x = -50;
        if (this.x < -50) this.x = canvas.width + 50;
    }

    draw() {
        const brightness = this.brightness;
        
        if (this.isStar) {
            // Stars glow
            const gradient = ctx.createRadialGradient(
                this.x, this.y, 0,
                this.x, this.y, this.size * 3
            );
            gradient.addColorStop(0, `rgba(150, 200, 255, ${this.opacity * (0.5 + brightness * 0.5)})`);
            gradient.addColorStop(0.5, `rgba(100, 150, 255, ${this.opacity * 0.3 * (0.5 + brightness * 0.5)})`);
            gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Tears
            ctx.fillStyle = `rgba(180, 200, 220, ${this.opacity * 0.6})`;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

// Shattered glass effect
class GlassFragment {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 30 + 20;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.opacity = 0.3;
        this.brightness = 0;
    }

    update(mouseX, mouseY) {
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 200) {
            const force = (200 - distance) / 200;
            this.brightness = Math.min(this.brightness + force * 0.05, 1);
        } else {
            this.brightness *= 0.95;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;

        // Boundary wrapping
        if (this.x > canvas.width + 100) this.x = -100;
        if (this.x < -100) this.x = canvas.width + 100;
        if (this.y > canvas.height + 100) this.y = -100;
        if (this.y < -100) this.y = canvas.height + 100;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Outer glow
        if (this.brightness > 0) {
            const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 1.5);
            glowGradient.addColorStop(0, `rgba(150, 200, 255, ${this.brightness * 0.3})`);
            glowGradient.addColorStop(1, 'rgba(150, 200, 255, 0)');
            ctx.fillStyle = glowGradient;
            ctx.fillRect(-this.size, -this.size, this.size * 2, this.size * 2);
        }

        // Glass fragment
        ctx.strokeStyle = `rgba(150, 200, 255, ${this.opacity + this.brightness * 0.4})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-this.size / 2, -this.size / 2);
        ctx.lineTo(this.size / 2, -this.size / 3);
        ctx.lineTo(this.size / 3, this.size / 2);
        ctx.lineTo(-this.size / 3, this.size / 2);
        ctx.closePath();
        ctx.stroke();

        // Inner crack glow
        if (this.brightness > 0.3) {
            ctx.strokeStyle = `rgba(200, 220, 255, ${this.brightness * 0.6})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, -this.size / 2);
            ctx.lineTo(0, this.size / 2);
            ctx.stroke();
        }

        ctx.restore();
    }
}

// Initialize particles and glass
const particles = [];
const glassFragments = [];
const particleCount = 200;
const glassCount = 30;

for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        Math.random() > 0.7
    ));
}

for (let i = 0; i < glassCount; i++) {
    glassFragments.push(new GlassFragment(
        Math.random() * canvas.width,
        Math.random() * canvas.height
    ));
}

// Mouse tracking
let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;
let interactionLevel = 0;

canvas.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    interactionLevel = Math.min(interactionLevel + 0.05, 1);
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    mouseX = touch.clientX;
    mouseY = touch.clientY;
    interactionLevel = Math.min(interactionLevel + 0.05, 1);
});

// Click interaction - create light burst
canvas.addEventListener('click', (e) => {
    const x = e.clientX;
    const y = e.clientY;
    
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y, true));
    }
});

canvas.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const x = touch.clientX;
    const y = touch.clientY;
    
    for (let i = 0; i < 20; i++) {
        particles.push(new Particle(x, y, true));
    }
});

// Messages system
const messages = [
    { text: "This is heavy", time: 2000, duration: 3000 },
    { text: "But you're still moving", time: 8000, duration: 3000 },
    { text: "Pain can be beautiful", time: 15000, duration: 3000 },
    { text: "You don't have to be fixed to be whole", time: 22000, duration: 4000 },
    { text: "Don't give up", time: 30000, duration: 4000 },
    { text: "LUMINA", time: 37000, duration: 5000 }
];

let messageIndex = 0;
let startTime = Date.now();

function updateMessage() {
    const elapsed = Date.now() - startTime;
    
    if (messageIndex < messages.length) {
        const current = messages[messageIndex];
        
        if (elapsed >= current.time && elapsed < current.time + current.duration) {
            if (messageEl.textContent !== current.text) {
                messageEl.textContent = current.text;
                messageEl.classList.add('show');
            }
        } else if (elapsed >= current.time + current.duration) {
            messageEl.classList.remove('show');
            if (messageIndex < messages.length - 1) {
                messageIndex++;
            }
        }
    }
}

// Animation loop
function animate() {
    // Dark background with slight gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000510');
    gradient.addColorStop(1, '#000000');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw glass fragments
    glassFragments.forEach(fragment => {
        fragment.update(mouseX, mouseY);
        fragment.draw();
    });

    // Update and draw particles
    particles.forEach(particle => {
        particle.update(mouseX, mouseY, interactionLevel);
        particle.draw();
    });

    // Update message
    updateMessage();

    // Fade interaction level
    interactionLevel *= 0.98;

    requestAnimationFrame(animate);
}

// Start animation
animate();

// Welcome message
messageEl.textContent = "Move to create light";
messageEl.classList.add('show');
setTimeout(() => {
    messageEl.classList.remove('show');
    startTime = Date.now();
}, 3000);
