export class StorageManager {
    /* Access the data (DB later) */
    static get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch(e) {
            console.error("Database Read Error", e);
            return [];
        }
    }

    /* Save the data (DB later) */
    static save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    /* Add new element to some key */
    static pushTo(key, item) {
        const currentData = this.get(key);
        currentData.push(item);
        this.save(key, currentData);
    }

    /* Dummy Data Generation */
    static async initSeedData() {
        /* Books Seed */
        if (!localStorage.getItem("books")) {
            console.log("StorageManager: Seeding initial books...");
            const books = [
                { 
                    id: 1, 
                    title: "Stellar Cartography", 
                    author: "Astrid Nova", 
                    price: "$15000", 
                    genre: "Science Fiction", 
                    pages: "342",
                    published: "Jan 2024",
                    rating: 4.5,
                    desc: "A breathtaking journey through the mapped and unmapped constellations.",
                    img: "/assets/dummy/astro.jpg",
                    reviews: []
                },
                { 
                    id: 2, 
                    title: "Pride & Paradox", 
                    author: "Jane Austin-Powers", 
                    price: "$12500", 
                    genre: "Classics", 
                    pages: "280",
                    published: "May 2023",
                    rating: 4.8,
                    desc: "A truth universally acknowledged, that a single man in possession of a time machine...",
                    img: "/assets/dummy/milk.jpg",
                    reviews: []
                }
            ];
            localStorage.setItem("books", JSON.stringify(books));
        }

        /* Users Seed */
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

        /* Deleted Token */

        // if (!localStorage.getItem("user_session")) {
        //     const sessionUser = { 
        //         id: "user_session_active", 
        //         name: "Alex Smith",
        //         email: "alex@gmail.com",
        //         role: "user",
        //         picture: null,
        //         loggedIn: true, 
        //         points: 1250 
        //     };
        //     localStorage.setItem("user_session", JSON.stringify(sessionUser));
        // }
        
        /* Fetured Promos Seed */
        if (!localStorage.getItem("featured_promos")) {
            const promos = [
                { 
                    title: "Unlimited Sci-Fi", 
                    desc: "Dive into thousands of galactic adventures", 
                    type: "scifi",
                    img: "/assets/dummy/earth.jpg", 
                    btnText: "Start for $9.99/mo", 
                    badge: "TRENDING" 
                },
                { 
                    title: "Classic Literature", 
                    desc: "Timeless masterpieces", 
                    type: "classics", 
                    img: "/assets/dummy/zero.jpg", 
                    btnText: "Explore", 
                    badge: "" 
                }
            ];
            localStorage.setItem("featured_promos", JSON.stringify(promos));
        }

        if (!localStorage.getItem("curated_config")) {
            const config = { displayGenre: "Science Fiction", limit: 2 };
            localStorage.setItem("curated_config", JSON.stringify(config));
        }

        /* Rewards Seed */
        if (!localStorage.getItem("reward_items")) {
            const rewards = [
                { 
                    id: 1, 
                    title: "The Midnight Alchemist", 
                    desc: "Signed hardcover with exclusive foil design.", 
                    cost: 4500, 
                    badge: "LIMITED EDITION", 
                    type: "rare",
                    img: "/assets/dummy/zero.jpg" 
                },
                { 
                    id: 2, 
                    title: "Celestial Bundle", 
                    desc: "Exclusive e-book themes and digital artworks.", 
                    cost: 1200, 
                    badge: "DIGITAL", 
                    type: "digital",
                    img: "/assets/dummy/stars.jpg" 
                },
                { 
                    id: 3, 
                    title: "Lumina Velvet Sleeve", 
                    desc: "Premium velvet protection for your travels.", 
                    cost: 2800, 
                    badge: "PHYSICAL", 
                    type: "common",
                    img: "/assets/dummy/milk.jpg" 
                },
                { 
                    id: 4, 
                    title: "Chronicler's Tome", 
                    desc: "Embossed leather journal for your stories.", 
                    cost: 6000, 
                    badge: "LEGENDARY", 
                    type: "legendary",
                    img: "/assets/dummy/notes.jpg" 
                }
            ];
            localStorage.setItem("reward_items", JSON.stringify(rewards));
        }

        /* Dashboard Seed */

        // Seed Top Summary Cards
        if (!localStorage.getItem("dashboard_stats")) {
            const stats = [
                { label: 'Total Revenue', value: '$45,280', trend: '+12.5%', color: 'bg-blue', subtext: 'Vs last month' },
                { label: 'Active Users', value: '1,240', trend: '-2.1%', color: 'bg-orange', subtext: 'Currently online' },
                { label: 'Pending Orders', value: '84', trend: '+5.0%', color: 'bg-cyan', subtext: 'Awaiting shipping' },
                { label: 'New Reviews', value: '12', trend: 'New', color: 'bg-yellow', subtext: 'This week' }
            ];
            localStorage.setItem("dashboard_stats", JSON.stringify(stats));
        }

        // Seed Sales Chart Data
        if (!localStorage.getItem("sales_performance")) {
            const performance = [
                { day: 'SAT', totalHeight: 40, fillHeight: 60 },
                { day: 'SUN', totalHeight: 50, fillHeight: 65 },
                { day: 'MON', totalHeight: 45, fillHeight: 80 },
                { day: 'TUE', totalHeight: 55, fillHeight: 70 },
                { day: 'WED', totalHeight: 80, fillHeight: 85 },
                { day: 'THU', totalHeight: 40, fillHeight: 50 },
                { day: 'FRI', totalHeight: 90, fillHeight: 100 }
            ];
            localStorage.setItem("sales_performance", JSON.stringify(performance));
        }

        // Seed Transactions with more data to test pagination
        if (!localStorage.getItem("orders")) {
            const orders = [
                { id: 'ORD-28492', customerName: 'Jane Doe', date: 'Oct 24, 2023', total: '124.50', status: 'Completed', bookTitle: 'Temp1'},
                { id: 'ORD-28491', customerName: 'Alex Smith', date: 'Oct 24, 2023', total: '42.00', status: 'Pending', bookTitle: 'Temp2' },
                { id: 'ORD-28490', customerName: 'Michael King', date: 'Oct 23, 2023', total: '89.99', status: 'Completed', bookTitle: 'Temp2' },
                { id: 'ORD-28321', customerName: 'Sarah Connor', date: 'Oct 23, 2023', total: '150.00', status: 'Pending', bookTitle: 'Temp2' },
                { id: 'ORD-28320', customerName: 'John Doe', date: 'Oct 22, 2023', total: '200.00', status: 'Completed', bookTitle: 'Temp2' },
                { id: 'ORD-28319', customerName: 'Ellen Ripley', date: 'Oct 22, 2023', total: '75.50', status: 'Completed', bookTitle: 'Temp2' },
                { id: 'ORD-28318', customerName: 'Marty McFly', date: 'Oct 21, 2023', total: '30.00', status: 'Cancelled', bookTitle: 'Temp2' },
                { id: 'ORD-28317', customerName: 'Bruce Wayne', date: 'Oct 21, 2023', total: '1000.00', status: 'Completed', bookTitle: 'Temp2' }
            ];
            localStorage.setItem("orders", JSON.stringify(orders));
        }

        /* Inventory Seed */
        if (!localStorage.getItem("inventory")) {
            const inventory = [
                { id: 1, title: "Stellar Cartography", author: "Astrid Nova", isbn: "978-0525559474", sku: "LUM-001", stock: 128, maxStock: 150 },
                { id: 2, title: "Pride & Paradox", author: "Jane Austin-Powers", isbn: "978-0593135204", sku: "LUM-002", stock: 4, maxStock: 100 },
                { id: 3, title: "Project Hail Mary", author: "Andy Weir", isbn: "978-0593099322", sku: "LUM-003", stock: 0, maxStock: 100 },
                { id: 4, title: "Circe", author: "Madeline Miller", isbn: "978-0316556347", sku: "LUM-004", stock: 45, maxStock: 100 },
                { id: 5, title: "Dune: Deluxe Edition", author: "Frank Herbert", isbn: "978-0593099321", sku: "LUM-005", stock: 80, maxStock: 100 }
            ];
            localStorage.setItem("inventory", JSON.stringify(inventory));
        }

        /* Promise for solving the racing condition */
        return Promise.resolve(true);
    }
}