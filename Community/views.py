from django.views import View
from django.shortcuts import render
from django.db.models import Sum
from Authentication.models import User
from django.http import JsonResponse
class CommunityView(View):
    template_name = 'Community/community.html'

    def get(self, request, *args, **kwargs):
        all_users = User.objects.all().order_by('-points')

        # Calculate Podium logic
        top_three = all_users[:3]
        podium = []
        if len(top_three) >= 3:
            podium = [
                {'user': top_three[1], 'rank': 2, 'slot': 'podium__card--2'},
                {'user': top_three[0], 'rank': 1, 'slot': 'podium__card--1'},
                {'user': top_three[2], 'rank': 3, 'slot': 'podium__card--3'}
            ]

        # Analytics
        total_points = all_users.aggregate(Sum('points'))['points__sum'] or 0
        total_books = all_users.aggregate(Sum('readings'))['readings__sum'] or 0

        context = {
            'podium': podium,
            'scholars': all_users,
            'total_members': all_users.count(),
            'total_books_k': round(total_books / 1000, 1),
            'total_points_m': round(total_points / 1000000, 1),
        }
        
        return render(request, self.template_name, context)
class ScholarSearchView(View):
    def get(self, request, *args, **kwargs):
        query = request.GET.get('q', '')
        
        if query:
            results = User.objects.filter(name__icontains=query).order_by('-points')[:10]
        else:
            results = User.objects.all().order_by('-points')[:10]

        data = [
            {
                'id': user.id,
                'name': user.name,
                'avatar': user.avatar if user.avatar else '/assets/dummy/default.jpg',
                'points': user.points,
                'readings': user.readings,
                'reviews': user.reviews,
                'rank_name': user.rank.name if user.rank else "Scholar"
            } for user in results
        ]

        return JsonResponse({'status': 'success', 'users': data})