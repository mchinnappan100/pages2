import uuid

# random (v4)
print(uuid.uuid4())

# name-based (v5)
print(uuid.uuid5(uuid.NAMESPACE_DNS, 'example.com'))