from django.contrib import admin
from .models import Project, ProjectDocument, ProjectImage, ProjectUpdate, SavedProject


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["title", "entrepreneur", "status", "funding_goal", "amount_raised", "created_at"]
    list_filter = ["status", "category"]
    search_fields = ["title", "entrepreneur__email"]
    readonly_fields = ["slug", "amount_raised", "reviewed_at"]


admin.site.register(ProjectDocument)
admin.site.register(ProjectImage)
admin.site.register(ProjectUpdate)
admin.site.register(SavedProject)
