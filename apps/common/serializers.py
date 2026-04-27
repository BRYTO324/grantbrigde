from rest_framework import serializers


class EmptySerializer(serializers.Serializer):
    """Placeholder serializer for endpoints with no request body."""
    pass
