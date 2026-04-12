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
        if (!localStorage.getItem('gamification-config')) {
            const defaultValues = {
                loginPoints: 10,
                reviewBase: 25,
                reviewBonus: 50,
                reviewMinChar: 100,
                purchaseRate: 2,
                purchaseMax: 500,
                signupBonus: 50
            };

            const newConfig = {};
            Object.keys(defaultValues).forEach(key => {
                const element = this.inputMap && this.inputMap[key];
                
                if (element && element.value !== undefined && element.value !== "") {
                    newConfig[key] = parseFloat(element.value);
                } else {
                    newConfig[key] = defaultValues[key];
                }
            });

            StorageManager.save('gamification-config', newConfig);
            console.log("Seed successful:", newConfig);
        }
        /* Books Seed */
        if (!localStorage.getItem("books")) {
            console.log("StorageManager: Seeding initial books...");
            const books = [
                { 
                    id: 1, 
                    title: "Secrets of Divine Love", 
                    author: "A. Helwa", 
                    price: "$2500", 
                    genre: "Religious", 
                    pages: "312",
                    published: "May 2020",
                    rating: 4.9,
                    desc: "A spiritual journey into the heart of Islam, focusing on the beauty of Allah's mercy and love.",
                    img: "/assets/dummy/divine_love.jpg",
                    reviews: []
                },
                { 
                    id: 2, 
                    title: "Reclaim Your Heart", 
                    author: "Yasmin Mogahed", 
                    price: "$1800", 
                    genre: "Religious", 
                    pages: "176",
                    published: "August 2012",
                    rating: 4.8,
                    desc: "Personal insights on breaking free from life's shackles and reconnecting with the Creator.",
                    img: "/assets/dummy/reclaim.jpg",
                    reviews: []
                },
                { 
                    id: 3, 
                    title: "Muhammad: His Life Based on the Earliest Sources", 
                    author: "Martin Lings", 
                    price: "$3500", 
                    genre: "Religious", 
                    pages: "384",
                    published: "October 2006",
                    rating: 4.9,
                    desc: "One of the most acclaimed biographies of the Prophet Muhammad, written with poetic grace.",
                    img: "/assets/dummy/seerah.jpg",
                    reviews: []
                },
                { 
                    id: 4, 
                    title: "The Sealed Nectar", 
                    author: "Safiur Rahman Mubarakpuri", 
                    price: "$2200", 
                    genre: "Religious", 
                    pages: "588",
                    published: "1979",
                    rating: 4.7,
                    desc: "A prize-winning biography of the Prophet Muhammad, known for its detail and historical accuracy.",
                    img: "/assets/dummy/nectar.jpg",
                    reviews: []
                },
                { 
                    id: 5, 
                    title: "Allah Loves", 
                    author: "Omar Suleiman", 
                    price: "$1500", 
                    genre: "Religious", 
                    pages: "160",
                    published: "May 2020",
                    rating: 4.9,
                    desc: "A guide to the characteristics and actions that earn the love and pleasure of the Almighty.",
                    img: "/assets/dummy/allah_loves.jpg",
                    reviews: []
                },
                { 
                    id: 6, 
                    title: "Lost Islamic History", 
                    author: "Firas Alkhateeb", 
                    price: "$2400", 
                    genre: "Religious", 
                    pages: "212",
                    published: "August 2014",
                    rating: 4.8,
                    desc: "Reclaiming the forgotten contributions and history of Muslim civilizations throughout the ages.",
                    img: "/assets/dummy/history.jpg",
                    reviews: []
                },
                { 
                    id: 7, 
                    title: "Clean Code", 
                    author: "Robert C. Martin", 
                    price: "$4500", 
                    genre: "Programming", 
                    pages: "464",
                    published: "August 2008",
                    rating: 4.7,
                    desc: "A handbook of agile software craftsmanship that teaches how to write code that works and lasts.",
                    img: "/assets/dummy/clean_code.jpg",
                    reviews: []
                },
                { 
                    id: 8, 
                    title: "The Pragmatic Programmer", 
                    author: "Andrew Hunt & David Thomas", 
                    price: "$4800", 
                    genre: "Programming", 
                    pages: "352",
                    published: "October 1999",
                    rating: 4.8,
                    desc: "Your journey to mastery, covering coding best practices and career-long learning strategies.",
                    img: "/assets/dummy/pragmatic.jpg",
                    reviews: []
                },
                { 
                    id: 9, 
                    title: "Eloquent JavaScript", 
                    author: "Marijn Haverbeke", 
                    price: "$3200", 
                    genre: "Programming", 
                    pages: "472",
                    published: "December 2018",
                    rating: 4.6,
                    desc: "A modern introduction to programming using JavaScript, covering everything from basics to advanced logic.",
                    img: "/assets/dummy/eloquent_js.jpg",
                    reviews: []
                },
                { 
                    id: 10, 
                    title: "Python Crash Course", 
                    author: "Eric Matthes", 
                    price: "$3800", 
                    genre: "Programming", 
                    pages: "544",
                    published: "May 2019",
                    rating: 4.8,
                    desc: "A fast-paced, thorough introduction to Python that will have you writing programs in no time.",
                    img: "/assets/dummy/python_crash.jpg",
                    reviews: []
                },
                { 
                    id: 11, 
                    title: "Cracking the Coding Interview", 
                    author: "Gayle Laakmann McDowell", 
                    price: "$4000", 
                    genre: "Programming", 
                    pages: "687",
                    published: "July 2015",
                    rating: 4.9,
                    desc: "189 programming questions and solutions to help you ace technical interviews at big tech companies.",
                    img: "/assets/dummy/cracking.jpg",
                    reviews: []
                },
                { 
                    id: 12, 
                    title: "Introduction to Algorithms", 
                    author: "Cormen, Leiserson, Rivest, Stein", 
                    price: "$8500", 
                    genre: "Programming", 
                    pages: "1312",
                    published: "April 2022",
                    rating: 4.7,
                    desc: "The 'Bible' of computer science algorithms, providing a comprehensive guide to data structures.",
                    img: "/assets/dummy/algorithms.jpg",
                    reviews: []
                },
                { 
                    id: 13, 
                    title: "Sapiens: A Brief History of Humankind", 
                    author: "Yuval Noah Harari", 
                    price: "$2800", 
                    genre: "Science", 
                    pages: "512",
                    published: "February 2015",
                    rating: 4.7,
                    desc: "A look at the evolutionary history of humans, from the Stone Age to the modern Silicon Age.",
                    img: "/assets/dummy/sapiens.jpg",
                    reviews: []
                },
                { 
                    id: 14, 
                    title: "Astrophysics for People in a Hurry", 
                    author: "Neil deGrasse Tyson", 
                    price: "$1500", 
                    genre: "Science", 
                    pages: "224",
                    published: "May 2017",
                    rating: 4.7,
                    desc: "Quick, bite-sized lessons on the nature of space and time for the busy modern reader.",
                    img: "/assets/dummy/tyson.jpg",
                    reviews: []
                },
                { 
                    id: 15, 
                    title: "Cosmos", 
                    author: "Carl Sagan", 
                    price: "$2200", 
                    genre: "Science", 
                    pages: "384",
                    published: "October 1980",
                    rating: 4.9,
                    desc: "A masterpiece of scientific storytelling that explores the evolution of the universe and human discovery.",
                    img: "/assets/dummy/cosmos.jpg",
                    reviews: []
                },
                { 
                    id: 16, 
                    title: "The Selfish Gene", 
                    author: "Richard Dawkins", 
                    price: "$2600", 
                    genre: "Science", 
                    pages: "360",
                    published: "May 2006",
                    rating: 4.5,
                    desc: "A revolutionary perspective on evolution, focusing on the gene as the fundamental unit of selection.",
                    img: "/assets/dummy/gene.jpg",
                    reviews: []
                },
                { 
                    id: 17, 
                    title: "The Immortal Life of Henrietta Lacks", 
                    author: "Rebecca Skloot", 
                    price: "$1700", 
                    genre: "Science", 
                    pages: "381",
                    published: "February 2010",
                    rating: 4.7,
                    desc: "The true story of a woman whose cancer cells changed modern medicine forever, sparking ethical debates.",
                    img: "/assets/dummy/henrietta.jpg",
                    reviews: []
                },
                { 
                    id: 18, 
                    title: "Why We Sleep", 
                    author: "Matthew Walker", 
                    price: "$2700", 
                    genre: "Science", 
                    pages: "368",
                    published: "September 2017",
                    rating: 4.8,
                    desc: "Unlocking the power of sleep and dreams to improve health, learning, and longevity.",
                    img: "/assets/dummy/sleep.jpg",
                    reviews: []
                },
                { 
                    id: 19, 
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
                    id: 22, 
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
            const activeSession = this.get("user_session");

            const communityUsers = [
                { id: "user_1", name: "Marcus Thorne", points: 15890, readings: 245, reviews: 150, joinDate: '2022', avatar: "/assets/dummy/a1.jpg", userBooks: [], borrowedBooks: [] },
                { id: "user_2", name: "Elena Vance", points: 12450, readings: 180, reviews: 95, joinDate: '2023', avatar: "/assets/dummy/a2.jpg", userBooks: [], borrowedBooks: [] },
                { id: "user_3", name: "Julian Mars", points: 11200, readings: 150, reviews: 80, joinDate: '2021', avatar: "/assets/dummy/a3.jpg", userBooks: [], borrowedBooks: [] },
                { id: "user_4", name: "Sophia Reed", points: 9420, readings: 124, reviews: 82, joinDate: '2023', avatar: "/assets/dummy/a4.jpg", userBooks: [], borrowedBooks: [] },
                { id: "user_5", name: "David Chen", points: 8950, readings: 118, reviews: 105, joinDate: '2022', avatar: "/assets/dummy/a5.jpg", userBooks: [], borrowedBooks: [] },
                { id: "user_6", name: "Isabella Rossi", points: 7600, readings: 92, reviews: 45, joinDate: '2023', avatar: "/assets/dummy/a6.jpg", userBooks: [], borrowedBooks: [] },
                { id: "user_7", name: "Lucas Meyer", points: 6210, readings: 85, reviews: 30, joinDate: '2022', avatar: "/assets/dummy/a7.jpg", userBooks: [], borrowedBooks: [] },
                { id: "user_8", name: "Amara Okafor", points: 5400, readings: 74, reviews: 62, joinDate: '2024', avatar: "/assets/dummy/a8.jpg", userBooks: [], borrowedBooks: [] },
                { id: "user_9", name: "Kenji Sato", points: 4800, readings: 60, reviews: 25, joinDate: '2023', avatar: "/assets/dummy/a9.jpg", userBooks: [], borrowedBooks: [] }
            ];

            if (activeSession) {
                communityUsers.push({
                    ...activeSession,
                    id: "user_session_active",
                    name: activeSession.name || "Guest"
                });
            }

            localStorage.setItem("community_users", JSON.stringify(communityUsers));
        }

        /* Token for Debugging */

        // if (!localStorage.getItem("user_session")) {
        //     const sessionUser = { 
        //         id: "user_session_active", 
        //         name: "Alex Smith",
        //         email: "alex@gmail.com",
        //         role: "user",
        //         picture: null,
        //         loggedIn: true, 
        //         readings: 30,
        //         points: 1250 
        //     };
        //     localStorage.setItem("user_session", JSON.stringify(sessionUser));
        // }
        
        /* Fetured Promos Seed */
        if (!localStorage.getItem("featured_promos")) {
            const promos = [
                { 
                    title: "Master the Code", 
                    desc: "From Python to Algorithms, upgrade your dev skills today", 
                    type: "programming",
                    img: "/assets/dummy/pragmatic.jpg", 
                    btnText: "Shop Coding Books", 
                    badge: "CAREER GROWTH" 
                },
                { 
                    title: "Spiritual Wisdom", 
                    desc: "Explore deep insights into faith and the heart", 
                    type: "religious", 
                    img: "/assets/dummy/divine_love.jpg", 
                    btnText: "View Collection", 
                    badge: "TOP RATED" 
                }
            ];
            localStorage.setItem("featured_promos", JSON.stringify(promos));
        }

        if (!localStorage.getItem("curated_config")) {
            const config = { 
                displayGenre: "Programming", 
                limit: 3 
            };
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
                    img: "/assets/dummy/zero.jpg" },
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
                },
                { 
                    id: 5, 
                    title: "Dev Masterclass Access", 
                    desc: "One-month premium access to advanced coding workshops.", 
                    cost: 3500, 
                    badge: "EDUCATION", 
                    type: "digital", 
                    img: "/assets/dummy/clean_code.jpg" 
                },
                { 
                    id: 6, 
                    title: "Divine Love Calligraphy", 
                    desc: "Hand-painted A3 parchment featuring spiritual verses.", 
                    cost: 5500, 
                    badge: "ARTISAN", 
                    type: "rare", 
                    img: "/assets/dummy/divine_love.jpg" 
                },
                { 
                    id: 7, 
                    title: "Silicon Valley Coffee Kit", 
                    desc: "Insulated smart mug and premium dark roast beans.", 
                    cost: 2200, 
                    badge: "LIFESTYLE", 
                    type: "common", 
                    img: "/assets/dummy/pragmatic.jpg" 
                },
                { 
                    id: 8, 
                    title: "Prophetic History Box", 
                    desc: "Complete Seerah collection with detailed historical maps.", 
                    cost: 8000, 
                    badge: "ULTIMATE", 
                    type: "legendary", 
                    img: "/assets/dummy/seerah.jpg" 
                }
            ];
            localStorage.setItem("reward_items", JSON.stringify(rewards));
        }

        /* Dashboard Seed */
        if (!localStorage.getItem("dashboard_stats")) {
            const stats = [
                { label: 'Total Revenue', value: '$45,280', trend: '+12.5%', color: 'bg-blue', subtext: 'Vs last month' },
                { label: 'Active Users', value: '1,240', trend: '-2.1%', color: 'bg-orange', subtext: 'Currently online' },
                { label: 'Pending Orders', value: '84', trend: '+5.0%', color: 'bg-cyan', subtext: 'Awaiting shipping' },
                { label: 'New Reviews', value: '12', trend: 'New', color: 'bg-yellow', subtext: 'This week' }
            ];
            localStorage.setItem("dashboard_stats", JSON.stringify(stats));
        }

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

        if (!localStorage.getItem("orders")) {
            const activeSession = JSON.parse(localStorage.getItem("user_session"));
            
            const orders = [
                { 
                    id: 'ORD-20261', 
                    customerName: activeSession ? activeSession.name : 'Alex Smith', 
                    date: 'Apr 12, 2026', 
                    total: '$2500', 
                    status: 'Completed', 
                    bookTitle: 'Secrets of Divine Love'
                },
                {
                    id: 'ORD-28492',
                    customerName: 'Marcus Thorne',
                    date: 'Apr 10, 2026',
                    total: '$8500',
                    status: 'Completed',
                    bookTitle: 'Introduction to Algorithms'
                },
                {
                    id: 'ORD-28491',
                    customerName: 'Elena Vance',
                    date: 'Apr 09, 2026',
                    total: '$1800',
                    status: 'Pending',
                    bookTitle: 'Reclaim Your Heart'
                },
                {
                    id: 'ORD-28490',
                    customerName: 'Julian Mars',
                    date: 'Apr 08, 2026',
                    total: '$4500',
                    status: 'Completed',
                    bookTitle: 'Clean Code'
                },
                {
                    id: 'ORD-28321',
                    customerName: 'Sophia Reed',
                    date: 'Apr 08, 2026',
                    total: '$3500',
                    status: 'Pending',
                    bookTitle: 'Muhammad: His Life...'
                },
                {
                    id: 'ORD-28320',
                    customerName: 'David Chen',
                    date: 'Apr 07, 2026',
                    total: '$3200',
                    status: 'Completed',
                    bookTitle: 'Eloquent JavaScript'
                },
                {
                    id: 'ORD-28319',
                    customerName: 'Isabella Rossi',
                    date: 'Apr 05, 2026',
                    total: '$1500',
                    status: 'Completed',
                    bookTitle: 'Allah Loves'
                },
                {
                    id: 'ORD-28318',
                    customerName: 'Lucas Meyer',
                    date: 'Apr 02, 2026',
                    total: '$2400',
                    status: 'Cancelled',
                    bookTitle: 'Lost Islamic History'
                },
                {
                    id: 'ORD-28317',
                    customerName: 'Amara Okafor',
                    date: 'Mar 28, 2026', 
                    total: '$15000',
                    status: 'Completed',
                    bookTitle: 'Stellar Cartography'
                }
            ];

            localStorage.setItem("orders", JSON.stringify(orders));
        }

        if (!localStorage.getItem("inventory")) {
            const inventory = [
                { id: 1, title: "Secrets of Divine Love", author: "A. Helwa", isbn: "978-1734231205", sku: "LUM-001", stock: 85, maxStock: 150 },
                { id: 3, title: "Muhammad: Earliest Sources", author: "Martin Lings", isbn: "978-1594771538", sku: "LUM-003", stock: 12, maxStock: 100 },
                
                { id: 7, title: "Clean Code", author: "Robert C. Martin", isbn: "978-0132350884", sku: "LUM-007", stock: 45, maxStock: 100 },
                { id: 8, title: "The Pragmatic Programmer", author: "Andrew Hunt", isbn: "978-0135957059", sku: "LUM-008", stock: 28, maxStock: 100 },
                { id: 12, title: "Introduction to Algorithms", author: "Cormen et al.", isbn: "978-0262046305", sku: "LUM-012", stock: 3, maxStock: 50 },
                
                { id: 13, title: "Sapiens", author: "Yuval Noah Harari", isbn: "978-0062316097", sku: "LUM-013", stock: 0, maxStock: 120 },
                { id: 15, title: "Cosmos", author: "Carl Sagan", isbn: "978-0345331359", sku: "LUM-015", stock: 62, maxStock: 100 },
                
                { id: 19, title: "Stellar Cartography", author: "Astrid Nova", isbn: "978-0525559474", sku: "LUM-019", stock: 110, maxStock: 150 },
                { id: 22, title: "Pride & Paradox", author: "Jane Austin-Powers", isbn: "978-0593135204", sku: "LUM-022", stock: 15, maxStock: 100 }
            ];
            localStorage.setItem("inventory", JSON.stringify(inventory));
        }

        /* Promise for solving the racing condition */
        return Promise.resolve(true);
    }
}