import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { fullName, memberId, email, phone, services } = req.body;

  if (!fullName || !memberId || !email || !phone || !services) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: [process.env.TO_EMAIL],
        subject: 'Higher Ed Med Member Request',
        text: `New member request received:

Patient Name: ${fullName}
Member ID: ${memberId}
Email: ${email}
Phone: ${phone}
Services Requested: ${services}

---
This email was sent from the Higher Ed Med mobile app.`
      }),
    });

    if (response.ok) {
      const result = await response.json();
      console.log('Email sent successfully:', result);
      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } else {
      const errorText = await response.text();
      console.error('Resend Error:', response.status, errorText);
      res.status(500).json({ message: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
}