/* ==========================================================================
   Kaviya Birthday Story: Grand Redesign ✨
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    const state = {
        mouse: {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            targetX: window.innerWidth / 2,
            targetY: window.innerHeight / 2
        },
        particlesState: 'drift',
        constellationPoints: [],
        audioPlaying: false,
        sealOpened: false,
        sealActive: false
    };

    const cursor = document.getElementById('custom-cursor');
    const cursorFollower = document.getElementById('custom-cursor-follower');
    const bgCanvas = document.getElementById('bg-canvas');
    const ctx = bgCanvas.getContext('2d');
    const masterStage = document.getElementById('master-stage');
    const audioControl = document.getElementById('audio-control');
    const visualizer = document.getElementById('visualizer');
    const scrollProgressFill = document.getElementById('scroll-progress-fill');
    const ambientGlow = document.getElementById('ambient-glow');
    const floatingHeartsLayer = document.getElementById('floating-hearts-layer');

    let lenis = null;
    let audioCtx = null;
    let synth = null;

    /* ==========================================================================
       Floating Hearts & Sparkles
       ========================================================================== */
    function spawnFloatingHearts() {
        const heartSymbols = ['♥', '♡', '✦', '❤'];
        const count = window.innerWidth < 768 ? 8 : 14;

        for (let i = 0; i < count; i++) {
            // Hearts
            const heart = document.createElement('div');
            heart.className = 'floating-heart';
            heart.textContent = heartSymbols[Math.floor(Math.random() * heartSymbols.length)];
            heart.style.left = `${Math.random() * 100}%`;
            heart.style.fontSize = `${Math.random() * 14 + 8}px`;
            heart.style.animationDuration = `${Math.random() * 12 + 10}s`;
            heart.style.animationDelay = `${Math.random() * 15}s`;
            heart.style.color = Math.random() > 0.5 ? '#E07A5F' : '#D4AF37';
            floatingHeartsLayer.appendChild(heart);
        }

        // Sparkles
        const sparkleCount = window.innerWidth < 768 ? 6 : 12;
        for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'floating-sparkle';
            sparkle.style.left = `${Math.random() * 100}%`;
            sparkle.style.width = `${Math.random() * 4 + 2}px`;
            sparkle.style.height = sparkle.style.width;
            sparkle.style.animationDuration = `${Math.random() * 15 + 8}s`;
            sparkle.style.animationDelay = `${Math.random() * 10}s`;
            sparkle.style.background = Math.random() > 0.4 ? '#D4AF37' : '#F4E285';
            floatingHeartsLayer.appendChild(sparkle);
        }
    }

    spawnFloatingHearts();

    /* ==========================================================================
       Canvas Resize & Constellation
       ========================================================================== */
    function resizeCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
        particles.forEach((particle) => {
            particle.constellationTarget = null;
        });
        generateConstellation();
    }

    /* ==========================================================================
       Custom Cursor
       ========================================================================== */
    window.addEventListener('pointermove', (event) => {
        state.mouse.targetX = event.clientX;
        state.mouse.targetY = event.clientY;
    });

    function updateCursor() {
        state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.14;
        state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.14;

        cursor.style.left = `${state.mouse.targetX}px`;
        cursor.style.top = `${state.mouse.targetY}px`;
        cursorFollower.style.left = `${state.mouse.x}px`;
        cursorFollower.style.top = `${state.mouse.y}px`;

        requestAnimationFrame(updateCursor);
    }

    updateCursor();

    document.addEventListener('mouseover', (event) => {
        if (event.target.closest('button, a')) {
            document.body.classList.add('hover-interactive');
        }
    });

    document.addEventListener('mouseout', (event) => {
        if (!event.relatedTarget || !event.relatedTarget.closest('button, a')) {
            document.body.classList.remove('hover-interactive');
        }
    });

    /* ==========================================================================
       Image Preloading
       ========================================================================== */
    const imageSources = [
        'photos/1781799660423.png',
        'photos/1781799671233.png',
        'photos/1781799677010.png',
        'photos/1781799682283.png',
        'photos/1781799687992.png',
        'photos/1781799704353.png',
        'photos/IMG_20260618_215602.jpg.jpeg',
        'photos/IMG_20260618_215611.jpg.jpeg',
        'photos/IMG_20260618_215630.jpg.jpeg',
        'photos/IMG_20260618_215643.jpg.jpeg',
        'photos/IMG_20260618_215656.jpg.jpeg',
        'photos/IMG_20260618_215710.jpg.jpeg',
        'photos/IMG_20260618_215724.jpg.jpeg',
        'photos/IMG_20260618_215740.jpg.jpeg',
        'photos/IMG_20260618_215804.jpg.jpeg',
        'photos/Screenshot_20260618_215213.jpg.jpeg',
        'photos/Screenshot_20260618_215244.jpg.jpeg'
    ];

    function preloadImages() {
        return Promise.all(imageSources.map((src) => new Promise((resolve) => {
            const image = new Image();
            image.onload = resolve;
            image.onerror = resolve;
            image.src = src;
        })));
    }

    /* ==========================================================================
       Particle System (Gold + Coral + Hearts)
       ========================================================================== */
    const particles = [];
    const PARTICLE_COUNT = window.innerWidth < 768 ? 100 : 240;

    function generateConstellation() {
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = 720;
        tempCanvas.height = 170;

        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        tempCtx.fillStyle = '#2C2424';
        tempCtx.font = '600 92px "Cormorant Garamond", serif';
        tempCtx.textAlign = 'center';
        tempCtx.textBaseline = 'middle';
        tempCtx.fillText('KAVIYA', 360, 86);

        const imgData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height).data;
        const coords = [];

        for (let y = 0; y < tempCanvas.height; y += 5) {
            for (let x = 0; x < tempCanvas.width; x += 5) {
                const index = (y * tempCanvas.width + x) * 4;
                if (imgData[index + 3] > 120) {
                    coords.push({
                        rx: (x - 360) / 360,
                        ry: (y - 86) / 86
                    });
                }
            }
        }

        state.constellationPoints = coords;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * window.innerWidth;
            this.y = Math.random() * window.innerHeight;
            this.reset();
        }

        reset() {
            this.size = Math.random() * 1.8 + 0.5;
            this.color = Math.random() > 0.44 ? '#D4AF37' : '#E07A5F';
            this.alpha = Math.random() * 0.42 + 0.16;
            this.vx = (Math.random() - 0.5) * 0.35;
            this.vy = (Math.random() - 0.5) * 0.35;
            this.constellationTarget = null;
            // Some particles are tiny hearts
            this.isHeart = Math.random() > 0.92;
        }

        update() {
            if (state.particlesState === 'constellation' && state.constellationPoints.length) {
                if (!this.constellationTarget) {
                    const point = state.constellationPoints[Math.floor(Math.random() * state.constellationPoints.length)];
                    const scaleX = Math.min(window.innerWidth * 0.39, 360);
                    const scaleY = Math.min(window.innerHeight * 0.1, 86);

                    this.constellationTarget = {
                        x: window.innerWidth / 2 + point.rx * scaleX,
                        y: window.innerHeight / 2 - window.innerHeight * 0.22 + point.ry * scaleY
                    };
                }

                this.x += (this.constellationTarget.x - this.x) * 0.07;
                this.y += (this.constellationTarget.y - this.y) * 0.07;
                this.alpha += (0.86 - this.alpha) * 0.04;
                return;
            }

            this.x += this.vx;
            this.y += this.vy;

            if (state.particlesState === 'burst') {
                this.vx *= 0.93;
                this.vy *= 0.93;
            }

            if (this.x < -20) this.x = bgCanvas.width + 20;
            if (this.x > bgCanvas.width + 20) this.x = -20;
            if (this.y < -20) this.y = bgCanvas.height + 20;
            if (this.y > bgCanvas.height + 20) this.y = -20;

            if (state.particlesState !== 'burst') {
                const dx = state.mouse.targetX - this.x;
                const dy = state.mouse.targetY - this.y;
                const dist = Math.hypot(dx, dy);

                if (dist < 120) {
                    const force = (120 - dist) / 120;
                    this.x -= (dx / (dist + 1)) * force * 1.8;
                    this.y -= (dy / (dist + 1)) * force * 1.8;
                }
            }
        }

        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;

            if (this.isHeart && this.size > 1) {
                // Draw tiny heart
                const s = this.size * 1.5;
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + s * 0.3);
                ctx.bezierCurveTo(this.x - s, this.y - s * 0.5, this.x - s * 0.5, this.y - s, this.x, this.y - s * 0.4);
                ctx.bezierCurveTo(this.x + s * 0.5, this.y - s, this.x + s, this.y - s * 0.5, this.x, this.y + s * 0.3);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        particles.push(new Particle());
    }

    generateConstellation();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    /* ==========================================================================
       Photo Card 3D Tilt & Interactions
       ========================================================================== */
    const allPhotoCards = document.querySelectorAll('.photo-card');
    allPhotoCards.forEach((card) => {
        card._quickRotateX = gsap.quickTo(card, "rotateX", { duration: 0.25, ease: "power2.out" });
        card._quickRotateY = gsap.quickTo(card, "rotateY", { duration: 0.25, ease: "power2.out" });
    });

    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    let activeCluster = null;
    let activeCards = [];
    let isScattered = false;

    function getActiveCluster() {
        const activeSection = Array.from(document.querySelectorAll('.photo-section')).find(s => {
            const style = window.getComputedStyle(s);
            return style.visibility === 'visible' && style.opacity !== '0';
        });
        return activeSection ? activeSection.querySelector('.photo-cluster') : null;
    }

    function triggerScatter() {
        isScattered = true;
        // Repel removed. Just flag as interactive state.
    }

    function resetScatter() {
        isScattered = false;
        if (!activeCards.length) return;

        activeCards.forEach(c => {
            c.classList.remove('hovered');
            c.style.setProperty('--mouse-x', '50%');
            c.style.setProperty('--mouse-y', '50%');
            c.style.zIndex = '2';
            if (c._quickRotateX && c._quickRotateY) {
                c._quickRotateX(0);
                c._quickRotateY(0);
            }
            
            gsap.to(c, {
                scale: 1,
                opacity: 1,
                filter: 'blur(0px)',
                rotate: parseFloat(c.dataset.r || 0),
                duration: 0.6,
                ease: 'power2.out',
                overwrite: 'auto'
            });
        });
    }

    const memoryCanvas = document.querySelector('.memory-canvas');
    if (memoryCanvas) {
        function focusCard(card) {
            if (card.classList.contains('hovered')) return;
            card.classList.add('hovered');
            card.style.zIndex = '50';

            // Bring the card forward, straighten it, scale it up
            gsap.to(card, {
                scale: 1.25,
                opacity: 1,
                filter: 'blur(0px)',
                rotate: 0,
                duration: 0.5,
                ease: 'power3.out',
                overwrite: 'auto'
            });

            // Dim and push siblings to the background
            activeCards.forEach((sibling) => {
                if (sibling !== card) {
                    sibling.classList.remove('hovered');
                    sibling.style.zIndex = '1';
                    gsap.to(sibling, {
                        scale: 0.85,
                        opacity: 0.25,
                        filter: 'blur(6px)',
                        rotate: parseFloat(sibling.dataset.r || 0),
                        duration: 0.5,
                        ease: 'power3.out',
                        overwrite: 'auto'
                    });
                }
            });
        }

        function resetCardFocus() {
            activeCards.forEach((c) => {
                c.classList.remove('hovered');
                c.style.zIndex = '2';
                gsap.to(c, {
                    scale: 1,
                    opacity: 1,
                    filter: 'blur(0px)',
                    rotate: parseFloat(c.dataset.r || 0),
                    duration: 0.5,
                    ease: 'power2.out',
                    overwrite: 'auto'
                });

                c.style.setProperty('--mouse-x', '50%');
                c.style.setProperty('--mouse-y', '50%');
                if (c._quickRotateX && c._quickRotateY) {
                    c._quickRotateX(0);
                    c._quickRotateY(0);
                }
            });
        }

        memoryCanvas.addEventListener('pointermove', (e) => {
            if (isTouchDevice) return;
            
            const cluster = getActiveCluster();
            if (!cluster) {
                if (isScattered) resetScatter();
                return;
            }

            if (activeCluster !== cluster) {
                if (isScattered) resetScatter();
                activeCluster = cluster;
                activeCards = Array.from(cluster.querySelectorAll('.photo-card'));
            }

            const rect = cluster.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;
            const distance = Math.hypot(dx, dy);

            const enterThreshold = window.innerWidth < 760 ? 250 : 380;
            const leaveThreshold = window.innerWidth < 760 ? 400 : 650;

            const card = e.target.closest('.photo-card');
            const isOverCard = card && activeCards.includes(card);

            if (!isScattered && (distance < enterThreshold || isOverCard)) {
                triggerScatter();
            }

            if (isScattered) {
                if (isOverCard) {
                    focusCard(card);

                    const cardRect = card.getBoundingClientRect();
                    const cardCenterX = cardRect.left + cardRect.width / 2;
                    const cardCenterY = cardRect.top + cardRect.height / 2;

                    const cdx = e.clientX - cardCenterX;
                    const cdy = e.clientY - cardCenterY;

                    const px = cdx / (cardRect.width / 2);
                    const py = cdy / (cardRect.height / 2);

                    const nx = Math.max(-1, Math.min(1, px));
                    const ny = Math.max(-1, Math.min(1, py));

                    card.style.setProperty('--mouse-x', `${((nx + 1) / 2 * 100).toFixed(1)}%`);
                    card.style.setProperty('--mouse-y', `${((ny + 1) / 2 * 100).toFixed(1)}%`);

                    const targetRotateX = -ny * 15;
                    const targetRotateY = nx * 15;

                    if (card._quickRotateX && card._quickRotateY) {
                        card._quickRotateX(targetRotateX);
                        card._quickRotateY(targetRotateY);
                    }
                } else {
                    const hasHoveredCard = activeCards.some(c => c.classList.contains('hovered'));
                    if (hasHoveredCard) {
                        resetCardFocus();
                    }
                }
            }
        });

        memoryCanvas.addEventListener('pointerleave', () => {
            if (isTouchDevice) return;
            if (isScattered) resetScatter();
        });

        memoryCanvas.addEventListener('pointerover', (e) => {
            if (isTouchDevice) return;
            if (!isScattered) return;
            const card = e.target.closest('.photo-card');
            if (!card || !activeCards.includes(card)) return;
            focusCard(card);
        });

        memoryCanvas.addEventListener('pointerout', (e) => {
            if (isTouchDevice) return;
            if (!isScattered) return;
            const card = e.target.closest('.photo-card');
            const relatedTarget = e.relatedTarget;
            const newCard = relatedTarget ? relatedTarget.closest('.photo-card') : null;

            if (!card || !activeCards.includes(card)) return;
            if (newCard === card) return;

            if (!newCard || !activeCards.includes(newCard)) {
                resetCardFocus();
            } else {
                card.classList.remove('hovered');
                card.style.setProperty('--mouse-x', '50%');
                card.style.setProperty('--mouse-y', '50%');
                if (card._quickRotateX && card._quickRotateY) {
                    card._quickRotateX(0);
                    card._quickRotateY(0);
                }
            }
        });

        memoryCanvas.addEventListener('click', (e) => {
            const card = e.target.closest('.photo-card');
            const cluster = getActiveCluster();
            if (!cluster) return;

            if (activeCluster !== cluster) {
                if (isScattered) resetScatter();
                activeCluster = cluster;
                activeCards = Array.from(cluster.querySelectorAll('.photo-card'));
            }

            if (card && activeCards.includes(card)) {
                e.stopPropagation();
                if (!isScattered) {
                    triggerScatter();
                    setTimeout(() => {
                        focusCard(card);
                    }, 50);
                } else {
                    if (card.classList.contains('hovered')) {
                        resetCardFocus();
                    } else {
                        focusCard(card);
                    }
                }
            } else {
                if (isScattered) {
                    resetCardFocus();
                }
            }
        });
    }

    /* ==========================================================================
       Particle Animation Loop
       ========================================================================== */
    function animateParticles() {
        ctx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

        particles.forEach((particle) => {
            particle.update();
            particle.draw();
        });

        if (state.particlesState === 'constellation') {
            ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
            ctx.lineWidth = 0.6;

            for (let i = 0; i < particles.length; i += 4) {
                for (let j = i + 1; j < i + 11 && j < particles.length; j += 1) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.hypot(dx, dy);

                    if (distance < 42) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        }

        requestAnimationFrame(animateParticles);
    }

    animateParticles();

    /* ==========================================================================
       Audio
       ========================================================================== */
    function initAudio() {
        if (audioCtx) return;

        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContext();

        synth = {
            osc1: audioCtx.createOscillator(),
            osc2: audioCtx.createOscillator(),
            gainNode: audioCtx.createGain(),
            filterNode: audioCtx.createBiquadFilter(),
            lfo: audioCtx.createOscillator(),
            lfoGain: audioCtx.createGain()
        };

        synth.osc1.type = 'sine';
        synth.osc1.frequency.value = 55;
        synth.osc2.type = 'triangle';
        synth.osc2.frequency.value = 82.4;
        synth.filterNode.type = 'lowpass';
        synth.filterNode.frequency.value = 440;
        synth.filterNode.Q.value = 1.2;
        synth.gainNode.gain.value = 0;
        synth.lfo.frequency.value = 0.08;
        synth.lfoGain.gain.value = 260;

        synth.lfo.connect(synth.lfoGain);
        synth.lfoGain.connect(synth.filterNode.frequency);
        synth.osc1.connect(synth.filterNode);
        synth.osc2.connect(synth.filterNode);
        synth.filterNode.connect(synth.gainNode);
        synth.gainNode.connect(audioCtx.destination);
        synth.lfo.start();
        synth.osc1.start();
        synth.osc2.start();
    }

    function toggleAudio(forceState) {
        initAudio();

        const nextState = typeof forceState === 'boolean' ? forceState : !state.audioPlaying;
        state.audioPlaying = nextState;

        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }

        const targetGain = nextState ? 0.08 : 0;
        synth.gainNode.gain.cancelScheduledValues(audioCtx.currentTime);
        synth.gainNode.gain.linearRampToValueAtTime(targetGain, audioCtx.currentTime + 1.2);
        visualizer.classList.toggle('playing', nextState);
        audioControl.querySelector('.audio-label').textContent = nextState ? 'AMBIENT ON' : 'AMBIENT OFF';
    }

    function adjustAudio(progress) {
        if (!synth || !audioCtx) return;

        synth.osc1.frequency.setTargetAtTime(55 + progress * 10, audioCtx.currentTime, 0.18);
        synth.osc2.frequency.setTargetAtTime(82.4 + progress * 14, audioCtx.currentTime, 0.18);
        synth.filterNode.frequency.setTargetAtTime(420 + progress * 520, audioCtx.currentTime, 0.2);
    }

    audioControl.addEventListener('click', () => toggleAudio());

    /* ==========================================================================
       Section Transition Sparkle Burst
       ========================================================================== */
    function spawnTransitionSparkles() {
        const stage = document.querySelector('.stage-viewport');
        const count = 18;
        
        for (let i = 0; i < count; i++) {
            const sparkle = document.createElement('div');
            sparkle.className = 'transition-sparkle';
            sparkle.style.left = '50%';
            sparkle.style.top = '50%';
            stage.appendChild(sparkle);

            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.3;
            const dist = Math.random() * 200 + 80;
            const color = Math.random() > 0.5 ? '#D4AF37' : '#E07A5F';
            sparkle.style.background = color;
            sparkle.style.boxShadow = `0 0 8px ${color}`;

            gsap.fromTo(sparkle,
                {
                    x: 0,
                    y: 0,
                    scale: 0,
                    opacity: 1
                },
                {
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist,
                    scale: Math.random() * 1.5 + 0.5,
                    opacity: 0,
                    duration: Math.random() * 0.8 + 0.6,
                    ease: 'power2.out',
                    onComplete: () => sparkle.remove()
                }
            );
        }
    }

    /* ==========================================================================
       Flower / Petal Shower
       ========================================================================== */
    function spawnFlowerShower(count = 36, zIndex = 103) {
        const stage = document.querySelector('.stage-viewport');
        const colors = ['#E07A5F', '#D4AF37', '#F4A261', '#E76F51', '#F4C2C2'];
        const petalPaths = [
            'M 15,0 C 25,0 30,10 25,25 C 20,40 10,40 5,25 C 0,10 5,0 15,0 Z',
            'M 10,0 C 22,2 26,14 18,26 C 10,38 2,34 0,22 C -2,10 2,0 10,0 Z',
            'M 12,5 A 4,4 0 0,1 16,9 A 4,4 0 0,1 12,13 A 4,4 0 0,1 8,9 A 4,4 0 0,1 12,5 Z M 16,9 A 4,4 0 0,1 20,13 A 4,4 0 0,1 16,17 A 4,4 0 0,1 12,13 A 4,4 0 0,1 16,9 Z'
        ];
        // Heart petal path
        const heartPath = 'M 15,28 C 15,28 2,18 2,10 C 2,5 6,2 10,4 C 12,5 14,7 15,10 C 16,7 18,5 20,4 C 24,2 28,5 28,10 C 28,18 15,28 15,28 Z';
        const allPaths = [...petalPaths, heartPath];

        for (let i = 0; i < count; i++) {
            const container = document.createElement('div');
            container.className = 'falling-petal';
            container.style.position = 'absolute';
            container.style.left = `${Math.random() * 100}%`;
            container.style.top = `-40px`;
            container.style.width = `${Math.random() * 20 + 15}px`;
            container.style.height = `${Math.random() * 20 + 15}px`;
            container.style.pointerEvents = 'none';
            container.style.zIndex = String(zIndex);

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 30 30');
            svg.style.width = '100%';
            svg.style.height = '100%';

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', allPaths[Math.floor(Math.random() * allPaths.length)]);
            path.setAttribute('fill', colors[Math.floor(Math.random() * colors.length)]);
            path.setAttribute('opacity', (Math.random() * 0.4 + 0.5).toFixed(2));

            svg.appendChild(path);
            container.appendChild(svg);
            stage.appendChild(container);

            const duration = Math.random() * 3.5 + 2.5;
            const delay = Math.random() * 0.8;

            gsap.fromTo(container,
                {
                    y: 0,
                    xPercent: -50,
                    rotation: Math.random() * 360,
                    scale: Math.random() * 0.4 + 0.6
                },
                {
                    y: window.innerHeight + 80,
                    x: `+=${Math.random() * 160 - 80}`,
                    rotation: `+=${Math.random() * 720 - 360}`,
                    duration: duration,
                    delay: delay,
                    ease: 'sine.inOut',
                    onComplete: () => {
                        container.remove();
                    }
                }
            );
        }
    }

    /* Gentle petal spawning during photo sections */
    let gentlePetalInterval = null;
    function startGentlePetals() {
        if (gentlePetalInterval) return;
        gentlePetalInterval = setInterval(() => {
            spawnFlowerShower(3, 5);
        }, 2500);
    }

    function stopGentlePetals() {
        if (gentlePetalInterval) {
            clearInterval(gentlePetalInterval);
            gentlePetalInterval = null;
        }
    }

    /* ==========================================================================
       Grand Finale Heart Burst
       ========================================================================== */
    function spawnGrandFinaleHearts() {
        const stage = document.querySelector('.stage-viewport');
        const colors = ['#E07A5F', '#D4AF37', '#F4A261', '#F4C2C2', '#E76F51'];
        const heartPath = 'M 15,28 C 15,28 2,18 2,10 C 2,5 6,2 10,4 C 12,5 14,7 15,10 C 16,7 18,5 20,4 C 24,2 28,5 28,10 C 28,18 15,28 15,28 Z';
        const count = 48;

        for (let i = 0; i < count; i++) {
            const container = document.createElement('div');
            container.style.position = 'absolute';
            container.style.left = '50%';
            container.style.top = '50%';
            container.style.width = `${Math.random() * 24 + 12}px`;
            container.style.height = container.style.width;
            container.style.pointerEvents = 'none';
            container.style.zIndex = '103';

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 30 30');
            svg.style.width = '100%';
            svg.style.height = '100%';
            svg.style.filter = 'drop-shadow(0 0 6px rgba(224, 122, 95, 0.5))';

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', heartPath);
            path.setAttribute('fill', colors[Math.floor(Math.random() * colors.length)]);
            path.setAttribute('opacity', (Math.random() * 0.3 + 0.6).toFixed(2));

            svg.appendChild(path);
            container.appendChild(svg);
            stage.appendChild(container);

            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * 350 + 100;
            const duration = Math.random() * 2.5 + 1.5;

            gsap.fromTo(container,
                {
                    x: 0,
                    y: 0,
                    scale: 0,
                    opacity: 1,
                    rotation: Math.random() * 360
                },
                {
                    x: Math.cos(angle) * dist,
                    y: Math.sin(angle) * dist - 100,
                    scale: Math.random() * 1.2 + 0.5,
                    opacity: 0,
                    rotation: `+=${Math.random() * 360}`,
                    duration: duration,
                    delay: Math.random() * 0.5,
                    ease: 'power2.out',
                    onComplete: () => container.remove()
                }
            );
        }
    }

    /* ==========================================================================
       Particle Burst
       ========================================================================== */
    function triggerParticleBurst(centerX, centerY) {
        state.particlesState = 'burst';
        particles.forEach((p) => {
            p.x = centerX;
            p.y = centerY;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 9 + 4;
            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.size = Math.random() * 2.8 + 1.2;
            p.alpha = 1.0;
            p.color = Math.random() > 0.4 ? '#D4AF37' : '#E07A5F';
            p.constellationTarget = null;
        });
    }

    /* ==========================================================================
       Wax Seal
       ========================================================================== */
    function activateWaxSeal(scrollTrigger) {
        const barrier = document.getElementById('wax-seal-barrier');
        const leftEnv = document.getElementById('envelope-left');
        const rightEnv = document.getElementById('envelope-right');
        const sealContainer = document.getElementById('seal-container');
        const seal = document.getElementById('wax-seal');

        barrier.classList.add('active');

        seal.addEventListener('pointerenter', () => {
            document.body.classList.add('hover-interactive');
        });
        seal.addEventListener('pointerleave', () => {
            if (!isDragging) {
                document.body.classList.remove('hover-interactive');
            }
        });

        let isDragging = false;
        let startY = 0;

        function updateTear(dy) {
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const initialY = viewportHeight * 0.5;
            const sealY = initialY + dy;
            const maxGap = viewportWidth * 0.22;
            const gapX = Math.min(maxGap, dy * 0.45);

            leftEnv.style.clipPath = `polygon(0% 0%, calc(50% - ${gapX}px) 0%, 50% ${sealY}px, 50% 100%, 0% 100%)`;
            rightEnv.style.clipPath = `polygon(calc(50% + ${gapX}px) 0%, 100% 0%, 100% 100%, 50% 100%, 50% ${sealY}px)`;
        }

        function onPointerDown(e) {
            isDragging = true;
            startY = e.clientY;
            sealContainer.classList.add('dragging');
            document.body.classList.add('hover-interactive');
            sealContainer.setPointerCapture(e.pointerId);
        }

        function onPointerMove(e) {
            if (!isDragging) return;

            const dyRaw = e.clientY - startY;
            const dy = Math.max(0, dyRaw);

            sealContainer.style.transform = `translate(-50%, calc(-50% + ${dy}px))`;
            updateTear(dy);

            const threshold = window.innerHeight * 0.4;
            if (dy >= threshold) {
                isDragging = false;
                sealContainer.releasePointerCapture(e.pointerId);
                popSeal(dy);
            }
        }

        function onPointerUp(e) {
            if (!isDragging) return;
            isDragging = false;
            sealContainer.releasePointerCapture(e.pointerId);
            resetSeal();
        }

        function resetSeal() {
            sealContainer.classList.remove('dragging');
            document.body.classList.remove('hover-interactive');

            const transform = sealContainer.style.transform;
            const match = transform.match(/calc\(-50% \+ ([\d.]+)px\)/);
            const currentDy = match ? parseFloat(match[1]) : 0;

            const animObj = { dy: currentDy };
            gsap.to(animObj, {
                dy: 0,
                duration: 0.6,
                ease: 'elastic.out(1, 0.6)',
                onUpdate: () => {
                    sealContainer.style.transform = `translate(-50%, calc(-50% + ${animObj.dy}px))`;
                    updateTear(animObj.dy);
                }
            });
        }

        function popSeal(finalDy) {
            state.sealOpened = true;
            state.sealActive = false;

            const burstY = window.innerHeight * 0.5 + finalDy;
            triggerParticleBurst(window.innerWidth / 2, burstY);
            spawnFlowerShower();

            if (state.audioPlaying && audioCtx && synth) {
                const popTime = audioCtx.currentTime;
                
                const osc = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(140, popTime);
                osc.frequency.exponentialRampToValueAtTime(640, popTime + 0.35);
                gainNode.gain.setValueAtTime(0.12, popTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, popTime + 0.35);
                osc.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                osc.start();
                osc.stop(popTime + 0.35);

                const chime = audioCtx.createOscillator();
                const chimeGain = audioCtx.createGain();
                chime.type = 'sine';
                chime.frequency.setValueAtTime(880, popTime);
                chime.frequency.exponentialRampToValueAtTime(1760, popTime + 0.45);
                chimeGain.gain.setValueAtTime(0.06, popTime);
                chimeGain.gain.exponentialRampToValueAtTime(0.001, popTime + 0.45);
                chime.connect(chimeGain);
                chimeGain.connect(audioCtx.destination);
                chime.start();
                chime.stop(popTime + 0.45);
            }

            barrier.classList.add('split-open');

            setTimeout(() => {
                barrier.classList.remove('active');
                document.body.style.overflow = '';
                if (lenis) lenis.start();

                setTimeout(() => {
                    if (!state.sealActive) {
                        state.particlesState = 'drift';
                    }
                }, 600);
            }, 850);
        }

        sealContainer.addEventListener('pointerdown', onPointerDown);
        sealContainer.addEventListener('pointermove', onPointerMove);
        sealContainer.addEventListener('pointerup', onPointerUp);
        sealContainer.addEventListener('pointercancel', onPointerUp);
    }

    /* ==========================================================================
       Timeline Helpers
       ========================================================================== */
    function revealLayer(timeline, selector, position) {
        timeline.set(selector, { visibility: 'visible' }, position)
            .fromTo(selector,
                {
                    autoAlpha: 0,
                    scale: 1.16,
                    z: -260,
                    filter: 'blur(18px)'
                },
                {
                    autoAlpha: 1,
                    scale: 1,
                    z: 0,
                    filter: 'blur(0px)',
                    duration: 1,
                    ease: 'power3.out',
                    onStart: () => {
                        // Add active glow to text
                        const el = document.querySelector(selector);
                        if (el) el.classList.add('active-glow');
                        // Sparkle burst on section entry
                        spawnTransitionSparkles();
                    }
                },
                position
            )
            .to(selector,
                {
                    autoAlpha: 0,
                    scale: 0.88,
                    z: 180,
                    filter: 'blur(16px)',
                    duration: 0.82,
                    ease: 'power3.in',
                    onComplete: () => {
                        const el = document.querySelector(selector);
                        if (el) el.classList.remove('active-glow');
                    }
                },
                position + 1.24
            )
            .set(selector, { visibility: 'hidden' }, position + 2.1);
    }

    function motionScale() {
        if (window.innerWidth < 360) return 0.32;
        if (window.innerWidth < 520) return 0.42;
        if (window.innerWidth < 760) return 0.56;
        if (window.innerWidth < 1024) return 0.78;
        if (window.innerWidth < 1440) return 1.0;
        if (window.innerWidth < 1920) return 1.25;
        if (window.innerWidth < 2560) return 1.5;
        return 1.85;
    }

    function cardX(element, drift = 0) {
        return (Number(element.dataset.x || 0) + drift) * motionScale();
    }

    function cardY(element, drift = 0) {
        return (Number(element.dataset.y || 0) + drift) * motionScale();
    }

    function cardRotation(element, drift = 0) {
        return Number(element.dataset.r || 0) + drift;
    }

    function revealPhotoSection(timeline, selector, position, options = {}) {
        const cards = `${selector} .photo-card`;
        const caption = `${selector} .photo-caption`;
        const glows = `${selector} .photo-glow`;
        const staggerFrom = options.staggerFrom || 'center';
        const holdPoint = position + 1.34;
        const exitPoint = position + 1.82;

        timeline
            .set(selector, { autoAlpha: 1, visibility: 'visible', pointerEvents: 'auto' }, position)
            .set(caption, { visibility: 'visible' }, position)
            .set(glows, { opacity: 0.6 }, position)
            .fromTo(cards,
                {
                    autoAlpha: 0,
                    xPercent: -50,
                    yPercent: -50,
                    x: options.originX || 0,
                    y: options.originY || 0,
                    z: -460,
                    scale: options.startScale || 0.42,
                    rotate: (index) => (Math.random() - 0.5) * 30, // Gift unwrapping rotation
                    filter: 'blur(24px)',
                    clipPath: 'circle(0% at 50% 50%)'
                },
                {
                    autoAlpha: 1,
                    xPercent: -50,
                    yPercent: -50,
                    x: (index, element) => cardX(element),
                    y: (index, element) => cardY(element),
                    z: 0,
                    scale: options.scale || 1,
                    rotate: (index, element) => cardRotation(element),
                    filter: 'blur(0px)',
                    clipPath: 'circle(76% at 50% 50%)',
                    pointerEvents: 'auto',
                    duration: options.enterDuration || 1.12,
                    ease: 'power3.out',
                    stagger: {
                        each: options.stagger || 0.07,
                        from: staggerFrom
                    },
                    onStart: () => {
                        startGentlePetals();
                    }
                },
                position
            )
            .fromTo(caption,
                {
                    autoAlpha: 0,
                    y: 18,
                    filter: 'blur(10px)'
                },
                {
                    autoAlpha: 1,
                    y: 0,
                    filter: 'blur(0px)',
                    duration: 0.72,
                    ease: 'power3.out'
                },
                position + 0.58
            )
            .to(cards,
                {
                    x: (index, element) => cardX(element, options.driftX || 0),
                    y: (index, element) => cardY(element, options.driftY || -8) + Math.sin(index * 1.2) * 6,
                    rotate: (index, element) => cardRotation(element, options.rotateDrift || 1.6),
                    scale: (index) => (options.holdScale || 1.025) + Math.sin(index * 0.8) * 0.01,
                    duration: 0.74,
                    ease: 'sine.inOut',
                    onStart: () => {
                        spawnTransitionSparkles();
                    }
                },
                holdPoint
            )
            .to(caption,
                {
                    autoAlpha: 0,
                    y: -20,
                    filter: 'blur(10px)',
                    duration: 0.48,
                    ease: 'power2.in'
                },
                exitPoint
            )
            .to(cards,
                {
                    autoAlpha: 0,
                    x: (index, element) => cardX(element, options.exitDriftX || 0),
                    y: (index, element) => cardY(element, options.exitDriftY || -28),
                    z: 260,
                    scale: options.exitScale || 0.82,
                    rotate: (index, element) => cardRotation(element, options.exitRotate || -2),
                    filter: 'blur(20px)',
                    clipPath: 'circle(34% at 50% 50%)',
                    pointerEvents: 'none',
                    duration: 0.82,
                    ease: 'power3.in',
                    stagger: {
                        each: options.exitStagger || 0.045,
                        from: options.exitFrom || 'edges'
                    },
                    onComplete: () => {
                        stopGentlePetals();
                    }
                },
                exitPoint
            )
            .to(glows, { opacity: 0, duration: 0.4 }, exitPoint)
            .set(selector, { autoAlpha: 0, visibility: 'hidden', pointerEvents: 'none' }, exitPoint + 1.05)
            .set(caption, { autoAlpha: 0, visibility: 'hidden' }, exitPoint + 1.05)
            .set(cards, { autoAlpha: 0, visibility: 'hidden' }, exitPoint + 1.05);
    }

    /* ==========================================================================
       Typewriter Effect for Zenith
       ========================================================================== */
    function typewriterReveal(timeline, selector, position, duration) {
        const paras = document.querySelectorAll(`${selector} .zenith-para`);
        let currentPos = position;

        paras.forEach((para, index) => {
            const text = para.textContent;
            para.textContent = '';
            para.style.opacity = '1';

            const paraSpan = document.createElement('span');
            para.appendChild(paraSpan);

            const cursorEl = document.createElement('span');
            cursorEl.className = 'typewriter-cursor';
            para.appendChild(cursorEl);

            const tweenObj = { length: 0 };
            
            timeline.to(tweenObj, {
                length: text.length,
                duration: duration / paras.length,
                ease: 'none',
                onUpdate: () => {
                    paraSpan.textContent = text.slice(0, Math.floor(tweenObj.length));
                    cursorEl.style.display = Math.floor(tweenObj.length) === text.length ? 'none' : 'inline-block';
                },
                onComplete: () => {
                    cursorEl.style.display = 'none';
                },
                onReverseComplete: () => {
                    paraSpan.textContent = '';
                }
            }, currentPos);

            currentPos += duration / paras.length;
        });
    }

    /* ==========================================================================
       Main Scroll Timeline
       ========================================================================== */
    function initScroll() {
        if (window.Lenis) {
            lenis = new Lenis({
                duration: 1.35,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                smoothWheel: true,
                smoothTouch: false
            });

            lenis.on('scroll', ScrollTrigger.update);

            gsap.ticker.add((time) => {
                lenis.raf(time * 1000);
            });

            gsap.ticker.lagSmoothing(0);

            // Lock scroll until envelope is opened
            lenis.stop();
        }
        document.body.style.overflow = 'hidden';

        /* 
         * Timeline positions with 2 new sections (eyes + beautiful):
         * Original had: arrival, kindness, [bloom], resilience, [duet], impact, [ribbon], [mosaic], zenith
         * New: arrival, kindness, eyes, [bloom], resilience, beautiful, [duet], impact, [ribbon], [mosaic], zenith
         *
         * Each text section takes ~2.1 units. Each photo section takes ~2.87 units.
         * We add 2 more text sections = ~4.2 extra units.
         * Old total was ~1300%, new needs ~1600%.
         */

        const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: masterStage,
                start: 'top top',
                end: '+=1600%',
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                onUpdate: (self) => {
                    adjustAudio(self.progress);

                    // Update scroll progress bar
                    if (scrollProgressFill) {
                        scrollProgressFill.style.width = `${(self.progress * 100).toFixed(1)}%`;
                    }

                    // Clear hovered states on scroll
                    allPhotoCards.forEach(c => {
                        if (c.classList.contains('hovered')) {
                            c.classList.remove('hovered');
                            c.style.zIndex = '';
                            c.style.setProperty('--mouse-x', '50%');
                            c.style.setProperty('--mouse-y', '50%');
                            if (c._quickRotateX && c._quickRotateY) {
                                c._quickRotateX(0);
                                c._quickRotateY(0);
                            }
                        }
                    });

                    // Constellation at the very end
                    if (self.progress > 0.93) {
                        if (state.particlesState !== 'burst') {
                            state.particlesState = 'constellation';
                        }
                    } else {
                        if (state.particlesState !== 'burst') {
                            state.particlesState = 'drift';
                            particles.forEach((particle) => {
                                particle.constellationTarget = null;
                            });
                        }
                    }

                    // Eyes section ambient glow effect (roughly 3.7 - 5.8 in timeline)
                    const eyesStart = 3.7 / 26; // approximate normalized position
                    const eyesEnd = 5.8 / 26;
                    if (self.progress > eyesStart && self.progress < eyesEnd) {
                        ambientGlow.classList.add('eyes-mode');
                    } else {
                        ambientGlow.classList.remove('eyes-mode');
                    }

                    // Auto-scatter on touch devices
                    const cluster = getActiveCluster();
                    if (cluster) {
                        if (activeCluster !== cluster) {
                            activeCluster = cluster;
                            activeCards = Array.from(cluster.querySelectorAll('.photo-card'));
                            if (isTouchDevice) {
                                setTimeout(() => {
                                    if (getActiveCluster() === cluster) {
                                        triggerScatter();
                                    }
                                }, 850);
                            }
                        }
                    } else {
                        if (activeCluster) {
                            if (isScattered) resetScatter();
                            activeCluster = null;
                            activeCards = [];
                        }
                    }
                },
                onLeave: () => {
                    state.particlesState = 'constellation';
                }
            }
        });

        // Activate the Wax Seal
        activateWaxSeal(timeline.scrollTrigger);

        // =====================================================================
        // ARRIVAL (position 0)
        // =====================================================================
        timeline
            .to('.arrival-line', { autoAlpha: 1, scale: 1, filter: 'blur(0px)', duration: 0.34 })
            .to('.arrival-line', { autoAlpha: 1, duration: 0.42 })
            .to('.arrival-layer', {
                autoAlpha: 0,
                scale: 0.9,
                z: 210,
                filter: 'blur(16px)',
                duration: 0.62,
                ease: 'power3.in'
            })
            .set('.arrival-layer', { visibility: 'hidden' });

        // =====================================================================
        // 1. KINDNESS (position ~1.58)
        // =====================================================================
        revealLayer(timeline, '[data-layer="kindness"]', 1.58);

        // =====================================================================
        // 2. THOSE EYES ✨ NEW (position ~3.7)
        // =====================================================================
        revealLayer(timeline, '[data-layer="eyes"]', 3.7);

        // =====================================================================
        // Memory canvas visible starting at Bloom
        // =====================================================================
        timeline.set('.memory-canvas', { autoAlpha: 1, visibility: 'visible', pointerEvents: 'auto' }, 5.9);

        // =====================================================================
        // 3. BLOOM GALLERY — Diamond Constellation (position ~5.9)
        // Hero center with orbiting satellites that spiral inward
        // =====================================================================
        revealPhotoSection(timeline, '[data-photo-section="bloom"]', 5.9, {
            staggerFrom: 'start',
            stagger: 0.12,
            originX: 0,
            originY: 0,
            startScale: 0.2,
            enterDuration: 1.4,
            driftY: -8,
            driftX: 0,
            rotateDrift: 3,
            holdScale: 1.03,
            exitScale: 0.6,
            exitRotate: -6,
            exitDriftY: -40,
            exitStagger: 0.06,
            exitFrom: 'edges'
        });

        // =====================================================================
        // 4. RESILIENCE (position ~8.9)
        // =====================================================================
        revealLayer(timeline, '[data-layer="resilience"]', 8.9);

        // =====================================================================
        // 5. BEAUTIFUL INSIDE & OUT ✨ NEW (position ~11.1)
        // =====================================================================
        revealLayer(timeline, '[data-layer="beautiful"]', 11.1);

        // =====================================================================
        // 6. DUET GALLERY — Cinematic Editorial Tilt (position ~13.3)
        // Dramatic overlap — cards slide from opposite sides with depth
        // =====================================================================
        revealPhotoSection(timeline, '[data-photo-section="duet"]', 13.3, {
            staggerFrom: 'edges',
            stagger: 0.18,
            originX: 300,
            originY: 0,
            startScale: 0.5,
            enterDuration: 1.6,
            driftY: -6,
            driftX: 4,
            rotateDrift: 2,
            holdScale: 1.02,
            exitRotate: 8,
            exitDriftX: 0,
            exitDriftY: -20,
            exitScale: 0.75,
            exitStagger: 0.1,
            exitFrom: 'edges'
        });

        // =====================================================================
        // 7. IMPACT (position ~16.3)
        // =====================================================================
        revealLayer(timeline, '[data-layer="impact"]', 16.3);

        // =====================================================================
        // 8. RIBBON GALLERY — Cascading Wave Arc (position ~18.5)
        // Cards cascade in like dominoes along a sine wave
        // =====================================================================
        revealPhotoSection(timeline, '[data-photo-section="ribbon"]', 18.5, {
            staggerFrom: 'start',
            stagger: 0.065,
            originX: -200,
            originY: 100,
            startScale: 0.3,
            enterDuration: 1.3,
            driftX: 10,
            driftY: -6,
            rotateDrift: 2.5,
            holdScale: 1.02,
            exitDriftX: 60,
            exitDriftY: -20,
            exitScale: 0.7,
            exitRotate: -5,
            exitStagger: 0.04,
            exitFrom: 'end'
        });

        // =====================================================================
        // 9. MOSAIC GALLERY — Heart Formation (position ~21.5)
        // Cards converge from far-flung positions into a heart shape
        // =====================================================================
        revealPhotoSection(timeline, '[data-photo-section="mosaic"]', 21.5, {
            staggerFrom: 'center',
            stagger: 0.14,
            originX: 0,
            originY: 0,
            startScale: 0.15,
            enterDuration: 1.5,
            driftY: -5,
            driftX: 0,
            rotateDrift: 1,
            holdScale: 1.03,
            exitScale: 0.5,
            exitRotate: 12,
            exitDriftY: -30,
            exitStagger: 0.08,
            exitFrom: 'center'
        });

        // Memory canvas hidden after mosaic (21.5 + 2.87 = 24.37)
        timeline.set('.memory-canvas', { autoAlpha: 0, visibility: 'hidden', pointerEvents: 'none' }, 24.37);

        // =====================================================================
        // 10. GRAND FINALE — ZENITH (position ~24.6)
        // =====================================================================
        timeline
            .set('[data-layer="zenith"]', { visibility: 'visible' }, 24.6)
            .fromTo('[data-layer="zenith"]',
                {
                    autoAlpha: 0,
                    scale: 1.2,
                    z: -320,
                    filter: 'blur(22px)'
                },
                {
                    autoAlpha: 1,
                    scale: 1,
                    z: 0,
                    filter: 'blur(0px)',
                    duration: 1.2,
                    ease: 'power3.out',
                    onStart: () => {
                        state.particlesState = 'constellation';
                        spawnTransitionSparkles();
                        // Trigger grand finale hearts
                        setTimeout(() => {
                            spawnGrandFinaleHearts();
                            spawnFlowerShower(24);
                        }, 1500);
                    }
                },
                24.6
            );

        // Typewriter reveal for zenith paragraphs
        typewriterReveal(timeline, '[data-layer="zenith"]', 25.2, 2.8);

        // Hold the zenith
        timeline.to('[data-layer="zenith"]', { autoAlpha: 1, duration: 0.3 }, 28.2);
    }

    /* ==========================================================================
       Initialize
       ========================================================================== */
    gsap.set('.arrival-line', { autoAlpha: 0, scale: 1.08, filter: 'blur(12px)' });
    gsap.set('.text-layer, .memory-canvas, .photo-section, .photo-card, .photo-caption, .zenith-layer', {
        autoAlpha: 0,
        visibility: 'hidden',
        pointerEvents: 'none'
    });
    gsap.set('.photo-glow', { opacity: 0 });

    preloadImages().then(initScroll);
});
