import { db } from "./firebase.js";

import {
    collection,
    getDocs,
    query,
    orderBy,
    limit
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const container = document.getElementById("news-container");

async function loadNews(){

    try{

        const q = query(
            collection(db, "news"),
            orderBy("date", "desc"),
            limit(5)
        );

        const snapshot = await getDocs(q);

        container.innerHTML = "";

        snapshot.forEach(doc=>{

            const news = doc.data();

container.innerHTML += `
<div class="news-item">

    <div class="news-date">
        ${news.date.toDate().toLocaleDateString("en-GB")}
    </div>

    <div class="news-title">
        ${news.title}
    </div>

    <div class="news-text">
        ${news.text}
    </div>

</div>
`;

    }catch(err){

        console.error(err);

    }

}

loadNews();