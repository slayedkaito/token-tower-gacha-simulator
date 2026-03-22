const config = {
            startIDR: 2500000, costDiamond: 20, costTicket: 3, maxShopTickets: 150,
            tokens: [{ id: 0, name: "RAM 32GB RGB", chance: 0.25 }, { id: 1, name: "SSD 2TB", chance: 0.10 },
            { id: 2, name: "Mobo X670E", chance: 0.05 }, { id: 3, name: "Core i9", chance: 0.01 },
            { id: 4, name: "RTX 4090", chance: 0.0038 }],
            trash: ["Thermal Paste", "Kabel SATA", "Baut PC", "Sticker Celeng", "Buku Manual"]
        };
        const state = {
            idr: config.startIDR, diamonds: 0, tickets: 1, shopTicketsLeft: config.maxShopTickets,
            cIdx: 0, consFails: 0, totalSpins: 0, totalIDR: 0, realDiamondSpent: 0,
            nearMiss: false, finished: false,
            pendTop: null, animRes: null, animCount: 0, dark: false
        };