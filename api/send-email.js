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
    // Generate truly unique identifiers
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substr(2, 12);
    const memberIdHash = memberId.replace(/[^a-zA-Z0-9]/g, ''); // Clean member ID
    const messageId = `member-request-${timestamp}-${memberIdHash}-${randomString}`;
    
    // Create unique subject line to prevent threading
    const uniqueSubject = `New Service Request - ${fullName} [${timestamp}]`;
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'HEM Patient Request<onboarding@resend.dev>',
        to: [process.env.TO_EMAIL],
        subject: uniqueSubject,
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
          // Unique Message-ID for each email
          'Message-ID': `<${messageId}@yourdomain.com>`,
          // Explicitly break threading by not including References or In-Reply-To
          'X-Priority': '1',
          'X-MSMail-Priority': 'High',
          // Additional headers to ensure uniqueness
          'X-Unique-ID': messageId,
          'X-Request-Type': 'member-service-request',
          // Thread-Index with unique value (helps with Outlook)
          'Thread-Index': Buffer.from(`${messageId}-${timestamp}`).toString('base64')
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