from django.urls import path
from . import views

urlpatterns = [
    # ============================================================
    # 1. AUTHENTICATION
    # ============================================================
    path("sign-in.html", views.login, name="login"),
    path("sign-up.html", views.signup, name="signup"),
    path("logout/", views.logout, name="logout"),
    path("api/check-session/", views.check_session, name="check_session"),

    # ============================================================
    # 2. STOREFRONT
    # ============================================================
    path("", views.home, name="home"),
    path("home.html", views.home, name="home_html"),
    path("store.html", views.catalog, name="catalog"),
    path("api/store/filter/", views.store_filter, name="store_filter"),
    
    path("book-view.html", views.book_detail, name="book_detail_html"), # to catch static links if any
    path("book/<int:book_id>/", views.book_detail, name="book_detail"),
    path("api/book/<int:book_id>/buy/", views.buy, name="buy_book"),
    path("api/book/<int:book_id>/borrow/", views.borrow, name="borrow_book"),
    path("api/book/<int:book_id>/review/", views.add_review, name="add_review"),

    # ============================================================
    # 3. USER ACCOUNT
    # ============================================================
    path("my-Books.html", views.my_books, name="my_books"),
    path("api/my-books/<str:filter_type>/", views.my_books_filter, name="my_books_filter"),
    
    path("user_profile.html", views.user_profile, name="user_profile"),
    path("api/profile/update-avatar/", views.update_avatar, name="update_avatar"),
    
    path("reward.html", views.rewards, name="rewards"),
    path("api/rewards/<int:reward_id>/redeem/", views.redeem, name="redeem_reward"),

    # ============================================================
    # 4. COMMUNITY
    # ============================================================
    path("community.html", views.leaderboard, name="community_leaderboard"),

    # ============================================================
    # 5. ADMIN / STAFF DASHBOARD
    # ============================================================
    path("dashboard.html", views.dashboard, name="dashboard_home"),
    
    path("Book-&-inventory.html", views.inventory_index, name="inventory_list"),
    path("api/dashboard/book/<int:book_id>/edit/", views.edit_book, name="edit_book"),
    
    path("Gamification_Admen.html", views.gamification_index, name="gamification_settings"),
    
    path("users_roles.html", views.users_roles, name="users_and_roles"),
    path("sales_refunds.html", views.sales_refunds, name="sales_refunds"),
    path("api/dashboard/users/<int:user_id>/role/", views.toggle_role, name="toggle_role")
]
