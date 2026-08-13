// news.js
import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const container = document.getElementById("news-container");

// FUNÇÃO PARA LIMPAR TEXTO
function cleanText(text) {
    if (!text) return '';
    return text
        .trim()
        .replace(/\n/g, ' ')
        .replace(/\r/g, ' ')
        .replace(/\t/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

async function loadNews() {
    try {
        const q = query(
            collection(db, "news"),
            orderBy("date", "desc"),
            limit(10) // AUMENTEI PARA 10
        );

        const snapshot = await getDocs(q);

        container.innerHTML = "";

        if (snapshot.empty) {
            container.innerHTML = `
                <div class="news-item">
                    <div class="news-date">No news available</div>
                    <div class="news-text">Check back later for updates.</div>
                </div>
            `;
            return;
        }

        snapshot.forEach(doc => {
            const news = doc.data();

            // FORMATAR DATA
            let dateStr = "";
            if (news.date) {
                if (news.date.toDate) {
                    // Se for Timestamp do Firebase
                    dateStr = news.date.toDate().toLocaleDateString("en-GB");
                } else if (typeof news.date === 'string') {
                    dateStr = news.date;
                } else {
                    dateStr = String(news.date);
                }
            }

            // LIMPAR TEXTO
            const cleanTextContent = cleanText(news.text || '');
            const cleanTitle = cleanText(news.title || '');

            container.innerHTML += `
                <div class="news-item">
                    <div class="news-date">${dateStr}</div>
                    <div class="news-text">${cleanTextContent}</div>
                </div>
            `;
        });

    } catch (err) {
        console.error("Erro ao carregar notícias:", err);
        container.innerHTML = `
            <div class="news-item">
                <div class="news-date">Error</div>
                <div class="news-text">Failed to load news. Please try again later.</div>
            </div>
        `;
    }
}

loadNews();