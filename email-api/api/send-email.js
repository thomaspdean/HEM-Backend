import fetch from 'node-fetch';

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { fullName, memberId, email, phone, services } = req.body;

  // Validate required fields
  if (!fullName || !memberId || !email || !phone || !services) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Call EmailJS from server-side
    const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service_id: process.env.EMAILJS_SERVICE_ID,
        template_id: process.env.EMAILJS_TEMPLATE_ID,
        user_id: process.env.EMAILJS_USER_ID,
        template_params: {
          fullName,
          memberId,
          email,
          phone,
          services
        },
      }),
    });

    if (response.ok) {
      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } else {
      const errorText = await response.text();
      console.error('EmailJS Error:', response.status, errorText);
      res.status(500).json({ message: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}