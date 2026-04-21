from django.urls import path

from customer.views import login, logout, me, register, update_profile

urlpatterns = [
    path('auth/register/', register, name='register'),
    path("auth/login/", login, name="auth-login"),
    path("auth/logout/", logout, name="auth-logout"),
    path("auth/me/", me, name="auth-me"),
    path("auth/profile/", update_profile, name="auth-profile"),
]