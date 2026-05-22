import os
import django
from pathlib import Path
from django.core.files.base import ContentFile

# --------------------
# Django Setup
# --------------------
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model
from Storefront.models import Book, Genre, Inventory


# --------------------
# CONFIG
# --------------------
STATIC_DUMMY_DIR = Path(__file__).resolve().parent / "static" / "assets" / "dummy"


# --------------------
# BOOK DATA
# --------------------
BOOKS_DATA = [
    {
        "id": 1,
        "title": "Secrets of Divine Love",
        "author": "A. Helwa",
        "price": 2500,
        "genre": "Religious",
        "pages": 312,
        "published": "May 2020",
        "rating": 4.9,
        "desc": "A spiritual journey into the heart of Islam, focusing on the beauty of Allah's mercy and love.",
        "img": "/assets/dummy/divine_love.jpg",
    },
    {
        "id": 2,
        "title": "Reclaim Your Heart",
        "author": "Yasmin Mogahed",
        "price": 1800,
        "genre": "Religious",
        "pages": 176,
        "published": "August 2012",
        "rating": 4.8,
        "desc": "Personal insights on breaking free from life's shackles and reconnecting with the Creator.",
        "img": "/assets/dummy/reclaim.jpg",
    },
    {
        "id": 3,
        "title": "Muhammad: His Life Based on the Earliest Sources",
        "author": "Martin Lings",
        "price": 3500,
        "genre": "Religious",
        "pages": 384,
        "published": "October 2006",
        "rating": 4.9,
        "desc": "One of the most acclaimed biographies of the Prophet Muhammad.",
        "img": "/assets/dummy/seerah.jpg",
    },
    {
        "id": 4,
        "title": "The Sealed Nectar",
        "author": "Safiur Rahman Mubarakpuri",
        "price": 2200,
        "genre": "Religious",
        "pages": 588,
        "published": "1979",
        "rating": 4.7,
        "desc": "A detailed biography of the Prophet Muhammad.",
        "img": "/assets/dummy/nectar.jpg",
    },
    {
        "id": 5,
        "title": "Allah Loves",
        "author": "Omar Suleiman",
        "price": 1500,
        "genre": "Religious",
        "pages": 160,
        "published": "May 2020",
        "rating": 4.9,
        "desc": "Guide to divine love.",
        "img": "/assets/dummy/allah_loves.jpg",
    },
    {
        "id": 6,
        "title": "Lost Islamic History",
        "author": "Firas Alkhateeb",
        "price": 2400,
        "genre": "Religious",
        "pages": 212,
        "published": "August 2014",
        "rating": 4.8,
        "desc": "Islamic historical contributions.",
        "img": "/assets/dummy/history.jpg",
    },
    {
        "id": 7,
        "title": "Clean Code",
        "author": "Robert C. Martin",
        "price": 4500,
        "genre": "Programming",
        "pages": 464,
        "published": "August 2008",
        "rating": 4.7,
        "desc": "Software craftsmanship guide.",
        "img": "/assets/dummy/clean_code.jpg",
    },
    {
        "id": 8,
        "title": "The Pragmatic Programmer",
        "author": "Andrew Hunt & David Thomas",
        "price": 4800,
        "genre": "Programming",
        "pages": 352,
        "published": "October 1999",
        "rating": 4.8,
        "desc": "Developer mastery guide.",
        "img": "/assets/dummy/pragmatic.jpg",
    },
    {
        "id": 9,
        "title": "Eloquent JavaScript",
        "author": "Marijn Haverbeke",
        "price": 3200,
        "genre": "Programming",
        "pages": 472,
        "published": "December 2018",
        "rating": 4.6,
        "desc": "JavaScript fundamentals.",
        "img": "/assets/dummy/eloquent_js.jpg",
    },
    {
        "id": 10,
        "title": "Python Crash Course",
        "author": "Eric Matthes",
        "price": 3800,
        "genre": "Programming",
        "pages": 544,
        "published": "May 2019",
        "rating": 4.8,
        "desc": "Python basics.",
        "img": "/assets/dummy/python_crash.jpg",
    },
    {
        "id": 11,
        "title": "Cracking the Coding Interview",
        "author": "Gayle Laakmann McDowell",
        "price": 4000,
        "genre": "Programming",
        "pages": 687,
        "published": "July 2015",
        "rating": 4.9,
        "desc": "Interview prep guide.",
        "img": "/assets/dummy/cracking.jpg",
    },
    {
        "id": 12,
        "title": "Introduction to Algorithms",
        "author": "Cormen, Leiserson, Rivest, Stein",
        "price": 8500,
        "genre": "Programming",
        "pages": 1312,
        "published": "April 2022",
        "rating": 4.7,
        "desc": "Algorithms bible.",
        "img": "/assets/dummy/algorithms.jpg",
    },
    {
        "id": 13,
        "title": "Sapiens: A Brief History of Humankind",
        "author": "Yuval Noah Harari",
        "price": 2800,
        "genre": "Science",
        "pages": 512,
        "published": "February 2015",
        "rating": 4.7,
        "desc": "Human history.",
        "img": "/assets/dummy/sapiens.jpg",
    },
    {
        "id": 14,
        "title": "Astrophysics for People in a Hurry",
        "author": "Neil deGrasse Tyson",
        "price": 1500,
        "genre": "Science",
        "pages": 224,
        "published": "May 2017",
        "rating": 4.7,
        "desc": "Space basics.",
        "img": "/assets/dummy/tyson.jpg",
    },
    {
        "id": 15,
        "title": "Cosmos",
        "author": "Carl Sagan",
        "price": 2200,
        "genre": "Science",
        "pages": 384,
        "published": "October 1980",
        "rating": 4.9,
        "desc": "Universe story.",
        "img": "/assets/dummy/cosmos.jpg",
    },
    {
        "id": 16,
        "title": "The Selfish Gene",
        "author": "Richard Dawkins",
        "price": 2600,
        "genre": "Science",
        "pages": 360,
        "published": "May 2006",
        "rating": 4.5,
        "desc": "Gene theory.",
        "img": "/assets/dummy/gene.jpg",
    },
    {
        "id": 17,
        "title": "The Immortal Life of Henrietta Lacks",
        "author": "Rebecca Skloot",
        "price": 1700,
        "genre": "Science",
        "pages": 381,
        "published": "February 2010",
        "rating": 4.7,
        "desc": "Medical ethics.",
        "img": "/assets/dummy/henrietta.jpg",
    },
    {
        "id": 18,
        "title": "Why We Sleep",
        "author": "Matthew Walker",
        "price": 2700,
        "genre": "Science",
        "pages": 368,
        "published": "September 2017",
        "rating": 4.8,
        "desc": "Sleep science.",
        "img": "/assets/dummy/sleep.jpg",
    },
    {
        "id": 19,
        "title": "Stellar Cartography",
        "author": "Astrid Nova",
        "price": 15000,
        "genre": "Science Fiction",
        "pages": 342,
        "published": "Jan 2024",
        "rating": 4.5,
        "desc": "Space maps.",
        "img": "/assets/dummy/astro.jpg",
    },
    {
        "id": 22,
        "title": "Pride & Paradox",
        "author": "Jane Austin-Powers",
        "price": 12500,
        "genre": "Classics",
        "pages": 280,
        "published": "May 2023",
        "rating": 4.8,
        "desc": "Time romance parody.",
        "img": "/assets/dummy/milk.jpg",
    },
]


# --------------------
# USER DATA
# --------------------
USERS_DATA = [
    {"username": "user_1", "name": "Marcus Thorne", "points": 15890, "readings": 245, "reviews": 150, "joinDate": "2022", "avatar": "/assets/dummy/a1.jpg"},
    {"username": "user_2", "name": "Elena Vance", "points": 12450, "readings": 180, "reviews": 95, "joinDate": "2023", "avatar": "/assets/dummy/a2.jpg"},
    {"username": "user_3", "name": "Julian Mars", "points": 11200, "readings": 150, "reviews": 80, "joinDate": "2021", "avatar": "/assets/dummy/a3.jpg"},
    {"username": "user_4", "name": "Sophia Reed", "points": 9420, "readings": 124, "reviews": 82, "joinDate": "2023", "avatar": "/assets/dummy/a4.jpg"},
    {"username": "user_5", "name": "David Chen", "points": 8950, "readings": 118, "reviews": 105, "joinDate": "2022", "avatar": "/assets/dummy/a5.jpg"},
    {"username": "user_6", "name": "Isabella Rossi", "points": 7600, "readings": 92, "reviews": 45, "joinDate": "2023", "avatar": "/assets/dummy/a6.jpg"},
    {"username": "user_7", "name": "Lucas Meyer", "points": 6210, "readings": 85, "reviews": 30, "joinDate": "2022", "avatar": "/assets/dummy/a7.jpg"},
    {"username": "user_8", "name": "Amara Okafor", "points": 5400, "readings": 74, "reviews": 62, "joinDate": "2024", "avatar": "/assets/dummy/a8.jpg"},
    {"username": "user_9", "name": "Kenji Sato", "points": 4800, "readings": 60, "reviews": 25, "joinDate": "2023", "avatar": "/assets/dummy/a9.jpg"},
]


# --------------------
# SUPERUSER
# --------------------
def create_superuser():
    User = get_user_model()

    if not User.objects.filter(username="admin").exists():
        admin_user = User.objects.create_superuser(
            username="admin",
            email="admin@gmail.com",
            password="admin123"
        )
        admin_user.role = "admin"
        admin_user.save(update_fields=["role"])
        print("✅ Superuser created: admin / admin123")
    else:
        print("⚠️ Superuser already exists")


# --------------------
# COPY IMAGE FROM STATIC
# --------------------
def get_image(img_path):
    filename = os.path.basename(img_path)
    src = STATIC_DUMMY_DIR / filename
    if src.exists():
        with open(src, "rb") as f:
            return f.read(), filename
    print(f"❌ Image not found: {src}")
    return None, None


# --------------------
# SEED GENRES + BOOKS
# --------------------
def seed_books():
    for data in BOOKS_DATA:

        genre_obj, _ = Genre.objects.get_or_create(
            name=data["genre"],
            defaults={"slug": data["genre"].lower().replace(" ", "-")}
        )

        book, created = Book.objects.update_or_create(
            id=data["id"],
            defaults={
                "title": data["title"],
                "author": data["author"],
                "price": data["price"],
                "pages": data["pages"],
                "rating": data["rating"],
                "published_date": data["published"],
                "description": data["desc"],
                "genre": genre_obj,
            }
        )

        img_bytes, filename = get_image(data["img"])

        if not img_bytes:
            print("❌ Image failed:", data["img"])
        else:
            print("✅ Image loaded:", filename)
            book.cover_img.save(filename, ContentFile(img_bytes))
            print("💾 Saved to model")

        Inventory.objects.update_or_create(
            book=book,
            defaults={
                "isbn": f"978-{data['id']:04d}-{hash(data['title']) % 10000:04d}",
                "sku": f"SKU-{data['id']:04d}",
                "stock": 25,
                "max_stock": 100,
            }
        )


# --------------------
# SEED USERS
# --------------------
def seed_users():
    User = get_user_model()

    for data in USERS_DATA:

        user, created = User.objects.get_or_create(
            username=data["username"],
            defaults={
                "email": f'{data["username"]}@gmail.com',
            }
        )

        img_bytes, filename = get_image(data["avatar"])
        if img_bytes and hasattr(user, "avatar"):
            user.avatar.save(filename, ContentFile(img_bytes))

        user.save()

        print(("✅ Created" if created else "🔄 Updated") + f": {user.username}")


# --------------------
# RUN
# --------------------
if __name__ == "__main__":
    create_superuser()
    seed_books()
    seed_users()
    print("🎉 Seeding done successfully!")