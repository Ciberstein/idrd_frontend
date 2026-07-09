import { Turnstile } from '@marsidev/react-turnstile';

// Para pedir un token nuevo (es de un solo uso), remonta este componente
// cambiando su prop `key` desde el form.
const Captcha = ({ onVerify, onExpire }) => {
  return (
    <Turnstile
      siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
      onSuccess={onVerify}
      onExpire={onExpire}
      options={{ theme: 'light', language: 'es' }}
    />
  );
}

export default Captcha;
