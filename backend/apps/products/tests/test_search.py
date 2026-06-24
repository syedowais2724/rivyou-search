import pytest
from unittest.mock import patch
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from apps.products.models import Product

@pytest.fixture(autouse=True)
def mock_django_rq():
    with patch('django_rq.enqueue') as mock_enqueue:
        yield mock_enqueue

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def auth_user():
    user = User.objects.create_user(username="testuser", password="testpassword123")
    return user

@pytest.fixture
def authenticated_client(api_client, auth_user):
    api_client.force_authenticate(user=auth_user)
    return api_client

@pytest.fixture
def sample_products(db):
    p1 = Product.objects.create(
        product_name="Super Flagship S24",
        product_description="Awesome modern smartphone with a glass display",
        category="Smartphones",
        tags=["5g", "camera"]
    )
    p2 = Product.objects.create(
        product_name="Ultra Charger Pro",
        product_description="High-speed smartphone charger adaptor",
        category="Chargers",
        tags=["fast-charging", "smartphone"]
    )
    p3 = Product.objects.create(
        product_name="Armor Protective Cover",
        product_description="Tough smartphone shell protective sleeve",
        category="Back Covers",
        tags=["protective", "smartphone"]
    )
    p4 = Product.objects.create(
        product_name="USB-C Travel Adapter",
        product_description="Simple basic wall charger block",
        category="Chargers",
        tags=["usb-c"]
    )
    return [p1, p2, p3, p4]

@pytest.mark.django_db
def test_search_ranking_order(authenticated_client, sample_products):
    """
    1. 'smartphone' query -> Tier 1 results (Smartphones) always come before Tier 2 (chargers/covers with smartphone tag)
    """
    url = reverse('product-search')
    response = authenticated_client.get(url, {'q': 'smartphone'})
    assert response.status_code == 200
    results = response.data['results']
    
    assert len(results) >= 3
    # First item should be Smartphones (Category Match -> Tier 1)
    assert results[0]['category'] == 'Smartphones'
    assert results[0]['rank_reason'] == 'Category match'
    
    # Second and third items should be Chargers/Back Covers matching tag "smartphone" (Tier 2)
    assert results[1]['category'] in ['Chargers', 'Back Covers']
    assert results[1]['rank_reason'].startswith('Tag match')
    
    assert results[2]['category'] in ['Chargers', 'Back Covers']
    assert results[2]['rank_reason'].startswith('Tag match')
    
    # Scores should be in descending order
    scores = [r['relevance_score'] for r in results]
    assert scores == sorted(scores, reverse=True)

@pytest.mark.django_db
def test_search_fuzzy_typo(authenticated_client, sample_products):
    """
    2. 'smartphne' (typo) -> fuzzy match still returns smartphones (Tier 1 category match)
    """
    url = reverse('product-search')
    response = authenticated_client.get(url, {'q': 'smartphne'})
    assert response.status_code == 200
    results = response.data['results']
    
    assert len(results) > 0
    # The fuzzy match on "Smartphones" category should trigger Tier 1
    assert results[0]['category'] == 'Smartphones'
    assert results[0]['rank_reason'] == 'Category match'
    assert response.data['suggested_query'] == 'smartphone'

@pytest.mark.django_db
def test_search_category_filter(authenticated_client, sample_products):
    """
    3. category_filter="Chargers" narrows results correctly
    """
    url = reverse('product-search')
    response = authenticated_client.get(url, {'q': 'smartphone', 'category_filter': 'Chargers'})
    assert response.status_code == 200
    results = response.data['results']
    
    # Only chargers should be returned
    assert len(results) > 0
    for r in results:
        assert r['category'] == 'Chargers'

@pytest.mark.django_db
def test_search_empty_query(authenticated_client, sample_products):
    """
    4. Empty query -> returns 400 error
    """
    url = reverse('product-search')
    response = authenticated_client.get(url, {'q': ''})
    assert response.status_code == 400
    
    response_missing = authenticated_client.get(url)
    assert response_missing.status_code == 400

@pytest.mark.django_db
def test_search_pagination(authenticated_client, sample_products):
    """
    5. Pagination: page=2 returns different results than page=1
    """
    url = reverse('product-search')
    
    # Page 1
    response_p1 = authenticated_client.get(url, {'q': 'smartphone', 'limit': 1, 'page': 1})
    assert response_p1.status_code == 200
    results_p1 = response_p1.data['results']
    assert len(results_p1) == 1
    
    # Page 2
    response_p2 = authenticated_client.get(url, {'q': 'smartphone', 'limit': 1, 'page': 2})
    assert response_p2.status_code == 200
    results_p2 = response_p2.data['results']
    assert len(results_p2) == 1
    
    # Products returned must be different
    assert results_p1[0]['id'] != results_p2[0]['id']
