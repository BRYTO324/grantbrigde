from django.urls import path
from . import views

urlpatterns = [
    path("initiate/", views.initiate_funding_view, name="funding-initiate"),
    path("webhook/flutterwave/", views.flutterwave_webhook, name="funding-webhook"),
    path("transactions/", views.my_transactions, name="my-transactions"),
    path("transactions/<uuid:pk>/", views.transaction_detail, name="transaction-detail"),
    path("payouts/", views.list_payouts, name="payout-list"),
    path("payouts/<uuid:project_id>/create/", views.create_payout_view, name="payout-create"),
]
