import { IContact, ICreateAccount, IHelpContact, IResetPassword, IResetPasswordByEmail } from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
     const data = {
          to: values.email,
          subject: 'Verify your account',
          html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); text-align: center;">
        <img src="https://i.postimg.cc/6pgNvKhD/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
          <h2 style="color: #277E16; font-size: 24px; margin-bottom: 20px;">Hey! ${values.name}, Your Account Credentials</h2>
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #277E16; width: 120px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
        </div>
    </div>
</body>`,
     };
     return data;
};
const contact = (values: IContact) => {
     const data = {
          to: values.email,
          subject: 'We’ve Received Your Message – Thank You!',
          html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">      
      <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <img src="https://res.cloudinary.com/ddhhyc6mr/image/upload/v1742293522/buzzy-box-logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
          <h2 style="color: #277E16; font-size: 24px; margin-bottom: 20px; text-align: center;">Thank You for Contacting Us, ${values.name}!</h2>
          
          <p style="color: #555; font-size: 16px; line-height: 1.5; text-align: center;">
              We have received your message and our team will get back to you as soon as possible.
          </p>
          
          <div style="padding: 15px; background-color: #f4f4f4; border-radius: 8px; margin: 20px 0;">
              <p style="color: #333; font-size: 16px; font-weight: bold;">Your Message Details:</p>
              <p><strong>Name:</strong> ${values.name}</p>
              <p><strong>Email:</strong> ${values.email}</p>
              <p><strong>Subject:</strong> ${values.subject}</p>
              <br/>
              <p><strong>Message:</strong> ${values.message}</p>
          </div>

          <p style="color: #555; font-size: 14px; text-align: center;">
              If your inquiry is urgent, feel free to reach out to us directly at 
              <a href="mailto:support@yourdomain.com" style="color: #277E16; text-decoration: none;">support@yourdomain.com</a>.
          </p>

          <p style="color: #555; font-size: 14px; text-align: center; margin-top: 20px;">
              Best Regards, <br/>
              The [Your Company Name] Team
          </p>
      </div>
  </body>`,
     };
     return data;
};
const resetPassword = (values: IResetPassword) => {
     const data = {
          to: values.email,
          subject: 'Reset your password',
          html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://i.postimg.cc/6pgNvKhD/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Your single use code is:</p>
            <div style="background-color: #277E16; width: 120px; padding: 10px; text-align: center; border-radius: 8px; color: #fff; font-size: 25px; letter-spacing: 2px; margin: 20px auto;">${values.otp}</div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">This code is valid for 3 minutes.</p>
                <p style="color: #b9b4b4; font-size: 16px; line-height: 1.5; margin-bottom: 20px;text-align:left">If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.</p>
        </div>
    </div>
</body>`,
     };
     return data;
};
const resetPasswordByUrl = (values: IResetPasswordByEmail) => {
     const data = {
          to: values.email,
          subject: 'Reset Your Password',
          html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
      <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://i.postimg.cc/6pgNvKhD/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <div style="text-align: center;">
          <h2 style="color: #333;">Reset Your Password</h2>
          <p style="color: #555; font-size: 16px; line-height: 1.5;">We received a request to reset your password. Click the button below to reset it:</p>
          <a href="${values.resetUrl}" target="_blank" style="display: inline-block; background-color: #277E16; color: white; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-size: 18px; margin: 20px auto;">Reset Password</a>
          <p style="color: #555; font-size: 16px; line-height: 1.5; margin-top: 20px;">If you didn’t request this, you can ignore this email.</p>
          <p style="color: #b9b4b4; font-size: 14px;">This link will expire in 10 minutes.</p>
        </div>
      </div>
    </body>`,
     };
     return data;
};

const contactFormTemplate = (values: IHelpContact) => {
     const data = {
          to: values.email,
          subject: 'Thank you for reaching out to us',
          html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
    <div style="width: 100%; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
        <img src="https://i.postimg.cc/6pgNvKhD/logo.png" alt="Logo" style="display: block; margin: 0 auto 20px; width:150px" />
        <div style="text-align: center;">
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Hello ${values.name},</p>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">Thank you for reaching out to us. We have received your message:</p>
            <div style="background-color: #f1f1f1; padding: 15px; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 20px;">
                <p style="color: #555; font-size: 16px; line-height: 1.5;">"${values.message}"</p>
            </div>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">We will get back to you as soon as possible. Below are the details you provided:</p>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">Email: ${values.email}</p>
            <p style="color: #555; font-size: 16px; line-height: 1.5; margin-bottom: 10px;">Phone: ${values.phone}</p>
            <p style="color: #b9b4b4; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">If you need immediate assistance, please feel free to contact us directly at our support number.</p>
        </div>
    </div>
</body>`,
     };
     return data;
};
const sendTrialWarningEmail = (user: any) => {
     const data = {
          to: user.email,
          subject: 'Your Free Trial Expires Tomorrow! ⏰',
          html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">Your Free Trial Expires Tomorrow! ⏰</h2>
          <p>Dear ${user.name},</p>
          <p>Your free trial will expire tomorrow at ${user.trialExpireAt.toLocaleString()}.</p>
          <p>Don't lose access to your progress! Subscribe now to continue enjoying all features.</p>
          <a href="${process.env.FRONTEND_URL}/subscribe" style="background: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Subscribe Now
          </a>
          <p>Questions? Reply to this email for support.</p>
        </div>
      </body>`,
     };
     return data;
};

const sendEarlyWarningEmail = (user: any) => {
     const data = {
          to: user.email,
          subject: '3 Days Left in Your Free Trial! 🚀',
          html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">3 Days Left in Your Free Trial! 🚀</h2>
          <p>Hi ${user.name},</p>
          <p>You have 3 days remaining in your free trial (expires ${user.trialExpireAt.toLocaleDateString()}).</p>
          <p>Continue your journey with our premium features!</p>
          <a href="${process.env.FRONTEND_URL}/subscribe" style="background: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Plans
          </a>
        </div>
      </body>`,
     };
     return data;
};

const sendReEngagementEmail = (user: any) => {
     const data = {
          to: user.email,
          subject: 'We Miss You! Come Back with 50% Off 🎉',
          html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">We Miss You! Come Back with 50% Off 🎉</h2>
          <p>Hi ${user.name},</p>
          <p>It's been a week since your trial ended. We'd love to have you back!</p>
          <p>Use code <strong>COMEBACK50</strong> for 50% off your first month.</p>
          <a href="${process.env.FRONTEND_URL}/subscribe?code=COMEBACK50" style="background: #6f42c1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Get 50% Off
          </a>
        </div>
      </body>`,
     };
     return data;
};

const sendTrialExpiredEmail = (user: any) => {
     const data = {
          to: user.email,
          subject: 'Your Free Trial Has Ended 😢',
          html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 50px; padding: 20px; color: #555;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; background: #fff; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333;">Your Free Trial Has Ended 😢</h2>
          <p>Dear ${user.name},</p>
          <p>Your free trial has expired. But don't worry - you can still access all features by subscribing!</p>
          <p>Choose a plan that works for you:</p>
          <a href="${process.env.FRONTEND_URL}/subscribe" style="background: #dc3545; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Subscribe Now
          </a>
          <p>Your progress is saved and will be restored when you subscribe.</p>
        </div>
      </body>`,
     };
     return data;
};

export const emailTemplate = {
     createAccount,
     resetPassword,
     resetPasswordByUrl,
     contactFormTemplate,
     contact,
     sendTrialWarningEmail,
     sendEarlyWarningEmail,
     sendReEngagementEmail,
     sendTrialExpiredEmail,
};
