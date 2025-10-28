import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [user, setUser] = useState<{ id: number; nom: string } | null>(null);
  const [groupes, setGroupes] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) navigate('/login');
    else setUser(JSON.parse(currentUser));
  }, [navigate]);

  const fetchGroupes = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('Groupe')
      .select('id, nom_groupe')
      .or(`chef_id.eq.${user.id},id.in.(select groupe_id from MembreGroupe where utilisateur_id.eq.${user.id})`);
    setGroupes(data || []);
  };

  useEffect(() => {
    fetchGroupes();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  if (!user) return <p>Chargement...</p>;

  return (
    <div>
      <h2>Bienvenue {user.nom}</h2>
      <Link to="/creer-groupe">Créer un groupe</Link>

      <h3>Mes groupes</h3>
      <ul>
        {groupes.map(g => (
          <li key={g.id}>
            <Link to={`/groupe/${g.id}`}>{g.nom_groupe}</Link>
          </li>
        ))}
      </ul>

      <button onClick={handleLogout}>Se déconnecter</button>
    </div>
  );
};

export default Home;
