module.exports = {
  secretPath: 'b50ff165-effa-45d6-b24b-6ff06a03e846', // generate some different e. g. UUID v4 to protect privacy of URL endpoint at least a little

  // Mail credentials
  username: 'email_account', // usualy without domain, propably best way is to create new local, email account only for this purpose and then in Garmin Connect add email as another LiveTrack contact
  password: 'your_password',
  host: 'domain.com', // same as host with SSL cert
  
  // localUser: true, // default true and for true value instead of checking email every minute which will propably be blocked by mail server, watch local server file in {mailDir} date of modified
  mailDir: '/home/email_account/Maildir/new/', // standard directory of users mail text files, remember to add backslash on end

  // If dir date of modification is less than minutes equal to maxWaitForSession it means propably new email arrived - than fetch it by IMAP, otherwise do there will be no request to mail servers

  // IMAP host to connect to to read the email from garmin, recommended local server (postfix)
  // gMail IS NOT recommended cause after so many request there will be timeouts of connection
  // most propably it's because firewall blocks such amount of connections & also it is slower

  // defaults to gmail
  // host: 'imap.gmail.com',
  // port: 993, default is 587 (usually postfix use that port)
  // tls: true,
  // secure: true,
  // keepalive: false,
  // ^ better do not set keepalive to true if using postman+dovecot + mail_max_userip_connections connection - it will reach this limit soon

  // Folder to look for the email in, defaults to INBOX but if you're using gmail and it doesn't find it try uncommenting the All Mail folder
  // label: '[Gmail]/All Mail',
  
  // Should we mark the garmin email seen after getting the link from it?
  // markSeen: false,

  // httpHost: 'localhost',
  // set this to 0.0.0.0 if you want to put that on external adress (public on internet! warning, there is no authorization for that)
  // httpPort: 8200,
  // waitForId: 300,
  // maxWaitForSession: 3, // use lower values for localhost thant external mail server which require more time to check inbox
};
