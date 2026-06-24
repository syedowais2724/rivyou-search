from django.contrib.auth.models import User
from django_rq import job
from .models import SearchHistory

@job
def log_search_query(user_id, query, results_count):
    """
    Creates a SearchHistory log for the given user_id and query asynchronously.
    """
    try:
        user = User.objects.get(pk=user_id)
        SearchHistory.objects.create(
            user=user,
            query=query.strip(),
            results_count=results_count
        )
    except User.DoesNotExist:
        pass
