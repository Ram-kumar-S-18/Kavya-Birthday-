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
        audioPlaying: false
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

    window.addEventListener('mousemove', (event) => {
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

            if (this.x < -20) this.x = bgCanvas.width + 20;
            if (this.x > bgCanvas.width + 20) this.x = -20;
            if (this.y < -20) this.y = bgCanvas.height + 20;
            if (this.y > bgCanvas.height + 20) this.y = -20;

            const dx = state.mouse.targetX - this.x;
            const dy = state.mouse.targetY - this.y;
            const dist = Math.hypot(dx, dy);

            if (dist < 120) {
                const force = (120 - dist) / 120;
                this.x -= (dx / (dist + 1)) * force * 1.8;
                this.y -= (dy / (dist + 1)) * force * 1.8;
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
            .set(selector, { autoAlpha: 1, visibility: 'visible' }, position)
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
                    duration: 0.82,
                    ease: 'power3.in',
                    stagger: {
                        each: options.exitStagger || 0.045,
                        from: options.exitFrom || 'edges'
                    }
                },
                exitPoint
            )
            .set(selector, { autoAlpha: 0, visibility: 'hidden' }, exitPoint + 1.05)
            .set(caption, { autoAlpha: 0, visibility: 'hidden' }, exitPoint + 1.05)
            .set(cards, { autoAlpha: 0, visibility: 'hidden' }, exitPoint + 1.05);
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
        }

        const timeline = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
                trigger: masterStage,
                start: 'top top',
                end: '+=1150%',
                pin: true,
                scrub: 1,
                anticipatePin: 1,
                onUpdate: (self) => {
                    adjustAudio(self.progress);

                    if (self.progress > 0.91) {
                        state.particlesState = 'constellation';
                    } else {
                        state.particlesState = 'drift';
                        particles.forEach((particle) => {
                            particle.constellationTarget = null;
                        });
                    }
                },
                onLeave: () => {
                    state.particlesState = 'constellation';
                }
            }
        });

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

        revealLayer(timeline, '[data-layer="kindness"]', 1.58);
        revealLayer(timeline, '[data-layer="resilience"]', 3.92);
        revealLayer(timeline, '[data-layer="impact"]', 6.26);

        timeline.set('.memory-canvas', { autoAlpha: 1, visibility: 'visible' }, 8.64);

        revealPhotoSection(timeline, '[data-photo-section="bloom"]', 8.64, {
            staggerFrom: 'center',
            driftY: -12,
            rotateDrift: 1.8
        });
        revealPhotoSection(timeline, '[data-photo-section="duet"]', 11.26, {
            staggerFrom: 'edges',
            originY: 44,
            driftY: -10,
            holdScale: 1.01,
            exitRotate: 2
        });
        revealPhotoSection(timeline, '[data-photo-section="ribbon"]', 13.94, {
            staggerFrom: 'start',
            stagger: 0.045,
            originX: -80,
            driftX: 18,
            driftY: -4,
            holdScale: 1.015,
            exitDriftX: 48,
            exitFrom: 'end'
        });
        revealPhotoSection(timeline, '[data-photo-section="mosaic"]', 16.72, {
            staggerFrom: 'random',
            originY: -30,
            driftY: -14,
            holdScale: 1.02,
            exitScale: 0.72,
            exitRotate: 4
        });
        timeline.set('.memory-canvas', { autoAlpha: 0, visibility: 'hidden' }, 19.3);

        timeline
            .set('[data-layer="zenith"]', { visibility: 'visible' }, 19.64)
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
                    duration: 1.28,
                    ease: 'power3.out',
                    onStart: () => {
                        state.particlesState = 'constellation';
                    }
                },
                19.64
            )
            .to('[data-layer="zenith"]', { autoAlpha: 1, duration: 1.16 }, 20.96);
    }

    gsap.set('.arrival-line', { autoAlpha: 0, scale: 1.08, filter: 'blur(12px)' });
    gsap.set('.text-layer, .memory-canvas, .photo-section, .photo-card, .photo-caption, .zenith-layer', {
        autoAlpha: 0,
        visibility: 'hidden',
        pointerEvents: 'none'
    });

    preloadImages().then(initScroll);
});
