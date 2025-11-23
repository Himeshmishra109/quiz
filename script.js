// Slider-style Quiz App — robust and safe insertion of text (no innerHTML issues for tags)
const quizData = [
  { q: "What does HTML stand for?",
    a: "Hyper Text Markup Language",
    b: "Home Tool Markup Language",
    c: "Hyperlinks and Text Markup Language",
    d: "None",
    correct: "a" },

  { q: "Which tag is used for the largest heading?",
    a: "<h6>", b: "<h1>", c: "<head>", d: "<title>", correct: "b" },

  { q: "CSS stands for?",
    a: "Cascading Style Sheets", b: "Computer Style Sheets",
    c: "Creative Style System", d: "Colorful Style Sheets", correct: "a" },

  { q: "JS is short for?",
    a: "Java System", b: "Java Syntax", c: "JavaScript", d: "JumboScript", correct: "c" },

  { q: "Which symbol is used for single-line comments in JS?",
    a: "//", b: "/* */", c: "#", d: "<!-- -->", correct: "a" },

  { q: "Which is used to style HTML?",
    a: "Python", b: "CSS", c: "Java", d: "C++", correct: "b" },

  { q: "Inside which HTML element do we put JS?",
    a: "<script>", b: "<js>", c: "<javascript>", d: "<code>", correct: "a" },

  { q: "Which HTML attribute is used to define inline styles?",
    a: "font", b: "class", c: "style", d: "styles", correct: "c" },

  { q: "Which CSS property changes text color?",
    a: "background-color", b: "color", c: "text-color", d: "font-color", correct: "b" },

  { q: "JS arrays are written with?",
    a: "{}", b: "()", c: "[]", d: "<>", correct: "c" }
];

let timeLeft = 120;
let timerInterval = null;
const total = quizData.length;
let current = 0;
let answers = new Array(total).fill(null);

function elt(sel){return document.querySelector(sel)}
function elAll(sel){return Array.from(document.querySelectorAll(sel))}

function startTimer(){
  updateTimer();
  const prog = elt('#timeProgress');
  if(timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    timeLeft--;
    updateTimer();
    const pct = Math.max(0, (timeLeft/120)*100);
    prog.style.width = pct + '%';
    if(timeLeft<=0){
      clearInterval(timerInterval);
      submitQuiz();
    }
  },1000);
}

function updateTimer(){
  const m = Math.floor(timeLeft/60);
  const s = String(timeLeft%60).padStart(2,'0');
  elt('#timer').textContent = `${m}:${s}`;
}

function createSlide(qObj, idx){
  const slide = document.createElement('div');
  slide.className = 'slide';
  slide.dataset.index = idx;

  const header = document.createElement('div');
  header.className = 'd-flex justify-content-between align-items-start mb-2';
  header.innerHTML = `<div><strong>Q${idx+1}.</strong> <span class="fw-bold ms-2"></span></div>
                      <div class="text-muted"><small>${idx+1}/${total}</small></div>`;
  header.querySelector('span.ms-2').textContent = qObj.q;
  slide.appendChild(header);

  const optionsWrap = document.createElement('div');
  optionsWrap.className = 'mt-2';

  ['a','b','c','d'].forEach(opt=>{
    const label = document.createElement('label');
    label.className = 'option-label d-flex form-check p-2 mb-2';
    label.tabIndex = 0;
    // radio
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `q${idx}`;
    input.value = opt;
    input.className = 'form-check-input me-2';
    input.id = `q${idx}_${opt}`;

    // text holder
    const textDiv = document.createElement('div');
    textDiv.innerHTML = `<span class="fw-semibold">${opt.toUpperCase()}.</span> <span class="ms-2"></span>`;
    textDiv.querySelector('.ms-2').textContent = qObj[opt];

    label.appendChild(input);
    label.appendChild(textDiv);

    // click behavior on label selects radio and marks selected
    label.addEventListener('click', (e)=>{
      input.checked = true;
      answers[idx] = input.value;
      // visual
      const siblingLabels = label.parentElement.querySelectorAll('.option-label');
      siblingLabels.forEach(l=> l.classList.remove('option-selected'));
      label.classList.add('option-selected');
    });

    // keyboard accessibility: space/enter toggles
    label.addEventListener('keydown', (e)=>{
      if(e.key === ' ' || e.key === 'Enter'){ e.preventDefault(); label.click(); }
    });

    optionsWrap.appendChild(label);
  });

  slide.appendChild(optionsWrap);
  return slide;
}

function renderSlides(){
  const slider = elt('#slider');
  slider.innerHTML = '';
  quizData.forEach((q,i)=>{
    const s = createSlide(q,i);
    if(i!==current) s.style.display = 'none';
    else s.classList.add('slide-enter');
    slider.appendChild(s);
  });
  updateIndicator();
  updateNavButtons();
}

function showSlide(idx, direction){
  const slider = elt('#slider');
  const slides = elAll('.slide');
  if(idx<0 || idx>=total) return;
  const prev = slides[current];
  const next = slides[idx];
  if(!prev || !next) return;
  // animate exit/enter
  prev.classList.remove('slide-enter'); prev.classList.add('slide-exit');
  setTimeout(()=>{ prev.style.display = 'none'; prev.classList.remove('slide-exit'); }, 320);
  next.style.display = 'block';
  next.classList.add('slide-enter');
  current = idx;
  updateIndicator();
  updateNavButtons();
  // reflect previously selected
  const sel = answers[idx];
  if(sel){
    const r = next.querySelector(`input[name="q${idx}"][value="${sel}"]`);
    if(r) r.checked = true;
    // mark selected label
    next.querySelectorAll('.option-label').forEach(l=> l.classList.remove('option-selected'));
    const chosen = next.querySelector(`input[name="q${idx}"][value="${sel}"]`);
    if(chosen) chosen.parentElement.classList.add('option-selected');
  }
}

function updateIndicator(){
  elt('#qIndicator').textContent = `${current+1} / ${total}`;
}

function updateNavButtons(){
  elt('#prevBtn').disabled = current===0;
  elt('#nextBtn').disabled = current===total-1;
}

function submitQuiz(){
  // stop timer
  if(timerInterval) clearInterval(timerInterval);
  // compute
  let score = 0;
  const review = [];
  for(let i=0;i<total;i++){
    const user = answers[i];
    const q = quizData[i];
    const ok = user === q.correct;
    if(ok) score++;
    review.push({index:i, user, correct:q.correct, text:q[q.correct], ok});
  }
  showResultsModal(score, review);
}

function showResultsModal(score, review){
  const body = elt('#modalBody');
  body.innerHTML = `<h3 class="mb-3">Score: ${score} / ${total}</h3>`;
  const list = document.createElement('div');
  list.className = 'list-group';
  review.forEach(r=>{
    const itm = document.createElement('div');
    itm.className = 'list-group-item';
    itm.classList.add(r.ok ? 'list-group-item-success' : 'list-group-item-danger');
    itm.innerHTML = `<div class="d-flex justify-content-between"><div><strong>Q${r.index+1}.</strong> ${quizData[r.index].q}</div>
                     <div><small>${r.ok ? 'Correct' : 'Wrong'}</small></div></div>
                     <div class="mt-1"><small>Your: ${r.user ? r.user.toUpperCase() : '<em>Not answered</em>'} • Correct: <strong>${r.correct.toUpperCase()}</strong></small></div>
                     <div class="mt-2"><small><em>Answer text:</em> ${r.text}</small></div>`;
    list.appendChild(itm);
  });
  body.appendChild(list);

  const modal = new bootstrap.Modal(document.getElementById('resultModal'));
  modal.show();
}

document.addEventListener('DOMContentLoaded', ()=>{
  renderSlides();
  startTimer();

  elt('#nextBtn').addEventListener('click', ()=> showSlide(current+1,'next'));
  elt('#prevBtn').addEventListener('click', ()=> showSlide(current-1,'prev'));
  elt('#submit').addEventListener('click', ()=> submitQuiz());

  elt('#retryBtn').addEventListener('click', ()=>{
    // reset
    answers = new Array(total).fill(null);
    timeLeft = 120;
    current = 0;
    renderSlides();
    startTimer();
    bootstrap.Modal.getInstance(document.getElementById('resultModal')).hide();
  });
});
