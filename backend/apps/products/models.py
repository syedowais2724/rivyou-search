from django.db import models
from django.conf import settings

if settings.DATABASES['default']['ENGINE'] == 'django.db.backends.postgresql':
    from django.contrib.postgres.fields import ArrayField
    from django.contrib.postgres.indexes import GinIndex

    class Product(models.Model):
        product_name = models.CharField(max_length=255, db_index=True)
        product_description = models.TextField()
        category = models.CharField(max_length=100, db_index=True)
        tags = ArrayField(models.CharField(max_length=50), default=list)
        created_at = models.DateTimeField(auto_now_add=True)

        class Meta:
            indexes = [
                GinIndex(fields=['tags'], name='product_tags_gin'),
            ]

        def __str__(self):
            return self.product_name
else:
    class Product(models.Model):
        product_name = models.CharField(max_length=255, db_index=True)
        product_description = models.TextField()
        category = models.CharField(max_length=100, db_index=True)
        tags = models.JSONField(default=list)
        created_at = models.DateTimeField(auto_now_add=True)

        class Meta:
            pass

        def __str__(self):
            return self.product_name
