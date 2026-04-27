from rest_framework import serializers
from .models import Project, ProjectDocument, ProjectImage, ProjectUpdate, SavedProject


class ProjectImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectImage
        fields = ["id", "image", "caption", "order"]


class ProjectDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectDocument
        fields = ["id", "title", "file", "doc_type", "created_at"]


class ProjectListSerializer(serializers.ModelSerializer):
    entrepreneur_name = serializers.CharField(source="entrepreneur.full_name", read_only=True)
    funding_percentage = serializers.FloatField(read_only=True)

    class Meta:
        model = Project
        fields = [
            "id", "title", "slug", "category", "cover_image",
            "funding_goal", "amount_raised", "funding_percentage",
            "country", "state", "status", "entrepreneur_name", "created_at",
        ]


class ProjectDetailSerializer(serializers.ModelSerializer):
    entrepreneur_name = serializers.CharField(source="entrepreneur.full_name", read_only=True)
    entrepreneur_id = serializers.UUIDField(source="entrepreneur.id", read_only=True)
    funding_percentage = serializers.FloatField(read_only=True)
    images = ProjectImageSerializer(many=True, read_only=True)
    documents = ProjectDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            "id", "title", "slug", "category", "description",
            "problem_statement", "solution", "impact",
            "funding_goal", "amount_raised", "funding_percentage", "min_contribution",
            "country", "state", "city", "status", "cover_image", "video_url",
            "entrepreneur_name", "entrepreneur_id",
            "images", "documents",
            "rejection_reason", "reviewed_at", "created_at", "updated_at",
        ]


class ProjectCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "title", "category", "description", "problem_statement",
            "solution", "impact", "funding_goal", "min_contribution",
            "country", "state", "city", "cover_image", "video_url",
        ]

    def validate_funding_goal(self, value):
        if value <= 0:
            raise serializers.ValidationError("Funding goal must be greater than zero.")
        return value


class ProjectUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = [
            "title", "category", "description", "problem_statement",
            "solution", "impact", "funding_goal", "min_contribution",
            "country", "state", "city", "cover_image", "video_url",
        ]


class ProjectProgressUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProjectUpdate
        fields = ["id", "title", "body", "is_public", "created_at"]
        read_only_fields = ["id", "created_at"]
