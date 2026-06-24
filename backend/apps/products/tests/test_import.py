import os
import pytest
import tempfile
from django.core.management import call_command
from django.core.management.base import CommandError
from apps.products.models import Product

@pytest.mark.django_db
def test_import_products_csv():
    # 1. Create a mock CSV dataset
    with tempfile.NamedTemporaryFile(mode='w+', suffix='.csv', delete=False) as f:
        f.write("name,description,category,tags\n")
        f.write("Test Phone,A great test phone,Smartphones,\"5g, flagship\"\n")
        f.write("Test Case,Slim case,Back Covers,slim\n")
        temp_name = f.name

    try:
        # 2. Run the import command
        call_command('import_products', file=temp_name)

        # 3. Check database counts and parsed values
        products = Product.objects.all().order_by('id')
        assert products.count() == 2
        assert products[0].product_name == "Test Phone"
        assert products[0].category == "Smartphones"
        assert "5g" in products[0].tags
        assert "flagship" in products[0].tags
        assert products[1].product_name == "Test Case"
        assert "slim" in products[1].tags

        # 4. Test database appends
        with tempfile.NamedTemporaryFile(mode='w+', suffix='.csv', delete=False) as f2:
            f2.write("name,category\n")
            f2.write("New Charger,Chargers\n")
            temp_name_2 = f2.name

        try:
            call_command('import_products', file=temp_name_2, append=True)
            assert Product.objects.count() == 3
        finally:
            if os.path.exists(temp_name_2):
                os.remove(temp_name_2)
    finally:
        if os.path.exists(temp_name):
            os.remove(temp_name)

@pytest.mark.django_db
def test_import_products_missing_headers():
    # Create invalid CSV file
    with tempfile.NamedTemporaryFile(mode='w+', suffix='.csv', delete=False) as f:
        f.write("description,tags\n")
        f.write("Missing name and category,slim\n")
        temp_name = f.name

    try:
        with pytest.raises(CommandError):
            call_command('import_products', file=temp_name)
    finally:
        if os.path.exists(temp_name):
            os.remove(temp_name)
