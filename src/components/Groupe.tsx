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
  const { id } = useParams(); // ID du groupe dans l’URL
  const [groupeNom, setGroupeNom] = useState('');
  const [membres, setMembres] = useState<Membre[]>([]);
  const [emailRecherche, setEmailRecherche] = useState('');
  const [utilisateurTrouve, setUtilisateurTrouve] = useState<Utilisateur | null>(null);

  // 🔹 Charger les infos du groupe et ses membres
  useEffect(() => {
    const fetchGroupe = async () => {
      if (!id) return;

      // Récupérer le nom du groupe
      const { data: groupeData } = await supabase
        .from('groupe')
        .select('nom_groupe')
        .eq('id', id)
        .single();

      setGroupeNom(groupeData?.nom_groupe || '');

      // Récupérer les membres avec jointure sur "utilisateur"
      const { data: membresData, error } = await supabase
        .from('membregroupe')
        .select('id, utilisateur_id, utilisateur:utilisateur_id ( id, nom, profil, email )')
        .eq('groupe_id', id);

      if (error) console.error('Erreur chargement membres :', error.message);
      else setMembres(membresData || []);
    };

    fetchGroupe();
  }, [id]);

  // 🔍 Recherche d’un utilisateur existant par email
  const handleSearchUser = async () => {
    const { data, error } = await supabase
      .from('utilisateur')
      .select('id, nom, profil, email')
      .eq('email', emailRecherche)
      .single();

    if (error || !data) {
      alert('Aucun utilisateur trouvé avec cet email.');
      setUtilisateurTrouve(null);
    } else {
      setUtilisateurTrouve(data);
    }
  };

  // ➕ Ajouter le membre au groupe
  const handleAddMembre = async () => {
    if (!utilisateurTrouve) return alert('Aucun utilisateur sélectionné.');
    if (!id) return;

    // Vérifie si déjà membre
    const { data: dejaMembre } = await supabase
      .from('membregroupe')
      .select('id')
      .eq('groupe_id', id)
      .eq('utilisateur_id', utilisateurTrouve.id)
      .maybeSingle();

    if (dejaMembre) {
      alert(`${utilisateurTrouve.nom} est déjà membre de ce groupe.`);
      return;
    }

    // Ajout du membre
    const { error } = await supabase
      .from('membregroupe')
      .insert([{ groupe_id: id, utilisateur_id: utilisateurTrouve.id }]);

    if (error) {
      alert('Erreur ajout membre : ' + error.message);
    } else {
      alert('Membre ajouté avec succès ✅');
      setEmailRecherche('');
      setUtilisateurTrouve(null);

      // Recharger la liste
      const { data: membresData } = await supabase
        .from('membregroupe')
        .select('id, utilisateur_id, utilisateur:utilisateur_id ( id, nom, profil, email )')
        .eq('groupe_id', id);
      setMembres(membresData || []);
    }
  };

  // ❌ Supprimer un membre
  const handleRemoveMembre = async (membreId: number) => {
    const { error } = await supabase
      .from('membregroupe')
      .delete()
      .eq('id', membreId);

    if (error) alert('Erreur suppression membre : ' + error.message);
    else {
      setMembres(membres.filter(m => m.id !== membreId));
      alert('Membre supprimé ✅');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <h2>👥 Groupe : {groupeNom}</h2>

      <h3>Ajouter un membre</h3>
      <input
        type="email"
        placeholder="Email du membre"
        value={emailRecherche}
        onChange={e => setEmailRecherche(e.target.value)}
      />
      <button onClick={handleSearchUser}>Rechercher</button>

      {utilisateurTrouve && (
        <div>
          <p>Utilisateur trouvé : <strong>{utilisateurTrouve.nom}</strong></p>
          <button onClick={handleAddMembre}>Ajouter au groupe</button>
        </div>
      )}

      <h3>Membres actuels</h3>
      {membres.length === 0 ? (
        <p>Aucun membre pour le moment.</p>
      ) : (
        <ul>
          {membres.map(m => (
            <li key={m.id}>
              {m.utilisateur.nom} — {m.utilisateur.profil || 'Profil non défini'}
              <button
                onClick={() => handleRemoveMembre(m.id)}
                style={{ marginLeft: '10px', color: 'red' }}
              >
                Supprimer
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Groupe;
