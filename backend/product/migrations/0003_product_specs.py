from django.db import migrations, models


def seed_product_specs(apps, schema_editor):
    Product = apps.get_model('product', 'Product')

    specs_by_name = {
        'iPhone 16 Pro': {
            'Display': '6.3-inch OLED, 120Hz',
            'Chipset': 'Apple A18 Pro',
            'RAM': '8 GB',
            'Storage': '256 GB',
            'Rear Camera': '48MP + 12MP + 12MP',
            'Front Camera': '12MP',
            'Battery': '3582 mAh',
            'OS': 'iOS 18',
            'Connectivity': '5G, Wi-Fi 7, Bluetooth 5.3, USB-C',
        },
        'iPhone 16': {
            'Display': '6.1-inch OLED, 60Hz',
            'Chipset': 'Apple A18',
            'RAM': '8 GB',
            'Storage': '128 GB',
            'Rear Camera': '48MP + 12MP',
            'Front Camera': '12MP',
            'Battery': '3561 mAh',
            'OS': 'iOS 18',
            'Connectivity': '5G, Wi-Fi 7, Bluetooth 5.3, USB-C',
        },
        'Samsung Galaxy S25 Ultra': {
            'Display': '6.8-inch AMOLED, 120Hz',
            'Chipset': 'Snapdragon 8 Elite',
            'RAM': '12 GB',
            'Storage': '256 GB',
            'Rear Camera': '200MP + 50MP + 10MP + 50MP',
            'Front Camera': '12MP',
            'Battery': '5000 mAh',
            'OS': 'Android 15',
            'Connectivity': '5G, Wi-Fi 7, Bluetooth 5.4, USB-C',
        },
        'Samsung Galaxy A56': {
            'Display': '6.7-inch AMOLED, 120Hz',
            'Chipset': 'Exynos 1580',
            'RAM': '8 GB',
            'Storage': '256 GB',
            'Rear Camera': '50MP + 12MP + 5MP',
            'Front Camera': '12MP',
            'Battery': '5000 mAh',
            'OS': 'Android 15',
            'Connectivity': '5G, Wi-Fi 6, Bluetooth 5.3, USB-C',
        },
        'Google Pixel 9 Pro': {
            'Display': '6.3-inch OLED, 120Hz',
            'Chipset': 'Google Tensor G4',
            'RAM': '16 GB',
            'Storage': '256 GB',
            'Rear Camera': '50MP + 48MP + 48MP',
            'Front Camera': '42MP',
            'Battery': '4700 mAh',
            'OS': 'Android 15',
            'Connectivity': '5G, Wi-Fi 7, Bluetooth 5.3, USB-C',
        },
        'Google Pixel 8a': {
            'Display': '6.1-inch OLED, 120Hz',
            'Chipset': 'Google Tensor G3',
            'RAM': '8 GB',
            'Storage': '128 GB',
            'Rear Camera': '64MP + 13MP',
            'Front Camera': '13MP',
            'Battery': '4492 mAh',
            'OS': 'Android 14',
            'Connectivity': '5G, Wi-Fi 6E, Bluetooth 5.3, USB-C',
        },
        'Xiaomi 14T Pro': {
            'Display': '6.67-inch AMOLED, 144Hz',
            'Chipset': 'MediaTek Dimensity 9300+',
            'RAM': '12 GB',
            'Storage': '512 GB',
            'Rear Camera': '50MP + 50MP + 12MP',
            'Front Camera': '32MP',
            'Battery': '5000 mAh',
            'OS': 'Android 14 (HyperOS)',
            'Connectivity': '5G, Wi-Fi 7, Bluetooth 5.4, USB-C',
        },
        'Nothing Phone (3a)': {
            'Display': '6.7-inch AMOLED, 120Hz',
            'Chipset': 'Snapdragon 7s Gen 3',
            'RAM': '12 GB',
            'Storage': '256 GB',
            'Rear Camera': '50MP + 50MP + 8MP',
            'Front Camera': '32MP',
            'Battery': '5000 mAh',
            'OS': 'Android 15 (Nothing OS)',
            'Connectivity': '5G, Wi-Fi 6, Bluetooth 5.4, USB-C',
        },
        'iphone 12': {
            'Display': '6.1-inch OLED, 60Hz',
            'Chipset': 'Apple A14 Bionic',
            'RAM': '4 GB',
            'Storage': '128 GB',
            'Rear Camera': '12MP + 12MP',
            'Front Camera': '12MP',
            'Battery': '2815 mAh',
            'OS': 'iOS',
            'Connectivity': '5G, Wi-Fi 6, Bluetooth 5.0, Lightning',
        },
    }

    for name, specs in specs_by_name.items():
        Product.objects.filter(name=name).update(specs=specs)

    fallback_specs = {
        'Display': 'Unknown',
        'Chipset': 'Unknown',
        'RAM': 'Unknown',
        'Storage': 'Unknown',
        'Battery': 'Unknown',
        'OS': 'Unknown',
    }

    for product in Product.objects.all():
        if not product.specs:
            product.specs = fallback_specs
            product.save(update_fields=['specs'])


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('product', '0002_product_image_seed_phones'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='specs',
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.RunPython(seed_product_specs, noop_reverse),
    ]
