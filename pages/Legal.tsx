import React from 'react';
import { COMPANY_INFO } from '../constants';

const Legal: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 sm:p-12 rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mentions Légales & Politique de Confidentialité</h1>
        
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">1. Éditeur du site</h2>
          <p className="text-gray-600 mb-2">
            Le site <strong>{COMPANY_INFO.name}</strong> est édité par l'entreprise exploitant le salon situé au {COMPANY_INFO.address}.
          </p>
          <ul className="list-disc pl-5 text-gray-600 space-y-1">
            <li><strong>Adresse :</strong> {COMPANY_INFO.address}</li>
            <li><strong>Téléphone :</strong> {COMPANY_INFO.phone}</li>
            <li><strong>Email :</strong> {COMPANY_INFO.email}</li>
            <li><strong>Directeur de la publication :</strong> [Nom du Gérant]</li>
            <li><strong>Hébergement :</strong> [Nom de l'hébergeur]</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">2. Propriété intellectuelle</h2>
          <p className="text-gray-600">
            L'ensemble de ce site relève de la législation française et internationale sur le droit d'auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">3. Protection des données personnelles (RGPD)</h2>
          <p className="text-gray-600 mb-4">
            Conformément au Règlement Général sur la Protection des Données (RGPD), nous vous informons que les informations recueillies sur le formulaire de réservation sont enregistrées dans un fichier informatisé par <strong>{COMPANY_INFO.name}</strong> pour la gestion des rendez-vous et de la clientèle.
          </p>
          <p className="text-gray-600 mb-4">
            Elles sont conservées pendant une durée de 3 ans après votre dernier contact et sont destinées uniquement à la direction de l'établissement.
          </p>
          <p className="text-gray-600">
            Conformément à la loi « informatique et libertés », vous pouvez exercer votre droit d'accès aux données vous concernant et les faire rectifier en contactant : <strong>{COMPANY_INFO.email}</strong>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">4. Cookies</h2>
          <p className="text-gray-600">
            Ce site peut utiliser des cookies techniques nécessaires au bon fonctionnement de la navigation. Ces cookies ne collectent pas de données personnelles à des fins publicitaires sans votre consentement préalable.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Legal;