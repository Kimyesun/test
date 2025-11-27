const nameInput = document.getElementById('name');
const langSelect = document.getElementById('lang');
const greetBtn = document.getElementById('greetBtn');
const greeting = document.getElementById('greeting');

function makeGreeting(name, lang){
  const n = name && name.trim() ? name.trim() : '';
  if(lang === 'en'){
    if(n) return `Hello, ${n}! Nice to meet you.`;
    return `Hello! What's your name?`;
  }
  // default: Korean
  if(n) return `안녕하세요, ${n}님! 만나서 반가워요.`;
  return `안녕하세요! 이름을 입력해 주세요.`;
}

function showGreeting(text){
  greeting.textContent = text;
  greeting.classList.remove('show');
  // reflow to restart animation
  void greeting.offsetWidth;
  greeting.classList.add('show');
}

function handleGreet(){
  const name = nameInput.value;
  const lang = langSelect.value;
  const text = makeGreeting(name, lang);
  showGreeting(text);
}

greetBtn.addEventListener('click', handleGreet);

nameInput.addEventListener('keyup', (e) => {
  if(e.key === 'Enter') handleGreet();
});

// set a friendly default greeting on load
window.addEventListener('load', () => {
  setTimeout(() => {
    showGreeting(makeGreeting('', 'ko'));
  }, 400);
});
