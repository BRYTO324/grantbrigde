# Shared utility services used across apps


def paginate_queryset(queryset, request, serializer_class, paginator):
    page = paginator.paginate_queryset(queryset, request)
    if page is not None:
        return paginator.get_paginated_response(serializer_class(page, many=True).data)
    return serializer_class(queryset, many=True).data
