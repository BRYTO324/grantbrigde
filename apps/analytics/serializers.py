from rest_framework import serializers


class EntrepreneurDashboardSerializer(serializers.Serializer):
    projects_submitted = serializers.IntegerField()
    total_raised = serializers.CharField()
    projects_by_status = serializers.ListField()


class FunderDashboardSerializer(serializers.Serializer):
    total_funded = serializers.CharField()
    projects_supported = serializers.IntegerField()
    transactions_count = serializers.IntegerField()


class AdminDashboardSerializer(serializers.Serializer):
    total_users = serializers.IntegerField()
    new_users_30d = serializers.IntegerField()
    pending_projects = serializers.IntegerField()
    gmv = serializers.CharField()
    platform_revenue = serializers.CharField()
    pending_payouts_amount = serializers.CharField()
    failed_payments = serializers.IntegerField()
