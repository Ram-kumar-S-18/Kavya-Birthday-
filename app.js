/* ==========================================================================
   Kaviya Birthday Story: Single Pinned Narrative Timeline
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

    let lenis = null;
    let audioCtx = null;
    let synth = null;

    function resizeCanvas() {
        bgCanvas.width = window.innerWidth;
        bgCanvas.height = window.innerHeight;
        particles.forEach((particle) => {
            particle.constellationTarget = null;
        });
        generateConstellation();
    }

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

    const particles = [];
    const PARTICLE_COUNT = 240;

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
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < PARTICLE_COUNT; i += 1) {
        particles.push(new Particle());
    }

    generateConstellation();
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initialize GSAP quickTo properties for 3D tilt
    const allPhotoCards = document.querySelectorAll('.photo-card');
    allPhotoCards.forEach((card) => {
        card._quickRotateX = gsap.quickTo(card, "rotateX", { duration: 0.25, ease: "power2.out" });
        card._quickRotateY = gsap.quickTo(card, "rotateY", { duration: 0.25, ease: "power2.out" });
    });

    // Physics Scatter & 3D Focus Interactions
    const clusters = document.querySelectorAll('.photo-cluster');
    clusters.forEach((cluster) => {
        let isClusterHovered = false;
        const cards = Array.from(cluster.querySelectorAll('.photo-card'));
        if (!cards.length) return;

        cluster.addEventListener('pointerenter', () => {
            isClusterHovered = true;

            // Scatter animation (fans out data-x and data-y coordinates by 1.8)
            gsap.to(cards, {
                x: (index, element) => cardX(element) * 1.8,
                y: (index, element) => cardY(element) * 1.8,
                duration: 1.3,
                ease: 'elastic.out(1, 0.75)',
                overwrite: 'auto'
            });
        });

        cluster.addEventListener('pointerleave', () => {
            isClusterHovered = false;

            // Reset all cards in this cluster back to clustered coordinates and clear focus pull
            gsap.to(cards, {
                x: (index, element) => cardX(element),
                y: (index, element) => cardY(element),
                scale: 1,
                opacity: 1,
                filter: 'blur(0px)',
                duration: 0.8,
                ease: 'power2.out',
                overwrite: 'auto',
                onComplete: () => {
                    cards.forEach(c => {
                        c.style.zIndex = '';
                        c.classList.remove('hovered');
                    });
                }
            });

            // Smoothly tilt back to 0
            cards.forEach(c => {
                c.classList.remove('hovered');
                c.style.setProperty('--mouse-x', '50%');
                c.style.setProperty('--mouse-y', '50%');
                if (c._quickRotateX && c._quickRotateY) {
                    c._quickRotateX(0);
                    c._quickRotateY(0);
                }
            });
        });

        // Delegate hover events for individual cards inside this cluster
        cluster.addEventListener('pointerover', (e) => {
            if (!isClusterHovered) return;
            const card = e.target.closest('.photo-card');
            if (!card || !cards.includes(card)) return;

            // Focus on hovered card
            card.classList.add('hovered');
            card.style.zIndex = '50';

            gsap.to(card, {
                scale: 1.15,
                opacity: 1,
                filter: 'blur(0px)',
                duration: 0.5,
                ease: 'power2.out',
                overwrite: 'auto'
            });

            // Push siblings back
            cards.forEach((sibling) => {
                if (sibling !== card) {
                    sibling.classList.remove('hovered');
                    sibling.style.zIndex = '1';
                    gsap.to(sibling, {
                        scale: 0.9,
                        opacity: 0.4,
                        filter: 'blur(4px)',
                        duration: 0.5,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });
                }
            });
        });

        cluster.addEventListener('pointerout', (e) => {
            if (!isClusterHovered) return;
            const card = e.target.closest('.photo-card');
            const relatedTarget = e.relatedTarget;
            const newCard = relatedTarget ? relatedTarget.closest('.photo-card') : null;

            if (!card || !cards.includes(card)) return;
            if (newCard === card) return;

            if (!newCard || !cards.includes(newCard)) {
                // Return all cards to default scattered state
                cards.forEach((c) => {
                    c.classList.remove('hovered');
                    c.style.zIndex = '2';
                    gsap.to(c, {
                        scale: 1,
                        opacity: 1,
                        filter: 'blur(0px)',
                        duration: 0.5,
                        ease: 'power2.out',
                        overwrite: 'auto'
                    });

                    // Reset 3D tilt
                    c.style.setProperty('--mouse-x', '50%');
                    c.style.setProperty('--mouse-y', '50%');
                    if (c._quickRotateX && c._quickRotateY) {
                        c._quickRotateX(0);
                        c._quickRotateY(0);
                    }
                });
            } else {
                // Moving between cards inside the same cluster: reset tilt on previous card
                card.classList.remove('hovered');
                card.style.setProperty('--mouse-x', '50%');
                card.style.setProperty('--mouse-y', '50%');
                if (card._quickRotateX && card._quickRotateY) {
                    card._quickRotateX(0);
                    card._quickRotateY(0);
                }
            }
        });

        // 3D tilt tracking using GSAP quickTo
        cluster.addEventListener('pointermove', (e) => {
            if (!isClusterHovered) return;
            const card = e.target.closest('.photo-card');
            if (!card || !cards.includes(card)) return;

            const rect = card.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            const dx = e.clientX - centerX;
            const dy = e.clientY - centerY;

            const px = dx / (rect.width / 2);
            const py = dy / (rect.height / 2);

            const nx = Math.max(-1, Math.min(1, px));
            const ny = Math.max(-1, Math.min(1, py));

            card.style.setProperty('--mouse-x', `${((nx + 1) / 2 * 100).toFixed(1)}%`);
            card.style.setProperty('--mouse-y', `${((ny + 1) / 2 * 100).toFixed(1)}%`);

            const targetRotateX = -ny * 15; // Max 15 degrees tilt
            const targetRotateY = nx * 15;

            if (card._quickRotateX && card._quickRotateY) {
                card._quickRotateX(targetRotateX);
                card._quickRotateY(targetRotateY);
            }
        });
    });

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
                    ease: 'power3.out'
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
                    ease: 'power3.in'
                },
                position + 1.24
            )
            .set(selector, { visibility: 'hidden' }, position + 2.1);
    }

    function motionScale() {
        if (window.innerWidth < 520) return 0.42;
        if (window.innerWidth < 760) return 0.56;
        if (window.innerWidth < 1040) return 0.78;
        return 1;
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
        const staggerFrom = options.staggerFrom || 'center';
        const holdPoint = position + 1.34;
        const exitPoint = position + 1.82;

        timeline
            .set(selector, { autoAlpha: 1, visibility: 'visible', pointerEvents: 'auto' }, position)
            .set(caption, { visibility: 'visible' }, position)
            .fromTo(cards,
                {
                    autoAlpha: 0,
                    xPercent: -50,
                    yPercent: -50,
                    x: options.originX || 0,
                    y: options.originY || 0,
                    z: -460,
                    scale: options.startScale || 0.42,
                    rotate: 0,
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
                    y: (index, element) => cardY(element, options.driftY || -8),
                    rotate: (index, element) => cardRotation(element, options.rotateDrift || 1.6),
                    scale: options.holdScale || 1.025,
                    duration: 0.74,
                    ease: 'sine.inOut'
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
                    }
                },
                exitPoint
            )
            .set(selector, { autoAlpha: 0, visibility: 'hidden', pointerEvents: 'none' }, exitPoint + 1.05)
            .set(caption, { autoAlpha: 0, visibility: 'hidden' }, exitPoint + 1.05)
            .set(cards, { autoAlpha: 0, visibility: 'hidden' }, exitPoint + 1.05);
    }

    function spawnFlowerShower() {
        const stage = document.querySelector('.stage-viewport');
        const colors = ['#E07A5F', '#D4AF37', '#F4A261', '#E76F51', '#F4C2C2'];
        const petalPaths = [
            'M 15,0 C 25,0 30,10 25,25 C 20,40 10,40 5,25 C 0,10 5,0 15,0 Z',
            'M 10,0 C 22,2 26,14 18,26 C 10,38 2,34 0,22 C -2,10 2,0 10,0 Z',
            'M 12,5 A 4,4 0 0,1 16,9 A 4,4 0 0,1 12,13 A 4,4 0 0,1 8,9 A 4,4 0 0,1 12,5 Z M 16,9 A 4,4 0 0,1 20,13 A 4,4 0 0,1 16,17 A 4,4 0 0,1 12,13 A 4,4 0 0,1 16,9 Z'
        ];

        const count = 36;
        for (let i = 0; i < count; i++) {
            const container = document.createElement('div');
            container.className = 'falling-petal';
            container.style.position = 'absolute';
            container.style.left = `${Math.random() * 100}%`;
            container.style.top = `-40px`;
            container.style.width = `${Math.random() * 20 + 15}px`;
            container.style.height = `${Math.random() * 20 + 15}px`;
            container.style.pointerEvents = 'none';
            container.style.zIndex = '103';

            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('viewBox', '0 0 30 30');
            svg.style.width = '100%';
            svg.style.height = '100%';

            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', petalPaths[Math.floor(Math.random() * petalPaths.length)]);
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

            // Lock scroll immediately on page load until envelope is opened
            lenis.stop();
        }
        document.body.style.overflow = 'hidden';

        const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: masterStage,
                start: 'top top',
                end: '+=1300%',
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                onUpdate: (self) => {
                    adjustAudio(self.progress);

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
                },
                onLeave: () => {
                    state.particlesState = 'constellation';
                }
            }
        });

        // Activate the Hero Wax Seal immediately
        activateWaxSeal(timeline.scrollTrigger);

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

        // 1. Kindness Reveal
        revealLayer(timeline, '[data-layer="kindness"]', 1.58);

        // Memory canvas visible starting at Bloom
        timeline.set('.memory-canvas', { autoAlpha: 1, visibility: 'visible', pointerEvents: 'auto' }, 3.8);

        // 2. Bloom Gallery
        revealPhotoSection(timeline, '[data-photo-section="bloom"]', 3.8, {
            staggerFrom: 'center',
            driftY: -12,
            rotateDrift: 1.8
        });

        // 3. Resilience Reveal
        revealLayer(timeline, '[data-layer="resilience"]', 6.8);

        // 4. Duet Gallery
        revealPhotoSection(timeline, '[data-photo-section="duet"]', 9.0, {
            staggerFrom: 'edges',
            originY: 44,
            driftY: -10,
            holdScale: 1.01,
            exitRotate: 2
        });

        // 5. Impact Reveal
        revealLayer(timeline, '[data-layer="impact"]', 12.0);

        // 6. Memory Flood (Ribbon & Mosaic simultaneously)
        // 6. Memory Ribbon Gallery
        revealPhotoSection(timeline, '[data-photo-section="ribbon"]', 14.3, {
            staggerFrom: 'start',
            stagger: 0.045,
            originX: -80,
            driftX: 18,
            driftY: -4,
            holdScale: 1.015,
            exitDriftX: 48,
            exitFrom: 'end'
        });

        // 7. Memory Mosaic Gallery (starts after Ribbon fully exits at 17.17)
        revealPhotoSection(timeline, '[data-photo-section="mosaic"]', 17.37, {
            staggerFrom: 'random',
            originY: -30,
            driftY: -14,
            holdScale: 1.02,
            exitScale: 0.72,
            exitRotate: 4
        });

        // Memory canvas hidden after mosaic finishes (17.37 + 2.87 = 20.24)
        timeline.set('.memory-canvas', { autoAlpha: 0, visibility: 'hidden', pointerEvents: 'none' }, 20.24);

        // 8. Zenith Reveal (starts after Mosaic finishes)
        timeline
            .set('[data-layer="zenith"]', { visibility: 'visible' }, 20.44)
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
                    }
                },
                20.44
            )
            .to('[data-layer="zenith"]', { autoAlpha: 1, duration: 0.3 }, 21.64);
    }

    gsap.set('.arrival-line', { autoAlpha: 0, scale: 1.08, filter: 'blur(12px)' });
    gsap.set('.text-layer, .memory-canvas, .photo-section, .photo-card, .photo-caption, .zenith-layer', {
        autoAlpha: 0,
        visibility: 'hidden',
        pointerEvents: 'none'
    });

    preloadImages().then(initScroll);
});
