from models.database import SessionLocal
from models.product import Product, Category

def seed():
    db = SessionLocal()
    
    # 1. Clean existing data
    db.query(Product).delete()
    db.query(Category).delete()
    db.commit()
    
    # 2. Add categories
    categories = {
        "Kitchenware": Category(name="Kitchenware", description="Best tools for your kitchen"),
        "Electronics": Category(name="Electronics", description="Quality home electronics"),
        "Beddings": Category(name="Beddings", description="Comfortable and stylish beddings"),
        "Carpets & Curtains": Category(name="Carpets & Curtains", description="Premium curtains and floor coverings")
    }
    db.add_all(categories.values())
    db.commit()
    
    # 3. Add sample products
    products = [
        # Kitchenware
        Product(
            title='Non-Stick Cookware Set',
            description='Premium 10-piece non-stick pots and pans set.',
            price=12500,
            image_url='/images/cookware.png',
            stock_quantity=15,
            category_id=categories["Kitchenware"].id
        ),
        Product(
            title='Electric Kettle (2.0L)',
            description='Fast boiling stainless steel electric kettle.',
            price=3500,
            image_url='/images/kettle.png',
            stock_quantity=25,
            category_id=categories["Kitchenware"].id
        ),
        # Electronics
        Product(
            title='Pro-Sound Soundbar',
            description='2.1 channel soundbar with wireless subwoofer.',
            price=28000,
            image_url='https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=400&q=80',
            stock_quantity=8,
            category_id=categories["Electronics"].id
        ),
        Product(
            title='Smart LED TV 43"',
            description='Crystal clear 4K Smart TV with Netflix and YouTube.',
            price=42000,
            image_url='https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80',
            stock_quantity=5,
            category_id=categories["Electronics"].id
        ),
        # Beddings
        Product(
            title='Egyptian Cotton Duvet Set',
            description='White 100% Egyptian cotton king size duvet with 4 pillows.',
            price=8500,
            image_url='https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=400&q=80',
            stock_quantity=12,
            category_id=categories["Beddings"].id
        ),
        # Carpets & Curtains
        Product(
            title='Persian-Style Area Rug',
            description='Large 5x8ft vintage style rug with intricate patterns.',
            price=18000,
            image_url='https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=400&q=80',
            stock_quantity=7,
            category_id=categories["Carpets & Curtains"].id
        )
    ]
    
    db.add_all(products)
    db.commit()
    db.close()
    print('Categories and sample household products added successfully')

if __name__ == '__main__':
    seed()
