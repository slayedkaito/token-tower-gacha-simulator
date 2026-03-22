const stats = {
            chart: null,
            generateReport: () => {
                ui.openModal('report-modal');
                const summaryEl = document.getElementById('report-summary');
                summaryEl.innerHTML = "Menghitung probabilitas 5000 simulasi Monte Carlo... Tunggu sebentar.";
                setTimeout(() => stats.render(), 50);
            },
            render: () => {
                const SIMS = 5000; let costs = new Int32Array(SIMS);
                for (let i = 0; i < SIMS; i++) {
                    let t = 1, pulls = 0, idx = 0, f = 0;
                    while (idx < 5) {
                        pulls++;
                        if (t >= 3) { t -= 3; }
                        if (Math.random() <= config.tokens[idx].chance) { idx++; f = 0; } else { if (Math.random() <= 0.8) { t += 1; } f++; if (f >= 5) { t += 4; f = 0; } }
                    }
                    costs[i] = pulls * 20;
                }
                costs.sort();
                const labels = [], data = [];
                for (let p = 1; p <= 100; p += 2) { labels.push(costs[Math.floor(SIMS * (p / 100)) - 1 || 0]); data.push(p); }
                let currentCost = state.totalSpins * 20, currentPct = 0;
                for (let i = 0; i < SIMS; i++) { if (costs[i] > currentCost) { currentPct = (i / SIMS) * 100; break; } }
                if (currentPct === 0 && currentCost >= costs[SIMS - 1]) currentPct = 100;

                const summaryEl = document.getElementById('report-summary');
                if (state.finished) summaryEl.innerHTML = `🏁 Anda menyelesaikan gacha dengan nilai modal setara <b>${currentCost} Diamond</b> (1x Spin = 20 DM).<br>Anda lebih beruntung dari <b>${(100 - currentPct).toFixed(1)}%</b> pemain! (Top <b>${currentPct.toFixed(1)}%</b> Luckiest)`;
                else summaryEl.innerHTML = `🔥 Mesin menelan <b>${state.totalSpins} Putaran</b> (Ekuivalen <b>${currentCost} Diamond</b>).<br>Jika Anda menyerah sekarang, kerugian Anda setara orang di persentil <b>${currentPct.toFixed(1)}%</b> distribusi Global.`;

                const ctx = document.getElementById('cdfChart').getContext('2d');
                if (stats.chart) stats.chart.destroy();
                const gridColor = state.dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'; const textColor = state.dark ? '#94a3b8' : '#64748b';
                stats.chart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{ label: 'CDF (% Selesai)', data: data, borderColor: '#8b5cf6', backgroundColor: '#8b5cf633', fill: true, tension: 0.4, pointRadius: 0 },
                        { label: 'Posisi Anda', data: [{ x: currentCost, y: currentPct }], borderColor: '#ef4444', backgroundColor: '#ef4444', pointRadius: 5, pointHoverRadius: 8, showLine: false }]
                    },
                    options: {
                        responsive: true, scales: {
                            x: { title: { display: true, text: 'Total Diamond Terbakar', color: textColor }, grid: { color: gridColor }, ticks: { color: textColor }, type: 'linear', position: 'bottom' },
                            y: { min: 0, max: 100, title: { display: true, text: 'Persentase Populasi (%)', color: textColor }, grid: { color: gridColor }, ticks: { color: textColor } }
                        }, plugins: { legend: { labels: { color: textColor } } }
                    }
                });
            }
        }

        const ui = {
            fmt: (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n),
            openModal: (id) => { document.querySelectorAll('.modal.show').forEach(m => m.classList.remove('show')); document.getElementById(id).classList.add('show'); },
            closeModal: (id) => { document.getElementById(id).classList.remove('show'); },
            toggleTheme: () => { state.dark = !state.dark; document.body.classList.toggle('dark-mode', state.dark); document.getElementById('theme-icon').innerText = state.dark ? '☀️' : '🌙'; if (stats.chart) { stats.render(); } },
            updateTopBar: () => {
                document.getElementById('ui-idr').innerText = ui.fmt(state.idr); document.getElementById('modal-idr').innerText = ui.fmt(state.idr);
                document.getElementById('ui-diamonds').innerText = state.diamonds; const tEl = document.getElementById('ui-tickets'); tEl.innerText = state.tickets;
                tEl.classList.toggle('ticket-warn', state.tickets > 0 && state.tickets < 3);
                const b1 = document.getElementById('btn-spin-1x'), c1 = document.getElementById('cost-1x');
                if (state.tickets >= config.costTicket) { c1.innerHTML = `<span class="text-cyan-500">3 Tiket</span>`; b1.style.opacity = '1'; } else { c1.innerHTML = `<span class="text-blue-500">20 DM</span>`; b1.style.opacity = state.diamonds >= 20 ? '1' : '0.4'; }
                const b5 = document.getElementById('btn-spin-5x'), c5 = document.getElementById('cost-5x');
                let t = state.tickets, tn = 0, dn = 0; for (let i = 0; i < 5; i++) { if (t >= 3) { t -= 3; tn += 3; } else { dn += 20; } }
                let cs = []; if (tn > 0) cs.push(`<span class="text-cyan-500">${tn} Tiket</span>`); if (dn > 0) cs.push(`<span class="text-blue-500">${dn} DM</span>`);
                c5.innerHTML = cs.join(' + '); b5.style.opacity = (state.tickets >= tn && state.diamonds >= dn) ? '1' : '0.4';
            },
            renderTower: () => {
                const c = document.getElementById('tower-container'); c.innerHTML = '';
                [...config.tokens].reverse().forEach(tk => {
                    const acq = tk.id < state.cIdx; const nxt = tk.id === state.cIdx; const w = (nxt && tk.id === 4) ? 'wall-active' : '';
                    c.innerHTML += `<div class="glass tower-slot p-3 rounded-xl flex justify-between items-center ${acq ? 'active' : ''} ${w}">
                <div class="flex items-center gap-3 relative z-10"><div class="w-8 h-8 rounded-lg border flex items-center justify-center transition" style="border-color: ${acq ? 'transparent' : 'var(--glass-border)'}; background: ${acq ? '#06b6d4' : 'var(--glass-bg)'};"><span class="text-xs font-bold transition" style="color: ${acq ? '#fff' : 'var(--text-muted)'}">${tk.id + 1}</span></div>
                <span class="font-bold text-sm transition" style="color: ${acq ? '#06b6d4' : 'var(--text-muted)'}">${tk.name}</span></div>
                <span class="text-[10px] font-mono z-10 px-2 py-1 rounded transition" style="background: ${acq ? '#06b6d4' : 'var(--glass-bg)'}; color: ${acq ? '#fff' : 'var(--text-muted)'}">${(tk.chance * 100).toFixed(tk.id === 4 ? 1 : 0)}%</span></div>`;
                });
            },
            log: (m, ty = "info") => {
                const cols = { info: "text-muted-adapt", mt: "text-amber-500", success: "text-emerald-500 font-bold", refund: "text-indigo-400 font-bold", warn: "text-amber-500 font-bold" };
                const d = document.createElement('div'); d.className = cols[ty] || cols.info;
                d.innerHTML = `<span class="opacity-50 font-normal text-muted-adapt">Pull ${state.totalSpins.toString().padStart(3, '0')}</span> ${m}`;
                const l = document.getElementById('ui-log'); l.appendChild(d); l.scrollTop = l.scrollHeight;
            },
            logR: (m) => { const d = document.createElement('div'); d.className = "pb-2 mb-2 border-b border-[var(--glass-border)] last:border-0 last:mb-0 text-xs text-adapt"; d.innerHTML = m; const l = document.getElementById('ui-rng-log'); l.appendChild(d); l.scrollTop = l.scrollHeight; },
            showAlert: (t, d, c) => { document.getElementById('alert-title').innerText = t; document.getElementById('alert-title').className = `text-2xl font-black mb-3 ${c}`; document.getElementById('alert-desc').innerHTML = d; ui.openModal('alert-modal'); },
            applyRes: () => {
                if (!state.animRes) return; const res = state.animRes; const c = state.animCount;
                if (c > 1) { ui.log(`=== ${c}x Tarikan ===`, "warn"); res.forEach(i => { ui.logR(i.rngLog); if (i.type === 'token') ui.log(`SUKSES: ${i.name}!`, "success"); else if (i.type === 'refund') ui.log(`Refund Bonus: ${i.name}`, "refund"); else ui.log(`Ampas: ${i.name}`, "mt"); }); }
                else { const i = res[0]; ui.logR(i.rngLog); if (i.type === 'token') ui.log(`SUKSES: ${i.name}!`, "success"); else if (i.type === 'refund') ui.log(`Refund Bonus: ${i.name}`, "refund"); else ui.log(`Ampas: ${i.name}`, "mt"); }
                state.animRes = null; ui.renderTower(); ui.updateTopBar(); game.checkM();
            },
            closeGachaAnim: () => { ui.applyRes(); ui.closeModal('gacha-anim-modal'); },
            showPIN: () => { document.getElementById('pg-step-bill').classList.add('hidden'); document.getElementById('pg-step-pin').classList.remove('hidden'); document.getElementById('pg-pin-input').focus(); }
        };

        const game = {
            selectPayment: (c, a) => {
                state.pendTop = { c, a }; document.getElementById('pg-amount').innerText = `${a} Diamond`; document.getElementById('pg-price').innerText = ui.fmt(c);
                document.getElementById('pg-total').innerText = ui.fmt(c + 2500 + (c * 0.11));
                ['pg-step-pin', 'pg-step-proces', 'pg-step-succ'].forEach(id => document.getElementById(id).classList.add('hidden'));
                document.getElementById('pg-step-bill').classList.remove('hidden'); ui.openModal('payment-gateway-modal');
            },
            checkPIN: (v) => {
                if (v.length === 6) {
                    if (v === '000000') { document.getElementById('pg-pin-err').classList.add('hidden'); document.getElementById('pg-pin-input').value = ''; setTimeout(() => game.execute(), 300); }
                    else { document.getElementById('pg-pin-err').classList.remove('hidden'); document.getElementById('pg-pin-input').value = ''; }
                }
            },
            execute: () => {
                const tot = state.pendTop.c + 2500 + (state.pendTop.c * 0.11);
                if (state.idr < tot) { ui.closeModal('payment-gateway-modal'); return ui.showAlert("SALDO TIDAK CUKUP", "Saldo simulasi habis.", "text-red-500"); }
                document.getElementById('pg-step-pin').classList.add('hidden'); document.getElementById('pg-step-proces').classList.remove('hidden');
                const l = document.getElementById('pg-logs'); l.innerHTML = '<div>[SEC] Handshake bank...</div>';
                setTimeout(() => { l.innerHTML += '<div class="text-blue-500">[OK] Token valid</div>'; l.scrollTop = 100; }, 800); setTimeout(() => { l.innerHTML += '<div class="text-emerald-500">[SUC] Dana ditarik</div>'; l.scrollTop = 100; }, 1500);
                setTimeout(() => { state.idr -= tot; state.diamonds += state.pendTop.a; state.totalIDR += tot; ui.updateTopBar(); document.getElementById('pg-step-proces').classList.add('hidden'); document.getElementById('pg-step-succ').classList.remove('hidden'); ui.log(`Top-Up: +${state.pendTop.a} DM.`, "info"); }, 2400);
            },
            buySubsidy: () => {
                if (state.shopTicketsLeft <= 0 || state.idr < 150000) return;
                state.idr -= 150000; state.totalIDR += 150000; state.tickets += state.shopTicketsLeft; state.shopTicketsLeft = 0;
                document.getElementById('ui-shop-limit').innerText = 0; document.getElementById('btn-buy-tickets').disabled = true; document.getElementById('btn-buy-tickets').classList.add('opacity-50', 'cursor-not-allowed');
                ui.updateTopBar(); ui.closeModal('shop-modal'); ui.log(`Subsidi dibeli.`, "info");
            },
            spin: (c) => {
                if (state.finished || gachaAnim.isAnim) return;
                let tN = 0, dN = 0, tT = state.tickets; for (let i = 0; i < c; i++) { if (tT >= 3) { tT -= 3; tN += 3; } else { dN += 20; } }
                if (state.diamonds < dN) { ui.closeModal('gacha-anim-modal'); return ui.openModal('topup-modal'); }
                state.tickets -= tN; state.diamonds -= dN; state.realDiamondSpent += dN; ui.updateTopBar();
                let obs = [];
                for (let i = 0; i < c; i++) {
                    state.totalSpins++; const tk = config.tokens[state.cIdx]; const r = Math.random(); const rs = r.toFixed(6), cs = tk.chance.toFixed(6);
                    let msg = `<span class="font-bold text-blue-500">Pull ${state.totalSpins} [${tk.name}]</span><br>Math.random() <= ${cs}<br>Roll: <span class="${r <= tk.chance ? 'text-emerald-500' : 'text-red-500'}">${rs}</span>`;
                    if (r <= tk.chance) { state.cIdx++; state.consFails = 0; obs.push({ type: 'token', name: tk.name, rngLog: msg }); if (state.cIdx >= 5) break; }
                    else {
                        let isTix = false; let tr = '';
                        if (Math.random() <= 0.8) { state.tickets += 1; isTix = true; }
                        else { tr = config.trash[Math.floor(Math.random() * config.trash.length)]; }
                        state.consFails++;
                        if (state.consFails >= 5) {
                            state.tickets += 4; state.consFails = 0;
                            obs.push({ type: 'refund', name: isTix ? '5 Tiket (Pity+1)' : '4 Tiket (Pity)', rngLog: msg });
                        } else {
                            if (isTix) obs.push({ type: 'refund', name: '1 Tiket', rngLog: msg });
                            else obs.push({ type: 'trash', name: tr, tg: tk.name, rngLog: msg });
                        }
                    }
                }
                let ntT = state.tickets, ntN = 0, ndN = 0; for (let i = 0; i < c; i++) { if (ntT >= 3) { ntT -= 3; ntN += 3; } else { ndN += 20; } }
                let csA = []; if (ntN > 0) csA.push(`${ntN} Tiket`); if (ndN > 0) csA.push(`${ndN} DM`);
                state.animRes = obs; state.animCount = c; gachaAnim.start(obs, csA.join(' + '));
            },
            checkM: () => {
                if (state.cIdx === 4 && !state.nearMiss) { state.nearMiss = true; setTimeout(() => ui.showAlert("PERINGATAN", "Tembok 0.1% aktif. Persiapkan uang dan hati Anda.", "text-red-500"), 500); }
                if (state.cIdx >= 5 && !state.finished) { state.finished = true; setTimeout(() => ui.showAlert("SELESAI", `Total Tarikan: ${state.totalSpins}<br>Uang Terkuras: ${ui.fmt(state.totalIDR)}`, "text-indigo-500"), 500); if (stats.chart) stats.render(); }
            }
        };
        window.onload = () => { ui.updateTopBar(); ui.renderTower(); ui.log("Sistem aktif! Lakukan Test Spin Anda hari ini."); };