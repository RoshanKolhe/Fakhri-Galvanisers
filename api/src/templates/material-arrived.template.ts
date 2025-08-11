export default function materialArrivedAtGateTemplate(mailOptions: any) {
  const template = `<!DOCTYPE html>
    <html>
    <head>
        <title>Welcome to Hylite</title>
    </head>
     <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            background: #007bff;
            color: #ffffff;
            padding: 15px;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 20px;
            font-size: 16px;
            color: #333;
        }
        .button {
            display: inline-block;
            background: #007bff;
            color: #ffffff;
            padding: 10px 15px;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 10px;
        }
        .footer {
            text-align: center;
            font-size: 14px;
            color: #666;
            padding: 10px;
            margin-top: 20px;
            border-top: 1px solid #ddd;
        }
    </style>
 <body>

<div class="container">
    <div class="header">
        <h2>Welcome to Hylite!</h2>
    </div>

    <div class="content">
        <p>Dear <strong>${mailOptions?.userData?.firstName} ${mailOptions?.userData?.lastName ? mailOptions?.userData?.lastName : ''}</strong>,</p>
        
        <p>${mailOptions?.content}</p>
        <p>Click the button below to check the status of challan:</p>
        <p><a class="button" href="${mailOptions?.redirectLink}" target="_blank">View Challan</a></p>

        <p>If you have any issues, feel free to contact our support team.</p>

        <p>Best Regards,<br>
        <strong>Hylite</strong></p>
    </div>

    <div class="footer">
        &copy; 2025 Hylite. All rights reserved.
    </div>
</div>

</body>
    </html>`;
  const MaterialArrivedAtGateTemplate = {
    subject: `Material arrived at gate of challan ID ${mailOptions.challanId}`,
    html: template,
  };
  return MaterialArrivedAtGateTemplate;
}
