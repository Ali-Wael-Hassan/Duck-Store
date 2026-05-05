from django.shortcuts import render
from Authentication.models import User 
from django.db.models import Sum
from django.http import JsonResponse

def community_view(request):
    all_users = User.objects.all().order_by('-points')

    # Podium logic
    top_three = all_users[:3]
    podium = []
    if len(top_three) >= 3:
        podium = [
            {'user': top_three[1], 'rank': 2, 'slot': 'podium__card--2'},
            {'user': top_three[0], 'rank': 1, 'slot': 'podium__card--1'},
            {'user': top_three[2], 'rank': 3, 'slot': 'podium__card--3'}
        ]

    # Global Stats
    total_points = all_users.aggregate(Sum('points'))['points__sum'] or 0
    total_books = all_users.aggregate(Sum('readings'))['readings__sum'] or 0

    return render(request, 'Community/community.html', {
        'podium': podium,
        'scholars': all_users,
        'total_members': all_users.count(),
        'total_books_k': round(total_books / 1000, 1),
        'total_points_m': round(total_points / 1000000, 1),
    })
def search_scholars(request):
    # Get the search term from the URL (e.g., ?q=moaz)
    query = request.GET.get('q', '')
    
    if query:
        # Search the 'name' or 'username' fields in your DB
        results = User.objects.filter(name__icontains=query).order_by('-points')[:10]
    else:
        results = User.objects.all().order_by('-points')[:10]

    # Convert the database objects into a list of dictionaries (JSON)
    data = []
    for user in results:
        data.append({
            'name': user.name,
            'avatar': user.avatar if user.avatar else '/assets/dummy/default.jpg',
            'points': user.points,
            'readings': user.readings,
            'reviews': user.reviews,
            'rank_name': user.rank.name if user.rank else "Scholar"
        })

    return JsonResponse({'status': 'success', 'users': data})