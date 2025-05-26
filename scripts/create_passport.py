# Copyright 2025 Fondazione LINKS

# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at

#     http://www.apache.org/licenses/LICENSE-2.0

# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

import json
import random
from faker import Faker

def generate_gold_record():
    fake = Faker()

    gold_record = {
        "id": fake.random_int(min=100000000, max=999999999),
        "type": random.choice(["Gold", "Silver", "Platinum", "Cobalt", "Coking_Coal", "Phosphate_Rock"]),
        #"quality": random.choice(["18k", "24k"]),
        "quantity_kg": f"{random.randint(1, 100)}",
        "location": random.choice(["TERNA MAG mines", "Tapojarvi mines", "JSW mines", "Tharsis mines", "Sibanye-Stillwater mine"]),
        "mined": fake.date_this_decade().strftime('%d/%m/%y')
    }

    return gold_record

def main():
    gold_record = generate_gold_record()
    gold_record_json = json.dumps(gold_record, indent=4)

    with open('nft-metadata.json', 'w') as json_file:
        json_file.write(gold_record_json)

if __name__ == "__main__":
    main()
