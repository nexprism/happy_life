const test = async () => {
  try {
    const res = await fetch('http://localhost:5000/events/6ac2cc4d6dae027c111af920/check-register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        guestEmail: 'teststudent@example.com',
        guestName: 'Test Student',
        is_verify: true
      })
    });
    const data = await res.json();
    console.log('check-register status:', res.status, data);
  } catch (err) {
    console.error('Error:', err);
  }
};
test();
