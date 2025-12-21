db.users.updateOne(
    { email: "cetelloa@uce.edu.ec" },
    { $set: { role: "admin" } }
);
print("Usuario promovido a admin!");
