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
        // 1. Check if data already exists to avoid overwriting user progress
        if (localStorage.getItem("books")) {
            console.log("StorageManager: Data already exists. Skipping seed.");
            return; 
        }

        console.log("StorageManager: Initializing database (Books & Community)...");

        // --- 2. SEED BOOKS (Library Catalog) ---
        const books = [
            { 
                id: 1, 
                title: "Stellar Cartography", 
                author: "Astrid Nova", 
                price: 14500, // Price in PTS (Numeric for sorting/filtering)
                genre: "Science Fiction", 
                pages: "342",
                published: "Jan 2024",
                rating: 4.5,
                desc: "A breathtaking journey through the mapped and unmapped constellations of the Andromeda galaxy.",
                img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqJzjaJUxr3Q_FmZOS3zkkeQrlR0pFQzDw-w&s",
                reviews: [
                    { user: "OrbitalExplorer", rating: 5, time: "2 days ago", comment: "The technical detail is grounded! Love it." }
                ]
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
                desc: "A truth universally acknowledged, that a single man in possession of a time machine, must be in want of a paradox.",
                img: "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcR_x_q8_hX_G_u_R_w_x_p_v_K_k_j_X_v_o&s",
                reviews: []
            },
            { 
                id: 3, 
                title: "Shadow Protocol", 
                author: "Elias Thorne", 
                price: 19000, 
                genre: "Science Fiction", 
                pages: "412",
                published: "Nov 2023",
                rating: 5.0,
                desc: "In a world where memories can be hacked, Elias must protect the only secret that can't be encrypted.",
                img: "https://images.unsplash.com/photo-1543005814-14b24e82ff3b?q=80&w=1000&auto=format&fit=crop",
                reviews: []
            }
        ];
        localStorage.setItem("books", JSON.stringify(books));

        // --- 3. SEED COMMUNITY USERS (Leaderboard) ---
        const communityUsers = [
            { 
                id: "u1", 
                name: "Marcus Thorne", 
                points: 15890, 
                readings: 245, 
                reviews: 150, 
                joinDate: "2022",
                avatar: "https://i.pravatar.cc/150?u=marcus" 
            },
            { 
                id: "u2", 
                name: "Elena Vance", 
                points: 12450, 
                readings: 180, 
                reviews: 95, 
                joinDate: "2023",
                avatar: "https://i.pravatar.cc/150?u=elena" 
            },
            { 
                id: "u3", 
                name: "Julian Mars", 
                points: 11200, 
                readings: 150, 
                reviews: 80, 
                joinDate: "2021",
                avatar: "https://i.pravatar.cc/150?u=julian" 
            },
            { 
                id: "u_session_active", // Match this with user_session ID below
                name: "Alex Smith", 
                points: 1250, 
                readings: 14, 
                reviews: 3, 
                joinDate: "2024",
                avatar: "https://i.pravatar.cc/150?u=alex" 
            }
        ];
        localStorage.setItem("community_users", JSON.stringify(communityUsers));

        // --- 4. SEED USER SESSION (The Logged In User) ---
        const sessionUser = { 
            id: "u_session_active", 
            name: "Alex Smith", 
            loggedIn: true,
            points: 1250 
        };
        localStorage.setItem("user_session", JSON.stringify(sessionUser));

        // --- 5. SEED PROMOS & CONFIG ---
        const promos = [
            { 
                title: "Unlimited Sci-Fi", 
                desc: "Dive into galactic adventures", 
                type: "scifi",
                img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmSHBwpEcTQgoAOlmnE5Auor0KVBgz6mqpbw&s",
                btnText: "Start for 9.9k PTS", 
                badge: "TRENDING" 
            }
        ];
        localStorage.setItem("featured_promos", JSON.stringify(promos));

        const config = { displayGenre: "Science Fiction", limit: 2 };
        localStorage.setItem("curated_config", JSON.stringify(config));
    }
}