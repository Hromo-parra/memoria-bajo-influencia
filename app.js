(() => {
  "use strict";

  const DATA = window.STUDY_DATA;
  const STORAGE_KEY = "memoria-influencia-v01";
  const CONSENT_VERSION = "piloto-2026-08-31-v1";
  const app = document.querySelector("#app");
  const toast = document.querySelector("#toast");

  let db = loadDatabase();
  let activeCode = null;
  let questionStartedAt = 0;
  let distractorStartedAt = 0;
  let readingTimer = null;

  function loadDatabase() {
    const empty = { participants: {}, settings: { pilotMode: false } };
    try {
      return { ...empty, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}") };
    } catch (error) {
      console.warn("No se pudo leer el almacenamiento local.", error);
      return empty;
    }
  }

  function saveDatabase() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  function escapeHTML(value = "") {
    return String(value).replace(/[&<>'"]/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    })[char]);
  }

  function normalize(value = "") {
    return String(value)
      .trim()
      .toLocaleLowerCase("es-MX")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ");
  }

  function hashString(value) {
    let hash = 2166136261;
    for (const char of `${DATA.meta.seed}:${value}`) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function assignmentFor(code) {
    const keys = Object.keys(DATA.assignments);
    const key = keys[hashString(code) % keys.length];
    return { key, ...DATA.assignments[key] };
  }

  function formatDate(value, withTime = false) {
    if (!value) return "—";
    return new Intl.DateTimeFormat("es-MX", {
      dateStyle: "medium",
      ...(withTime ? { timeStyle: "short" } : {})
    }).format(new Date(value));
  }

  function hasAcceptedConsent(participant) {
    return Boolean(participant?.consentAt);
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 3000);
  }

  function go(route) {
    window.location.hash = route;
  }

  function top() {
    window.scrollTo({ top: 0, behavior: "smooth" });
    app.focus({ preventScroll: true });
  }

  function renderHome() {
    app.innerHTML = `
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">Experimento de memoria</p>
          <h1>Lo que ocurre. Lo que nos cuentan. Lo que recordamos.</h1>
          <p>Una experiencia interactiva para estudiar cómo la información posterior a un evento puede modificar la precisión del recuerdo.</p>
          <div class="metric-strip" aria-label="Características del estudio">
            <div class="metric"><strong>15</strong><span>detalles críticos</span></div>
            <div class="metric"><strong>2</strong><span>sesiones</span></div>
            <div class="metric"><strong>7 días</strong><span>de intervalo</span></div>
          </div>
        </div>
        <aside class="hero-panel">
          <div>
            <p class="eyebrow">Selecciona un acceso</p>
            <h2>¿Cómo vas a entrar?</h2>
            <div class="mode-stack">
              <button class="mode-card" data-route="#/participante">
                <span class="mode-icon">01</span>
                <span><strong>Modo participante</strong><small>Iniciar o continuar una sesión</small></span>
                <span class="arrow" aria-hidden="true">→</span>
              </button>
              <button class="mode-card" data-route="#/docente">
                <span class="mode-icon">02</span>
                <span><strong>Modo docente</strong><small>Pilotaje, asignaciones y datos</small></span>
                <span class="arrow" aria-hidden="true">→</span>
              </button>
            </div>
          </div>
          <div class="privacy-note"><strong>Privacidad por diseño.</strong> Esta versión guarda respuestas solo en este navegador y utiliza códigos anónimos.</div>
        </aside>
      </section>`;
    top();
  }

  function renderParticipantLogin() {
    app.innerHTML = `
      <section class="page-shell">
        <div class="page-head">
          <div><p class="eyebrow">Modo participante</p><h2>Acceso al estudio</h2><p>Usa el mismo código anónimo en ambas sesiones. No escribas tu nombre, matrícula ni correo.</p></div>
          <button class="btn btn-ghost" data-route="#/">← Inicio</button>
        </div>
        <div class="panel panel-narrow">
          <form id="participant-login">
            <div class="field">
              <label for="participant-code">Código anónimo</label>
              <input id="participant-code" name="code" type="text" minlength="4" maxlength="24" pattern="[A-Za-z0-9-]+" autocomplete="off" placeholder="Ejemplo: M7-K42" required />
              <small>Entre 4 y 24 caracteres: letras, números o guion.</small>
            </div>
            <div class="field">
              <span>¿Qué sesión realizarás?</span>
              <div class="choices">
                <label class="choice"><input type="radio" name="session" value="1" checked /><span class="choice-key">1</span><span><strong>Sesión inicial</strong><br><span class="muted small">Video, actividad visual, relato y primera prueba</span></span></label>
                <label class="choice"><input type="radio" name="session" value="2" /><span class="choice-key">2</span><span><strong>Seguimiento a 7 días</strong><br><span class="muted small">Segunda prueba y explicación final</span></span></label>
              </div>
            </div>
            <div class="notice"><span aria-hidden="true">✓</span><div><strong>Consentimiento antes de iniciar</strong><p>Al continuar se mostrará primero el consentimiento informado. La prueba solo puede comenzar si lo aceptas explícitamente.</p></div></div>
            <div class="notice"><span aria-hidden="true">●</span><div><strong>Antes de continuar</strong><p>Realiza la actividad sin consultar notas ni regresar al video. Usa un dispositivo con audio y reserva un momento sin interrupciones.</p></div></div>
            <div class="btn-row"><button class="btn btn-primary" type="submit">Continuar</button></div>
          </form>
        </div>
      </section>`;
    document.querySelector("#participant-code")?.focus();
    top();
  }

  function createParticipant(code) {
    const assignment = assignmentFor(code);
    return {
      code,
      assignmentKey: assignment.key,
      list: assignment.list,
      immediateForm: assignment.immediate,
      delayedForm: assignment.delayed,
      createdAt: new Date().toISOString(),
      consentAt: null,
      consentVersion: null,
      currentStage: "consent",
      videoStartedAt: null,
      videoCompletedAt: null,
      posteventReadMs: null,
      session1: { distractors: [], responses: [], completedAt: null, eligibleAt: null },
      session2: { responses: [], startedAt: null, completedAt: null },
      debriefViewedAt: null
    };
  }

  function renderSession() {
    const participant = db.participants[activeCode];
    if (!participant) return go("#/participante");
    const stage = participant.currentStage;
    if (!hasAcceptedConsent(participant) && ["intro", "video", "distractor", "postevent", "test1", "test2"].includes(stage)) {
      participant.currentStage = "consent";
      saveDatabase();
      return renderConsent(participant);
    }
    if (stage === "consent") return renderConsent(participant);
    if (stage === "intro") return renderIntroduction(participant);
    if (stage === "video") return renderVideo(participant);
    if (stage === "distractor") return renderDistractor(participant);
    if (stage === "postevent") return renderPostevent(participant);
    if (stage === "test1") return renderTest(participant, 1);
    if (stage === "session1_complete") return renderSessionOneComplete(participant);
    if (stage === "test2") return renderTest(participant, 2);
    if (stage === "complete") return renderDebrief(participant);
    participant.currentStage = "consent";
    saveDatabase();
    renderConsent(participant);
  }

  function sessionFrame(content, currentStep, label) {
    const steps = Array.from({ length: 6 }, (_, index) => {
      const position = index + 1;
      return `<span class="step ${position < currentStep ? "done" : ""} ${position === currentStep ? "current" : ""}"></span>`;
    }).join("");
    return `
      <section class="page-shell">
        <div class="progress-label"><span>${escapeHTML(label)}</span><span>Paso ${Math.min(currentStep, 6)} de 6</span></div>
        <div class="stepper" aria-hidden="true">${steps}</div>
        ${content}
      </section>`;
  }

  function renderConsent(participant) {
    app.innerHTML = sessionFrame(`
      <div class="panel consent-panel">
        <div class="panel-head"><div><p class="eyebrow">Consentimiento informado</p><h2>Información para decidir si deseas participar</h2><p>Estudio: <strong>Memoria bajo influencia</strong> · Código: <strong>${escapeHTML(participant.code)}</strong></p></div><button class="btn btn-ghost" type="button" data-action="print-consent">Imprimir o guardar</button></div>
        <div class="notice warning"><span aria-hidden="true">!</span><div><strong>Documento para pilotaje académico</strong><p>Antes de reclutar participantes, el equipo debe completar el correo institucional y obtener la aprobación docente o del comité de ética que corresponda.</p></div></div>
        <div class="consent-meta" aria-label="Datos del consentimiento">
          <div><span>Equipo investigador</span><strong>${DATA.meta.authors.map(escapeHTML).join(" · ")}</strong></div>
          <div><span>Versión</span><strong>${CONSENT_VERSION}</strong></div>
          <div><span>Contacto</span><strong>[correo institucional por completar]</strong></div>
        </div>
        <div class="consent-sections">
          <section><h3>¿Cuál es el propósito?</h3><p>Este proyecto académico estudia cómo las personas recuerdan una escena y procesan información relacionada con ella. Para no influir en tus respuestas, algunos detalles del objetivo se explicarán al terminar tu participación.</p></section>
          <section><h3>¿Qué tendrás que hacer?</h3><p>Realizarás una sesión inicial de aproximadamente 20–30 minutos: observarás una escena audiovisual una sola vez, completarás una actividad breve y responderás preguntas de memoria. Siete días después realizarás un seguimiento de aproximadamente 10–15 minutos, sin volver a ver el video ni consultar notas.</p></section>
          <section><h3>Riesgos o molestias</h3><p>Podrías experimentar cansancio, aburrimiento, frustración al no recordar algún detalle o incomodidad al descubrir, en la explicación final, que no se reveló desde el inicio toda la finalidad del estudio. Puedes retirarte en cualquier momento. Si el video o las preguntas te generan malestar, detente y avisa al equipo.</p></section>
          <section><h3>Beneficios y compensación</h3><p>No se garantiza un beneficio personal ni una mejora de la memoria. Tu participación puede contribuir al aprendizaje metodológico del equipo. Esta aplicación no ofrece compensación; cualquier compensación externa debe informarse por separado antes de participar.</p></section>
          <section><h3>Privacidad y uso de datos</h3><p>No se solicita nombre, matrícula ni correo. Tus respuestas se asocian únicamente al código anónimo mostrado arriba y se guardan localmente en este navegador hasta que el equipo las exporte. GitHub Pages aloja la aplicación, pero no recibe las respuestas. El equipo responsable debe resguardar los archivos y limitar su acceso.</p></section>
          <section><h3>Participación voluntaria y retiro</h3><p>Participar es voluntario. Puedes dejar de participar sin penalización y sin explicar el motivo. Para solicitar que se retiren datos ya exportados, conserva tu código y comunícalo al contacto institucional; será posible mientras no se hayan anonimizado de forma irreversible o agregado al análisis.</p></section>
          <section><h3>Preguntas y aclaración final</h3><p>Puedes hacer preguntas antes de aceptar. Al concluir la segunda sesión recibirás una explicación del propósito y de la información posterior al evento.</p></section>
        </div>
        <form id="consent-form">
          <h3>Declaración de consentimiento</h3>
          <label class="check-row"><input type="checkbox" name="adult" required /><span>Confirmo que tengo 18 años o más y cumplo los criterios comunicados por el equipo investigador.</span></label>
          <label class="check-row"><input type="checkbox" name="read" required /><span>He leído la información sobre propósito, procedimientos, duración, riesgos, beneficios y privacidad.</span></label>
          <label class="check-row"><input type="checkbox" name="understand" required /><span>Tuve oportunidad de hacer preguntas, recibí respuestas satisfactorias y sé con quién comunicarme.</span></label>
          <label class="check-row"><input type="checkbox" name="voluntary" required /><span>Comprendo que mi participación es voluntaria y que puedo retirarme sin penalización.</span></label>
          <label class="check-row"><input type="checkbox" name="agree" required /><span>Acepto participar y que mis respuestas se utilicen con fines académicos conforme a este documento.</span></label>
          <div class="spacer"></div>
          <p class="small muted">Al seleccionar “Acepto y continúo”, se registrarán la fecha, la hora y la versión del consentimiento junto con tu código anónimo.</p>
          <div class="btn-row"><button class="btn btn-primary" type="submit">Acepto y continúo</button><button class="btn btn-secondary" type="button" data-route="#/">No acepto / salir</button></div>
        </form>
      </div>`, 1, "Sesión inicial");
    top();
  }

  function renderIntroduction(participant) {
    app.innerHTML = sessionFrame(`
      <div class="panel panel-narrow">
        <p class="eyebrow">Instrucciones</p>
        <h2>Observa con atención natural</h2>
        <div class="reading-card">
          <p>A continuación verás una escena cotidiana. Obsérvala una sola vez y presta atención de manera natural.</p>
          <p>El video no podrá pausarse, adelantarse ni repetirse. Después realizarás varias actividades relacionadas con memoria y procesamiento de información.</p>
        </div>
        <div class="notice"><span aria-hidden="true">●</span><div><strong>Prepara el entorno</strong><p>Activa el audio, mantén esta pestaña visible y evita tomar notas o capturas.</p></div></div>
        <div class="btn-row"><button class="btn btn-primary" data-action="start-video">Estoy listo para ver el video</button></div>
      </div>`, 2, "Sesión inicial");
    top();
  }

  function renderVideo(participant) {
    const completed = Boolean(participant.videoCompletedAt);
    app.innerHTML = sessionFrame(`
      <div class="panel">
        <div class="panel-head"><div><p class="eyebrow">Evento audiovisual</p><h2>Escena en una cafetería</h2><p>${completed ? "El video terminó. Continúa sin volver a observarlo." : "La reproducción comenzará cuando pulses el botón."}</p></div></div>
        <div class="video-frame">
          <video id="study-video" preload="metadata" playsinline disablepictureinpicture controlslist="nodownload noplaybackrate nofullscreen" aria-label="Video del evento en una cafetería">
            <source src="assets/evento-cafeteria.mp4" type="video/mp4" />
            Tu navegador no puede reproducir este video.
          </video>
          <div class="video-overlay ${completed ? "hidden" : ""}" id="video-overlay">
            <div><h3>Una sola reproducción</h3><p>Al iniciar, mantén esta ventana visible hasta que termine el video.</p><button class="play-button" id="play-video" aria-label="Reproducir video">▶</button></div>
          </div>
        </div>
        <div class="btn-row"><button class="btn btn-primary" id="continue-after-video" data-action="start-distractor" ${completed ? "" : "disabled"}>Continuar a la actividad visual</button></div>
      </div>`, 2, "Sesión inicial");

    const video = document.querySelector("#study-video");
    const play = document.querySelector("#play-video");
    if (completed) {
      video.removeAttribute("src");
      video.querySelector("source")?.remove();
    } else {
      let farthestTime = 0;
      play?.addEventListener("click", async () => {
        participant.videoStartedAt ||= new Date().toISOString();
        saveDatabase();
        document.querySelector("#video-overlay")?.classList.add("hidden");
        try { await video.play(); } catch (error) {
          document.querySelector("#video-overlay")?.classList.remove("hidden");
          showToast("No se pudo iniciar el video. Revisa el audio e inténtalo otra vez.");
        }
      });
      video.addEventListener("timeupdate", () => { farthestTime = Math.max(farthestTime, video.currentTime); });
      video.addEventListener("seeking", () => {
        if (video.currentTime > farthestTime + 0.4) video.currentTime = farthestTime;
      });
      video.addEventListener("pause", () => { if (!video.ended) video.play().catch(() => {}); });
      video.addEventListener("contextmenu", (event) => event.preventDefault());
      video.addEventListener("ended", () => {
        participant.videoCompletedAt = new Date().toISOString();
        saveDatabase();
        document.querySelector("#continue-after-video")?.removeAttribute("disabled");
        showToast("Video completado. Ya puedes continuar.");
      });
    }
    top();
  }

  function renderDistractor(participant) {
    const index = participant.session1.distractors.length;
    if (index >= DATA.distractors.length) {
      participant.currentStage = "postevent";
      saveDatabase();
      return renderPostevent(participant);
    }
    const task = DATA.distractors[index];
    const oddIndex = hashString(`${participant.code}:distractor:${index}`) % 6;
    const symbols = Array.from({ length: 6 }, (_, i) => i === oddIndex ? task.odd : task.common);
    app.innerHTML = sessionFrame(`
      <div class="panel panel-narrow">
        <div class="progress-label"><span>Ejercicio ${index + 1} de ${DATA.distractors.length}</span><span>${Math.round(index / DATA.distractors.length * 100)}%</span></div>
        <p class="eyebrow">Tarea distractora</p>
        <h2>¿Cuál figura es diferente?</h2>
        <p class="muted">Selecciona una de las seis posiciones. La actividad avanza automáticamente.</p>
        <div class="distractor-grid">
          ${symbols.map((symbol, i) => `<button class="symbol-card" data-action="answer-distractor" data-index="${i}" aria-label="Posición ${i + 1}: ${symbol}">${symbol}</button>`).join("")}
        </div>
      </div>`, 3, "Sesión inicial");
    distractorStartedAt = performance.now();
    top();
  }

  function narrativeFor(participant) {
    const listIndex = participant.list - 1;
    const sections = [
      DATA.details.slice(0, 5),
      DATA.details.slice(5, 8),
      DATA.details.slice(8, 12),
      DATA.details.slice(12, 15)
    ];
    return sections.map((group, groupIndex) => {
      const sentences = group.map((detail) => {
        const condition = detail.conditions[listIndex];
        if (condition === "N") return "";
        return condition === "C" ? detail.correctText : detail.misleadingText;
      }).filter(Boolean);
      const openings = [
        "La estudiante llegó a una cafetería universitaria. ",
        "Una vez instalada, organizó sus cosas. ",
        "Más adelante compartió la mesa con otro estudiante. ",
        "Al concluir sus actividades, ambos recogieron sus pertenencias. "
      ];
      return openings[groupIndex] + sentences.join(" ");
    });
  }

  function renderPostevent(participant) {
    const paragraphs = narrativeFor(participant);
    const minSeconds = db.settings.pilotMode ? 0 : 15;
    app.innerHTML = sessionFrame(`
      <div class="panel panel-narrow">
        <div class="panel-head"><div><p class="eyebrow">Lectura sobre el evento</p><h2>Resumen de la escena</h2><p>Lee el texto completo una sola vez y con atención.</p></div></div>
        <article class="reading-card">${paragraphs.map((paragraph) => `<p>${escapeHTML(paragraph)}</p>`).join("")}</article>
        <label class="check-row"><input id="reading-confirm" type="checkbox" /><span>Confirmo que leí el texto completo.</span></label>
        <div class="btn-row"><button class="btn btn-primary" id="start-test-button" data-action="start-test-one" disabled>Comenzar prueba de memoria <span id="reading-countdown">${minSeconds ? `(${minSeconds} s)` : ""}</span></button></div>
      </div>`, 4, "Sesión inicial");
    const startedAt = performance.now();
    const checkbox = document.querySelector("#reading-confirm");
    const button = document.querySelector("#start-test-button");
    const countdown = document.querySelector("#reading-countdown");
    let remaining = minSeconds;
    const sync = () => { button.disabled = !(checkbox.checked && remaining <= 0); };
    checkbox.addEventListener("change", sync);
    clearInterval(readingTimer);
    if (remaining > 0) {
      readingTimer = setInterval(() => {
        remaining -= 1;
        countdown.textContent = remaining > 0 ? `(${remaining} s)` : "";
        if (remaining <= 0) { clearInterval(readingTimer); sync(); }
      }, 1000);
    } else sync();
    button.addEventListener("click", () => {
      participant.posteventReadMs = Math.round(performance.now() - startedAt);
      saveDatabase();
    }, { once: true });
    top();
  }

  function renderTest(participant, sessionNumber) {
    const session = sessionNumber === 1 ? participant.session1 : participant.session2;
    const form = sessionNumber === 1 ? participant.immediateForm : participant.delayedForm;
    const questions = DATA.questions[form];
    const index = session.responses.length;
    if (index >= questions.length) return completeSession(participant, sessionNumber);
    const question = questions[index];
    const answerInput = question.type === "choice"
      ? `<div class="choices">${question.options.map((option, i) => `<label class="choice"><input type="radio" name="answer" value="${escapeHTML(option)}" /><span class="choice-key">${String.fromCharCode(65 + i)}</span><span>${escapeHTML(option)}</span></label>`).join("")}</div>`
      : `<div class="field"><label for="open-answer">Respuesta breve</label><input id="open-answer" name="openAnswer" type="text" maxlength="120" autocomplete="off" placeholder="${escapeHTML(question.placeholder)}" /></div><label class="check-row"><input id="no-recall" type="checkbox" /><span>No lo recuerdo</span></label>`;
    app.innerHTML = sessionFrame(`
      <div class="panel panel-narrow">
        <div class="progress-label"><span>Forma ${form} · Reactivo ${index + 1} de ${questions.length}</span><span>${Math.round(index / questions.length * 100)}%</span></div>
        <form id="question-form" data-session="${sessionNumber}">
          <p class="question-number">${escapeHTML(question.item)}${question.filler ? " · Relleno" : ""}</p>
          <h2 class="question-title">${escapeHTML(question.prompt)}</h2>
          ${answerInput}
          <div class="response-meta">
            <div class="field">
              <span>Confianza en tu respuesta</span>
              <div class="range-wrap"><input id="confidence" name="confidence" type="range" min="0" max="100" step="1" value="50" aria-label="Confianza de 0 a 100" /><output id="confidence-value" class="range-value">50</output></div>
              <small>0 = nada seguro · 100 = completamente seguro</small>
            </div>
            <fieldset class="field" style="border:0;padding:0;margin:0">
              <legend>¿De dónde crees que proviene tu recuerdo?</legend>
              <div class="source-grid">${DATA.sources.map((source) => `<label class="choice"><input type="radio" name="source" value="${source.value}" /><span>${source.label}</span></label>`).join("")}</div>
            </fieldset>
          </div>
          <div class="spacer"></div>
          <div class="btn-row"><button class="btn btn-primary" type="submit">Confirmar y continuar</button><button class="btn btn-ghost" type="button" data-action="omit-question" data-session="${sessionNumber}">Registrar omisión</button></div>
          <p class="muted small">No podrás regresar a este reactivo. No se mostrará retroalimentación durante el estudio.</p>
        </form>
      </div>`, 5, sessionNumber === 1 ? "Prueba inmediata" : "Seguimiento a 7 días");
    const confidence = document.querySelector("#confidence");
    confidence.addEventListener("input", () => { document.querySelector("#confidence-value").value = confidence.value; });
    const noRecall = document.querySelector("#no-recall");
    const openAnswer = document.querySelector("#open-answer");
    if (noRecall && openAnswer) {
      noRecall.addEventListener("change", () => {
        openAnswer.disabled = noRecall.checked;
        if (noRecall.checked) openAnswer.value = "";
      });
      openAnswer.addEventListener("input", () => { if (openAnswer.value.trim()) noRecall.checked = false; });
    }
    questionStartedAt = performance.now();
    top();
  }

  function scoreResponse(question, rawAnswer, participant, status = "OK") {
    const answer = normalize(rawAnswer);
    const correct = question.correct.map(normalize).includes(answer);
    const misleading = question.misleading.map(normalize).includes(answer);
    const noRecall = answer === "no lo recuerdo";
    const detail = DATA.details.find((item) => item.id === question.id);
    const condition = detail ? detail.conditions[participant.list - 1] : "F";
    return {
      accuracy: question.filler || status !== "OK" ? null : (correct ? 1 : 0),
      misinfoChoice: question.filler || status !== "OK" ? null : (misleading ? 1 : 0),
      misinfoAccept: question.filler || status !== "OK" ? null : (condition === "E" && misleading ? 1 : 0),
      noRecall: status === "OK" ? (noRecall ? 1 : 0) : null,
      condition
    };
  }

  function saveQuestionResponse(participant, sessionNumber, payload) {
    const session = sessionNumber === 1 ? participant.session1 : participant.session2;
    const form = sessionNumber === 1 ? participant.immediateForm : participant.delayedForm;
    const question = DATA.questions[form][session.responses.length];
    const scored = scoreResponse(question, payload.answer, participant, payload.status);
    const inconsistency = payload.status === "OK" && normalize(payload.answer) !== "no lo recuerdo" && payload.source === "no_recall";
    session.responses.push({
      id: question.id,
      item: question.item,
      form,
      session: sessionNumber === 1 ? "immediate" : "delayed",
      filler: Boolean(question.filler),
      response: payload.answer,
      confidence: payload.confidence,
      source: payload.source,
      rtMs: payload.rtMs,
      status: payload.status,
      inconsistencyFlag: inconsistency ? 1 : 0,
      ...scored,
      recordedAt: new Date().toISOString()
    });
    saveDatabase();
    renderTest(participant, sessionNumber);
  }

  function completeSession(participant, sessionNumber) {
    if (sessionNumber === 1) {
      const completedAt = new Date();
      participant.session1.completedAt = completedAt.toISOString();
      participant.session1.eligibleAt = new Date(completedAt.getTime() + DATA.meta.delayDays * 86400000).toISOString();
      participant.currentStage = "session1_complete";
    } else {
      participant.session2.completedAt = new Date().toISOString();
      participant.currentStage = "complete";
      participant.debriefViewedAt = new Date().toISOString();
    }
    saveDatabase();
    renderSession();
  }

  function renderSessionOneComplete(participant) {
    app.innerHTML = sessionFrame(`
      <div class="panel panel-narrow">
        <div class="completion-mark" aria-hidden="true">✓</div>
        <p class="eyebrow">Sesión registrada</p>
        <h2>Terminaste la primera parte</h2>
        <p>Conserva tu código anónimo. La segunda sesión estará disponible a partir del <strong>${formatDate(participant.session1.eligibleAt, true)}</strong>.</p>
        <div class="code-card">${escapeHTML(participant.code)}</div>
        <div class="notice warning"><span aria-hidden="true">7</span><div><strong>No revises el video ni busques respuestas</strong><p>Durante el intervalo evita consultar materiales sobre la escena. No se mostrarán puntuaciones ni respuestas correctas.</p></div></div>
        <div class="btn-row"><button class="btn btn-primary" data-action="download-participant">Guardar respaldo de mi sesión</button><button class="btn btn-secondary" data-route="#/">Salir</button></div>
      </div>`, 6, "Sesión inicial");
    top();
  }

  function renderSessionTwoGate(participant) {
    const eligible = new Date(participant.session1.eligibleAt).getTime();
    const remainingMs = Math.max(0, eligible - Date.now());
    const canStart = db.settings.pilotMode || remainingMs <= 0;
    const remainingDays = Math.ceil(remainingMs / 86400000);
    app.innerHTML = `
      <section class="page-shell"><div class="panel panel-narrow">
        <p class="eyebrow">Seguimiento</p>
        <h2>${canStart ? "Tu segunda sesión está disponible" : "Aún no es momento del seguimiento"}</h2>
        <p>Código: <strong>${escapeHTML(participant.code)}</strong> · Forma asignada: <strong>${participant.delayedForm}</strong></p>
        ${canStart
          ? `<div class="notice success"><span aria-hidden="true">✓</span><div><strong>Continúa sin volver al video</strong><p>Responde solo con lo que recuerdas en este momento.</p></div></div><div class="btn-row"><button class="btn btn-primary" data-action="start-session-two">Comenzar prueba diferida</button><button class="btn btn-secondary" data-route="#/">Salir</button></div>`
          : `<div class="notice warning"><span aria-hidden="true">⏱</span><div><strong>Faltan aproximadamente ${remainingDays} día${remainingDays === 1 ? "" : "s"}</strong><p>Podrás continuar a partir del ${formatDate(participant.session1.eligibleAt, true)}.</p></div></div><div class="btn-row"><button class="btn btn-secondary" data-route="#/">Volver al inicio</button></div>`}
      </div></section>`;
    top();
  }

  function renderDebrief(participant) {
    app.innerHTML = sessionFrame(`
      <div class="panel panel-narrow">
        <div class="completion-mark" aria-hidden="true">✓</div>
        <p class="eyebrow">Explicación final</p>
        <h2>Gracias por completar el estudio</h2>
        <div class="reading-card">
          <p>El propósito de esta práctica es estudiar cómo la información presentada después de observar un evento puede influir en la memoria.</p>
          <p>El relato que leíste incluyó una combinación de detalles correctos, detalles modificados de manera intencional y aspectos que no se mencionaron. Esta manipulación permite comparar la precisión del recuerdo y la aceptación de información engañosa.</p>
          <p>Que una persona recuerde un detalle distinto no implica falta de atención: la memoria es reconstructiva y puede integrar información de distintas fuentes. No compartas los detalles de la manipulación con personas que aún puedan participar.</p>
        </div>
        <div class="notice warning"><span aria-hidden="true">!</span><div><strong>Texto pendiente de aprobación</strong><p>Antes de la aplicación real, añadir datos de contacto, derecho a retirar datos y recursos de atención definidos en el protocolo ético.</p></div></div>
        <div class="btn-row"><button class="btn btn-primary" data-action="download-participant">Descargar respaldo</button><button class="btn btn-secondary" data-route="#/">Finalizar</button></div>
      </div>`, 6, "Seguimiento completado");
    top();
  }

  function renderMissingSession() {
    app.innerHTML = `<section class="page-shell"><div class="panel panel-narrow"><p class="eyebrow">Seguimiento</p><h2>No encontramos la primera sesión</h2><p>Este prototipo conserva los datos en el navegador donde se realizó la sesión inicial. Comprueba el código y usa el mismo dispositivo y navegador.</p><div class="notice warning"><span aria-hidden="true">!</span><div><strong>Si cambiaste de dispositivo</strong><p>Entrega al equipo investigador el respaldo descargado al terminar la primera sesión para que lo importe en modo docente.</p></div></div><div class="btn-row"><button class="btn btn-secondary" data-route="#/participante">Intentar otro código</button></div></div></section>`;
    top();
  }

  function renderTeacherLogin() {
    app.innerHTML = `<section class="page-shell"><div class="page-head"><div><p class="eyebrow">Modo docente</p><h2>Panel del equipo investigador</h2><p>Acceso para pilotaje y revisión local del protocolo.</p></div><button class="btn btn-ghost" data-route="#/">← Inicio</button></div><div class="panel panel-narrow"><form id="teacher-login"><div class="field"><label for="teacher-key">Clave de acceso de pilotaje</label><input id="teacher-key" type="password" autocomplete="off" required /><small>Clave inicial documentada para el equipo: MEMORIA2026. No constituye seguridad para un estudio publicado.</small></div><button class="btn btn-primary" type="submit">Entrar al panel</button></form></div></section>`;
    top();
  }

  function renderTeacher(tab = "overview") {
    const participants = Object.values(db.participants);
    const completedOne = participants.filter((p) => p.session1.completedAt).length;
    const completedTwo = participants.filter((p) => p.session2.completedAt).length;
    const tabs = [
      ["overview", "Resumen"], ["matrix", "Matriz"], ["protocol", "Protocolo"]
    ];
    let content = "";
    if (tab === "matrix") content = renderMatrix();
    else if (tab === "protocol") content = renderProtocol();
    else content = renderOverview(participants, completedOne, completedTwo);
    app.innerHTML = `<section class="page-shell"><div class="page-head"><div><p class="eyebrow">Modo docente</p><h2>Control del pilotaje</h2><p>Asignaciones reproducibles, datos locales y verificación metodológica.</p></div><button class="btn btn-ghost" data-route="#/">← Salir</button></div><div class="tabs">${tabs.map(([id, label]) => `<button class="tab ${tab === id ? "active" : ""}" data-teacher-tab="${id}">${label}</button>`).join("")}</div>${content}</section>`;
    top();
  }

  function renderOverview(participants, completedOne, completedTwo) {
    return `
      <div class="dashboard-grid">
        <div class="stat-card"><strong>${participants.length}</strong><span>códigos locales</span></div>
        <div class="stat-card"><strong>${completedOne}</strong><span>sesiones iniciales</span></div>
        <div class="stat-card"><strong>${completedTwo}</strong><span>seguimientos completos</span></div>
      </div>
      <div class="panel">
        <div class="panel-head"><div><h3>Herramientas de pilotaje</h3><p>El modo piloto elimina la espera de siete días. No debe activarse durante recolección real.</p></div><label class="check-row" style="border:0;padding:0"><input id="pilot-toggle" type="checkbox" ${db.settings.pilotMode ? "checked" : ""} /><span>Modo piloto</span></label></div>
        <form id="assignment-calculator" class="field-grid"><div class="field"><label for="calc-code">Calcular asignación por código</label><input id="calc-code" type="text" placeholder="Ejemplo: PILOTO-01" /></div><div class="field"><span>Resultado</span><div id="assignment-result" class="notice" style="margin:0;min-height:50px"><div><strong>Introduce un código</strong><p>La semilla fija conserva la misma asignación.</p></div></div></div></form>
        <div class="btn-row"><button class="btn btn-primary" data-action="export-csv" ${participants.length ? "" : "disabled"}>Exportar CSV</button><button class="btn btn-secondary" data-action="export-json" ${participants.length ? "" : "disabled"}>Exportar respaldo JSON</button><label class="btn btn-secondary" for="import-json">Importar respaldo</label><input class="sr-only" id="import-json" type="file" accept="application/json,.json" /><button class="btn btn-ghost" data-action="reset-data" ${participants.length ? "" : "disabled"}>Borrar datos locales</button></div>
      </div>
      <div class="panel">
        <div class="panel-head"><div><h3>Participantes en este navegador</h3><p>No se muestran respuestas ni claves individuales durante una sesión activa.</p></div></div>
        ${participants.length ? `<div class="table-wrap"><table><thead><tr><th>Código</th><th>Versión</th><th>Lista</th><th>Inmediata</th><th>Diferida</th><th>Estado</th></tr></thead><tbody>${participants.map((p) => `<tr><td><strong>${escapeHTML(p.code)}</strong></td><td>${p.assignmentKey}</td><td>${p.list}</td><td>Forma ${p.immediateForm}</td><td>Forma ${p.delayedForm}</td><td>${p.session2.completedAt ? `<span class="badge green">Completo</span>` : p.session1.completedAt ? `<span class="badge orange">Seguimiento pendiente</span>` : `<span class="badge">En curso</span>`}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Todavía no hay sesiones guardadas.</p>`}
      </div>
      <div class="notice warning"><span aria-hidden="true">!</span><div><strong>Límite de esta versión estática</strong><p>GitHub Pages no ofrece una base de datos privada. Para un estudio real multiusuario se requiere un servicio de captura con autenticación, cifrado y control de acceso; este prototipo es apropiado para pilotaje local y docencia.</p></div></div>`;
  }

  function renderMatrix() {
    return `<div class="panel"><div class="panel-head"><div><h3>Rotación de condiciones</h3><p>C = correcta, E = engañosa, N = control sin mención.</p></div></div><div class="matrix"><div class="matrix-row matrix-head"><span>ID</span><span>Detalle real</span><span>L1</span><span>L2</span><span>L3</span></div>${DATA.details.map((detail) => `<div class="matrix-row"><strong>${detail.id}</strong><span>${escapeHTML(detail.real)}</span>${detail.conditions.map((condition) => `<span class="badge ${condition === "C" ? "green" : condition === "E" ? "orange" : ""}">${condition}</span>`).join("")}</div>`).join("")}</div></div><div class="panel"><h3>Contrabalanceo de formas</h3><div class="table-wrap" style="margin-top:1rem"><table><thead><tr><th>Versión</th><th>Inmediata</th><th>7 días</th><th>Lista</th></tr></thead><tbody>${Object.entries(DATA.assignments).map(([key, value]) => `<tr><td><strong>${key}</strong></td><td>Forma ${value.immediate}</td><td>Forma ${value.delayed}</td><td>Lista ${value.list}</td></tr>`).join("")}</tbody></table></div></div>`;
  }

  function renderProtocol() {
    const steps = [
      ["01", "Consentimiento y código", "Identificación anónima y aceptación voluntaria."],
      ["02", "Evento audiovisual", "Una sola reproducción del video de 64 segundos."],
      ["03", "Tarea distractora", "Doce ejercicios de discriminación visual sin contenido relacionado."],
      ["04", "Información postevento", "Relato generado con cinco detalles C, cinco E y cinco N."],
      ["05", "Memoria inmediata", "Forma A o B; respuesta, confianza, fuente y tiempo."],
      ["06", "Seguimiento", "La otra forma después de siete días, seguida del debriefing."]
    ];
    return `<div class="panel"><div class="panel-head"><div><h3>Secuencia experimental</h3><p>Cada detalle crítico se evalúa una sola vez.</p></div></div><div class="mode-stack">${steps.map(([number, title, text]) => `<div class="mode-card" style="cursor:default"><span class="mode-icon">${number}</span><span><strong>${title}</strong><small>${text}</small></span></div>`).join("")}</div></div><div class="panel"><h3>Lista de verificación antes del pilotaje</h3>${[
      "Completar contacto institucional y obtener aprobación del consentimiento y debriefing.",
      "Revisar en pantalla completa la visibilidad de los 15 detalles del video.",
      "Pilotear comprensión, dificultad y tiempo de las Formas A y B.",
      "Definir recordatorios y ventana de vencimiento del seguimiento.",
      "Configurar una captura de datos privada antes de reclutar una muestra real.",
      "Excluir F01 del análisis principal y conservar incidencias/omisiones como NA."
    ].map((item) => `<label class="check-row"><input type="checkbox" /><span>${item}</span></label>`).join("")}</div>`;
  }

  function buildRows() {
    return Object.values(db.participants).flatMap((participant) => [
      ...participant.session1.responses,
      ...participant.session2.responses
    ].map((response) => ({
      participant_code: participant.code,
      version: participant.assignmentKey,
      list: participant.list,
      session: response.session,
      form: response.form,
      item_id: response.id,
      item: response.item,
      condition: response.condition,
      response: response.response,
      accuracy: response.accuracy,
      misinfo_choice: response.misinfoChoice,
      misinfo_accept: response.misinfoAccept,
      confidence_0_100: response.confidence,
      source: response.source,
      rt_ms: response.rtMs,
      no_recall: response.noRecall,
      filler: response.filler ? 1 : 0,
      status: response.status,
      inconsistency_flag: response.inconsistencyFlag,
      recorded_at: response.recordedAt
    })));
  }

  function csvEscape(value) {
    if (value === null || value === undefined) return "";
    const string = String(value);
    return /[",\n]/.test(string) ? `"${string.replace(/"/g, '""')}"` : string;
  }

  function download(name, content, type) {
    try {
      const blob = new Blob([content], { type });
      if (typeof navigator !== "undefined" && typeof navigator.msSaveOrOpenBlob === "function") {
        navigator.msSaveOrOpenBlob(blob, name);
        return true;
      }
      if (typeof URL?.createObjectURL !== "function") throw new Error("createObjectURL no disponible");
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = name;
      link.rel = "noopener";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      window.setTimeout(() => {
        link.remove();
        URL.revokeObjectURL(url);
      }, 1000);
      return true;
    } catch (error) {
      console.error("No se pudo iniciar la descarga.", error);
      showToast("No se pudo iniciar la descarga en este navegador.");
      return false;
    }
  }

  function exportCSV() {
    const rows = buildRows();
    if (!rows.length) return showToast("Aún no hay respuestas para exportar.");
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(","))].join("\n");
    download(`memoria-datos-${new Date().toISOString().slice(0, 10)}.csv`, `\uFEFF${csv}`, "text/csv;charset=utf-8");
  }

  function exportJSON(participant = null) {
    const payload = participant
      ? { schema: DATA.meta.version, exportedAt: new Date().toISOString(), participant }
      : { schema: DATA.meta.version, exportedAt: new Date().toISOString(), database: db };
    const suffix = participant ? participant.code : "respaldo-completo";
    download(`memoria-${suffix}.json`, JSON.stringify(payload, null, 2), "application/json");
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = JSON.parse(reader.result);
        if (payload.participant?.code) {
          db.participants[payload.participant.code] = payload.participant;
        } else if (payload.database?.participants) {
          db = { ...db, ...payload.database };
        } else throw new Error("Formato no reconocido");
        saveDatabase();
        showToast("Respaldo importado correctamente.");
        renderTeacher("overview");
      } catch (error) {
        showToast("El archivo no es un respaldo válido.");
      }
    };
    reader.readAsText(file);
  }

  document.addEventListener("submit", (event) => {
    event.preventDefault();
    if (event.target.id === "participant-login") {
      const form = new FormData(event.target);
      const code = String(form.get("code") || "").trim().toUpperCase();
      const session = Number(form.get("session"));
      if (!/^[A-Z0-9-]{4,24}$/.test(code)) return showToast("Revisa el formato del código anónimo.");
      activeCode = code;
      let participant = db.participants[code];
      if (session === 1) {
        if (!participant) {
          participant = createParticipant(code);
          db.participants[code] = participant;
          saveDatabase();
        }
        if (participant.session1.completedAt) participant.currentStage = "session1_complete";
        renderSession();
      } else {
        if (!participant?.session1.completedAt) return renderMissingSession();
        if (participant.session2.completedAt) {
          participant.currentStage = "complete";
          return renderSession();
        }
        if (!hasAcceptedConsent(participant)) {
          participant.currentStage = "consent";
          saveDatabase();
          return renderSession();
        }
        renderSessionTwoGate(participant);
      }
    }

    if (event.target.id === "consent-form") {
      const participant = db.participants[activeCode];
      participant.consentAt = new Date().toISOString();
      participant.consentVersion = CONSENT_VERSION;
      participant.currentStage = "intro";
      saveDatabase();
      renderSession();
    }

    if (event.target.id === "question-form") {
      const participant = db.participants[activeCode];
      const sessionNumber = Number(event.target.dataset.session);
      const formData = new FormData(event.target);
      const open = event.target.querySelector("#open-answer");
      const noRecall = event.target.querySelector("#no-recall");
      const answer = open ? (noRecall?.checked ? "No lo recuerdo" : open.value.trim()) : String(formData.get("answer") || "");
      const source = String(formData.get("source") || "");
      if (!answer) return showToast("Elige una respuesta o marca ‘No lo recuerdo’.");
      if (!source) return showToast("Indica de dónde crees que proviene el recuerdo.");
      saveQuestionResponse(participant, sessionNumber, {
        answer,
        confidence: Number(formData.get("confidence")),
        source,
        rtMs: Math.round(performance.now() - questionStartedAt),
        status: "OK"
      });
    }

    if (event.target.id === "teacher-login") {
      if (document.querySelector("#teacher-key").value !== "MEMORIA2026") return showToast("La clave no coincide.");
      sessionStorage.setItem("memoria-teacher", "1");
      renderTeacher("overview");
    }
  });

  document.addEventListener("click", (event) => {
    const route = event.target.closest("[data-route]")?.dataset.route;
    if (route) return go(route);
    const tab = event.target.closest("[data-teacher-tab]")?.dataset.teacherTab;
    if (tab) return renderTeacher(tab);
    const target = event.target.closest("[data-action]");
    if (!target) return;
    const action = target.dataset.action;
    const participant = activeCode ? db.participants[activeCode] : null;

    if (action === "start-video") {
      participant.currentStage = "video";
      saveDatabase();
      renderSession();
    }
    if (action === "start-distractor") {
      participant.currentStage = "distractor";
      saveDatabase();
      renderSession();
    }
    if (action === "answer-distractor") {
      const index = participant.session1.distractors.length;
      const selected = Number(target.dataset.index);
      const oddIndex = hashString(`${participant.code}:distractor:${index}`) % 6;
      participant.session1.distractors.push({
        trial: index + 1,
        selectedPosition: selected + 1,
        oddPosition: oddIndex + 1,
        correct: selected === oddIndex ? 1 : 0,
        rtMs: Math.round(performance.now() - distractorStartedAt)
      });
      saveDatabase();
      renderDistractor(participant);
    }
    if (action === "start-test-one") {
      participant.currentStage = "test1";
      saveDatabase();
      renderSession();
    }
    if (action === "start-session-two") {
      participant.currentStage = "test2";
      participant.session2.startedAt ||= new Date().toISOString();
      saveDatabase();
      renderSession();
    }
    if (action === "omit-question") {
      const sessionNumber = Number(target.dataset.session);
      if (!window.confirm("Registrar este reactivo como omisión (NA_OMIT) y continuar sin volver atrás?")) return;
      saveQuestionResponse(participant, sessionNumber, {
        answer: "", confidence: null, source: null,
        rtMs: Math.round(performance.now() - questionStartedAt), status: "NA_OMIT"
      });
    }
    if (action === "download-participant") exportJSON(participant);
    if (action === "print-consent") window.print();
    if (action === "export-csv") exportCSV();
    if (action === "export-json") exportJSON();
    if (action === "reset-data") {
      if (!window.confirm("Esto borrará todas las sesiones guardadas en este navegador. ¿Ya exportaste un respaldo?")) return;
      if (!window.confirm("Confirma una segunda vez: esta acción no se puede deshacer.")) return;
      db.participants = {};
      saveDatabase();
      renderTeacher("overview");
      showToast("Datos locales eliminados.");
    }
  });

  document.addEventListener("change", (event) => {
    if (event.target.id === "pilot-toggle") {
      db.settings.pilotMode = event.target.checked;
      saveDatabase();
      showToast(event.target.checked ? "Modo piloto activado." : "Modo piloto desactivado.");
    }
    if (event.target.id === "import-json" && event.target.files[0]) importJSON(event.target.files[0]);
  });

  document.addEventListener("input", (event) => {
    if (event.target.id === "calc-code") {
      const code = event.target.value.trim().toUpperCase();
      const result = document.querySelector("#assignment-result");
      if (!code) {
        result.innerHTML = "<div><strong>Introduce un código</strong><p>La semilla fija conserva la misma asignación.</p></div>";
      } else {
        const assignment = assignmentFor(code);
        result.innerHTML = `<div><strong>${assignment.key} · Lista ${assignment.list}</strong><p>Inmediata: Forma ${assignment.immediate} · Diferida: Forma ${assignment.delayed}</p></div>`;
      }
    }
  });

  window.addEventListener("hashchange", route);

  function route() {
    clearInterval(readingTimer);
    const hash = window.location.hash || "#/";
    if (hash === "#/participante") return renderParticipantLogin();
    if (hash === "#/docente") {
      return sessionStorage.getItem("memoria-teacher") === "1" ? renderTeacher("overview") : renderTeacherLogin();
    }
    renderHome();
  }

  route();
})();
