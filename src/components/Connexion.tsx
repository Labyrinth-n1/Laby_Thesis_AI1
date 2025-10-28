import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    // Récupérer les infos de l'utilisateur dans la table utilisateur
    const { data: userInfo, error: userError } = await supabase
      .from('utilisateur')
      .select('nom, prenom')
      .eq('email', email)
      .single();

    if (userError || !userInfo) {
      setErrorMessage('Impossible de récupérer les informations utilisateur.');
      return;
    }

    // Stocker dans localStorage (ou contexte) pour la Home
    localStorage.setItem('currentUser', JSON.stringify(userInfo));

    // Redirection vers Home
    navigate('/home');
  };

  return (
    <div>
      <h2>Login</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleLogin}>
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
};

export default Login;
