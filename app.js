const TEAMS = [
  {
    name: "Snupy F.C.",
    short: "SNP",
    logo: "./assets/logo-snupy-fc.svg",
    featured: true,
    note: "Escudo integrado con identidad urbana y tonos azules para presencia de club top.",
    chips: ["Azul & blanco", "Diseno urbano", "Club fundador"],
  },
  {
    name: "Mendoza F.C.",
    short: "MDZ",
    logo: "./assets/logo-liga-compas-elite-26.svg",
    note: "Pendiente de escudo personalizado. Usa emblema provisional de liga para mantener look premium.",
    chips: ["Pendiente logo", "Roster activo"],
  },
  {
    name: "No gordas F.C.",
    short: "NGD",
    logo: "./assets/logo-no-gordas-fc.svg",
    featured: true,
    note: "Escudo clasico con acabado dorado, azul y verde para una identidad mas de club tradicional.",
    chips: ["Azul & verde", "Estilo clasico", "Escudo oficial"],
  },
  {
    name: "El bromas",
    short: "BRM",
    logo: "./assets/logo-el-bromas-fc.svg",
    featured: true,
    note: "Escudo teatral y festivo con joker central para reflejar el ADN del club y su nombre.",
    chips: ["Joker crest", "Morado & verde", "Escudo oficial"],
  },
  {
    name: "Aguachilito F.C",
    short: "AGU",
    logo: "./assets/logo-aguachilito-fc.svg",
    featured: true,
    note: "Escudo con vibra costena, energia festiva y estetica unica para el torneo.",
    chips: ["Teal & naranja", "Mariscos vibe", "Escudo oficial"],
  },
  {
    name: "Deportivo Eldeva",
    short: "ELD",
    logo: "./assets/logo-deportivo-eldeva.svg",
    featured: true,
    note: "Escudo tipo club grande: corona, escudo oscuro y detalles dorados de campeon.",
    chips: ["Azul marino", "Dorado campeon", "Escudo oficial"],
  },
];

const STORAGE_KEY = "liga-compas-elite-26-results";

const fixtures = buildFixtures(TEAMS);
const storedScores = loadScores();
fixtures.forEach((fixture) => {
  const saved = storedScores[fixture.id];
  if (saved) {
    fixture.homeGoals = saved.homeGoals;
    fixture.awayGoals = saved.awayGoals;
  }
});

const standingsBody = document.getElementById("standingsBody");
const fixturesList = document.getElementById("fixturesList");
const teamsGrid = document.getElementById("teamsGrid");
const playedMatches = document.getElementById("playedMatches");
const totalGoals = document.getElementById("totalGoals");
const leaderName = document.getElementById("leaderName");
const resetButton = document.getElementById("resetButton");

function buildFixtures(teams) {
  const rotation = [...teams];
  const firstLegRounds = [];

  for (let roundIndex = 0; roundIndex < rotation.length - 1; roundIndex += 1) {
    const matches = [];
    for (let i = 0; i < rotation.length / 2; i += 1) {
      const homeCandidate = rotation[i];
      const awayCandidate = rotation[rotation.length - 1 - i];

      const shouldSwap = i === 0 ? roundIndex % 2 === 1 : (roundIndex + i) % 2 === 1;
      matches.push({
        home: shouldSwap ? awayCandidate.name : homeCandidate.name,
        away: shouldSwap ? homeCandidate.name : awayCandidate.name,
      });
    }

    firstLegRounds.push(matches);

    const fixed = rotation[0];
    const tail = rotation.slice(1);
    tail.unshift(tail.pop());
    rotation.splice(0, rotation.length, fixed, ...tail);
  }

  const secondLegRounds = firstLegRounds.map((round) =>
    round.map((match) => ({
      home: match.away,
      away: match.home,
    })),
  );

  return [...firstLegRounds, ...secondLegRounds].flatMap((round, roundIndex) =>
    round.map((match, matchIndex) => ({
      id: `${roundIndex + 1}-${matchIndex + 1}-${getTeamShort(match.home)}-${getTeamShort(match.away)}`,
      jornada: roundIndex + 1,
      home: match.home,
      away: match.away,
      homeGoals: "",
      awayGoals: "",
    })),
  );
}

function getLogo(teamName) {
  return TEAMS.find((team) => team.name === teamName)?.logo || "./assets/logo-liga-compas-elite-26.svg";
}

function getTeamShort(teamName) {
  return TEAMS.find((team) => team.name === teamName)?.short || "TM";
}

function loadScores() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveScores() {
  const payload = fixtures.reduce((acc, fixture) => {
    acc[fixture.id] = {
      homeGoals: fixture.homeGoals,
      awayGoals: fixture.awayGoals,
    };
    return acc;
  }, {});
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function computeStandings() {
  const table = TEAMS.map((team) => ({
    name: team.name,
    short: team.short,
    logo: team.logo,
    pj: 0,
    g: 0,
    e: 0,
    p: 0,
    gf: 0,
    gc: 0,
    dif: 0,
    pts: 0,
  }));

  const teamMap = new Map(table.map((row) => [row.name, row]));

  fixtures.forEach((fixture) => {
    if (fixture.homeGoals === "" || fixture.awayGoals === "") {
      return;
    }

    const home = teamMap.get(fixture.home);
    const away = teamMap.get(fixture.away);
    const hg = Number(fixture.homeGoals);
    const ag = Number(fixture.awayGoals);

    home.pj += 1;
    away.pj += 1;
    home.gf += hg;
    home.gc += ag;
    away.gf += ag;
    away.gc += hg;

    if (hg > ag) {
      home.g += 1;
      home.pts += 3;
      away.p += 1;
    } else if (ag > hg) {
      away.g += 1;
      away.pts += 3;
      home.p += 1;
    } else {
      home.e += 1;
      away.e += 1;
      home.pts += 1;
      away.pts += 1;
    }
  });

  table.forEach((row) => {
    row.dif = row.gf - row.gc;
  });

  table.sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dif !== a.dif) return b.dif - a.dif;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.gc - b.gc;
  });

  return table;
}

function renderStandings() {
  const table = computeStandings();
  standingsBody.innerHTML = table
    .map((team, index) => {
      const posClass = index === 0 ? "pos-badge pos-badge--top" : "pos-badge";
      return `
        <tr>
          <td><span class="${posClass}">${index + 1}</span></td>
          <td>
            <div class="team-cell">
              <img class="team-cell__logo" src="${team.logo}" alt="Logo ${team.name}" />
              <strong>${team.name}</strong>
            </div>
          </td>
          <td>${team.pj}</td>
          <td>${team.g}</td>
          <td>${team.e}</td>
          <td>${team.p}</td>
          <td>${team.gf}</td>
          <td>${team.gc}</td>
          <td>${team.dif}</td>
          <td><strong>${team.pts}</strong></td>
        </tr>
      `;
    })
    .join("");

  const played = fixtures.filter((fixture) => fixture.homeGoals !== "" && fixture.awayGoals !== "").length;
  const goals = fixtures.reduce((sum, fixture) => {
    const home = fixture.homeGoals === "" ? 0 : Number(fixture.homeGoals);
    const away = fixture.awayGoals === "" ? 0 : Number(fixture.awayGoals);
    return sum + home + away;
  }, 0);

  playedMatches.textContent = String(played);
  totalGoals.textContent = String(goals);
  leaderName.textContent = table[0]?.name || "Sin lider";
}

function renderFixtures() {
  const fixturesByRound = fixtures.reduce((acc, fixture) => {
    if (!acc.has(fixture.jornada)) {
      acc.set(fixture.jornada, []);
    }
    acc.get(fixture.jornada).push(fixture);
    return acc;
  }, new Map());

  fixturesList.innerHTML = [...fixturesByRound.entries()]
    .map(([jornada, roundFixtures]) => {
      const playedCount = roundFixtures.filter((fixture) => fixture.homeGoals !== "" && fixture.awayGoals !== "").length;
      return `
        <section class="round-block">
          <div class="round-block__head">
            <div>
              <p class="eyebrow">Matchday ${jornada}</p>
              <h3>Jornada ${jornada}</h3>
            </div>
            <span class="round-block__meta">${playedCount}/${roundFixtures.length} jugados</span>
          </div>
          <div class="round-block__grid">
            ${roundFixtures.map((fixture) => {
      const done = fixture.homeGoals !== "" && fixture.awayGoals !== "";
      const winner = done
        ? Number(fixture.homeGoals) > Number(fixture.awayGoals)
          ? fixture.home
          : Number(fixture.awayGoals) > Number(fixture.homeGoals)
            ? fixture.away
            : "Empate"
        : "Pendiente";

      return `
        <article class="fixture-card">
          <div class="fixture-card__top">
            <div>
              <p class="eyebrow">Jornada ${fixture.jornada}</p>
              <h3>${fixture.home} vs ${fixture.away}</h3>
            </div>
            <span class="fixture-state ${done ? "fixture-state--done" : "fixture-state--pending"}">${done ? "Jugado" : "Pendiente"}</span>
          </div>
          <div class="fixture-card__mid">
            <div class="fixture-team">
              <img class="fixture-team__badge" src="${getLogo(fixture.home)}" alt="Logo ${fixture.home}" />
              <div class="fixture-team__name">
                <span>${fixture.home}</span>
                <span>Local</span>
              </div>
            </div>
            <div class="score-box">
              <input type="number" min="0" max="50" inputmode="numeric" data-team="home" data-id="${fixture.id}" value="${fixture.homeGoals}" />
              <span class="score-separator">:</span>
              <input type="number" min="0" max="50" inputmode="numeric" data-team="away" data-id="${fixture.id}" value="${fixture.awayGoals}" />
            </div>
            <div class="fixture-team fixture-team--away">
              <div class="fixture-team__name">
                <span>${fixture.away}</span>
                <span>Visitante</span>
              </div>
              <img class="fixture-team__badge" src="${getLogo(fixture.away)}" alt="Logo ${fixture.away}" />
            </div>
          </div>
          <div class="fixture-card__bottom">
            <span>Ganador: <strong>${winner}</strong></span>
            <span>ID: ${fixture.id}</span>
          </div>
        </article>
      `;
    }).join("")}
          </div>
        </section>
      `;
    })
    .join("");

  fixturesList.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", handleScoreInput);
    input.addEventListener("change", renderFixturesAndStandings);
  });
}

function renderTeams() {
  teamsGrid.innerHTML = TEAMS.map((team) => {
    const chips = team.chips.map((chip) => `<span>${chip}</span>`).join("");
    return `
      <article class="team-card ${team.featured ? "team-card--featured" : ""}">
        <img class="team-card__logo" src="${team.logo}" alt="Escudo ${team.name}" />
        <div class="team-card__meta">
          <p class="eyebrow">${team.short}</p>
          <h3>${team.name}</h3>
          <p>${team.note}</p>
          <div class="team-card__chips">${chips}</div>
        </div>
      </article>
    `;
  }).join("");
}

function handleScoreInput(event) {
  const { id, team } = event.target.dataset;
  const fixture = fixtures.find((item) => item.id === id);
  if (!fixture) return;

  let nextValue = event.target.value.trim();
  if (nextValue === "") {
    fixture[team === "home" ? "homeGoals" : "awayGoals"] = "";
  } else {
    nextValue = String(Math.max(0, Math.min(50, Number(nextValue))));
    fixture[team === "home" ? "homeGoals" : "awayGoals"] = nextValue;
    event.target.value = nextValue;
  }

  saveScores();
  renderStandings();
}

function renderFixturesAndStandings() {
  renderFixtures();
  renderStandings();
}

resetButton.addEventListener("click", () => {
  fixtures.forEach((fixture) => {
    fixture.homeGoals = "";
    fixture.awayGoals = "";
  });
  localStorage.removeItem(STORAGE_KEY);
  renderFixturesAndStandings();
});

renderTeams();
renderFixturesAndStandings();
