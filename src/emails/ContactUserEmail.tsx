import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import React from 'react';

interface ContactUserEmailProps {
  subject: string;
  message: string;
}

const main = {
  backgroundColor: '#f6f9fc',
  padding: '10px 0',
};

const container = {
  backgroundColor: '#ffffff',
  border: '1px solid #f0f0f0',
  padding: '45px',
  width: '650px',
};

const text = {
  fontSize: '16px',
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: '300',
  color: '#404040',
  lineHeight: '26px',
};

const adventourLogoURL =
  'https://res.cloudinary.com/dyjbjmpqy/image/upload/v1710487341/AdventourLogo.png';

const ContactUserEmail = ({ subject, message }: ContactUserEmailProps) => (
  <Html>
    <Head />
    <Preview>AdvenTour - {subject}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src={adventourLogoURL}
          width={60}
          height={60}
          alt="AdvenTour Logo"
        />
        <Section>
          <Text style={text}>{message}</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default ContactUserEmail;
