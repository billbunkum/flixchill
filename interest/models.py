from django.db import models

from django.contrib.auth.models import User

#important User info: id, email, name, date
class Film(models.Model):
    title = models.CharField(max_length=30, blank=True)
    genre = models.CharField(max_length=30, blank=True)
    director = models.CharField(max_length=30, blank=True)

    def __str__(self):
        return self.title

class Interest(models.Model):
    date = models.DateTimeField(auto_now_add=True)
    user = models.ForeignKey(User, null=True, blank=True)
    film = models.ForeignKey(Film, null=True, blank=True)
