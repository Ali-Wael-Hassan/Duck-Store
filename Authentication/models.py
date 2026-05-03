from django.db import models
from django.contrib.auth.models import AbstractUser

class Rank(models.Model):
    name = models.CharField(max_length=100)
    min_points = models.IntegerField()
    max_points = models.IntegerField()
    icon = models.CharField(max_length=10)
    
    def __str__(self):
        return self.name

class User(AbstractUser):
    """
    - 'id' -> built-in PK
    - 'uname' -> built-in 'username'
    - 'password' -> built-in 'password' (hashed automatically)
    - 'last_login' -> built-in 'last_login'
    - 'join_date' -> built-in 'date_joined'
    """
    rank = models.ForeignKey(Rank, on_delete=models.SET_NULL, null=True, blank=True)
    name = models.CharField(max_length=150)
    email = models.EmailField(max_length=255, unique=True)
    role = models.CharField(max_length=20, default='user')
    avatar = models.CharField(max_length=255, null=True, blank=True)
    points = models.IntegerField(default=0)
    readings = models.IntegerField(default=0)
    reviews = models.IntegerField(default=0)
    last_active = models.DateField(auto_now=True)
    session_id = models.CharField(max_length=100, null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.email})"
    