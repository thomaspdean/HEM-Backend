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
    // Generate unique message ID
    const messageId = `member-request-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Higher Ed Med <onboarding@resend.dev>',
        to: [process.env.TO_EMAIL],
        subject: `New Service Request - ${fullName}`,
        text: `New member request received:

Patient Name: ${fullName}
Member ID: ${memberId}
Email: ${email}
Phone: ${phone}
Services Requested: ${services}

---
Request ID: ${messageId}
Timestamp: ${new Date().toISOString()}`,
        headers: {
          'Message-ID': `<${messageId}@resend.dev>`,
          'X-Priority': '1',
          'X-MSMail-Priority': 'High'
        }
      }),
    });

    if (response.ok) {
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