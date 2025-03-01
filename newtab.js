// Thời tiết
function fetchWeather() {
  const apiKey = 'e0239800209ac4d58c78895ce0f406f2';
  const city = 'Hanoi';
  fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`)
      .then(response => response.json())
      .then(data => {
          const [cityTemp, description] = `${data.name}: ${data.main.temp}°C, ${data.weather[0].description}`.split(', ');
          document.getElementById('weather-info-city').innerText = cityTemp;
          document.getElementById('weather-info-desc').innerText = description;
          updateWeatherIcon(data.weather[0].main);
      })
      .catch(() => {
          document.getElementById('weather-info-city').innerText = 'Không tải được';
          document.getElementById('weather-info-desc').innerText = 'thời tiết';
          document.getElementById('weather-icon').innerText = '❓';
      });
}
function updateWeatherIcon(weather) {
  const iconElement = document.getElementById('weather-icon');
  switch (weather.toLowerCase()) {
      case 'clear': iconElement.innerText = '☀️'; break;
      case 'clouds': iconElement.innerText = '☁️'; break;
      case 'rain': iconElement.innerText = '🌧️'; break;
      case 'thunderstorm': iconElement.innerText = '⛈️'; break;
      case 'snow': iconElement.innerText = '❄️'; break;
      case 'mist': case 'fog': iconElement.innerText = '🌫️'; break;
      default: iconElement.innerText = '🌡️'; break;
  }
}
fetchWeather();

// Danh sách deadline
function loadDeadlines() {
  const deadlines = JSON.parse(localStorage.getItem('deadlines') || '[]');
  const list = document.getElementById('deadline-list');
  list.innerHTML = '';
  deadlines.forEach((deadline, index) => {
      let text = deadline.text;

      // Giới hạn 60 ký tự và thêm dấu "..." nếu quá dài
      if (text.length > 45) {
          text = text.substring(0, 40) + "...";
      }

      const li = createDeadlineItem(text, deadline.time, index);
      list.appendChild(li);
  });

  updateDeadlineTimers();
}
function createDeadlineItem(text, time, index) {
  const li = document.createElement('li');
  li.innerHTML = `${text} <span style="word-wrap: break-word;" class="deadline-time" id="deadline-timer-${index}"></span>`;
  li.style.wordWrap = "break-word";
  const deleteBtn = document.createElement('button');
  deleteBtn.innerText = 'Xóa';
  deleteBtn.className = 'delete-btn';
  deleteBtn.onclick = () => deleteDeadline(index);
  li.appendChild(deleteBtn);
  if (time) li.dataset.time = time;
  return li;
}
function addDeadline() {
  const input = document.getElementById('deadline-input');
  const timeInput = document.getElementById('deadline-time-input');
  if (input.value) {
      const deadlines = JSON.parse(localStorage.getItem('deadlines') || '[]');
      deadlines.push({ text: input.value, time: timeInput.value || null });
      localStorage.setItem('deadlines', JSON.stringify(deadlines));
      input.value = '';
      timeInput.value = '';
      loadDeadlines();
  }
}
function deleteDeadline(index) {
  const deadlines = JSON.parse(localStorage.getItem('deadlines') || '[]');
  deadlines.splice(index, 1);
  localStorage.setItem('deadlines', JSON.stringify(deadlines));
  loadDeadlines();
}
function updateDeadlineTimers() {
  const deadlines = JSON.parse(localStorage.getItem('deadlines') || '[]');
  deadlines.forEach((deadline, index) => {
      if (deadline.time) {
          const targetDate = new Date(deadline.time).getTime();
          const now = new Date().getTime();
          const distance = targetDate - now;
          const timerSpan = document.getElementById(`deadline-timer-${index}`);
          if (distance < 0) {
              timerSpan.innerText = '(Hết hạn)';
          } else {
              const days = Math.floor(distance / (1000 * 60 * 60 * 24));
              const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
              const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
              const seconds = Math.floor((distance % (1000 * 60)) / 1000);
              timerSpan.innerText = `(${days}d ${hours}h ${minutes}m ${seconds}s)`;
          }
      }
  });
}
setInterval(updateDeadlineTimers, 1000);
loadDeadlines();

// Theo dõi mục tiêu
function loadGoals() {
  const goals = JSON.parse(localStorage.getItem('goals') || '[]');
  const list = document.getElementById('goal-list');
  list.innerHTML = '';
  goals.forEach((goal, index) => {
      let text = goal;
      // Giới hạn 60 ký tự và thêm dấu "..." nếu quá dài
      if (text.length > 50) {
          goal = text.substring(0, 45) + "...";
      }
      const li = document.createElement('li');
      li.innerText = goal;
      const deleteBtn = document.createElement('button');
      deleteBtn.innerText = 'Xóa';
      deleteBtn.className = 'delete-btn';
      deleteBtn.onclick = () => deleteGoal(index);
      li.appendChild(deleteBtn);
      list.appendChild(li);
  });
}
function addGoal() {
  const input = document.getElementById('goal-input');
  if (input.value) {
      const goals = JSON.parse(localStorage.getItem('goals') || '[]');
      goals.push(input.value);
      localStorage.setItem('goals', JSON.stringify(goals));
      input.value = '';
      loadGoals();
  }
}
function deleteGoal(index) {
  const goals = JSON.parse(localStorage.getItem('goals') || '[]');
  goals.splice(index, 1);
  localStorage.setItem('goals', JSON.stringify(goals));
  loadGoals();
}
loadGoals();

// Đếm ngược thời gian
let timerTime = 25 * 60;
let timerInterval;
let totalTime;

function startTimer() {
  clearInterval(timerInterval);
  const minutes = parseInt(document.getElementById('timer-minutes').value) || 25;
  timerTime = minutes * 60; // Tổng thời gian tính bằng giây
  totalTime = timerTime;
  startTime = Date.now(); // Lấy thời gian bắt đầu
  document.getElementById('timer-progress').style.width = '100%';

  timerInterval = setInterval(() => {
      // Tính thời gian đã trôi qua kể từ khi bắt đầu
      const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
      timerTime = totalTime - elapsedTime; // Cập nhật thời gian còn lại

      updateTimerDisplay();

      if (timerTime <= 0) {
          clearInterval(timerInterval);
          timerTime = 0; // Đảm bảo không xuống âm
          updateTimerDisplay();
          document.getElementById('timer-progress').style.width = '0%';
          playAlertSound();
      }
  }, 1000);
}
function resetTimer() {
  clearInterval(timerInterval);
  timerTime = 25 * 60;
  document.getElementById('timer-minutes').value = 25;
  document.getElementById('timer-progress').style.width = '100%';
  updateTimerDisplay();
}
function updateTimerDisplay() {
  const minutes = Math.floor(timerTime / 60);
  const seconds = timerTime % 60;
  document.getElementById('timer-text').innerText =
      `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  const progressPercentage = (timerTime / totalTime) * 100;
  document.getElementById('timer-progress').style.width = `${progressPercentage}%`;
}
updateTimerDisplay();

// Bảng Note
function loadNote() {
  const note = localStorage.getItem('note') || '';
  document.getElementById('note-input').value = note;
}
function saveNote() {
  const note = document.getElementById('note-input').value;
  localStorage.setItem('note', note);
}
loadNote();
document.getElementById('note-input').addEventListener('input', saveNote);

// Đồng hồ kỹ thuật số
function updateClock() {
  const now = new Date();
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  document.getElementById('clock-display').innerText = `${hours}:${minutes}:${seconds}`;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const day = days[now.getDay()];
  document.getElementById('day-display').innerText = day;

  const hour = now.getHours();
  const iconElement = document.getElementById('clock-icon');
  if (hour >= 5 && hour < 12) iconElement.innerText = '🌅';
  else if (hour >= 12 && hour < 17) iconElement.innerText = '☀️';
  else if (hour >= 17 && hour < 21) iconElement.innerText = '🌇';
  else iconElement.innerText = '🌙';
}
setInterval(updateClock, 1000);
updateClock();

// Often Used
const defaultLinks = [
  { name: 'chatGPT', url: 'https://www.chatgpt.com' },
  { name: 'YouTube', url: 'https://www.youtube.com' },
  { name: 'Facebook', url: 'https://www.facebook.com' },
  { name: 'Twitter', url: 'https://www.twitter.com' },
  { name: 'GitHub', url: 'https://www.github.com' },
  { name: 'Discord', url: 'https://www.discord.com' },
  { name: 'Wikipedia', url: 'https://www.wikipedia.org' },
  { name: 'Amazon', url: 'https://www.amazon.com' }
];

function loadOftenUsed() {
  const oftenUsed = JSON.parse(localStorage.getItem('oftenUsed') || JSON.stringify(defaultLinks));
  const container = document.getElementById('often-used-container');
  container.innerHTML = '';
  oftenUsed.forEach((item, index) => {
      const div = document.createElement('div');
      div.className = 'often-used-item';
      div.dataset.index = index;

      const iconUrl = `https://www.google.com/s2/favicons?domain=${item.url}&sz=32`;
      const img = document.createElement('img');
      img.src = iconUrl;
      img.onerror = () => {
          const defaultIcon = document.createElement('div');
          defaultIcon.className = 'default-icon';
          defaultIcon.innerText = item.name.charAt(0).toUpperCase();
          div.replaceChild(defaultIcon, img);
      };

      const name = document.createElement('span');
      name.innerText = item.name;

      div.appendChild(img);
      div.appendChild(name);

      div.addEventListener('click', () => window.open(item.url, '_blank'));
      div.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          showContextMenu(index, e.pageX, e.pageY);
      });

      container.appendChild(div);
  });
}

function showContextMenu(index, x, y) {
  const existingMenu = document.querySelector('.context-menu');
  if (existingMenu) existingMenu.remove();

  const oftenUsed = JSON.parse(localStorage.getItem('oftenUsed') || JSON.stringify(defaultLinks));
  const item = oftenUsed[index];

  const menu = document.createElement('div');
  menu.className = 'context-menu';
  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.value = item.name;
  nameInput.placeholder = 'Tên';

  const urlInput = document.createElement('input');
  urlInput.type = 'text';
  urlInput.value = item.url;
  urlInput.placeholder = 'URL';

  const saveButton = document.createElement('button');
  saveButton.innerText = 'Lưu';
  saveButton.onclick = () => {
      oftenUsed[index] = { name: nameInput.value, url: urlInput.value };
      localStorage.setItem('oftenUsed', JSON.stringify(oftenUsed));
      loadOftenUsed();
      menu.remove();
  };

  menu.appendChild(nameInput);
  menu.appendChild(urlInput);
  menu.appendChild(saveButton);
  document.body.appendChild(menu);

  document.addEventListener('click', function closeMenu(e) {
      if (!menu.contains(e.target)) {
          menu.remove();
          document.removeEventListener('click', closeMenu);
      }
  });
}

loadOftenUsed();

// Popup cho Google Services
function showGooglePopup(event) {
  const popup = document.getElementById('google-popup');
  const rect = event.target.getBoundingClientRect();
  popup.style.left = `${rect.left + window.scrollX}px`;
  popup.style.top = `${rect.bottom + window.scrollY}px`;
  popup.style.display = 'grid';

  if (popup.innerHTML === '') {
      const services = [
          { name: 'Search', url: 'https://www.google.com', icon: 'https://www.google.com/favicon.ico' },
          { name: 'Maps', url: 'https://maps.google.com', icon: 'https://maps.google.com/favicon.ico' },
          { name: 'YouTube', url: 'https://www.youtube.com', icon: 'https://www.youtube.com/favicon.ico' },
          { name: 'Gemini', url: 'https://gemini.google.com', icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThr7qrIazsvZwJuw-uZCtLzIjaAyVW_ZrlEQ&s' },
          { name: 'News', url: 'https://news.google.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Google_News_icon.svg/1200px-Google_News_icon.svg.png' },
          { name: 'Gmail', url: 'https://mail.google.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Gmail_icon_%282020%29.svg/2560px-Gmail_icon_%282020%29.svg.png' },
          { name: 'Meet', url: 'https://meet.google.com', icon: 'https://meet.google.com/favicon.ico' },
          { name: 'Chat', url: 'https://chat.google.com', icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT295XIWMRJtgoV5TeBEP-6NlgulLRoFKui8Q&s' },
          { name: 'Contacts', url: 'https://contacts.google.com', icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTc3D3mp4E8CVNlvwYwBZJUwvBtm-_jEwSA3w&s' },
          { name: 'Drive', url: 'https://drive.google.com', icon: 'https://drive.google.com/favicon.ico' },
          { name: 'Calendar', url: 'https://calendar.google.com', icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Google_Calendar_icon_%282020%29.svg/2048px-Google_Calendar_icon_%282020%29.svg.png' }
      ];

      services.forEach(service => {
          const item = document.createElement('div');
          item.className = 'service-item';
          item.innerHTML = `<img src="${service.icon}" alt="${service.name}" onerror="this.style.display='none'; this.parentElement.innerHTML='<span style=\'font-size: 1.5em;\'>${getUnicodeIcon(service.name)}</span>'"><span>${service.name}</span>`;
          item.onclick = () => window.open(service.url, '_blank');
          popup.appendChild(item);
      });
  }

  document.addEventListener('click', function hidePopup(e) {
      if (!popup.contains(e.target) && e.target !== event.target) {
          popup.style.display = 'none';
          document.removeEventListener('click', hidePopup);
      }
  });
}

function getUnicodeIcon(name) {
  switch (name.toLowerCase()) {
      case 'search': return '🔍';
      case 'maps': return '🗺️';
      case 'youtube': return '▶️';
      case 'gemini': return '✨';
      case 'news': return '📰';
      case 'gmail': return '📧';
      case 'meet': return '🎙️';
      case 'chat': return '💬';
      case 'contacts': return '👤';
      case 'drive': return '📁';
      case 'calendar': return '📅';
      default: return '🌐';
  }
}

// Hàm kiểm tra và xóa deadline quá 2 ngày (check khi mở tab)
function cleanOldDeadlines() {
  const deadlines = JSON.parse(localStorage.getItem('deadlines') || '[]');
  const now = new Date().getTime();
  const twoDaysInMs = 2 * 24 * 60 * 60 * 1000; // 2 ngày tính bằng milliseconds
  const updatedDeadlines = deadlines.filter(deadline => {
      if (!deadline.time) return true; // Giữ lại nếu không có thời hạn
      const deadlineTime = new Date(deadline.time).getTime();
      return (deadlineTime - now) > -twoDaysInMs; // Xóa nếu quá 2 ngày
  });
  localStorage.setItem('deadlines', JSON.stringify(updatedDeadlines));
  loadDeadlines(); // Cập nhật danh sách chính
}

// Hàm tải danh sách deadline dưới 1 ngày vào div10
function loadUrgentDeadlines() {
  const deadlines = JSON.parse(localStorage.getItem('deadlines') || '[]');
  const list = document.getElementById('urgent-deadline-list');
  list.innerHTML = '';
  const now = new Date().getTime();
  const oneDayInMs = 24 * 60 * 60 * 1000; // 1 ngày tính bằng milliseconds

  deadlines.forEach((deadline, index) => {
      if (deadline.time) {
          const deadlineTime = new Date(deadline.time).getTime();
          const timeLeft = deadlineTime - now;
          if (timeLeft > 0 && timeLeft <= oneDayInMs) {
              const li = document.createElement('li');
              const minutes = Math.floor(timeLeft / (1000 * 60));
              const hours = Math.floor(minutes / 60);
              const remainingMinutes = minutes % 60;
              const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
              li.innerHTML = `${deadline.text} <span class="deadline-time">(${hours}h ${remainingMinutes}m ${seconds}s)</span>`;
              list.appendChild(li);
          }
      }
  });
}

// Hàm phát âm thanh cảnh báo
// Biến toàn cục để lưu trạng thái cần phát âm thanh
let shouldPlayAlert = false;

// Hàm phát âm thanh cảnh báo
function playAlertSound() {
  const audio = new Audio('https://github.com/konan-1947/new_tab_v1/raw/refs/heads/main/sound/ring.mp3');
  audio.play().catch(error => {
      console.log('Không thể phát âm thanh:', error);
  });
}

// Hàm kiểm tra deadline dưới 1 giờ và đặt trạng thái (chạy khi load)
function checkUrgentSound() {
  const deadlines = JSON.parse(localStorage.getItem('deadlines') || '[]');
  const now = new Date().getTime();
  const oneHourInMs = 60 * 60 * 1000; // 1 giờ tính bằng milliseconds

  deadlines.forEach(deadline => {
      if (deadline.time) {
          const deadlineTime = new Date(deadline.time).getTime();
          const timeLeft = deadlineTime - now;
          if (timeLeft > 0 && timeLeft <= oneHourInMs) {
              shouldPlayAlert = true; // Đặt trạng thái cần phát âm thanh
          }
      }
  });
}

// Phát âm thanh khi người dùng tương tác lần đầu
function handleFirstInteraction() {
  if (shouldPlayAlert) {
      playAlertSound();
      shouldPlayAlert = false; // Đảm bảo chỉ phát một lần
      document.removeEventListener('click', handleFirstInteraction); // Xóa listener sau khi phát
  }
}

// Thêm listener cho tương tác đầu tiên
document.addEventListener('click', handleFirstInteraction);

// Gọi các hàm khi mở tab (giữ nguyên thứ tự)
cleanOldDeadlines(); // Xóa deadline quá 2 ngày
loadUrgentDeadlines(); // Tải deadline dưới 1 ngày
checkUrgentSound(); // Kiểm tra deadline và đặt trạng thái âm thanh

// Cập nhật danh sách deadline gấp mỗi giây
setInterval(loadUrgentDeadlines, 1000);

// Gọi các hàm khi mở tab
cleanOldDeadlines(); // Xóa deadline quá 2 ngày
loadUrgentDeadlines(); // Tải deadline dưới 1 ngày
checkUrgentSound(); // Kiểm tra và phát âm thanh một lần khi load

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("gmail").addEventListener("click", ()=>{window.open('https://mail.google.com', '_blank')});
  document.getElementById("more_action").addEventListener("click", (event)=>{showGooglePopup(event)});
  document.getElementById("avatar").addEventListener("click", ()=>{window.open('https://myaccount.google.com/', '_blank')});
  document.getElementById("adddl").addEventListener("click", ()=>{addDeadline()});
  document.getElementById("startTimer").addEventListener("click", ()=>{startTimer()});
  document.getElementById("resetTimer").addEventListener("click", ()=>{resetTimer()});
 document.getElementById("addGoal").addEventListener("click", ()=>{addGoal()});
 
 
 
  const icon = document.getElementById("bookmark-icon");
  let popup = null; // Lưu trạng thái popup

  icon.addEventListener("click", () => {
      if (popup) {
          popup.remove(); // Đóng popup nếu đang mở
          popup = null;
          return;
      }

      // Lấy vị trí icon
      const rect = icon.getBoundingClientRect();

      // Tạo popup
      popup = document.createElement("div");
      popup.id = "bookmark-popup";

      // Đặt vị trí ngay dưới icon
      popup.style.position = "absolute";
      popup.style.top = `${rect.bottom + window.scrollY + 5}px`;  // Ngay dưới icon + 5px
      popup.style.left = `${rect.left + window.scrollX}px`;       // Căn theo icon
      popup.style.display = "block";  

      // Tạo danh sách bookmarks
      const list = document.createElement("ul");
      list.id = "bookmark-list";
      popup.appendChild(list);
      document.body.appendChild(popup);

      // Lấy danh sách bookmarks từ Chrome API
      chrome.bookmarks.getTree((nodes) => {
          function extractBookmarks(bookmarkNodes) {
              let bookmarks = [];
              for (let node of bookmarkNodes) {
                  if (node.url) {
                      bookmarks.push({ title: node.title, url: node.url });
                  }
                  if (node.children) {
                      bookmarks = bookmarks.concat(extractBookmarks(node.children));
                  }
              }
              return bookmarks;
          }

          const bookmarks = extractBookmarks(nodes);

          // Hiển thị bookmarks trong popup
          bookmarks.forEach(bookmark => {
              const li = document.createElement("li");
              const a = document.createElement("a");
              a.href = bookmark.url;
              a.textContent = bookmark.title;
              a.target = "_blank"; // Mở trong tab mới
              li.appendChild(a);
              list.appendChild(li);
          });
      });

      // Đóng popup khi click ra ngoài
      document.addEventListener("click", (event) => {
          if (popup && event.target !== icon && !popup.contains(event.target)) {
              popup.remove();
              popup = null;
          }
      }, { once: true });
  });
});

