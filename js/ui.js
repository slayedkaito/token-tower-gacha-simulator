const gachaAnim = {
            isAnim: false, skipped: false, triggerWait: null, canSkip: false, cards: [],
            start: async (res, nCost) => {
                if (gachaAnim.isAnim) return;
                gachaAnim.isAnim = true; gachaAnim.skipped = false; gachaAnim.triggerWait = null; gachaAnim.canSkip = false;
                setTimeout(() => gachaAnim.canSkip = true, 400);
                ui.openModal('gacha-anim-modal');
                const cont = document.getElementById('gacha-anim-container');
                const title = document.getElementById('gacha-anim-title');
                const ctrls = document.getElementById('gacha-anim-controls');

                document.getElementById('gacha-spin-again-cost').innerText = `BIAYA BERIKUT: ${nCost}`;
                ctrls.style.opacity = '0'; ctrls.style.display = 'none';
                document.getElementById('btn-skip-anim').style.display = 'block'; cont.innerHTML = '';
                title.innerText = "SUMMONING"; title.className = "text-4xl font-black mb-12 text-white tracking-[0.3em] font-serif shadow-white z-10 animate-pulse";

                gachaAnim.cards = [];
                res.forEach((r, i) => {
                    const w = document.createElement('div'); w.className = "w-32 h-44 perspective-1000 scale-0 opacity-0 mx-2 transition-all duration-500 z-10";
                    const inn = document.createElement('div'); inn.className = "w-full h-full relative preserve-3d transition-transform duration-700 pointer-events-none";
                    const f = document.createElement('div'); f.className = "absolute w-full h-full backface-hidden rounded-xl bg-slate-800 rotate-y-180 flex items-center justify-center p-2 text-center";
                    const txt = document.createElement('span'); txt.className = "text-white text-xs font-bold drop-shadow"; txt.innerText = "?"; f.appendChild(txt);
                    const b = document.createElement('div'); b.className = "absolute w-full h-full backface-hidden bg-card-back rounded-xl flex items-center justify-center border-2 border-slate-600";
                    b.innerHTML = `<span class="text-white/70 font-serif font-black text-2xl">Xf</span>`;
                    inn.appendChild(b); inn.appendChild(f); w.appendChild(inn); cont.appendChild(w);
                    setTimeout(() => { if (gachaAnim.skipped) return; w.classList.remove('scale-0', 'opacity-0'); w.classList.add('anim-drop-lux'); }, i * 150 + 50);
                    gachaAnim.cards.push({ w, inn, f, txt, res: r });
                });

                await gachaAnim.wait(res.length * 150 + 500);
                if (gachaAnim.skipped) { gachaAnim.forceFlip(); return; }

                title.classList.remove('animate-pulse');
                for (let i = 0; i < gachaAnim.cards.length; i++) {
                    if (gachaAnim.skipped) { gachaAnim.forceFlip(); return; }
                    const c = gachaAnim.cards[i]; const r = c.res;
                    c.w.classList.remove('anim-drop-lux');
                    if (r.type === 'token') {
                        title.innerText = "SUCCESS"; title.className = "text-5xl font-black mb-12 text-emerald-400 drop-shadow-[0_0_20px_#10b981] z-10 transition";
                        c.f.className = "absolute w-full h-full backface-hidden rounded-xl bg-gradient-to-b from-stone-100 to-stone-400 border-[3px] border-emerald-400 shadow-[0_0_30px_#10b981] flex items-center justify-center rotate-y-180 p-2 text-center";
                        c.txt.className = "text-lg font-black text-emerald-700"; c.txt.innerText = r.name;
                        c.inn.classList.add('rotate-y-180'); c.w.classList.add('anim-shake');
                        await gachaAnim.wait(800); c.w.classList.remove('anim-shake');
                    } else if (r.type === 'refund') {
                        c.f.className = "absolute w-full h-full backface-hidden rounded-xl border border-indigo-400 bg-indigo-900 flex justify-center items-center rotate-y-180 shadow-[0_0_20px_#6366f1] p-2 text-center";
                        c.txt.className = "text-xs font-bold text-indigo-300"; c.txt.innerText = r.name;
                        c.inn.classList.add('rotate-y-180'); await gachaAnim.wait(500);
                    } else {
                        c.f.className = "absolute w-full h-full backface-hidden rounded-xl border-[3px] border-amber-400 bg-amber-100 flex items-center justify-center rotate-y-180 shadow-[0_0_30px_#f59e0b] p-2 text-center";
                        c.txt.className = "text-lg font-black text-amber-600"; c.txt.innerText = r.tg;
                        c.inn.classList.add('rotate-y-180'); await gachaAnim.wait(900);
                        if (gachaAnim.skipped) { gachaAnim.forceFlip(); return; }
                        c.txt.innerText = "CRACK!"; c.txt.className = "text-xs font-black text-red-600";
                        c.w.classList.add('anim-shatter-lux'); await gachaAnim.wait(450);
                        if (gachaAnim.skipped) { gachaAnim.forceFlip(); return; }
                        c.w.classList.remove('anim-shatter-lux'); c.w.classList.add('anim-drop-lux');
                        c.f.className = "absolute w-full h-full backface-hidden rounded-xl bg-slate-300 border border-slate-400 rotate-y-180 flex items-center justify-center p-2 text-center";
                        c.txt.className = "text-[11px] font-bold text-slate-600"; c.txt.innerText = r.name;
                        await gachaAnim.wait(300);
                    }
                    await gachaAnim.wait(200);
                }
                if (!gachaAnim.skipped) gachaAnim.finishR();
            },
            skip: () => {
                if (!gachaAnim.isAnim || gachaAnim.skipped || !gachaAnim.canSkip) return;
                gachaAnim.skipped = true; if (gachaAnim.triggerWait) gachaAnim.triggerWait();
            },
            wait: (ms) => new Promise(r => {
                if (gachaAnim.skipped) return r();
                const t = setTimeout(() => { gachaAnim.triggerWait = null; r(); }, ms);
                gachaAnim.triggerWait = () => { clearTimeout(t); r(); };
            }),
            forceFlip: () => {
                gachaAnim.cards.forEach(c => {
                    const r = c.res; c.w.className = "w-32 h-44 perspective-1000 scale-100 mx-2 transition z-10 opacity-100 pointer-events-none";
                    if (r.type === 'token') { c.f.className = "absolute w-full h-full backface-hidden rounded-xl bg-stone-200 border-[3px] border-emerald-400 shadow-[0_0_30px_#10b981] flex rotate-y-180 items-center justify-center p-2"; c.txt.className = "text-lg font-black text-emerald-700"; }
                    else if (r.type === 'refund') { c.f.className = "absolute flex w-full h-full backface-hidden rounded-xl border border-indigo-400 bg-indigo-900 rotate-y-180 items-center justify-center p-2"; c.txt.className = "text-xs font-bold text-indigo-300"; }
                    else { c.f.className = "absolute w-full h-full backface-hidden rounded-xl bg-slate-300 border border-slate-400 rotate-y-180 flex items-center justify-center p-2"; c.txt.className = "text-[11px] font-bold text-slate-600"; }
                    c.txt.innerText = r.name; c.inn.style.transitionDuration = "0s"; c.inn.classList.add('rotate-y-180');
                });
                gachaAnim.finishR();
            },
            finishR: () => {
                const title = document.getElementById('gacha-anim-title'); title.innerText = "RESULTS";
                title.className = `text-4xl font-black mb-12 uppercase drop-shadow z-10 transition ${gachaAnim.cards.some(c => c.res.type === 'token') ? 'text-emerald-400' : 'text-slate-300'}`;
                const ctrl = document.getElementById('gacha-anim-controls');
                document.getElementById('btn-skip-anim').style.display = 'none'; ctrl.style.display = 'flex';
                setTimeout(() => { ctrl.style.opacity = '1'; }, 10);
                setTimeout(() => { gachaAnim.cards.forEach(c => c.inn.style.transitionDuration = '0.7s'); }, 50);
                gachaAnim.isAnim = false;
            },
            spinAgain: () => { if (gachaAnim.isAnim) return; const c = state.animCount; ui.applyRes(); game.spin(c); }
        };