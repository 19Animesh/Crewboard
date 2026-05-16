async function testLogins() {
  console.log("--- Testing Admin Login ---");
  try {
    const adminRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@123' })
    });
    console.log(`Admin Status: ${adminRes.status}`);
    const adminData = await adminRes.json();
    console.log(`Admin Response:`, adminData);
    if (adminRes.ok) console.log("✅ Admin Login Successful!\n");
    else console.log("❌ Admin Login Failed!\n");
  } catch (e) {
    console.log("❌ Admin Login Error:", e.message, "\n");
  }

  console.log("--- Testing Member Login ---");
  try {
    const memberRes = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'member@example.com', password: 'Member@123' })
    });
    console.log(`Member Status: ${memberRes.status}`);
    const memberData = await memberRes.json();
    console.log(`Member Response:`, memberData);
    if (memberRes.ok) console.log("✅ Member Login Successful!\n");
    else console.log("❌ Member Login Failed!\n");
  } catch (e) {
    console.log("❌ Member Login Error:", e.message, "\n");
  }
}

testLogins();
