import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Mail, 
  Folder, 
  Presentation, 
  Trash2, 
  Plus, 
  LogOut, 
  Send, 
  FileText, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Loader2, 
  ArrowUpRight, 
  User, 
  Sparkles,
  Award
} from 'lucide-react';
import { 
  auth, 
  db, 
  googleSignIn, 
  initAuth, 
  logout, 
  getAccessToken, 
  handleFirestoreError, 
  OperationType 
} from '../lib/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';

interface ClientNote {
  id: string;
  title: string;
  content: string;
  treatmentId?: string;
  createdAt: string;
}

interface WorkspaceActivityLog {
  id: string;
  actionType: string;
  description: string;
  timestamp: string;
}

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime?: string;
    date?: string;
  };
}

interface EmailMessage {
  id: string;
  snippet: string;
}

export const Workspace: React.FC = () => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'calendar' | 'drive' | 'gmail' | 'slides' | 'notes'>('overview');
  
  // Loading & Error States
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [isLoadingGmail, setIsLoadingGmail] = useState(false);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  // Integrated Data States
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [activityLogs, setActivityLogs] = useState<WorkspaceActivityLog[]>([]);

  // Form Inputs
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTreatment, setNoteTreatment] = useState('Soin Visage');
  
  // Gmail Send Form
  const [gmailRecipient, setGmailRecipient] = useState('contact@360degresfrance.org');
  const [gmailSubject, setGmailSubject] = useState('Demande de Renseignement - Institut D.R');
  const [gmailBody, setGmailBody] = useState('Bonjour,\n\nJe souhaite obtenir des conseils de suivi suite à mon soin d\'hier.\n\nCordialement.');
  const [isSendingMail, setIsSendingMail] = useState(false);

  // Calendar Sync Input
  const [eventDate, setEventDate] = useState('2026-06-25');
  const [eventTime, setEventTime] = useState('14:30');
  const [isBookingCalendar, setIsBookingCalendar] = useState(false);

  // Drive Upload Form
  const [uploadedFileName, setUploadedFileName] = useState('mon-journal-bien-etre.txt');
  const [uploadedFileText, setUploadedFileText] = useState('Mon suivi esthétique de l\'institut D.R Sante & Beauté. Mon derme est plus ferme et réhydraté.');
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);

  // Slides State
  const [isCreatingSlides, setIsCreatingSlides] = useState(false);
  const [createdPresentationId, setCreatedPresentationId] = useState<string | null>(null);

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
        syncUserProfile(currentUser);
        loadLocalData(currentUser);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync data whenever token becomes available
  useEffect(() => {
    if (token && user) {
      loadDriveFiles();
      loadCalendarEvents();
      loadGmailMessages();
    }
  }, [token, user]);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    setErrorText(null);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        syncUserProfile(result.user);
        loadLocalData(result.user);
        setSuccessText("Connexion Google réussie avec tous les accès Workspace !");
      }
    } catch (err: any) {
      setErrorText("La connexion a échoué. Veuillez réessayer.");
      console.error(err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      setDriveFiles([]);
      setCalendarEvents([]);
      setEmails([]);
      setSuccessText("Déconnecté avec succès.");
    } catch (err) {
      console.error(err);
    }
  };

  // PERSISTENCE: Create Client profile doc on success
  const syncUserProfile = async (firebaseUser: FirebaseUser) => {
    try {
      const profileRef = doc(db, 'clients', firebaseUser.uid);
      await setDoc(profileRef, {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || 'Client Institut',
        email: firebaseUser.email || '',
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (error) {
      console.error("Error syncing client profile to Firestore:", error);
    }
  };

  // PERSISTENCE: Load activity logs and client notes from Firestore
  const loadLocalData = async (firebaseUser: FirebaseUser) => {
    setIsLoadingNotes(true);
    try {
      // 1. Fetch customized Notes
      const notesPath = `clients/${firebaseUser.uid}/notes`;
      const notesSnap = await getDocs(collection(db, notesPath));
      const loadedNotes: ClientNote[] = [];
      notesSnap.forEach((docSnap) => {
        loadedNotes.push(docSnap.data() as ClientNote);
      });
      setNotes(loadedNotes);

      // 2. Fetch Audit/Activity Logs
      const logsPath = `clients/${firebaseUser.uid}/activity_logs`;
      const logsSnap = await getDocs(collection(db, logsPath));
      const loadedLogs: WorkspaceActivityLog[] = [];
      logsSnap.forEach((docSnap) => {
        loadedLogs.push(docSnap.data() as WorkspaceActivityLog);
      });
      setActivityLogs(loadedLogs.sort((a,b) => b.timestamp.localeCompare(a.timestamp)));
    } catch (error) {
      console.error("Error loading secure data from Firestore:", error);
    } finally {
      setIsLoadingNotes(false);
    }
  };

  // PERSISTENCE: Write new custom note to Firestore and reload
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !noteTitle || !noteContent) return;

    try {
      const noteId = 'note_' + Date.now();
      const notePath = `clients/${user.uid}/notes`;
      const noteDocRef = doc(db, notePath, noteId);
      
      const newNote: ClientNote = {
        id: noteId,
        title: noteTitle,
        content: noteContent,
        treatmentId: noteTreatment,
        createdAt: new Date().toISOString()
      };

      await setDoc(noteDocRef, newNote);
      setNoteTitle('');
      setNoteContent('');
      setNotes(prev => [newNote, ...prev]);
      setSuccessText("Note sauvegardée avec succès dans votre espace personnel.");
      
      // Log Local Action
      await logWorkspaceActivity('notes_write', `Création d'une note privée : ${noteTitle}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `clients/${user.uid}/notes`);
    }
  };

  // PERSISTENCE: Delete Note from Firestore
  const handleDeleteNote = async (noteId: string) => {
    if (!user) return;
    const confirmed = window.confirm("Souhaitez-vous supprimer définitivement cette note ?");
    if (!confirmed) return;

    try {
      const notePath = `clients/${user.uid}/notes`;
      await deleteDoc(doc(db, notePath, noteId));
      setNotes(prev => prev.filter(n => n.id !== noteId));
      setSuccessText("Note effacée de Firestore.");
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `clients/${user.uid}/notes`);
    }
  };

  // PERSISTENCE Helper: Log Workspace actions to Firestore
  const logWorkspaceActivity = async (actionType: string, description: string) => {
    if (!user) return;
    try {
      const logsPath = `clients/${user.uid}/activity_logs`;
      const logId = 'log_' + Date.now();
      const logDocRef = doc(db, logsPath, logId);

      const log: WorkspaceActivityLog = {
        id: logId,
        actionType,
        description,
        timestamp: new Date().toISOString()
      };

      await setDoc(logDocRef, log);
      setActivityLogs(prev => [log, ...prev]);
    } catch (error) {
      console.error("Error writing activity log:", error);
    }
  };

  // WORKSPACE API: Load Google Drive recent files dynamically (REAL CLIENT-SIDE CALL)
  const loadDriveFiles = async () => {
    if (!token) return;
    setIsLoadingDrive(true);
    try {
      const resp = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=10&fields=files(id,name,mimeType)', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json();
      if (data.files) {
        setDriveFiles(data.files);
      }
    } catch (err) {
      console.error("Error loaded files from Google Drive:", err);
    } finally {
      setIsLoadingDrive(false);
    }
  };

  // WORKSPACE API: Create/Upload simple Text report on user's Google Drive (REAL MUTATIVE CALL WITH CONFIRMATION)
  const handleUploadToDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;

    // MANDATORY confirmation dialog
    const confirmed = window.confirm(`Voulez-vous autoriser l'application à générer et uploader le fichier "${uploadedFileName}" sur votre Google Drive ?`);
    if (!confirmed) return;

    setIsUploadingDrive(true);
    setErrorText(null);
    try {
      const metadata = {
        name: uploadedFileName,
        mimeType: 'text/plain'
      };

      const fileContent = new Blob([uploadedFileText], { type: 'text/plain' });
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', fileContent);

      const resp = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: form
      });

      if (resp.ok) {
        const result = await resp.json();
        setSuccessText(`Fichier "${uploadedFileName}" créé sur votre Drive avec succès (ID: ${result.id}) !`);
        
        await logWorkspaceActivity('drive_upload', `Fichier uploadé vers Google Drive : ${uploadedFileName}`);
        loadDriveFiles();
      } else {
        throw new Error("Upload Drive failed");
      }
    } catch (err) {
      setErrorText("Échec de la création du rapport sur Drive. Vérifiez vos autorisations.");
    } finally {
      setIsUploadingDrive(false);
    }
  };

  // WORKSPACE API: Load Google Calendar events dynamically (REAL CLIENT-SIDE CALL)
  const loadCalendarEvents = async () => {
    if (!token) return;
    setIsLoadingCalendar(true);
    try {
      const now = new Date().toISOString();
      const resp = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?maxResults=10&timeMin=${now}&orderBy=startTime&singleEvents=true`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json();
      if (data.items) {
        setCalendarEvents(data.items);
      }
    } catch (err) {
      console.error("Error loading events from Google Calendar:", err);
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  // WORKSPACE API: Sync evaluation appointment directly on User's real Google Calendar (REAL MUTATIVE CALL WITH CONFIRMATION)
  const handleAddCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;

    // MANDATORY confirmation dialog
    const dateTimeStr = `${eventDate}T${eventTime}:00`;
    const confirmed = window.confirm(`Souhaitez-vous inscrire votre consultation esthétique du ${eventDate} à ${eventTime} sur votre agenda Google Calendar ?`);
    if (!confirmed) return;

    setIsBookingCalendar(true);
    setErrorText(null);
    try {
      const startDateTime = new Date(dateTimeStr);
      const endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1-hour duration

      const eventPayload = {
        summary: "Soin Esthétique - D.R Santé & Beauté",
        description: "Votre séance personnalisée de soin et de beauté à l'institut.\nAdresse : 45 Rue de l'Ancienne Comédie, Paris 11.",
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: "Europe/Paris"
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: "Europe/Paris"
        },
        reminders: {
          useDefault: true
        }
      };

      const resp = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventPayload)
      });

      if (resp.ok) {
        setSuccessText("Rendez-vous Planifié ! L'événement a été inscrit en temps réel dans votre agenda Google Calendar.");
        
        await logWorkspaceActivity('calendar_sync', `Soin esthétique programmé sur Google Agenda : ${eventDate} à ${eventTime}`);
        loadCalendarEvents();
      } else {
        throw new Error("Calendar schedule failed.");
      }
    } catch (err) {
      setErrorText("L'inscription de l'événement a échoué. Assurez-vous d'avoir accepté les autorisations Agenda.");
    } finally {
      setIsBookingCalendar(false);
    }
  };

  // WORKSPACE API: Load User Gmail messages preview (REAL CLIENT-SIDE CALL)
  const loadGmailMessages = async () => {
    if (!token) return;
    setIsLoadingGmail(true);
    try {
      const resp = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=5', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await resp.json();
      if (data.messages) {
        const fetchedEmails: EmailMessage[] = [];
        for (const msg of data.messages) {
          const detailResp = await fetch(`https://www.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=minimal`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const detail = await detailResp.json();
          fetchedEmails.push({
            id: msg.id,
            snippet: detail.snippet || 'Sans contenu'
          });
        }
        setEmails(fetchedEmails);
      }
    } catch (err) {
      console.error("Error loading email previews from Gmail:", err);
    } finally {
      setIsLoadingGmail(false);
    }
  };

  // WORKSPACE API: Send direct confirmation/support message via Gmail (REAL MUTATIVE CALL WITH CONFIRMATION)
  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) return;

    // MANDATORY confirmation dialog
    const confirmed = window.confirm(`Êtes-vous sûr de vouloir de envoyer un e-mail réel depuis votre compte Gmail principal à l'adresse "${gmailRecipient}" ?`);
    if (!confirmed) return;

    setIsSendingMail(true);
    setErrorText(null);
    try {
      // Craft clean raw MIME message
      const emailLines = [
        `From: me`,
        `To: ${gmailRecipient}`,
        `Subject: ${gmailSubject}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/plain; charset=utf-8`,
        ``,
        gmailBody
      ];
      
      const rawEmail = emailLines.join('\n');
      // base64 url safe encoding
      const encodedEmail = btoa(unescape(encodeURIComponent(rawEmail)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const resp = await fetch('https://www.googleapis.com/gmail/v1/users/me/messages/send', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ raw: encodedEmail })
      });

      if (resp.ok) {
        setSuccessText(`E-mail envoyé avec succès via Gmail à ${gmailRecipient} !`);
        setGmailSubject('Demande de Renseignement - Institut D.R');
        setGmailBody('Bonjour,\n\nE-mail de suivi bien envoyé!');
        
        await logWorkspaceActivity('mail_sent', `E-mail de contact envoyé via Gmail à ${gmailRecipient}`);
        loadGmailMessages();
      } else {
        throw new Error("Gmail send failed.");
      }
    } catch (err) {
      setErrorText("L'envoi d'e-mail a échoué. Vérifiez vos permissions et l'adresse.");
    } finally {
      setIsSendingMail(false);
    }
  };

  // WORKSPACE API: Create real Google Slides Aesthetic Progress Presentation (REAL MUTATIVE CALL WITH CONFIRMATION)
  const handleCreateSlides = async () => {
    if (!token || !user) return;

    // MANDATORY confirmation dialog
    const confirmed = window.confirm("Souhaitez-vous générer un nouveau diaporama de suivi de Protocole Esthétique complet dans Google Slides ?");
    if (!confirmed) return;

    setIsCreatingSlides(true);
    setErrorText(null);
    try {
      // Create blank presentation
      const createResp = await fetch('https://slides.googleapis.com/v1/presentations', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `Mon Protocole de Beauté Esthétique - ${user.displayName || 'Client'}`
        })
      });

      if (createResp.ok) {
        const presentation = await createResp.json();
        setCreatedPresentationId(presentation.presentationId);
        setSuccessText(`Présentation Google Slides générée d'acte d'analyse avec succès ! (ID: ${presentation.presentationId})`);
        
        await logWorkspaceActivity('slides_generation', `Création d'une présentation de soin Google Slides`);
      } else {
        throw new Error("Google Slides creation failed.");
      }
    } catch (err) {
      setErrorText("La création de la présentation a échoué. Vérifiez vos accès Google Slides.");
    } finally {
      setIsCreatingSlides(false);
    }
  };

  // If not authenticated, prompt Login
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 py-16 px-4 font-sans flex items-center justify-center">
        <div className="max-w-2xl w-full bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden animate-fade-in">
          
          <div className="bg-gradient-to-tr from-primary to-accent p-8 md:p-12 text-center text-white relative">
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-12 translate-x-12"></div>
            <Award className="w-16 h-16 text-white/90 mx-auto mb-4 animate-pulse" />
            <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-none">Espace Client & Workspace</h1>
            <p className="mt-4 text-purple-100 font-light text-sm md:text-base leading-relaxed">
              Connectez-vous en toute sécurité à notre institut et utilisez vos outils Google Workspace préférés pour gérer vos rendez-vous, partager d'élégants fichiers, et consulter vos rapports de soin.
            </p>
          </div>

          <div className="p-8 md:p-12 space-y-8 text-center">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-start gap-3">
                <Calendar className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Google Agenda</h4>
                  <p className="text-[11px] text-gray-500 mt-1">Synchronisez vos soins de l'institut et configurez des rappels.</p>
                </div>
              </div>
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-start gap-3">
                <Folder className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Google Drive</h4>
                  <p className="text-[11px] text-gray-500 mt-1">Uploadez et archivez vos bilans cutanés et photos d'évolution.</p>
                </div>
              </div>
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-start gap-3">
                <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Gmail notifications</h4>
                  <p className="text-[11px] text-gray-500 mt-1">Consultez et envoyez vos messages de suivi à votre esthéticienne.</p>
                </div>
              </div>
              <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 flex items-start gap-3">
                <Presentation className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">Google Slides</h4>
                  <p className="text-[11px] text-gray-500 mt-1">Générez un diaporama esthétique personnalisé de votre profil.</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-150 pt-8 flex flex-col items-center justify-center gap-4">
              <button 
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="gsi-material-button text-sm font-bold flex items-center justify-center gap-3 bg-white text-gray-700 border border-gray-300 rounded-full px-8 py-4 shadow-md hover:shadow-lg hover:border-gray-400 active:scale-95 transition-all w-full max-w-sm"
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    <span>Communication en cours...</span>
                  </>
                ) : (
                  <>
                    <div className="gsi-material-button-icon">
                      <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block", width: "18px", height: "18px" }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                        <path fill="none" d="M0 0h48v48H0z"></path>
                      </svg>
                    </div>
                    <span className="gsi-material-button-contents font-sans font-black tracking-wide text-xs uppercase text-slate-700">Se connecter avec Google</span>
                  </>
                )}
              </button>
              
              <span className="text-[10px] text-gray-400 font-mono">Identité sécurisée par Google Firebase Authentication et Cloud Firestore DB.</span>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // If Authenticated
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Profile Card Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-purple-100/60 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-primary to-accent text-white flex items-center justify-center font-black text-2xl shadow-md uppercase shrink-0">
              {user.displayName ? user.displayName.slice(0, 2) : 'Cl'}
            </div>
            <div>
              <span className="text-[10px] bg-emerald-50 text-emerald-600 px-3 py-1 font-bold border border-emerald-150 rounded-md tracking-wider uppercase">
                Profil Client Beauté Connecté
              </span>
              <h1 className="text-2xl font-extrabold text-[#111827] mt-1.5 tracking-tight">
                Bonjour, {user.displayName || 'Cher Client'} !
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">{user.email}</p>
            </div>
          </div>

          <div className="flex gap-3 shrink-0">
            <button 
              onClick={handleLogout}
              className="px-5 py-3 rounded-2xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-gray-500 text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 border border-slate-200"
            >
              <LogOut className="w-4 h-4" /> Se Déconnecter
            </button>
          </div>
        </div>

        {/* Global Notifications panel */}
        {successText && (
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-150 text-emerald-800 text-xs font-bold font-sans flex items-center gap-2.5 relative animate-scale-up">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successText}</span>
            <button onClick={() => setSuccessText(null)} className="absolute right-4 text-emerald-400 hover:text-emerald-700">✕</button>
          </div>
        )}
        {errorText && (
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-150 text-rose-800 text-xs font-bold font-sans flex items-center gap-2.5 relative animate-scale-up">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorText}</span>
            <button onClick={() => setErrorText(null)} className="absolute right-4 text-rose-400 hover:text-rose-700">✕</button>
          </div>
        )}

        {/* Workspace Operations Grid & Navigation Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Tabs Menu */}
          <div className="space-y-2 bg-white p-4 rounded-3xl border border-purple-100/50 shadow-sm h-fit">
            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 block px-3 mb-3">Menu Integré</span>
            <button 
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${activeTab === 'overview' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-purple-50'}`}
            >
              <span className="flex items-center gap-2.5"><Activity className="w-4 h-4" /> Vue d'ensemble</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-100 text-gray-600 rounded-md">Live</span>
            </button>
            <button 
              onClick={() => setActiveTab('calendar')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors ${activeTab === 'calendar' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-purple-50'}`}
            >
              <Calendar className="w-4 h-4" /> Google Calendar
            </button>
            <button 
              onClick={() => setActiveTab('drive')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors ${activeTab === 'drive' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-purple-50'}`}
            >
              <Folder className="w-4 h-4" /> Google Drive
            </button>
            <button 
              onClick={() => setActiveTab('gmail')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors ${activeTab === 'gmail' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-purple-50'}`}
            >
              <Mail className="w-4 h-4" /> Gmail Suivi
            </button>
            <button 
              onClick={() => setActiveTab('slides')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2.5 transition-colors ${activeTab === 'slides' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-purple-50'}`}
            >
              <Presentation className="w-4 h-4" /> Google Slides
            </button>
            <button 
              onClick={() => setActiveTab('notes')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-colors ${activeTab === 'notes' ? 'bg-primary text-white' : 'text-gray-600 hover:bg-purple-50'}`}
            >
              <span className="flex items-center gap-2.5"><FileText className="w-4 h-4" /> Notes & Firestore</span>
              <span className="text-[10px] bg-purple-100 text-primary px-1.5 py-0.5 rounded-md font-mono">{notes.length}</span>
            </button>
          </div>

          {/* Active View Display Section */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-8 border border-purple-100/50 shadow-sm min-h-[450px]">
            
            {/* 1. OVERVIEW VIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-fade-in">
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" /> Tableau de Bord Google Workspace & Firestore
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Regardez vos services synchronisés en temps réel.</p>
                </div>

                {/* Dashboard Stats Panel */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 bg-gradient-to-tr from-purple-50 to-pink-50/20 rounded-2xl border border-purple-100 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Notes (Firestore)</span>
                      <span className="text-3xl font-black text-primary mt-1 block">{notes.length}</span>
                    </div>
                    <FileText className="w-10 h-10 text-primary/30" />
                  </div>
                  <div className="p-5 bg-gradient-to-tr from-purple-50 to-pink-50/20 rounded-2xl border border-purple-100 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Événements Agenda</span>
                      <span className="text-3xl font-black text-primary mt-1 block">{calendarEvents.length}</span>
                    </div>
                    <Calendar className="w-10 h-10 text-primary/30" />
                  </div>
                  <div className="p-5 bg-gradient-to-tr from-purple-50 to-pink-50/20 rounded-2xl border border-purple-100 flex items-center justify-between">
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400">Fichiers Drive</span>
                      <span className="text-3xl font-black text-primary mt-1 block">{driveFiles.length}</span>
                    </div>
                    <Folder className="w-10 h-10 text-primary/30" />
                  </div>
                </div>

                {/* Audit & Activity Logs (Firestore Secured Connection) */}
                <div>
                  <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider mb-4 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                    <Activity className="w-4 h-4 text-accent" /> Historique de Synchronisation (Persistent)
                  </h4>
                  {activityLogs.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Aucune action n'a été loggée pour le moment. Effectuez une opération Google Drive ou Google Agenda ci-dessous.</p>
                  ) : (
                    <div className="space-y-3 font-mono text-xs max-h-60 overflow-y-auto pr-2">
                      {activityLogs.map((log) => (
                        <div key={log.id} className="flex items-start justify-between p-3 bg-zinc-50 border border-gray-200/50 rounded-xl">
                          <div className="space-y-1">
                            <span className="px-2 py-0.5 bg-purple-50 text-primary text-[9px] font-bold uppercase rounded-md">
                              {log.actionType}
                            </span>
                            <p className="text-gray-700 font-sans mt-1">{log.description}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 shrink-0">
                            {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2. GOOGLE CALENDAR VIEW */}
            {activeTab === 'calendar' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-primary" /> Inscription à votre Google Cal
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Inscrivez vos soins esthétiques directement dans votre agenda Google officiel.</p>
                  </div>
                  <button 
                    onClick={loadCalendarEvents} 
                    disabled={isLoadingCalendar}
                    className="p-2.5 rounded-xl border border-gray-200 text-slate-600 hover:bg-slate-50 transition active:scale-90"
                    title="Rafraîchir l'agenda"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingCalendar ? 'animate-spin text-primary' : ''}`} />
                  </button>
                </div>

                {/* Plan form */}
                <form onSubmit={handleAddCalendarEvent} className="p-5 bg-purple-50/50 border border-purple-100 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Date du Soin</label>
                    <input 
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Heure du Soin</label>
                    <input 
                      type="time"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isBookingCalendar}
                    className="px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    {isBookingCalendar ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )} Inscrire Agenda
                  </button>
                </form>

                {/* Event list */}
                <div>
                  <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider mb-4">Prochaines consultations de votre Google Agenda</h4>
                  {isLoadingCalendar ? (
                    <div className="flex justify-center p-6"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                  ) : calendarEvents.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Aucun événement à venir trouvé sur votre Google Agenda principal.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {calendarEvents.map((evt) => (
                        <div key={evt.id} className="p-3 bg-zinc-50 border border-gray-250/30 rounded-xl flex items-center justify-between text-xs gap-3">
                          <div className="space-y-1">
                            <span className="font-bold text-gray-800">{evt.summary}</span>
                          </div>
                          <span className="text-[10px] font-mono font-black text-primary uppercase shrink-0">
                            {evt.start?.dateTime ? new Date(evt.start.dateTime).toLocaleDateString([], {day:'2-digit', month:'2-digit', year:'2-digit', hour:'2-digit', minute:'2-digit'}) : 'Date fixe'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3. GOOGLE DRIVE VIEW */}
            {activeTab === 'drive' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                      <Folder className="w-5 h-5 text-primary" /> Vos Documents de Suivi (Google Drive)
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Uploadez, stockez et téléchargez vos bilans d'analyse cutanée personnalisés.</p>
                  </div>
                  <button 
                    onClick={loadDriveFiles} 
                    disabled={isLoadingDrive}
                    className="p-2.5 rounded-xl border border-gray-200 text-slate-600 hover:bg-slate-50 transition active:scale-90"
                    title="Rafraîchir l'espace Drive"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingDrive ? 'animate-spin text-primary' : ''}`} />
                  </button>
                </div>

                {/* Upload document form */}
                <form onSubmit={handleUploadToDrive} className="p-5 bg-purple-50/50 border border-purple-100 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Nom du fichier text à créer</label>
                    <input 
                      type="text"
                      value={uploadedFileName}
                      onChange={(e) => setUploadedFileName(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Contenu du rapport d'activités</label>
                    <textarea 
                      value={uploadedFileText}
                      onChange={(e) => setUploadedFileText(e.target.value)}
                      className="w-full h-24 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={isUploadingDrive}
                      className="px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95"
                    >
                      {isUploadingDrive ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )} Sauvegarder dans Google Drive
                    </button>
                  </div>
                </form>

                {/* File list */}
                <div>
                  <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider mb-4">Fichiers récents stockés sur votre Drive</h4>
                  {isLoadingDrive ? (
                    <div className="flex justify-center p-6"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                  ) : driveFiles.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Aucun fichier présent ou détecté sur votre stockage Google Drive.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {driveFiles.map((f) => (
                        <div key={f.id} className="p-3 bg-zinc-50 border border-gray-150 rounded-xl flex items-center justify-between text-xs gap-3 font-sans">
                          <div className="flex items-center gap-2.5">
                            <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                            <span className="font-semibold text-gray-800 line-clamp-1">{f.name}</span>
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono tracking-wider shrink-0 uppercase">{f.mimeType.split('/').pop()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. GMAIL MESSAGES VIEW */}
            {activeTab === 'gmail' && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                      <Mail className="w-5 h-5 text-primary" /> Message & Rapports via Gmail
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">Envoyez des demandes directes ou des e-mails d'inscription au salon de beauté.</p>
                  </div>
                  <button 
                    onClick={loadGmailMessages} 
                    disabled={isLoadingGmail}
                    className="p-2.5 rounded-xl border border-gray-200 text-slate-600 hover:bg-slate-50 transition active:scale-90"
                    title="Rafraîchir la boîte mail"
                  >
                    <RefreshCw className={`w-4 h-4 ${isLoadingGmail ? 'animate-spin text-primary' : ''}`} />
                  </button>
                </div>

                {/* Send email form */}
                <form onSubmit={handleSendEmail} className="p-5 bg-purple-50/50 border border-purple-100 rounded-2xl grid grid-cols-1 gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-sans">Destinataire Institut</label>
                      <input 
                        type="email"
                        value={gmailRecipient}
                        onChange={(e) => setGmailRecipient(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none font-sans"
                        placeholder="contact@360degresfrance.org"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-sans">Sujet de l'E-mail</label>
                      <input 
                        type="text"
                        value={gmailSubject}
                        onChange={(e) => setGmailSubject(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none font-sans"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5 font-sans">Corps du message</label>
                    <textarea 
                      value={gmailBody}
                      onChange={(e) => setGmailBody(e.target.value)}
                      className="w-full h-32 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none font-sans leading-relaxed"
                    />
                  </div>
                  <div className="flex justify-end pt-3">
                    <button
                      type="submit"
                      disabled={isSendingMail}
                      className="px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95"
                    >
                      {isSendingMail ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )} Envoyer via votre Gmail
                    </button>
                  </div>
                </form>

                {/* Email headers */}
                <div>
                  <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider mb-4">Derniers messages reçus / envoyés (Aperçu Gmail)</h4>
                  {isLoadingGmail ? (
                    <div className="flex justify-center p-6"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                  ) : emails.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Aucun e-mail trouvé ou accès restreint.</p>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2 font-sans">
                      {emails.map((m) => (
                        <div key={m.id} className="p-3 bg-zinc-50 border border-gray-150 rounded-xl text-xs text-gray-650 leading-relaxed max-h-24 overflow-hidden shadow-sm">
                          <p className="font-light italic">"{m.snippet}"</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5. GOOGLE SLIDES VIEW */}
            {activeTab === 'slides' && (
              <div className="space-y-8 animate-fade-in text-center py-8">
                <Presentation className="w-16 h-16 text-primary mx-auto animate-bounce mb-3" />
                <div className="max-w-md mx-auto">
                  <h3 className="text-xl font-extrabold text-gray-900 tracking-tight mb-2">
                    Analyse & Rapports esthétiques Google Slides
                  </h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-6">
                    Générez une présentation de diaporama complète et élégante contenant vos fiches conseils, soins de la peau, manucure et photos avant-après pour impressionner vos proches.
                  </p>
                  
                  {createdPresentationId ? (
                    <div className="p-5 bg-purple-50/50 border border-purple-200 rounded-2xl relative">
                      <span className="text-[9px] uppercase font-black text-purple-600 tracking-wide block mb-1">Diaporama créé</span>
                      <p className="text-xs font-bold text-slate-800 tracking-wide leading-none">{`Analyse Esthétique - ID: ${createdPresentationId.slice(0, 10)}...`}</p>
                      
                      <a 
                        href={`https://docs.google.com/presentation/d/${createdPresentationId}/edit`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-accent text-white text-xs font-bold uppercase rounded-lg shadow-sm active:scale-95 transition-all text-center"
                      >
                        Ouvrir dans Google Slides <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  ) : (
                    <button
                      onClick={handleCreateSlides}
                      disabled={isCreatingSlides}
                      className="px-6 py-4 bg-primary hover:bg-accent text-white text-xs font-bold uppercase tracking-wider rounded-2xl shadow-md transition-all active:scale-95 inline-flex items-center gap-2"
                    >
                      {isCreatingSlides ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Presentation className="w-4 h-4" />
                      )} Générer mon Diaporama Esthétique
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 6. CLIENT FIRESTORE NOTES VIEW */}
            {activeTab === 'notes' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" /> Vos Notes Personnelles (Persistence Firestore)
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Prenez note de vos ressentis post-séances pour que votre esthéticienne adapte au mieux les prochains protocoles.</p>
                </div>

                {/* Form to submit note */}
                <form onSubmit={handleAddNote} className="p-5 bg-purple-50/50 border border-purple-100 rounded-2xl grid grid-cols-1 gap-4 font-sans">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Sujet / Titre</label>
                      <input 
                        type="text"
                        value={noteTitle}
                        onChange={(e) => setNoteTitle(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                        placeholder="Ex: Hydratation après laser"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Type de Soin</label>
                      <select 
                        value={noteTreatment}
                        onChange={(e) => setNoteTreatment(e.target.value)}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                      >
                        <option value="Soin Visage">Soin Visage</option>
                        <option value="Manucure">Manucure</option>
                        <option value="Beauté des Pieds">Beauté des Pieds</option>
                        <option value="Massage bien-être">Massage bien-être</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-1.5">Observations / Remarques</label>
                    <textarea 
                      value={noteContent}
                      onChange={(e) => setNoteContent(e.target.value)}
                      className="w-full h-24 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                      placeholder="Ex: Ma peau s'est parfaitement apaisée dès le lendemain..."
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-6 py-3 bg-primary hover:bg-accent text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95"
                    >
                      <Plus className="w-4 h-4" /> Enregistrer dans Firestore
                    </button>
                  </div>
                </form>

                {/* List of saved notes */}
                <div className="space-y-3 font-sans">
                  <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider border-b border-gray-100 pb-2">Vos Notes Actuelles</h4>
                  
                  {isLoadingNotes ? (
                    <div className="flex justify-center p-6"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                  ) : notes.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">Aucune note pour le moment.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {notes.map((n) => (
                        <div key={n.id} className="p-5 bg-zinc-50 border border-gray-200/50 rounded-2xl flex flex-col justify-between shadow-sm relative">
                          <button 
                            onClick={() => handleDeleteNote(n.id)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-rose-600 p-1"
                            title="Supprimer la note"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div>
                            <span className="text-[9px] px-2 py-0.5 bg-purple-100 text-primary font-bold uppercase rounded-md tracking-wide">
                              {n.treatmentId}
                            </span>
                            <h5 className="font-extrabold text-sm text-gray-900 mt-2 mb-2 leading-tight pr-6">{n.title}</h5>
                            <p className="text-xs text-gray-650 leading-relaxed font-light">{n.content}</p>
                          </div>
                          <span className="text-[9px] text-gray-400 font-mono text-right mt-4 leading-none">{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Workspace;
