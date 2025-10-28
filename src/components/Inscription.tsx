import React, { useState, useRef } from 'react';
import { supabase } from '../supabaseClient';

const Inscription: React.FC = () => {
  const [nom, setNom] = useState<string>('');
  const [prenom, setPrenom] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [profil, setProfil] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [recording, setRecording] = useState<boolean>(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [message, setMessage] = useState<string>('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = e => chunksRef.current.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/mp3' });
        setAudioBlob(blob);
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (error) {
      alert('Erreur lors de l’accès au micro : ' + (error as Error).message);
    }
  };

  // ⏹️ Arrêter l’enregistrement
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  // 📨 Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!audioBlob) {
      return alert('Enregistrez un audio avant de soumettre !');
    }

    // 1️⃣ Création de l'utilisateur via Supabase Auth
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: 'https://labythesisai1-xyhn--5173--1db57326.local-corp.webcontainer.io/confirmation',
      },
    });

    if (signUpError) {
      return alert('Erreur création utilisateur : ' + signUpError.message);
    }

    // 2️⃣ Stockage temporaire des infos et de l'audio
    try {
      // Stocke l’audio dans Supabase Storage avec un nom temporaire basé sur l’email
      const fileName = `pending-audio/${email}_${Date.now()}.mp3`;
      const { error: uploadError } = await supabase
        .storage
        .from('audio-files')
        .upload(fileName, audioBlob, { upsert: true });

      if (uploadError) throw uploadError;

      // Stocke les infos restantes dans Storage (JSON)
      const info = { nom, prenom, profil, email, audio_path: fileName };
      const { error: infoError } = await supabase
        .storage
        .from('pending-info')
        .upload(`pending-json/${email}.json`, new Blob([JSON.stringify(info)], { type: 'application/json' }), { upsert: true });

      if (infoError) throw infoError;

      setMessage('Merci ! Veuillez confirmer votre email pour finaliser l’inscription.');
    } catch (err: any) {
      alert('Erreur stockage temporaire : ' + err.message);
    }

    // Reset formulaire côté UI
    setNom('');
    setPrenom('');
    setEmail('');
    setProfil('');
    setPassword('');
    setAudioBlob(null);
  };

  return (
    <div>
      <h2>Inscription</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Nom" value={nom} onChange={e => setNom(e.target.value)} required />
        <input type="text" placeholder="Prénom" value={prenom} onChange={e => setPrenom(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="text" placeholder="Profil" value={profil} onChange={e => setProfil(e.target.value)} />
        <input type="password" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />

        <div>
          {!recording && <button type="button" onClick={startRecording}>Démarrer l'enregistrement</button>}
          {recording && <button type="button" onClick={stopRecording}>⏹️ Arrêter</button>}
        </div>

        {audioBlob && <p>✅ Audio prêt à être envoyé !</p>}

        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
};

export default Inscription;
