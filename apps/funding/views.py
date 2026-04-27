import json
from decimal import Decimal
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny

from apps.common.responses import success_response, error_response
from apps.common.pagination import StandardResultsPagination
from apps.projects.models import Project
from apps.projects.permissions import IsAdminUser
from .serializers import InitiateFundingSerializer, TransactionSerializer, PayoutSerializer
from .services import initiate_funding, process_webhook, create_payout_request
from .models import Transaction, Payout
from . import flutterwave


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def initiate_funding_view(request):
    serializer = InitiateFundingSerializer(data=request.data)
    if not serializer.is_valid():
        return error_response("Validation failed", serializer.errors)

    try:
        project = Project.objects.get(id=serializer.validated_data["project_id"])
    except Project.DoesNotExist:
        return error_response("Project not found.", status_code=status.HTTP_404_NOT_FOUND)

    try:
        result = initiate_funding(
            funder=request.user,
            project=project,
            amount=serializer.validated_data["amount"],
            currency=serializer.validated_data.get("currency", "NGN"),
        )
    except ValueError as e:
        return error_response(str(e))

    return success_response(result, "Payment initiated.", status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def flutterwave_webhook(request):
    """Receive and process Flutterwave webhook events."""
    signature = request.headers.get("verif-hash", "")

    # Verify webhook signature
    if not flutterwave.verify_webhook_signature(request.body, signature):
        return error_response("Invalid webhook signature.", status_code=status.HTTP_401_UNAUTHORIZED)

    try:
        payload = json.loads(request.body)
    except json.JSONDecodeError:
        return error_response("Invalid payload.", status_code=status.HTTP_400_BAD_REQUEST)

    process_webhook(payload)
    return success_response(message="Webhook received.")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_transactions(request):
    qs = Transaction.objects.filter(funder=request.user).select_related("project").order_by("-created_at")
    paginator = StandardResultsPagination()
    page = paginator.paginate_queryset(qs, request)
    return paginator.get_paginated_response(TransactionSerializer(page, many=True).data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def transaction_detail(request, pk):
    try:
        txn = Transaction.objects.select_related("project", "funder").get(id=pk, funder=request.user)
    except Transaction.DoesNotExist:
        return error_response("Transaction not found.", status_code=status.HTTP_404_NOT_FOUND)
    return success_response(TransactionSerializer(txn).data)


# Admin payout endpoints
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def create_payout_view(request, project_id):
    try:
        project = Project.objects.get(id=project_id)
    except Project.DoesNotExist:
        return error_response("Project not found.", status_code=status.HTTP_404_NOT_FOUND)
    try:
        payout = create_payout_request(project, request.user)
    except ValueError as e:
        return error_response(str(e))
    return success_response(PayoutSerializer(payout).data, "Payout queued.", status.HTTP_201_CREATED)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def list_payouts(request):
    qs = Payout.objects.select_related("project", "entrepreneur").order_by("-created_at")
    paginator = StandardResultsPagination()
    page = paginator.paginate_queryset(qs, request)
    return paginator.get_paginated_response(PayoutSerializer(page, many=True).data)
