const arvot = [0, 0, 0, 0];
let ekaKierros = true, rahat = 100, panos = 1, voitot = 0;

const volumeButton = document.getElementById('Vol');
const youwonSound = document.getElementById('youwonSound');
const deadmenSound = document.getElementById('deadmenSound');
const lockSound = document.getElementById('lockSound');
const betSound = document.getElementById('betSound');
const spinSound = document.getElementById('spinSound');
const toohighSound = document.getElementById('toohighSound');
const trySound = document.getElementById('trySound');

// Alusta äänet
youwonSound.volume = 1;
deadmenSound.volume = 1;
lockSound.volume = 1;
betSound.volume = 1;
spinSound.volume = 1;
toohighSound.volume = 1;
trySound.volume = 1;

let isMuted = false;

// Kuuntele VOL nappia painettaessa
volumeButton.addEventListener('click', toggleVolume);


function toggleVolume() {
    isMuted = !isMuted;

    // Päivitä äänen tila
    updateVolume(youwonSound);
    updateVolume(deadmenSound);
    updateVolume(lockSound);
    updateVolume(betSound);
    updateVolume(spinSound);
    updateVolume(toohighSound);
    updateVolume(trySound);

    // Päivitä nappi ja kuvake
    updateButtonAppearance();
}

function updateVolume(sound) {
    sound.volume = isMuted ? 0 : 1;
}

function updateButtonAppearance() {
    if (isMuted) {
        volumeButton.style.backgroundColor = 'red';
        volumeButton.innerHTML = '<i class="bi bi-volume-mute"></i>';
    } else {
        volumeButton.style.backgroundColor = '';
        volumeButton.innerHTML = '<i class="bi bi-volume-up"></i>';
    }
}



// BET //
function muutaPanos() {
  panos = (panos % 5) + 1;
  const panosElement = document.querySelector('#panos');
  panosElement.innerHTML = `<i class="bi bi-coin"></i> BET:0${panos}$`;
  // ÄÄNI BET-NAPILLE
  const betSound = document.getElementById('betSound');
      betSound.play();
}


function pelaa() {
  if (rahat - panos >= 0) {
    /* VÄHENNETÄÄN PANOS JA UPDATE CREDITS */
    rahat -= panos;
    document.querySelector('#rahamaara').innerText = 'CREDITS:' + rahat + '$';

    /* NAPPULAT DISABLED KUN SPINNING */
    document.querySelectorAll('.pelialue button').forEach((bu) => {
        bu.disabled = true;
    });

    /* TARKISTA LOCK-NAPIT */
    let lukitut = document.querySelectorAll('.rullatjanappulat button.active').length;
    if (lukitut === 3) {
        /* VAIN 3 RULLAN LUKITUS MAHDOLLINEN */
        document.querySelectorAll('.rullatjanappulat button:not(.active)').forEach((ele) => {
            ele.disabled = true;
        });
    } else {
        document.querySelectorAll('.rullatjanappulat button').forEach((ele) => {
            ele.disabled = true;
        });
    }

    // HAETAAN VIIMEINEN SPINNING RULLA + EVNT //
    let viimeinen = '';
    for (let i = 1; i < 5; i++) {
        if (!document.querySelector('#rulla' + i + 'button').classList.contains('active')) {
            viimeinen = '#rulla' + i;
        }
    }

    if (!viimeinen == '') {
        document.querySelector(viimeinen).addEventListener('transitionend', siirtyminenPaattyy);
    }

    // SPINNING - RULLIEN PYÖRITYS //
    document.querySelectorAll('.rulla').forEach((ele, ndx) => {
        arvot[ndx] = pyoritaRullaa(ele, ndx);
    });

    // Lisää äänitehoste SPIN-napin painallukselle
    const spinSound = document.getElementById('spinSound');
    spinSound.play();

    paivitaInfo('FIRE ALL OF YER GUNS');
    } else {
    /* JOS PANOS TOO HIGH  */
    paivitaInfo('BET´S TOO HIGH - YE CHEAT?');
    const toohighSound = document.getElementById('toohighSound'); //dont cha cross me laddie - panos liian suuri //
      toohighSound.play();
    }
}

function pyoritaRullaa(rulla, ndx) {
  // HAETAAN RULLAN EDELLINEN PYSÄHTYMISKOHTA //
  let yPaikka = parseInt(getComputedStyle(rulla).backgroundPositionY);

  let lisays = 0;

  if (!document.querySelector('#rulla' + (ndx + 1) + 'button').classList.contains('active')) {
    const aikaPerKuva = 100;

    // 2 pyöräytystä + rullan numeron mukainen pyöräytys + arvottu rulla kohta (yksi viidestä) //
    lisays = (2 + ndx) * 5 + Math.round(Math.random() * 5);

    rulla.style.transition = 'background-position-y ' + (8 + lisays) * aikaPerKuva + 'ms';
    rulla.style.backgroundPositionY = yPaikka + lisays * 80 + 'px';
  }

  // palautetaan tieto, minkä kuvan kohdalle rulla pysähtyy //
  return (yPaikka / 80 + lisays) % 5;

  
}

function siirtyminenPaattyy(evnt) {
  
  evnt.target.removeEventListener('transitionend', siirtyminenPaattyy);

  /* PANOS JA PELAA BUTTON KÄYTTÖÖN */
  document.querySelector('#pelaabutton').disabled = false;
  document.querySelector('#panosButton').disabled = false;
    
  /*  TARKISTETAAN VOITOT */
  let lkm = 0,
    voitto = 0,
    voittotaulukko = [6, 4, 3, 10, 5];
  for (let i = 0; i < 5; i++) {
    /* käydään läpi rullan kuvat */
    lkm = 0;
    for (luku of arvot) {
      /* käydään läpi kaikki rullat */
      lkm = luku == i ? lkm + 1 : lkm;
    }
    /* ONKO KOLME PIRATE SKULLS TAI NELJÄ SAMAA */
    voitto = i == 3 && lkm == 3 ? 5 : lkm == 4 ? voittotaulukko[i] : 0;
    if (voitto != 0) {
      const youwonSound = document.getElementById('youwonSound'); // Voitto - soita ääni
      youwonSound.play();

      break;
    }
  }

  if (voitto != 0) {
    paivitaInfo('YE WON ' + voitto * panos + '$ - DID YE CHEAT?');
    rahat += voitto * panos;
    document.querySelector('#rahamaara').innerText = 'CREDITS:' + rahat + ' $';
    voitot += voitto * panos;
  } else {
    paivitaInfo('YER PISTOL IS WONKY');
    
  }

  
  // Jos LOCKED-tila ei ole päällä, salli lukitusten käyttö
  if (!document.querySelector('.rullatjanappulat button.active')) {
    ekaKierros = true; // Salli lukitusten käyttö
  }

  // LOCK BUTTONS POIS KÄYTÖSTÄ
  document.querySelectorAll('.rullatjanappulat button').forEach((ele) => {
    if (!ele.classList.contains('active')) {
      ele.disabled = false; // Salli lukitusten käyttö
      ele.classList.remove('active');
      ele.innerText = 'LOCK';
      ele.style.backgroundColor = ''; // Palauta alkuperäinen väri pyöräytyksen jälkeen
    }
  });

  if (ekaKierros && voitto == 0) {
    // ensimmäinen SPIN ei voittoa --> salli lukitukset
    ekaKierros = false;
    document.querySelectorAll('.rullatjanappulat button').forEach((ele) => {
      ele.disabled = false;
    });
    paivitaInfo('YE NEED MORE RUM');
  } else {
    ekaKierros = true;

    // LOCK BUTTONS POIS KÄYTÖSTÄ
    document.querySelectorAll('.rullatjanappulat button').forEach((ele) => {
      ele.disabled = true;
      ele.classList.remove('active');
      ele.innerText = 'LOCK';

      document.querySelectorAll('.rullatjanappulat button').forEach((ele) => {
        ele.style.backgroundColor = ''; // Tyhjentää värimäärittelyn, jolloin se palautuu alkuperäiseksi
      });
    });
  }

  if (rahat == 0) {
    document.querySelectorAll('.pelialue button').forEach((bu) => {
      bu.disabled = true;
    });
    paivitaInfo('YER THE WORST PIRATE EVER');
    // Lisää äänitehoste rahojen loputtua
    const deadmenSound = document.getElementById('deadmenSound');
    deadmenSound.play();
  }
}

// LOCK TARKISTUS //
function tarkistaLukot(src) {
    let lukitut = [];

    document.querySelectorAll('.rullatjanappulat button').forEach((ele) => {
        if (ele.classList.contains('active')) {
            lukitut.push(ele.id);
        }
    });

    if (lukitut.length < 3 || lukitut.includes(src.id)) { // KOLME LUKITUSTA SALLITTU
        src.classList.toggle('active');
        src.innerText = (src.innerText == 'LOCK') ? 'LOCKED' : 'LOCK';
    } else {
        paivitaInfo('ONLY THREE LOCKS ALLOWED');
        const trySound = document.getElementById('trySound'); // MAKE HIM WALK THE PLANK CAPTAIN - soita ääni TRY
        trySound.play();
    }

    // Muuta LOCK-napin väri punaiseksi, kun LOCKED-tilassa
    if (src.classList.contains('active')) {
        src.style.backgroundColor = 'red';
    
    // lisätään ääniefekti LOCK-napin painallukselle
      const lockSound = document.getElementById('lockSound');
      lockSound.play();
    } else {
        // Palauta alkuperäinen väri, kun nappi ei LOCKED-tilassa
        src.style.backgroundColor = '';

    // lisätään ääniefekti LOCK-napin vapautukselle
      const lockSound = document.getElementById('lockSound');
      lockSound.play();
    }
}


function paivitaInfo(teksti, tyyppi) {
  const alertDiv = document.querySelector('#alrt');

  // poistetaan tällä hetkellä käytössä oleva luokka //
  for (let ln of alertDiv.classList.values()) {
    if (ln.indexOf('alert-') >= 0) {
      alertDiv.classList.remove(ln);
    }
  }
  // asetetaan uudet teksti ja uusi luokka //
  document.querySelector('#alrtteksti').innerHTML = teksti;
  alertDiv.classList.add(tyyppi);
}
