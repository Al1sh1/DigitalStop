from decimal import Decimal

from django.db import migrations, models


def seed_phone_products(apps, schema_editor):
    Brand = apps.get_model('brand', 'Brand')
    Product = apps.get_model('product', 'Product')

    brand_rows = [
        {
            'name': 'Apple',
            'country': 'USA',
            'description': 'Premium smartphones and ecosystem devices.',
        },
        {
            'name': 'Samsung',
            'country': 'South Korea',
            'description': 'Flagship and mid-range Android smartphones.',
        },
        {
            'name': 'Google',
            'country': 'USA',
            'description': 'Pixel phones with clean Android and AI features.',
        },
        {
            'name': 'Xiaomi',
            'country': 'China',
            'description': 'Performance-focused phones with strong value.',
        },
        {
            'name': 'Nothing',
            'country': 'United Kingdom',
            'description': 'Design-driven Android smartphones.',
        },
    ]

    brands = {}
    for row in brand_rows:
        brand, _ = Brand.objects.update_or_create(
            name=row['name'],
            defaults={
                'country': row['country'],
                'description': row['description'],
            },
        )
        brands[row['name']] = brand

    product_rows = [
        {
            'name': 'iPhone 16 Pro',
            'description': '6.3-inch display, A18 Pro chip, triple camera system.',
            'price': Decimal('1299.00'),
            'image_url': 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1000&q=80',
            'brand': 'Apple',
        },
        {
            'name': 'iPhone 16',
            'description': '6.1-inch display, fast performance and all-day battery.',
            'price': Decimal('999.00'),
            'image_url': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80',
            'brand': 'Apple',
        },
        {
            'name': 'Samsung Galaxy S25 Ultra',
            'description': 'Top-tier camera, S Pen support and premium AMOLED display.',
            'price': Decimal('1249.00'),
            'image_url': 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1000&q=80',
            'brand': 'Samsung',
        },
        {
            'name': 'Samsung Galaxy A56',
            'description': 'Balanced mid-range phone with great battery life.',
            'price': Decimal('469.00'),
            'image_url': 'https://images.unsplash.com/photo-1583573636246-18cb2246697f?auto=format&fit=crop&w=1000&q=80',
            'brand': 'Samsung',
        },
        {
            'name': 'Google Pixel 9 Pro',
            'description': 'Excellent computational photography and smooth Android experience.',
            'price': Decimal('1099.00'),
            'image_url': 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=1000&q=80',
            'brand': 'Google',
        },
        {
            'name': 'Google Pixel 8a',
            'description': 'Affordable Pixel with AI features and reliable camera.',
            'price': Decimal('549.00'),
            'image_url': 'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=1000&q=80',
            'brand': 'Google',
        },
        {
            'name': 'Xiaomi 14T Pro',
            'description': 'High performance, fast charging and Leica-tuned camera.',
            'price': Decimal('799.00'),
            'image_url': 'https://images.unsplash.com/photo-1567581935884-3349723552ca?auto=format&fit=crop&w=1000&q=80',
            'brand': 'Xiaomi',
        },
        {
            'name': 'Nothing Phone (3a)',
            'description': 'Distinctive glyph design with clean Nothing OS.',
            'price': Decimal('449.00'),
            'image_url': 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&w=1000&q=80',
            'brand': 'Nothing',
        },
    ]

    for row in product_rows:
        Product.objects.update_or_create(
            name=row['name'],
            brand=brands[row['brand']],
            defaults={
                'description': row['description'],
                'price': row['price'],
                'image_url': row['image_url'],
            },
        )

    Product.objects.filter(image_url='').update(
        image_url='https://placehold.co/600x420?text=Phone'
    )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='image_url',
            field=models.URLField(blank=True, default='', max_length=1000),
        ),
        migrations.RunPython(seed_phone_products, noop_reverse),
    ]
