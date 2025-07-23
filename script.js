const validIdentifiant = '212000';
const validPassword = '2103';

const loginContainer = document.getElementById('login-container');
const dashboard = document.getElementById('dashboard');
const btnLogin = document.getElementById('btn-login');
const errorMsg = document.getElementById('error-msg');
const loading = document.getElementById('loading');
const navLinks = document.querySelectorAll('nav a');
const sections = document.querySelectorAll('.content-section');
const btnLogout = document.getElementById('btn-logout');
const virementForm = document.getElementById('virement-form');
const virementMessage = document.getElementById('virement-message');
const cardNumberElem = document.getElementById('card-number');

// Soldes (en centimes)
let soldeCourant = 200000000; // 2 000 000 €
let soldeEpargne = 1230050;   // 12 300,50 €

// Formatage € français
function formatEuro(cents) {
  let euros = (cents / 100).toFixed(2);
  return euros.toString().replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €';
}

// Masquer numéro carte
function maskCardNumber(num) {
  return '**** **** **** ' + num.slice(-4);
}

// Mise à jour affichage soldes
function updateSoldeUI() {
  document.getElementById('solde-courant').textContent = formatEuro(soldeCourant);
  document.getElementById('solde-epargne').textContent = formatEuro(soldeEpargne);
  document.getElementById('epargne-solde').textContent = formatEuro(soldeEpargne);
  // Mise à jour option compte-source virement
  document.querySelector('#compte-source option[value="courant"]').textContent = `Compte courant - ${formatEuro(soldeCourant)}`;
  document.querySelector('#compte-source option[value="epargne"]').textContent = `Compte épargne - ${formatEuro(soldeEpargne)}`;
}

// Initialisation
cardNumberElem.textContent = maskCardNumber('1234567890123456');
updateSoldeUI();

// Login
btnLogin.addEventListener('click', () => {
  const identifiant = document.getElementById('identifiant').value.trim();
  const password = document.getElementById('password').value.trim();

  errorMsg.style.display = 'none';

  if (identifiant === '' || password === '') {
    errorMsg.textContent = 'Veuillez remplir tous les champs.';
    errorMsg.style.display = 'block';
    return;
  }

  if (identifiant !== validIdentifiant || password !== validPassword) {
    errorMsg.textContent = 'Identifiant ou mot de passe incorrect.';
    errorMsg.style.display = 'block';
    return;
  }

  loading.style.display = 'block';
  btnLogin.disabled = true;

  setTimeout(() => {
    loading.style.display = 'none';
    loginContainer.style.display = 'none';
    dashboard.style.display = 'block';
    showSection('comptes');
    initChart();
  }, 2000);
});

// Navigation onglets
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navLinks.forEach(l => l.classList.remove('active'));
    link.classList.add('active');

    const target = link.getAttribute('data-section');
    showSection(target);
    virementMessage.textContent = '';
  });
});

function showSection(id) {
  sections.forEach(section => {
    if (section.id === id) {
      section.classList.add('active-section');
    } else {
      section.classList.remove('active-section');
    }
  });
}

// Logout
btnLogout.addEventListener('click', () => {
  dashboard.style.display = 'none';
  loginContainer.style.display = 'block';
  document.getElementById('identifiant').value = '';
  document.getElementById('password').value = '';
  btnLogin.disabled = false;
  errorMsg.style.display = 'none';
  virementMessage.textContent = '';
});

// Virement form
virementForm.addEventListener('submit', e => {
  e.preventDefault();
  const compteSource = document.getElementById('compte-source').value;
  const beneficiaire = document.getElementById('beneficiaire').value.trim();
  const montantInput = document.getElementById('montant');
  const montant = Math.round(parseFloat(montantInput.value) * 100);

  virementMessage.style.color = '#ffd633';
  virementMessage.textContent = 'Virement en cours...';

  if (beneficiaire === '') {
    virementMessage.style.color = 'red';
    virementMessage.textContent = 'Veuillez saisir un bénéficiaire.';
    return;
  }
  if (isNaN(montant) || montant <= 0) {
    virementMessage.style.color = 'red';
    virementMessage.textContent = 'Montant invalide.';
    return;
  }

  if (compteSource === 'courant' && montant > soldeCourant) {
    virementMessage.style.color = 'red';
    virementMessage.textContent = 'Solde insuffisant sur le compte courant.';
    return;
  }
  if (compteSource === 'epargne' && montant > soldeEpargne) {
    virementMessage.style.color = 'red';
    virementMessage.textContent = 'Solde insuffisant sur le compte épargne.';
    return;
  }

  setTimeout(() => {
    if (compteSource === 'courant') {
      soldeCourant -= montant;
    } else {
      soldeEpargne -= montant;
    }
    updateSoldeUI();
    virementMessage.style.color = '#00cc00';
    virementMessage.textContent = `Virement de ${formatEuro(montant)} effectué vers ${beneficiaire}.`;
    montantInput.value = '';
    document.getElementById('beneficiaire').value = '';
    updateChartBalance();
  }, 1500);
});

// Chart.js solde courant (6 mois)
const ctx = document.getElementById('soldeChart').getContext('2d');
const months = ['Fév', 'Mars', 'Avril', 'Mai', 'Juin', 'Juil'];
let balances = [180000000, 185000000, 190000000, 195000000, 198000000, soldeCourant];

let soldeChart;

function initChart() {
  soldeChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: months,
      datasets: [{
        label: 'Solde compte courant (€)',
        data: balances.map(b => b / 100),
        borderColor: '#ffd633',
        backgroundColor: 'rgba(255, 204, 51, 0.3)',
        fill: true,
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 7,
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: false,
          ticks: {
            callback: val => val.toLocaleString('fr-FR', {style:'currency', currency:'EUR'})
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#ffd633'
          }
        }
      }
    }
  });
}

function updateChartBalance() {
  balances.shift();
  balances.push(soldeCourant);
  soldeChart.data.datasets[0].data = balances.map(b => b / 100);
  soldeChart.update();
}
