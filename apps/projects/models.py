from django.db import models
from django.conf import settings
from apps.common.models import TimeStampedModel


class ProjectStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PENDING_REVIEW = "pending_review", "Pending Review"
    APPROVED = "approved", "Approved"
    LIVE = "live", "Live"
    PARTIALLY_FUNDED = "partially_funded", "Partially Funded"
    FULLY_FUNDED = "fully_funded", "Fully Funded"
    PAYOUT_PENDING = "payout_pending", "Payout Pending"
    COMPLETED = "completed", "Completed"
    REJECTED = "rejected", "Rejected"
    SUSPENDED = "suspended", "Suspended"


class ProjectCategory(models.TextChoices):
    AGRICULTURE = "agriculture", "Agriculture"
    TECHNOLOGY = "technology", "Technology"
    HEALTH = "health", "Health"
    EDUCATION = "education", "Education"
    RETAIL = "retail", "Retail"
    MANUFACTURING = "manufacturing", "Manufacturing"
    SERVICES = "services", "Services"
    OTHER = "other", "Other"


class Project(TimeStampedModel):
    entrepreneur = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="projects"
    )
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=300, unique=True, blank=True)
    category = models.CharField(max_length=50, choices=ProjectCategory.choices, default=ProjectCategory.OTHER)
    description = models.TextField()
    problem_statement = models.TextField(blank=True)
    solution = models.TextField(blank=True)
    impact = models.TextField(blank=True)

    funding_goal = models.DecimalField(max_digits=14, decimal_places=2)
    amount_raised = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    min_contribution = models.DecimalField(max_digits=14, decimal_places=2, default=500)

    country = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    city = models.CharField(max_length=100, blank=True)

    status = models.CharField(max_length=30, choices=ProjectStatus.choices, default=ProjectStatus.DRAFT, db_index=True)

    cover_image = models.ImageField(upload_to="projects/covers/", null=True, blank=True)
    video_url = models.URLField(blank=True)

    # Admin review
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, null=True, blank=True,
        on_delete=models.SET_NULL, related_name="reviewed_projects"
    )
    reviewed_at = models.DateTimeField(null=True, blank=True)
    rejection_reason = models.TextField(blank=True)

    # Soft delete
    is_deleted = models.BooleanField(default=False)

    class Meta:
        db_table = "projects"
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["category"]),
            models.Index(fields=["entrepreneur"]),
            models.Index(fields=["country"]),
        ]

    def __str__(self):
        return self.title

    @property
    def funding_percentage(self):
        if self.funding_goal == 0:
            return 0
        return round((self.amount_raised / self.funding_goal) * 100, 2)

    @property
    def is_fully_funded(self):
        return self.amount_raised >= self.funding_goal


class ProjectDocument(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="documents")
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to="projects/documents/")
    doc_type = models.CharField(max_length=50, blank=True)  # business_plan, cac, etc.

    class Meta:
        db_table = "project_documents"


class ProjectImage(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="projects/images/")
    caption = models.CharField(max_length=255, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "project_images"
        ordering = ["order"]


class ProjectUpdate(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="updates")
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    body = models.TextField()
    is_public = models.BooleanField(default=True)

    class Meta:
        db_table = "updates"
        ordering = ["-created_at"]


class SavedProject(TimeStampedModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="saved_projects")
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name="saved_by")

    class Meta:
        db_table = "saved_projects"
        unique_together = [["user", "project"]]
