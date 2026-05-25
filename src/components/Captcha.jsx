import { Turnstile } from '@marsidev/react-turnstile';

export default function Captcha({ onVerify, onExpire }) {
  return (
    <Turnstile
      siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
      onSuccess={onVerify}
      onExpire={onExpire}
      options={{ theme: 'light', language: 'es' }}
    />
  );
}
