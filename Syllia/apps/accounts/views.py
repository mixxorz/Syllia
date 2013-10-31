from django.contrib.auth import get_user_model
from django.contrib.auth.forms import PasswordChangeForm
from django.contrib import messages
from django.views.generic.base import View
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_protect
from django.contrib.auth.decorators import login_required
from django.http import Http404

from Syllia.apps.accounts.forms import RegisterForm, ProfileForm


class RegisterView(View):
    template_name = "accounts/register.html"
    form_class = RegisterForm

    def get(self, request, *args, **kwargs):
        form = RegisterForm()
        return render(request, self.template_name, {'form': form})

    def post(self, request, *args, **kwargs):
        form = RegisterForm(request.POST)

        if form.is_valid():
            user = get_user_model().objects.create_user(
                form.cleaned_data['email'], form.cleaned_data['password'])

            user.name = form.cleaned_data['name']
            user.save()

            return redirect('authtools:login')

        return render(request, self.template_name, {'form': form})


@csrf_protect
@login_required
def update_profile(request):
    if request.method == "POST":
        form = ProfileForm(request.POST)

        if form.is_valid():
            current_user = get_user_model().objects.get(
                email=request.user.email)

            current_user.name = form.cleaned_data['name']
            current_user.save()

            current_user.faculty.department = form.cleaned_data['department']
            current_user.faculty.save()

            messages.success(request, 'Your profile was updated')
            return redirect('index')

        messages.error(request, 'Something went wrong')
        request.session['profile_form'] = form
        return redirect('index')

    raise Http404


@csrf_protect
@login_required
def change_password(request):
    if request.method == "POST":
        form = PasswordChangeForm(user=request.user, data=request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Your password has been changed')
            return redirect('index')

        messages.error(request, 'Something went wrong')
        request.session['change_password_form'] = form
        return redirect('index')

    raise Http404
