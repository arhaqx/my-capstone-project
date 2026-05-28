from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('superadmin', 'Superadmin'),
        ('admin', 'Admin'),
        ('user', 'User'),
    )

    role = models.CharField(max_length=15, choices=ROLE_CHOICES, default='user')

    @property
    def is_superadmin(self):
        return self.role == 'superadmin'

    @property
    def is_admin_or_higher(self):
        return self.role in ['admin', 'superadmin']