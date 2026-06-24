import csv
import os
from django.core.management.base import BaseCommand, CommandError
from apps.products.models import Product

class Command(BaseCommand):
    help = "Imports products from a CSV file into the PostgreSQL database."

    def add_arguments(self, parser):
        parser.add_argument('--file', type=str, required=True, help="Path to the CSV file")
        parser.add_argument('--append', action='store_true', help="Append products instead of clearing database first")

    def handle(self, *args, **options):
        file_path = options['file']
        append = options['append']

        if not os.path.exists(file_path):
            raise CommandError(f"CSV file not found at: {file_path}")

        if not append:
            self.stdout.write("Clearing existing products from the database...")
            Product.objects.all().delete()

        products = []
        try:
            with open(file_path, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                fieldnames = reader.fieldnames or []
                
                # Dynamic column mapping to support common headers
                name_col = next((col for col in fieldnames if col.lower().strip() in ['product_name', 'name']), None)
                desc_col = next((col for col in fieldnames if col.lower().strip() in ['product_description', 'description', 'desc']), None)
                cat_col = next((col for col in fieldnames if col.lower().strip() in ['category', 'cat']), None)
                tags_col = next((col for col in fieldnames if col.lower().strip() in ['tags', 'tag']), None)

                if not name_col:
                    raise CommandError("CSV file must contain a 'name' or 'product_name' column.")
                if not cat_col:
                    raise CommandError("CSV file must contain a 'category' column.")

                for row_idx, row in enumerate(reader, start=1):
                    name = (row[name_col] or '').strip()
                    desc = (row[desc_col] or '').strip() if desc_col else ""
                    category = (row[cat_col] or '').strip()
                    
                    if not name or not category:
                        self.stdout.write(self.style.WARNING(f"Skipping row {row_idx}: missing name or category"))
                        continue

                    # Parse tags
                    tags = []
                    if tags_col and row[tags_col]:
                        raw_tags = row[tags_col].strip()
                        # If tag list is in json brackets, strip them out
                        if raw_tags.startswith('[') and raw_tags.endswith(']'):
                            raw_tags = raw_tags[1:-1].replace('"', '').replace("'", "")
                        tags = [t.strip() for t in raw_tags.split(',') if t.strip()]

                    products.append(Product(
                        product_name=name,
                        product_description=desc,
                        category=category,
                        tags=tags
                    ))
        except Exception as e:
            raise CommandError(f"Error parsing CSV file: {str(e)}")

        if not products:
            self.stdout.write(self.style.WARNING("No products found in the CSV file to import."))
            return

        self.stdout.write(f"Seeding {len(products)} products into the database...")
        Product.objects.bulk_create(products)
        self.stdout.write(self.style.SUCCESS(f"Successfully imported {len(products)} products!"))
