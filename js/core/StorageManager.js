export class StorageManager {
    static get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch(e) {
            console.error("Database Read Error", e);
            return [];
        }
    }

    static save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    static pushTo(key, item) {
        const currentData = this.get(key);
        currentData.push(item);
        this.save(key, currentData);
    }

    static initSeedData() {
        if (!localStorage.getItem("books")) {
            console.log("StorageManager: Seeding initial books...");
            const books = [
                { 
                    id: 1, 
                    title: "Stellar Cartography", 
                    author: "Astrid Nova", 
                    price: 15000, 
                    genre: "Science Fiction", 
                    pages: "342",
                    published: "Jan 2024",
                    rating: 4.5,
                    desc: "A breathtaking journey through the mapped and unmapped constellations.",
                    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqJzjaJUxr3Q_FmZOS3zkkeQrlR0pFQzDw-w&s",
                    reviews: []
                },
                { 
                    id: 2, 
                    title: "Pride & Paradox", 
                    author: "Jane Austin-Powers", 
                    price: 12500, 
                    genre: "Classics", 
                    pages: "280",
                    published: "May 2023",
                    rating: 4.8,
                    desc: "A truth universally acknowledged, that a single man in possession of a time machine...",
                    img: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcR_x_q8_hX_G_u_R_w_x_p_v_K_k_j_X_v_o&s",
                    reviews: []
                }
            ];
            localStorage.setItem("books", JSON.stringify(books));
        }

        if (!localStorage.getItem("community_users")) {
            console.log("StorageManager: Seeding community leaderboard...");
            const communityUsers = [
                { id: "user_1", name: "Marcus Thorne", points: 15890, readings: 245, reviews: 150, joinDate: '2022', avatar: 'https://i.pravatar.cc/150?u=marcus' },
                { id: "user_2", name: "Elena Vance", points: 12450, readings: 180, reviews: 95, joinDate: '2023', avatar: 'https://i.pravatar.cc/150?u=elena' },
                { id: "user_3", name: "Julian Mars", points: 11200, readings: 150, reviews: 80, joinDate: '2021', avatar: 'https://i.pravatar.cc/150?u=julian' },
                { id: "user_4", name: "Sophia Reed", points: 9420, readings: 124, reviews: 82, joinDate: '2023', avatar: 'https://i.pravatar.cc/150?u=sophia' },
                { id: "user_5", name: "David Chen", points: 8950, readings: 118, reviews: 105, joinDate: '2022', avatar: 'https://i.pravatar.cc/150?u=david' },
                { id: "user_session_active", name: "Alex Smith", points: 1250, readings: 14, reviews: 3, joinDate: '2024', avatar: 'https://i.pravatar.cc/150?u=alex' }
            ];
            localStorage.setItem("community_users", JSON.stringify(communityUsers));
        }

        if (!localStorage.getItem("user_session")) {
            const sessionUser = { 
                id: "user_session_active", 
                name: "Alex Smith", 
                loggedIn: true, 
                points: 1250 
            };
            localStorage.setItem("user_session", JSON.stringify(sessionUser));
        }

        if (!localStorage.getItem("featured_promos")) {
            const promos = [
                { title: "Unlimited Sci-Fi", desc: "Dive into thousands of galactic adventures", type: "scifi", img: "...", btnText: "Start for $9.99/mo", badge: "TRENDING" },
                { title: "Classic Literature", desc: "Timeless masterpieces", type: "classics", img: "...", btnText: "Explore", badge: "" }
            ];
            localStorage.setItem("featured_promos", JSON.stringify(promos));
        }

        if (!localStorage.getItem("curated_config")) {
            const config = { displayGenre: "Science Fiction", limit: 2 };
            localStorage.setItem("curated_config", JSON.stringify(config));
        }

        if (!localStorage.getItem("reward_items")) {
            console.log("StorageManager: Seeding reward catalog...");
            const rewards = [
                { 
                    id: 1, 
                    title: "The Midnight Alchemist", 
                    desc: "Signed hardcover with exclusive foil design.", 
                    cost: 4500, 
                    badge: "LIMITED EDITION", 
                    type: "rare",
                    img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400" 
                },
                { 
                    id: 2, 
                    title: "Celestial Bundle", 
                    desc: "Exclusive e-book themes and digital artworks.", 
                    cost: 1200, 
                    badge: "DIGITAL", 
                    type: "digital",
                    img: "https://images.unsplash.com/photo-1464802686167-b939a6910659?w=400" 
                },
                { 
                    id: 3, 
                    title: "Lumina Velvet Sleeve", 
                    desc: "Premium velvet protection for your travels.", 
                    cost: 2800, 
                    badge: "PHYSICAL", 
                    type: "common",
                    img: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" 
                },
                { 
                    id: 4, 
                    title: "Chronicler's Tome", 
                    desc: "Embossed leather journal for your stories.", 
                    cost: 6000, 
                    badge: "LEGENDARY", 
                    type: "legendary",
                    img: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400" 
                }
            ];
            localStorage.setItem("reward_items", JSON.stringify(rewards));
        }
    }
}