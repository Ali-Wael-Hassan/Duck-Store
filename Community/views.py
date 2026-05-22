from django.views import View
from django.shortcuts import render
from django.db.models import Sum
from django.core.paginator import Paginator
from django.http import JsonResponse

from Authentication.models import User


class CommunityView(View):
    template_name = 'Community/community.html'

    def get(self, request, *args, **kwargs):
        all_users = list(User.objects.all().order_by('-points'))

        # ---------- PODIUM ----------
        top_three = all_users[:3]

        podium = []

        if len(top_three) > 0:
            podium.append({
                'user': top_three[0],
                'rank': 1,
                'slot': 'podium__card--1'
            })

        if len(top_three) > 1:
            podium.append({
                'user': top_three[1],
                'rank': 2,
                'slot': 'podium__card--2'
            })

        if len(top_three) > 2:
            podium.append({
                'user': top_three[2],
                'rank': 3,
                'slot': 'podium__card--3'
            })

        # ---------- ANALYTICS ----------
        total_points = User.objects.aggregate(
            total=Sum('points')
        )['total'] or 0

        total_books = User.objects.aggregate(
            total=Sum('readings')
        )['total'] or 0

        # ---------- PAGINATION ----------
        paginator = Paginator(all_users[3:], 10)
        page_number = request.GET.get('page')
        scholars_page = paginator.get_page(page_number)

        context = {
            'podium': podium,
            'scholars': scholars_page,
            'total_members': len(all_users),
            'total_books_k': round(total_books / 1000, 1),
            'total_points_m': round(total_points / 1_000_000, 1),
        }

        return render(request, self.template_name, context)