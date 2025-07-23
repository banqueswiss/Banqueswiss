
const validIdentifiant = '212000';
const validPassword = '2103';

const translations = {
  fr: {
    title: "Crédit Royal",
    login: "Se connecter",
    logout: "Déconnexion",
    nav_comptes: "Comptes",
    nav_virement: "Virement",
    nav_profil: "Profil",
    your_accounts: "Vos comptes",
    history_title: "10 dernières opérations",
    transfer_title: "Effectuer un virement",
    from_account: "Compte source",
    beneficiary: "Bénéficiaire",
    amount: "Montant (€)",
    send: "Envoyer",
    profile_title: "Profil utilisateur"
  },
  en: {
    title: "Royal Credit",
    login: "Log in",
    logout: "Log out",
    nav_comptes: "Accounts",
    nav_virement: "Transfer",
    nav_profil: "Profile",
    your_accounts: "Your accounts",
    history_title: "Last 10 operations",
    transfer_title: "Make a transfer",
    from_account: "From account",
    beneficiary: "Beneficiary",
    amount: "Amount (€)",
    send: "Send",
    profile_title: "User profile"
  },
  de: {
    title: "Königliches Kreditinstitut",
    login: "Einloggen",
    logout: "Abmelden",
    nav_comptes: "Konten",
    nav_virement: "Überweisung",
    nav_profil: "Profil",
    your_accounts: "Ihre Konten",
    history_title: "Letzte 10 Vorgänge",
    transfer_title: "Überweisung tätigen",
    from_account: "Quellkonto",
    beneficiary: "Empfänger",
    amount: "Betrag (€)",
    send: "Senden",
    profile_title: "Benutzerprofil"
  }
};

const loginContainer = document.getElementById('login-container');
const dashboard = document.getElementById('dashboard');
const btnLogin = document.getElementById('btn-login');
const errorMsg = document.getElementById('error-msg');
const loading = document.getElementById('loading');
const navLinks = document.querySelectorAll('nav a[data-section]');
const sections = document.querySelectorAll('.content-section');
const btnLogout = document.getElementById('btn-logout');
const virementForm = document.getElementById('virement-form');
const virementMessage = document.getElementById('virement-message');
const historiqueDiv = document.getElementById('historique');
const langSelect = document.getElementById('lang-select');

let soldeCourant = 200000000;
let soldeEpargne = 1230050;
let compteBloque = true;
let historique = [];

function formatEuro(cents) {
  return (cents / 100).toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
}

function updateSoldeUI() {
  document.getElementById('solde-courant').textContent = formatEuro(soldeCourant);
  document.getElementById('solde-epargne').textContent = formatEuro(soldeEpargne);
}

function addOperation(libelle, montant) {
  const date = new Date().toLocaleDateString('fr-FR');
  const entry = `${date}   ${libelle.padEnd(30)} ${montant >= 0 ? '+' : ''}${formatEuro(montant)}`;
  historique.unshift(entry);
  if (historique.length > 10) historique.pop();
  historiqueDiv.textContent = historique.join('\n');
}

btnLogin.addEventListener('click', () => {
  const identifiant = document.getElementById('identifiant').value.trim();
  const password = document.getElementById('password').value.trim();
  errorMsg.textContent = '';

  if (identifiant !== validIdentifiant || password !== validPassword) {
    errorMsg.textContent = "Identifiant ou mot de passe incorrect.";
    return;
  }

  loading.style.display = 'block';
  btnLogin.disabled = true;

  setTimeout(() => {
    loading.style.display = 'none';
    loginContainer.style.display = 'none';
    dashboard.style.display = 'block';
    updateSoldeUI();
    showSection('comptes');
  }, 1000);
});

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    showSection(link.dataset.section);
    virementMessage.textContent = '';
  });
});

function showSection(id) {
  sections.forEach(section => {
    section.style.display = section.id === id ? 'block' : 'none';
  });
}

btnLogout.addEventListener('click', () => {
  dashboard.style.display = 'none';
  loginContainer.style.display = 'block';
  btnLogin.disabled = false;
});

virementForm.addEventListener('submit', e => {
  e.preventDefault();

  if (compteBloque) {
    virementMessage.style.color = 'red';
    virementMessage.textContent = 'Votre compte est bloqué. Vous ne pouvez pas effectuer de virements.';
    return;
  }

  const source = document.getElementById('compte-source').value;
  const destinataire = document.getElementById('beneficiaire').value.trim();
  const montant = Math.round(parseFloat(document.getElementById('montant').value) * 100);

  if (!destinataire || isNaN(montant) || montant <= 0) {
    virementMessage.style.color = 'red';
    virementMessage.textContent = 'Saisie invalide.';
    return;
  }

  if ((source === 'courant' && montant > soldeCourant) || (source === 'epargne' && montant > soldeEpargne)) {
    virementMessage.style.color = 'red';
    virementMessage.textContent = 'Fonds insuffisants.';
    return;
  }

  virementMessage.style.color = '#ffd633';
  virementMessage.textContent = 'Traitement...';

  setTimeout(() => {
    if (source === 'courant') soldeCourant -= montant;
    else soldeEpargne -= montant;

    updateSoldeUI();
    virementMessage.style.color = '#00cc00';
    virementMessage.textContent = 'Virement effectué avec succès.';
    addOperation(`Virement vers ${destinataire}`, -montant);
    virementForm.reset();
  }, 1500);
});

function setLang(lang) {
  const elements = document.querySelectorAll('[data-i18n]');
  elements.forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[lang] && translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
}

langSelect.addEventListener('change', () => {
  setLang(langSelect.value);
});

// Init
setLang('fr');
