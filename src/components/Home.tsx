import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

const Home: React.FC = () => {
  const [user, setUser] = useState<{ nom: string; prenom: string } | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Vérifier si utilisateur est connecté
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/login'); // redirection si pas connecté
      return;
    }

    setUser(JSON.parse(currentUser));
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  if (!user) return <p>Chargement...</p>;

  return (
    <div>
      <h2>Bienvenue {user.nom} {user.prenom} !</h2>
      <button onClick={handleLogout}>Se déconnecter</button>
    </div>
  );
};

export default Home;
