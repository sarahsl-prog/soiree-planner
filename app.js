/**
 * Soirée Planner — simple client-side app for a three-night summer party.
 * Renders guest list, drink menu, and a golden-hour countdown.
 */

// ── Event data ─────────────────────────────────────────────────────────────

/** Opening night date (local time). Golden hour ≈ 20 minutes before sunset. */
const OPENING_NIGHT = new Date(2026, 6, 18); // July 18, 2026
const GOLDEN_HOUR = new Date(2026, 6, 18, 20, 12, 0); // 8:12 PM local

/** Guest roster with RSVP status and optional plus-one name. */
const GUESTS = [
  { name: "Elena Vasquez",  rsvp: "yes",   plusOne: "Marco Vasquez" },
  { name: "James Whitfield",  rsvp: "yes",   plusOne: null },
  { name: "Priya Sharma",     rsvp: "maybe", plusOne: null },
  { name: "Theo Lindqvist",   rsvp: "yes",   plusOne: "Sofia Lindqvist" },
  { name: "Amara Okafor",     rsvp: "no",    plusOne: null },
  { name: "Claire Dubois",    rsvp: "yes",   plusOne: "Henri Dubois" },
  { name: "Sam Rivera",       rsvp: "maybe", plusOne: "Jordan Lee" },
];

/** One signature cocktail + mocktail for each of the three evenings. */
const DRINK_MENU = [
  {
    night: "Night One",
    date: "Friday, July 18",
    cocktail: {
      name: "Golden Hour Spritz",
      description: "Aperol, prosecco, rosemary syrup, and a splash of grapefruit.",
    },
    mocktail: {
      name: "Sunset Fizz",
      description: "Sparkling water, blood orange, honey, and fresh thyme.",
    },
  },
  {
    night: "Night Two",
    date: "Saturday, July 19",
    cocktail: {
      name: "Terrace Negroni",
      description: "Gin, Campari, sweet vermouth, orange peel.",
    },
    mocktail: {
      name: "Garden Bramble",
      description: "Muddled blackberries, lemon, ginger ale, mint.",
    },
  },
  {
    night: "Night Three",
    date: "Sunday, July 20",
    cocktail: {
      name: "Starlight Old Fashioned",
      description: "Bourbon, demerara, angostura, smoked orange.",
    },
    mocktail: {
      name: "Lavender Lemonade",
      description: "Fresh lemon, lavender honey, sparkling water, ice.",
    },
  },
];

// ── Guest list rendering ───────────────────────────────────────────────────

/** Human-friendly labels for RSVP badge values. */
const RSVP_LABELS = {
  yes: "attending",
  maybe: "maybe",
  no: "regrets",
};

/**
 * Build a table row for one guest.
 * RSVP values map to colored badge classes defined in styles.css.
 */
function createGuestRow(guest) {
  const row = document.createElement("tr");

  const nameCell = document.createElement("td");
  nameCell.textContent = guest.name;

  const rsvpCell = document.createElement("td");
  const badge = document.createElement("span");
  badge.className = `rsvp-badge rsvp-${guest.rsvp}`;
  badge.textContent = RSVP_LABELS[guest.rsvp] || guest.rsvp;
  rsvpCell.appendChild(badge);

  const plusOneCell = document.createElement("td");
  const plusOneSpan = document.createElement("span");
  if (guest.plusOne) {
    plusOneSpan.className = "plus-one has-guest";
    plusOneSpan.textContent = guest.plusOne;
  } else {
    plusOneSpan.className = "plus-one";
    plusOneSpan.textContent = "—";
  }
  plusOneCell.appendChild(plusOneSpan);

  row.append(nameCell, rsvpCell, plusOneCell);
  return row;
}

/** Populate the guest table from the GUESTS array. */
function renderGuestList() {
  const tbody = document.getElementById("guest-list");
  GUESTS.forEach((guest) => tbody.appendChild(createGuestRow(guest)));
}

/**
 * Add one guest to the in-memory list and append their row to the table.
 * Called when the RSVP form is submitted.
 */
function addGuest(guest) {
  GUESTS.push(guest);
  document.getElementById("guest-list").appendChild(createGuestRow(guest));
}

// ── RSVP form handling ─────────────────────────────────────────────────────

/** Wire up the RSVP form: validate, add guest, reset, and show feedback. */
function initRsvpForm() {
  const form = document.getElementById("rsvp-form");
  const plusOneField = document.getElementById("plus-one-field");
  const plusOneInput = document.getElementById("plus-one");
  const feedback = document.getElementById("rsvp-feedback");
  const rsvpRadios = form.querySelectorAll('input[name="rsvp"]');

  // Hide plus-one when guest sends regrets — no guest to bring
  function syncPlusOneVisibility() {
    const attending = form.querySelector('input[name="rsvp"]:checked').value === "yes";
    plusOneField.hidden = !attending;
    if (!attending) plusOneInput.value = "";
  }

  rsvpRadios.forEach((radio) => radio.addEventListener("change", syncPlusOneVisibility));
  syncPlusOneVisibility();

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const name = form.name.value.trim();
    const rsvp = form.rsvp.value;
    const plusOneRaw = form.plusOne.value.trim();

    if (!name) {
      feedback.textContent = "Please enter your name.";
      form.name.focus();
      return;
    }

    const guest = {
      name,
      rsvp,
      plusOne: rsvp === "yes" && plusOneRaw ? plusOneRaw : null,
    };

    addGuest(guest);
    form.reset();
    form.querySelector('input[name="rsvp"][value="yes"]').checked = true;
    syncPlusOneVisibility();

    feedback.textContent = rsvp === "yes"
      ? `Welcome, ${name}! You're on the list.`
      : `Thanks, ${name}. We'll miss you.`;
  });
}

// ── Drink menu rendering ─────────────────────────────────────────────────────

/** Create a single drink line (cocktail or mocktail). */
function createDrinkItem(type, drink) {
  const item = document.createElement("div");
  item.className = "drink-item";

  const typeLabel = document.createElement("div");
  typeLabel.className = "drink-type";
  typeLabel.textContent = type;

  const name = document.createElement("div");
  name.className = "drink-name";
  name.textContent = drink.name;

  const desc = document.createElement("div");
  desc.className = "drink-desc";
  desc.textContent = drink.description;

  item.append(typeLabel, name, desc);
  return item;
}

/** Build a card for one evening's drinks. */
function createNightCard(night) {
  const card = document.createElement("article");
  card.className = "drink-night";

  const heading = document.createElement("h3");
  heading.textContent = night.night;

  const date = document.createElement("p");
  date.className = "drink-date";
  date.textContent = night.date;

  card.append(heading, date);
  card.appendChild(createDrinkItem("Signature Cocktail", night.cocktail));
  card.appendChild(createDrinkItem("Mocktail", night.mocktail));
  return card;
}

/** Populate the drink grid from the DRINK_MENU array. */
function renderDrinkMenu() {
  const container = document.getElementById("drink-menu");
  DRINK_MENU.forEach((night) => container.appendChild(createNightCard(night)));
}

// ── Golden hour countdown ────────────────────────────────────────────────────

/** Pad a number to two digits for the countdown display. */
function pad(n) {
  return String(n).padStart(2, "0");
}

/**
 * Calculate remaining time until golden hour and update the DOM.
 * Runs once immediately, then every second via setInterval.
 */
function updateCountdown() {
  const now = new Date();
  const diff = GOLDEN_HOUR - now;

  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");
  const messageEl = document.getElementById("countdown-message");

  // After golden hour has passed, show a celebratory message instead
  if (diff <= 0) {
    daysEl.textContent = "00";
    hoursEl.textContent = "00";
    minutesEl.textContent = "00";
    secondsEl.textContent = "00";
    messageEl.textContent = "Golden hour has arrived — raise a glass!";
    return;
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  daysEl.textContent = pad(days);
  hoursEl.textContent = pad(hours);
  minutesEl.textContent = pad(minutes);
  secondsEl.textContent = pad(seconds);

  const options = { weekday: "long", month: "long", day: "numeric" };
  messageEl.textContent = `First toast on ${OPENING_NIGHT.toLocaleDateString("en-US", options)} at 8:12 PM`;
}

// ── Initialize ───────────────────────────────────────────────────────────────

renderGuestList();
renderDrinkMenu();
initRsvpForm();
updateCountdown();
setInterval(updateCountdown, 1000);
