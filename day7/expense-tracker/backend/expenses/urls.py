from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TransactionViewSet, dashboard_summary

router = DefaultRouter()
router.register(
    "transactions",
    TransactionViewSet,
    basename="transaction",
)

urlpatterns = [
    path("", include(router.urls)),
    path("summary/", dashboard_summary, name="dashboard-summary"),
]