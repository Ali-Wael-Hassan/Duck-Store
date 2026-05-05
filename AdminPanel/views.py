from django.shortcuts import render, redirect
from django.contrib import messages
from .models import GamificationConfig
from .forms import GamificationConfigForm

def gamification_admin_view(request):
    # gets the single config object or creates it
    config, created = GamificationConfig.objects.get_or_create(pk=1)

    if request.method == 'POST':
        # deletes current record so next load uses model defaults
        if 'reset' in request.POST:
            config.delete()
            messages.info(request, "Configuration reset to default values.")
            return redirect('gamification_admin')

        # updates the database with form data
        form = GamificationConfigForm(request.POST, instance=config)
        if form.is_valid():
            form.save()
            messages.success(request, "Configuration saved successfully!")
            return redirect('gamification_admin')
    else:
        form = GamificationConfigForm(instance=config)

    return render(request, 'admin/gamification_setup.html', {'form': form})
