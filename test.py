from ldb.models import Person, Entity
from django_seed import Seed

seeder = Seed.seeder()
seeder.add_entity(Entity, 10)
seeder.add_entity(Person, 10)
inserted_pks = seeder.execute()
