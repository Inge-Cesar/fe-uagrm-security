export interface LoginProps {
  email: string;
  password: string;
}

const login = async ({ email, password }: LoginProps) => {
  const body = JSON.stringify({ email, password });

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body,
    });

    return res;
  } catch (err) {
    return {
      status: 500,
    };
  }
};

export default login;
