import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';

interface AdventourResetPasswordEmailProp {
  userFirstname?: string;
  resetPasswordLink?: string;
}

const main = {
  backgroundColor: '#f6f9fc',
  padding: '10px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  padding: '45px',
};

const text = {
  fontSize: '16px',
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: '300',
  color: '#404040',
  lineHeight: '26px',
};

const button = {
  backgroundColor: '#007ee6',
  borderRadius: '4px',
  color: '#fff',
  fontFamily: "'Open Sans', 'Helvetica Neue', Arial",
  fontSize: '15px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '210px',
  padding: '14px 7px',
};

const adventourLogoURL =
  'https://res.cloudinary.com/dyjbjmpqy/image/upload/v1710487341/AdventourLogo.png';

const AdventourResetPasswordEmail = ({
  userFirstname,
  resetPasswordLink,
}: AdventourResetPasswordEmailProp) => (
  <Html>
    <Head />
    <Preview>AdvenTour - reset your password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={adventourLogoURL}
          width={60}
          height={60}
          alt="AdvenTour Logo"
        />
        <Section>
          <Text style={text}>Hi {userFirstname},</Text>
          <Text style={text}>
            You recently requested a password change for your AdvenTour account.
            If this was you, you can set a new password here:
          </Text>
          <Button style={button} href={resetPasswordLink}>
            Reset password
          </Button>
          <Text style={text}>
            If you don&apos;t want to change your password or didn&apos;t
            request this, just ignore and delete this message.
          </Text>
          <Text style={text}>
            This password reset link will expire in 10 minutes and can only be
            used once.
          </Text>
          <strong>
            <Text style={text}>
              <strong>
                To keep your account secure, please don&apos;t forward this
                email to anyone
              </strong>
            </Text>
          </strong>
          <Text style={text}>Continue your adventure with AdvenTour!</Text>
          <Text style={text}>
            Regards,
            <br />
            Tushar Gaonkar
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default AdventourResetPasswordEmail;
