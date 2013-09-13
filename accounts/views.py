from django.contrib.auth import get_user_model
from django.views.generic.base import View
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.core.urlresolvers import reverse
from accounts.forms import RegisterForm


class ProfileView(View):
    template_name = "accounts/profile.html"

    def get(self, request, *args, **kwargs):
        return render(request, self.template_name)


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

            return HttpResponseRedirect(reverse('authtools:login'))

        return render(request, self.template_name, {'form': form})
