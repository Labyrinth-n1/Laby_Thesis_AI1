import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';

interface Utilisateur {
  id: number;
  nom: string;
  profil: string | null;
  email?: string;
}

interface Membre {
  id: number;
  utilisateur_id: number;
  utilisateur: Utilisateur;
}

const Groupe: React.FC = () => {
  const { id } = useParams(); // ID du groupe
  const [groupeNom, setGroupeNom] = useState('');
  const [chef, setChef] = useState<Utilisateur | null>(null);
  const [membres, setMembres] = useState<Membre[]>([]);
  const [emailRecherche, setEmailRecherche] = useState('');
  const [utilisateurTrouve, setUtilisateurTrouve] = useState<Utilisateur | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: number } | null>(null);

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) setCurrentUser(JSON.parse(user));
  }, []);

  const fetchGroupe = async () => {
    if (!id) return;

    // Récupère le groupe et le chef
    const { data: groupeData, error: groupeError } = await supabase
      .from('Groupe')
      .select('nom_groupe, chef_id')
      .eq('id', id)
      .single();

    if (groupeError) return console.error(groupeError.message);
    setGroupeNom(groupeData.nom_groupe);

    const { data: chefData, error: chefError } = await supabase
      .from('Utilisateur')
      .select('id, nom, profil')
      .eq('id', groupeData.chef_id)
      .single();

    if (!chefError) setChef(chefData);

    // Récupère les membres
    const { data: membresData, error: membresError } = await supabase
      .from('MembreGroupe')
      .select('id, utilisateur_id, utilisateur:utilisateur_id (id, nom, profil)')
      .eq('groupe_id', id);

    if (!membresError) setMembres(membresData || []);
  };

  useEffect(() => {
    fetchGroupe();
  }, [id]);

  const handleSearchUser = async () => {
    const { data, error } = await supabase
      .from('Utilisateur')
      .select('id, nom, profil, email')
      .eq('email', emailRecherche)
      .single();

    if (error || !data) {
      alert('Aucun utilisateur trouvé avec cet email.');
      setUtilisateurTrouve(null);
    } else setUtilisateurTrouve(data);
  };

  const handleAddMembre = async () => {
    if (!currentUser || currentUser.id !== chef?.id) return alert('Seul le chef peut ajouter des membres.');
    if (!utilisateurTrouve) return alert('Utilisateur non sélectionné.');

    const { data: dejaMembre } = await supabase
      .from('MembreGroupe')
      .select('id')
      .eq('groupe_id', id)
      .eq('utilisateur_id', utilisateurTrouve.id)
      .maybeSingle();

    if (dejaMembre) return alert('Déjà membre');

    const { error } = await supabase
      .from('MembreGroupe')
      .insert([{ groupe_id: id, utilisateur_id: utilisateurTrouve.id }]);

    if (error) return alert(error.message);

    alert('Membre ajouté ✅');
    setEmailRecherche('');
    setUtilisateurTrouve(null);
    fetchGroupe();
  };

  const handleRemoveMembre = async (membreId: number) => {
    if (!currentUser || currentUser.id !== chef?.id) return alert('Seul le chef peut supprimer.');

    const { error } = await supabase
      .from('MembreGroupe')
      .delete()
      .eq('id', membreId);

    if (error) return alert(error.message);

    setMembres(membres.filter(m => m.id !== membreId));
  };

  if (!currentUser) return <p>Chargement...</p>;

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>Groupe : {groupeNom}</h2>
      <p>Chef : {chef?.nom || 'N/A'}</p>

      <h3>Ajouter un membre</h3>
      {currentUser.id === chef?.id ? (
        <>
          <input
            type="email"
            placeholder="Email du membre"
            value={emailRecherche}
            onChange={e => setEmailRecherche(e.target.value)}
          />
          <button onClick={handleSearchUser}>Rechercher</button>
          {utilisateurTrouve && (
            <div>
              <p>{utilisateurTrouve.nom}</p>
              <button onClick={handleAddMembre}>Ajouter</button>
            </div>
          )}
        </>
      ) : <p>Seul le chef peut ajouter des membres</p>}

      <h3>Membres</h3>
      <ul>
        {membres.map(m => (
          <li key={m.id}>
            {m.utilisateur.nom} — {m.utilisateur.profil || 'Profil non défini'}
            {currentUser.id === chef?.id && (
              <button onClick={() => handleRemoveMembre(m.id)} style={{ marginLeft: '10px', color: 'red' }}>
                Supprimer
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Groupe;
