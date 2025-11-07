export default function generatePaymentRejectedTemplate(mailOptions: any) {
  const template = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Payment Proof Rejected</title>
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
      color: #d9534f;
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>Payment Proof Rejected</h2>
    </div>
    <div class="content">
      <p>Dear ${mailOptions.userData.firstName},</p>

      <p>We have reviewed the payment proof you submitted for invoice <span class="highlight">${mailOptions.invoiceId}</span>. Unfortunately, it has been <span class="highlight">rejected</span> due to verification issues.</p>

      <p>Kindly ensure the uploaded document is clear and matches the payment details. Please re-upload a valid payment proof to proceed with your transaction.</p>

      <a class="btn" href="${process.env.REACT_APP_ENDPOINT}">Go to Your Dashboard</a>

      <p>If you need help or have questions, feel free to contact our support team.</p>
    </div>
    <div class="footer">
      &copy; 2025 Hylite. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
  const OtpTemplate = {
    subject: `Action Required: Payment Proof Rejected for Invoice ${mailOptions.invoiceId}`,
    html: template,
  };
  return OtpTemplate;
}
