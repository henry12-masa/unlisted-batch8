const QUESTION_COUNT = 50;
let currentExam = null;
let currentQuestions = [];
let currentIndex = 0;
let score = 0;

const $ = (id) => document.getElementById(id);
const screens = { home: $('homeScreen'), quiz: $('quizScreen'), result: $('resultScreen') };

function showScreen(name){
  Object.values(screens).forEach(s => s.classList.add('hidden'));
  screens[name].classList.remove('hidden');
  window.scrollTo({top:0, behavior:'smooth'});
}

function shuffle(array){
  const a = [...array];
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]]=[a[j],a[i]];
  }
  return a;
}

function renderHome(){
  $('examGrid').innerHTML = '';
  window.examList.forEach(exam => {
    const btn = document.createElement('button');
    btn.className = 'exam-card';
    btn.innerHTML = `<h3>${exam.title}</h3><p>${exam.description}</p><p class="muted">200問収録 / ランダム50問</p>`;
    btn.addEventListener('click', () => startQuiz(exam.slug));
    $('examGrid').appendChild(btn);
  });
}

function startQuiz(slug){
  currentExam = window.examList.find(e => e.slug === slug);
  const bank = window.quizData?.[slug] || [];
  if(bank.length === 0){ alert('問題データが見つかりません。'); return; }
  currentQuestions = shuffle(bank).slice(0, Math.min(QUESTION_COUNT, bank.length));
  currentIndex = 0;
  score = 0;
  $('examTitle').textContent = currentExam.title;
  $('scoreText').textContent = '正解 0';
  showScreen('quiz');
  renderQuestion();
}

function renderQuestion(){
  const q = currentQuestions[currentIndex];
  $('questionTitle').textContent = `問題 ${currentIndex + 1}`;
  $('progressText').textContent = `${currentIndex + 1} / ${currentQuestions.length}`;
  $('barFill').style.width = `${((currentIndex) / currentQuestions.length) * 100}%`;
  $('questionText').textContent = q.question;
  $('feedback').classList.add('hidden');
  $('feedback').textContent = '';
  $('choices').innerHTML = '';
  shuffle(q.choices).forEach(choice => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.type = 'button';
    btn.textContent = choice;
    btn.addEventListener('click', () => answer(choice, btn));
    $('choices').appendChild(btn);
  });
}

function answer(choice, btn){
  const q = currentQuestions[currentIndex];
  const isCorrect = choice === q.answer;
  document.querySelectorAll('.choice').forEach(b => {
    b.disabled = true;
    if(b.textContent === q.answer) b.classList.add('correct');
  });
  if(!isCorrect) btn.classList.add('wrong');
  if(isCorrect) score++;
  $('scoreText').textContent = `正解 ${score}`;
  $('feedback').classList.remove('hidden');
  $('feedback').innerHTML = `<strong>${isCorrect ? '正解です。' : '不正解です。'}</strong><br>正解：${q.answer}<br>${q.explanation}`;
  setTimeout(() => {
    currentIndex++;
    if(currentIndex >= currentQuestions.length){ finishQuiz(); }
    else { renderQuestion(); }
  }, 1200);
}

function finishQuiz(){
  $('barFill').style.width = '100%';
  $('resultTitle').textContent = `${currentExam.title} の結果`;
  $('resultScore').textContent = `${currentQuestions.length}問中 ${score}問正解`;
  showScreen('result');
}

function goHome(){ showScreen('home'); }

$('homeBtn').addEventListener('click', goHome);
$('backHomeBtn').addEventListener('click', goHome);
$('retryBtn').addEventListener('click', () => currentExam ? startQuiz(currentExam.slug) : goHome());

renderHome();
showScreen('home');
