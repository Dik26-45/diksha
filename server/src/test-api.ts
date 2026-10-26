// Comprehensive test suite for SAFAR AI Backend API

async function runTests() {
  const BASE_URL = 'http://localhost:5000/api';
  console.log('--- STARTING SAFAR AI API VERIFICATION TESTS ---');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: any) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`, detail || '');
      failed++;
    }
  }

  // 1. Health check
  const healthRes = await fetch(`${BASE_URL}/health`).then((r) => r.json());
  assert(healthRes.status === 'healthy', 'API Health Check returns healthy');
  assert(healthRes.database?.notice?.includes('Demo Mode') || healthRes.database?.mode === 'demo', 'Demo Mode banner is explicitly reported in database status');

  // 2. Login as Aisha Khan (Female Passenger, Verified)
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'aisha.khan@safar.ai', password: 'Password123!' }),
  }).then((r) => r.json());
  assert(!!loginRes.token, 'Aisha Khan login succeeds and returns JWT');
  assert(loginRes.user?.passwordHash === undefined, 'Password hash is strictly sanitized and omitted from auth response');
  const aishaToken = loginRes.token;

  // 3. Login as Bilal Ahmed (Male Passenger, Unverified)
  const bilalLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'bilal.ahmed@safar.ai', password: 'Password123!' }),
  }).then((r) => r.json());
  assert(!!bilalLogin.token, 'Bilal Ahmed login succeeds');
  const bilalToken = bilalLogin.token;

  // 4. Duplicate Email Registration Prevention
  const dupReg = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'aisha.khan@safar.ai',
      password: 'Password123!',
      fullName: 'Duplicate Aisha',
    }),
  });
  assert(dupReg.status === 409, 'Duplicate email registration returns 409 Conflict');

  // 5. Successful New Registration
  const testEmail = `test.passenger.${Date.now()}@safar.ai`;
  const newReg = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'Password123!',
      fullName: 'New Test Commuter',
      role: 'PASSENGER',
      gender: 'FEMALE',
    }),
  }).then((r) => r.json());
  assert(newReg.user?.email === testEmail, 'New user successfully registered');

  // 6. List Rides
  const ridesRes = await fetch(`${BASE_URL}/rides`).then((r) => r.json());
  assert(Array.isArray(ridesRes.rides) && ridesRes.rides.length >= 4, 'List rides returns scheduled rides with totalCount');

  // 7. Women-Only Filter
  const womenRides = await fetch(`${BASE_URL}/rides?isWomenOnly=true`).then((r) => r.json());
  assert(
    womenRides.rides.every((r: any) => r.isWomenOnly === true),
    'Women-only filter returns exclusively isWomenOnly rides'
  );

  // 8. AI Matching 5-Factor Scoring
  const matchRes = await fetch(`${BASE_URL}/matching/find-matches`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aishaToken}`,
    },
    body: JSON.stringify({
      originLat: 33.72,
      originLng: 73.058, // F-7 area
      destLat: 33.642,
      destLng: 72.993, // NUST area
      preferredDepartureTime: new Date().toISOString(),
    }),
  }).then((r) => r.json());
  assert(Array.isArray(matchRes.matches) && matchRes.matches.length > 0, 'AI Matching returns ranked scored rides');
  assert(
    matchRes.matches[0].overallScore > 0 && !!matchRes.matches[0].explanation,
    'AI match score includes explainable summary and 0-100 score'
  );
  assert(
    matchRes.algorithm?.type === 'RULE_BASED_HEURISTIC_MATCHING',
    'Algorithm transparency confirms explainable rule-based matching heuristics'
  );

  // 9. Women-Only Restriction: Male Passenger Attempting to Book Women-Only Ride
  const womenRideId = 'ride-women-001';
  const unauthorizedBooking = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${bilalToken}`, // Male user
    },
    body: JSON.stringify({
      rideId: womenRideId,
      seatCount: 1,
    }),
  });
  assert(
    unauthorizedBooking.status === 403,
    'Male passenger booking women-only ride is strictly blocked with 403 Forbidden'
  );

  // 10. Women-Only Restriction: Female Passenger Booking Women-Only Ride
  // Check available seats before booking
  const rideBefore = await fetch(`${BASE_URL}/rides/${womenRideId}`).then((r) => r.json());
  const initialAvailable = rideBefore.ride.availableSeats;

  const validBookingRes = await fetch(`${BASE_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aishaToken}`, // Female user
    },
    body: JSON.stringify({
      rideId: womenRideId,
      seatCount: 1,
    }),
  }).then((r) => r.json());
  assert(!!validBookingRes.booking?.id, 'Female passenger successfully books women-only ride');
  assert(validBookingRes.booking?.paymentStatus === 'SIMULATED_PAID', 'Simulated payment status is set');

  // Verify seat decrement
  const rideAfter = await fetch(`${BASE_URL}/rides/${womenRideId}`).then((r) => r.json());
  assert(
    rideAfter.ride.availableSeats === initialAvailable - 1,
    'Ride available seats decremented exactly by booked seat count'
  );

  // 11. Booking Cancellation & Seat Restoration
  const cancelRes = await fetch(`${BASE_URL}/bookings/${validBookingRes.booking.id}/cancel`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aishaToken}`,
    },
    body: JSON.stringify({ reason: 'Schedule change' }),
  }).then((r) => r.json());
  assert(cancelRes.booking?.status === 'CANCELLED', 'Booking cancelled successfully');

  const rideAfterCancel = await fetch(`${BASE_URL}/rides/${womenRideId}`).then((r) => r.json());
  assert(
    rideAfterCancel.ride.availableSeats === initialAvailable,
    'Cancelled booking successfully restores available seats on the ride'
  );

  // 12. Safety Report Submission
  const safetyRes = await fetch(`${BASE_URL}/safety/report`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aishaToken}`,
    },
    body: JSON.stringify({
      category: 'UNSAFE_DRIVING',
      description: 'Vehicle exceeded highway speed limit near toll plaza.',
    }),
  }).then((r) => r.json());
  assert(!!safetyRes.report?.id, 'Safety incident report logged successfully');

  // 13. Emergency SOS Trigger
  const sosRes = await fetch(`${BASE_URL}/safety/emergency-sos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${aishaToken}`,
    },
    body: JSON.stringify({
      lat: 33.72,
      lng: 73.05,
      message: 'Test SOS trigger from safety center.',
    }),
  }).then((r) => r.json());
  assert(sosRes.emergency?.emergencyNumber === '112', 'SOS triggers alert with emergency number 112');

  // 14. Admin Route Protection: Passenger attempting to access Admin API
  const unauthorizedAdmin = await fetch(`${BASE_URL}/admin/overview`, {
    headers: { Authorization: `Bearer ${aishaToken}` },
  });
  assert(
    unauthorizedAdmin.status === 403,
    'Non-admin passenger blocked from admin endpoints with 403 Forbidden'
  );

  // 15. Admin Login & Access
  const adminLogin = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@safar.ai', password: 'Admin123!' }),
  }).then((r) => r.json());
  const adminToken = adminLogin.token;

  const adminOverview = await fetch(`${BASE_URL}/admin/overview`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  }).then((r) => r.json());
  assert(adminOverview.metrics?.totalUsers > 0, 'Admin overview loads system metrics successfully');

  console.log(`\n====================================================`);
  console.log(`TEST RESULTS SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log(`====================================================`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Test run failed with error:', e);
  process.exit(1);
});
