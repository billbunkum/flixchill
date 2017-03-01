from django.shortcuts import render, redirect
from django.contrib import messages

# from .forms import UserRegistrationForm
from .forms import RegistrationForm
# from django.template import RequestContext

def register(request):
    if request.method == "POST":
        form = RegistrationForm(request.POST)
        # form = UserRegistrationForm(request.POST)

        if form.is_valid():
            new_user = form.save(commit=False)
            #need to clean data before persisting to db
            new_user.set_password(form.cleaned_data["password"])
            new_user.save()

            messages.success(request, 'Congrats! You now exist.')

            #heading to accounts.urls for 'login' endpoint
            return redirect('accounts:login')

    else:
        form = RegistrationForm
        # form = UserRegistrationForm

    context = {
        "form": form,
    }

    return render(request, "accounts/register.html", context)