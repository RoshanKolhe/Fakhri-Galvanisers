const SITE_SETTINGS = {
  email: {
    type: 'smtp',
    host: 'smtp.hostinger.com',
    secure: true,
    port: 465,
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: 'test@stuckatpoint.com',
      pass: 'Test@2023',
    },
  },
  fromMail: 'test@stuckatpoint.com',
};
export default SITE_SETTINGS;
