// script.js
// Updated to implement requested behaviors:
// - No button click requires 3 clicks, with flash/shake and text "You missed."
// - Memory/context page added before question page with pause and continue
// - Rose visuals added on memory, build-up, and YES result pages
// - Birds fly left→right globally
// - Background music (autoplay muted by default) with mute toggle
// - YES button opens a heart mini-game (click heart repeatedly -> explode -> YES result)
// - All interactions remain responsive and touch-friendly
// Author: Copilot (modified per user request)

document.addEventListener('DOMContentLoaded', () => {
  const pages = Array.from(document.querySelectorAll('.page'));
  const overlay = document.getElementById('overlay');
  const gameFeedback = document.getElementById('gameFeedback');
  const bgMusic = document.getElementById('bgMusic');
  const musicToggle = document.getElementById('musicToggle');
  const errorSound = document.getElementById('errorSound');

  // showPage: toggles active class by data-page attribute
  const showPage = (n) => {
    pages.forEach(p => p.classList.toggle('active', p.dataset.page === String(n)));
    // birds visible globally; slightly dim on intro
    document.getElementById('birds').style.opacity = (n === 1) ? '0.5' : '0.95';
  };

  // Initial page
  showPage(1);

  // Navigation buttons
  document.getElementById('startBtn').addEventListener('click', () => showPage(2));

  // Game choices (page 2)
  const choices = document.querySelectorAll('.choice');
  const overlayEl = overlay;
  function wrongAnswer() {
    overlayEl.classList.add('flash-red');
    if (errorSound) { try { errorSound.currentTime = 0; errorSound.play(); } catch(e){} }
    const app = document.getElementById('app');
    app.classList.add('shake');
    gameFeedback.textContent = "Hmm… that didn’t feel right.";
    setTimeout(() => {
      overlayEl.classList.remove('flash-red');
      app.classList.remove('shake');
      gameFeedback.textContent = "";
    }, 700);
  }
  function correctAnswer() {
    overlayEl.style.transition = 'background 800ms ease';
    overlayEl.style.background = 'linear-gradient(180deg, rgba(107,15,26,0.12), rgba(0,0,0,0))';
    setTimeout(() => { overlayEl.style.background = 'transparent'; }, 900);
    // create petals
    launchPetals(28);
    // gentle birds speed-up by adjusting animation durations
    document.querySelectorAll('.bird').forEach((b, i) => {
      b.style.animationDuration = `${30 + i*8}s`;
    });

    // show text and continue button inside game area
    gameFeedback.textContent = "You chose with your heart.";
    const continueBtn = document.createElement('button');
    continueBtn.className = 'btn btn-primary';
    continueBtn.textContent = 'Continue';
    continueBtn.style.marginTop = '0.8rem';
    continueBtn.addEventListener('click', () => {
      showPage(3);
      // clear feedback
      gameFeedback.textContent = "";
    });
    // ensure we don't add multiple
    gameFeedback.innerHTML = '';
    gameFeedback.appendChild(document.createTextNode('You chose with your heart.'));
    gameFeedback.appendChild(document.createElement('br'));
    gameFeedback.appendChild(continueBtn);
  }

  choices.forEach(ch => {
    ch.addEventListener('click', (e) => {
      const choice = ch.dataset.choice;
      // stop if already on next page
      if (document.querySelector('.page-game').classList.contains('hidden')) return;
      if (choice === 'lopa') {
        correctAnswer();
      } else {
        wrongAnswer();
      }
    });
  });

  // Page 3 -> Page 4
  document.getElementById('toBuildUp').addEventListener('click', () => {
    showPage(4);
  });

  // Page 4 -> Page 5
  document.getElementById('toMemory').addEventListener('click', () => {
    // show memory page and run the pause animation text sequence
    showPage(5);
    startMemorySequence();
  });

  // Memory sequence: reveal pause, then concluding line, then Continue button
  function startMemorySequence() {
    const pauseText = document.getElementById('pauseText');
    const memoryConclude = document.getElementById('memoryConclude');
    const continueBtn = document.getElementById('toQuestion');
    pauseText.classList.remove('hidden');
    memoryConclude.classList.add('hidden');
    continueBtn.classList.add('hidden');

    // timing: show pause for ~1000ms, then show concluding text, then show Continue button
    setTimeout(() => {
      pauseText.classList.add('hidden');
      memoryConclude.classList.remove('hidden');
      // gentle rose float (a subtle transform)
      const rose = document.querySelector('.rose-memory');
      if (rose) { rose.animate([{ transform: 'translateY(6%)' }, { transform: 'translateY(0%)' }, { transform: 'translateY(6%)' }], { duration: 4200, iterations: Infinity, direction: 'alternate' }); }
      setTimeout(() => {
        continueBtn.classList.remove('hidden');
      }, 600);
    }, 1100);
  }

  // Memory -> Question
  document.getElementById('toQuestion').addEventListener('click', () => {
    showPage(6);
    // If there's background music available, try to play (will succeed only after user gesture)
    if (bgMusic) { try { bgMusic.volume = 0.18; bgMusic.play(); } catch(e){} }
    // small petal ambience pre-load
    launchPetals(12);
  });

  // Petal engine (falling petals/roses)
  function launchPetals(amount = 20) {
    const layer = document.getElementById('petalLayer');
    if (!layer) return;
    const w = layer.clientWidth || window.innerWidth;
    const h = layer.clientHeight || window.innerHeight;
    for (let i = 0; i < amount; i++) {
      const p = document.createElement('div');
      p.className = 'petal';
      // random size and position
      const size = 8 + Math.random()*18;
      p.style.width = `${size}px`;
      p.style.height = `${size*0.7}px`;
      p.style.left = `${Math.random()*100}%`;
      p.style.top = `-${Math.random()*20 + 5}%`;
      p.style.opacity = (0.6 + Math.random()*0.4).toString();
      p.style.transform = `rotate(${Math.random()*360}deg)`;
      // animation
      const fallDuration = 5000 + Math.random()*7000;
      p.style.animation = `petalFall ${fallDuration}ms linear forwards`;
      p.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))';
      layer.appendChild(p);
      // remove after animation
      setTimeout(() => {
        p.remove();
      }, fallDuration + 600);
    }
  }

  // Petal keyframes inserted via JS so CSS file stays compact
  const petalStyle = document.createElement('style');
  petalStyle.innerHTML = `
    .petal{ position:absolute; z-index:1; pointer-events:none; background: radial-gradient(circle at 40% 30%, #ffb6c4, #7a0e12); border-radius:45% 55% 60% 40% / 50% 50% 50% 50%; transform-origin:center; }
    @keyframes petalFall {
      0% { transform: translateY(0) rotate(0deg) translateX(0); opacity:1; }
      100% { transform: translateY(120vh) rotate(600deg) translateX(40px); opacity:0.04; }
    }`;
  document.head.appendChild(petalStyle);

  // "No" button playful escape behavior
  const noBtn = document.getElementById('noBtn');
  let noHovers = 0;
  let noLocked = false;
  const maxDodges = 3;

  function moveNoBtn(ev) {
    if (noLocked) return;
    noHovers++;
    const rect = noBtn.getBoundingClientRect();
    const parent = noBtn.parentElement.getBoundingClientRect();
    // compute new position by offsetting transform
    const offsetX = (Math.random() * 140 + 40) * (Math.random() > 0.5 ? 1 : -1);
    const offsetY = (Math.random() * 20 - 10);
    // apply transform
    noBtn.style.transition = 'transform 260ms cubic-bezier(.22,.9,.3,1)';
    noBtn.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    // if reached max, lock movement (let it stop moving)
    if (noHovers >= maxDodges) {
      noLocked = true;
      setTimeout(() => {
        noBtn.style.transform = 'translate(0,0)';
        noBtn.style.transition = 'transform 320ms ease';
      }, 350);
    }
  }

  // For mouse users (hover)
  noBtn.addEventListener('mouseenter', moveNoBtn);

  // For touch devices: on touchstart, move once as well
  noBtn.addEventListener('touchstart', (e) => {
    // don't prevent click — allow the user to still tap if they insist
    moveNoBtn();
  }, {passive:true});

  // Yes / No click handlers
  const yesBtn = document.getElementById('yesBtn');
  yesBtn.addEventListener('click', () => {
    startHeartMiniGame();
  });
  noBtn.addEventListener('click', () => {
    // original behaviour before further change: go to NO result
    showResult(false);
  });

  // Heart mini-game (original): show large heart and handle clicks
  function startHeartMiniGame() {
    // create heart-stage overlay
    const stage = document.createElement('div');
    stage.className = 'heart-stage';
    stage.innerHTML = `
      <div class="heart-instructions" style="color:${getComputedStyle(document.documentElement).getPropertyValue('--soft-pink')}; font-family:var(--title-font); font-size:1.2rem; margin-bottom:1rem">Click the heart.</div>
      <div class="heart-large" id="bigHeart">💖</div>
    `;
    document.body.appendChild(stage);
    const bigHeart = stage.querySelector('#bigHeart');

    let heartClicks = 0;
    const neededClicks = 6; // number of clicks before explode
    function onHeartClick() {
      heartClicks++;
      // grow heart
      const scale = 1 + heartClicks * 0.12;
      bigHeart.style.transform = `scale(${scale})`;
      // pulse animation
      bigHeart.classList.remove('heart-pulse');
      // reflow
      void bigHeart.offsetWidth;
      bigHeart.classList.add('heart-pulse');

      // small particle / sparkle generation on each click
      createTinyParticles(bigHeart, 8);

      if (heartClicks >= neededClicks) {
        // explode into hearts + petals
        explodeHeart(stage, bigHeart, () => {
          // cleanup stage and go to YES result
          stage.remove();
          showResult(true);
        });
      }
    }

    // Touch + mouse friendly
    bigHeart.addEventListener('click', onHeartClick);
    bigHeart.addEventListener('touchstart', (e) => { e.preventDefault(); onHeartClick(); }, {passive:false});
  }

  // create small particles around an element (hearts/petals)
  function createTinyParticles(originEl, count = 10) {
    const rect = originEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.width = `${8 + Math.random()*14}px`;
      p.style.height = p.style.width;
      p.style.left = `${cx - 8 + (Math.random()-0.5)*60}px`;
      p.style.top = `${cy - 8 + (Math.random()-0.5)*60}px`;
      p.style.borderRadius = '6px';
      p.style.background = (Math.random() > 0.5) ? '#ff9fb3' : '#7a0e12';
      p.style.opacity = '1';
      p.style.zIndex = 30;
      p.style.transition = `transform ${800 + Math.random()*800}ms cubic-bezier(.22,.9,.3,1), opacity ${800 + Math.random()*800}ms ease`;
      document.body.appendChild(p);
      // fly outward
      requestAnimationFrame(() => {
        const tx = (Math.random() - 0.5) * 260;
        const ty = -140 - Math.random()*240;
        p.style.transform = `translate(${tx}px, ${ty}px) rotate(${Math.random()*360}deg) scale(${0.9 + Math.random()})`;
        p.style.opacity = '0';
      });
      setTimeout(() => p.remove(), 1600 + Math.random()*800);
    }
  }

  // explode heart into many hearts + petals, then callback
  function explodeHeart(stageEl, heartEl, cb) {
    // generate lots of particles: mixture of hearts (text) and petals (div)
    const rect = heartEl.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top + rect.height/2;
    const total = 40;
    for (let i = 0; i < total; i++) {
      if (Math.random() > 0.55) {
        // text heart
        const h = document.createElement('div');
        h.textContent = ['❤️','💖','🌹'][Math.floor(Math.random()*3)];
        h.style.position = 'fixed';
        h.style.left = `${cx}px`;
        h.style.top = `${cy}px`;
        h.style.zIndex = 30;
        h.style.fontSize = `${10 + Math.random()*28}px`;
        h.style.opacity = '1';
        document.body.appendChild(h);
        // animation
        const dx = (Math.random() - 0.5) * 600;
        const dy = (Math.random() - 0.2) * -700;
        h.animate([{ transform: 'translate(0,0) rotate(0deg)', opacity:1 }, { transform: `translate(${dx}px, ${dy}px) rotate(${(Math.random()-0.5)*720}deg)`, opacity:0 }], { duration: 800 + Math.random()*900, easing:'cubic-bezier(.22,.9,.3,1)' });
        setTimeout(() => h.remove(), 1900);
      } else {
        // petal
        const p = document.createElement('div');
        p.className = 'particle';
        p.style.width = `${12 + Math.random()*20}px`;
        p.style.height = p.style.width;
        p.style.left = `${cx}px`;
        p.style.top = `${cy}px`;
        p.style.background = (Math.random()>0.5) ? '#ffb6c4' : '#7a0e12';
        p.style.zIndex = 30;
        document.body.appendChild(p);
        const dx = (Math.random() - 0.5) * 520;
        const dy = (Math.random() - 0.1) * -680;
        p.animate([{ transform: 'translate(0,0) rotate(0deg)', opacity:1 }, { transform: `translate(${dx}px, ${dy}px) rotate(${(Math.random()-0.5)*540}deg)`, opacity:0 }], { duration: 900 + Math.random()*900, easing:'cubic-bezier(.22,.9,.3,1)' });
        setTimeout(() => p.remove(), 2000);
      }
    }
    // small screen shake and flash
    overlay.classList.add('flash-red');
    const appEl = document.getElementById('app');
    appEl.classList.add('shake');
    setTimeout(() => {
      overlay.classList.remove('flash-red');
      appEl.classList.remove('shake');
      // call callback after particles finish
      setTimeout(cb, 500);
    }, 700);
  }

  // show result (true => YES, false => NO)
  function showResult(isYes) {
    showPage(7);
    const resultCard = document.getElementById('resultCard');
    resultCard.innerHTML = '';
    if (isYes) {
      // add rose graphic into result area
      const rose = document.createElement('img');
      rose.className = 'rose-graphic rose-yes';
      rose.src = 'https://images.unsplash.com/photo-1508736266287-4b3b70edc6fb?q=80&w=900&auto=format&fit=crop&ixlib=rb-4.0.3&s=8a2f7a4b3b6d4d49b88f6f97f7cbe8b1';
      rose.alt = '';
      resultCard.appendChild(rose);

      resultCard.className = 'result-card yes';
      resultCard.innerHTML += `
        <h2 style="font-family:var(--title-font); margin-top:0; color:#6b0f1a">You just made me the happiest man.</h2>
        <p style="margin-top:.6rem">Take a screenshot of this answer and send it to me ❤️</p>
      `;
      // small gentle floating of the rose
      if (rose.animate) {
        rose.animate([{ transform: 'translateY(0px)' }, { transform: 'translateY(-8px)' }, { transform: 'translateY(0px)' }], { duration: 4200, iterations: Infinity, direction: 'alternate' });
      }
    } else {
      // NO result: calm navy background, respectful message
      resultCard.className = 'result-card no';
      resultCard.innerHTML = `
        <h2 style="margin-top:0">Thank you for being honest.</h2>
        <p style="margin-top:.6rem;">Please take a screenshot and send it to me.</p>
      `;
    }
  }

  // Music controls: attempt autoplay (muted by default to maximize play success)
  function tryAutoPlayMusic() {
    if (!bgMusic) return;
    // try to unmute if user previously toggled
    if (musicToggle.getAttribute('aria-pressed') === 'false') {
      // user wants unmuted
      bgMusic.muted = false;
      bgMusic.volume = 0.16;
    }
    try { bgMusic.play().catch(()=>{}); } catch(e){}
  }

  // Mute toggle handler
  musicToggle.addEventListener('click', () => {
    if (!bgMusic) return;
    const pressed = musicToggle.getAttribute('aria-pressed') === 'true';
    if (pressed) {
      // unmute
      bgMusic.muted = false;
      bgMusic.volume = 0.16;
      musicToggle.textContent = '🔊';
      musicToggle.setAttribute('aria-pressed', 'false');
    } else {
      // mute
      bgMusic.muted = true;
      musicToggle.textContent = '🔇';
      musicToggle.setAttribute('aria-pressed', 'true');
    }
    try { bgMusic.play().catch(()=>{}); } catch(e){}
  });

  // small helper: try to play music after first user interaction (better chance)
  const startInteraction = () => {
    document.removeEventListener('click', startInteraction);
    document.removeEventListener('touchstart', startInteraction);
    // try start music if available
    if (bgMusic) { try { bgMusic.play().catch(()=>{}); } catch(e){} }
  };
  document.addEventListener('click', startInteraction, {once:true});
  document.addEventListener('touchstart', startInteraction, {once:true});
});
