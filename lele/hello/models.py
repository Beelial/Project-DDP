from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class CartItem(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product_id = models.CharField(max_length=100)
    name = models.CharField(max_length=200)
    price = models.IntegerField()
    quantity = models.IntegerField(default=1)

    def subtotal(self):
        return self.price * self.quantity

from django.db import models
from django.contrib.auth.models import User

class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    total = models.IntegerField()
    method = models.CharField(max_length=50)
    status = models.CharField(max_length=30, default='BERHASIL')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Order #{self.id} - {self.user.username}'
        
class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        related_name='items',
        on_delete=models.CASCADE
    )
    product_name = models.CharField(max_length=100)
    price = models.IntegerField()
    quantity = models.IntegerField()

    @property
    def subtotal(self):
        return self.price * self.quantity

    def __str__(self):
        return self.product_name
