// news.js - Adicionar limpeza do texto
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/11.5.0/firebase-database.js";

const firebaseConfig = {
    // Seu config aqui
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const newsRef = ref(database, 'news');

// FUNÇÃO PARA LIMPAR TEXTO
function cleanText(text) {
    if (!text) return '';
    // Remove espaços no início e fim
    let cleaned = text.trim();
    // Substitui quebras de linha por espaço
    cleaned = cleaned.replace(/\n/g, ' ');
    // Remove espaços duplicados
    cleaned = cleaned.replace(/\s+/g, ' ');
    return cleaned;
}

onValue(newsRef, (snapshot) => {
    const container = document.getElementById('news-container');
    container.innerHTML = '';
    
    const data = snapshot.val();
    
    if (data) {
        const newsArray = Object.values(data);
        
        newsArray.sort((a, b) => {
            if (a.timestamp && b.timestamp) {
                return b.timestamp - a.timestamp;
            }
            return 0;
        });
        
        newsArray.forEach((item) => {
            const newsItem = document.createElement('div');
            newsItem.className = 'news-item';
            
            // LIMPAR O TEXTO
            const cleanTextContent = cleanText(item.text);
            const cleanDate = item.date ? item.date.trim() : '';
            
            newsItem.innerHTML = `
                <div class="news-date">${cleanDate}</div>
                <div class="news-text">${cleanTextContent}</div>
            `;
            
            container.appendChild(newsItem);
        });
    } else {
        container.innerHTML = `
            <div class="news-item">
                <div class="news-date">No news available</div>
                <div class="news-text">Check back later for updates.</div>
            </div>
        `;
    }
});