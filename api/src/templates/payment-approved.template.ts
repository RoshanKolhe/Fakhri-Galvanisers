export default function generatePaymentApprovedTemplate(mailOptions: any) {
  const template = `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Payment Approved</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      background-color: #f4f6f8;
      padding: 20px;
    }
    .container {
      max-width: 600px;
      margin: auto;
      background-color: #ffffff;
      border: 1px solid #dce3ec;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
    }
    .header {
      background-color: #007BFF;
      color: white;
      padding: 20px;
      text-align: center;
    }
    .content {
      padding: 20px;
      color: #333;
    }
    .footer {
      font-size: 12px;
      color: #888;
      text-align: center;
      padding: 15px;
      background-color: #f0f4f8;
    }
    .btn {
      display: inline-block;
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #007BFF;
      color: white;
      text-decoration: none;
      border-radius: 4px;
    }
    .highlight {
      color: #007BFF;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Payment Proof Approved</h2>
    </div>
    <div class="content">
      <p>Dear ${mailOptions.userData.firstName},</p>

      <p>We have reviewed your submitted payment proof and we’re pleased to inform you that it has been <span class="highlight">successfully approved</span>.</p>

      <p>Your transaction is now confirmed, and we will proceed with the next steps as planned.</p>

      <p>If you have any questions or need further assistance, feel free to reach out to our support team.</p>

      <a class="btn" href="${process.env.REACT_APP_ENDPOINT}">Go to Your Dashboard</a>
    </div>
    <div class="footer">
      &copy; 2025 Hylite. All rights reserved.
    </div>
  </div>
</body>
</html>

    `;
  const OtpTemplate = {
    subject: 'Payment Proof Approved',
    html: template,
  };
  return OtpTemplate;
}
