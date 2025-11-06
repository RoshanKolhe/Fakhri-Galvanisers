const SITE_SETTINGS = {
  email: {
    type: 'smtp',
    host: 'smtp.gmail.com',
    secure: true,
    port: 465,
    tls: {
      rejectUnauthorized: false,
    },
    auth: {
      user: 'taloja@hylite.co.in',
      pass: 'cjxdpwkxegsaoisy',
    },
  },
  fromMail: 'taloja@hylite.co.in',
};
export default SITE_SETTINGS;
