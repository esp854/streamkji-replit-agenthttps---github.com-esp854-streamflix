import React, { useState } from 'react';
import { useAuth } from '../contexts/auth-context';
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const EmailTest: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  
  const { token } = useAuth();

  const sendTestEmail = async () => {
    if (!email || !subject || !message) {
      setResult({ success: false, message: 'Veuillez remplir tous les champs' });
      return;
    }

    setIsSending(true);
    setResult(null);

    try {
      // Get CSRF token
      let csrfToken = '';
      try {
        const csrfResponse = await fetch('/api/csrf-token', {
          method: 'GET',
          credentials: 'include'
        });
        if (csrfResponse.ok) {
          const csrfData = await csrfResponse.json();
          csrfToken = csrfData.csrfToken;
        }
      } catch (error) {
        console.warn('Failed to get CSRF token:', error);
      }

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...(csrfToken ? { 'x-csrf-token': csrfToken } : {}),
        },
        body: JSON.stringify({ to: email, subject, message }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ success: true, message: 'Email envoyé avec succès!' });
      } else {
        setResult({ success: false, message: data.error || 'Erreur lors de l\'envoi de l\'email' });
      }
    } catch (error) {
      setResult({ success: false, message: 'Erreur de connexion' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Test d'envoi d'email</h2>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
          Email destinataire
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
          placeholder="utilisateur@example.com"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subject">
          Sujet
        </label>
        <Input
          id="subject"
          type="text"
          value={subject}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
          placeholder="Sujet de l'email"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="message">
          Message
        </label>
        <Textarea
          id="message"
          value={message}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)}
          placeholder="Contenu de l'email"
          rows={4}
        />
      </div>

      <button
        onClick={sendTestEmail}
        disabled={isSending}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
      >
        {isSending ? 'Envoi en cours...' : 'Envoyer Email'}
      </button>

      {result && (
        <div className={`mt-4 p-3 rounded ${result.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {result.message}
        </div>
      )}
    </div>
  );
};

export default EmailTest;