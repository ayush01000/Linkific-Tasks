from django.db import models


class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ("income", "Income"),
        ("spend", "Spend"),
        ("saving", "Saving"),
    ]

    title = models.CharField(max_length=120)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    transaction_type = models.CharField(
        max_length=10,
        choices=TRANSACTION_TYPES,
    )
    category = models.CharField(max_length=80, blank=True)
    date = models.DateField()
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-date", "-created_at"]

    def __str__(self):
        return f"{self.title} - {self.amount}"