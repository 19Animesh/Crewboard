async function main() {
  const loginRes = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@123' })
  });
  
  console.log('Login Status:', loginRes.status);
  const loginData = await loginRes.json();
  console.log('Login Data:', loginData);
  
  const cookies = loginRes.headers.get('set-cookie');
  console.log('Set-Cookie:', cookies);
  
  const meRes = await fetch('http://localhost:3000/api/auth/me', {
    headers: {
      'Cookie': cookies
    }
  });
  console.log('Me Status:', meRes.status);
  console.log('Me Data:', await meRes.json());
}

main().catch(console.error);
