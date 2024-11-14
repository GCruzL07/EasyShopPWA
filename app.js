// app.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    onSnapshot, 
    doc, 
    updateDoc, 
    deleteDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBpk4MfO92q_qypkV58y-X_h3QmHG9AWMg",
    authDomain: "easyshop-bd-f2c88.firebaseapp.com",
    projectId: "easyshop-bd-f2c88",
    storageBucket: "easyshop-bd-f2c88.firebasestorage.app",
    messagingSenderId: "977305864639",
    appId: "1:977305864639:web:cb599301ccd3da1e4bf90a"
  };

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const shoppingListRef = collection(db, 'shopping-list');

// Función para registrar el Service Worker
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('./service-worker.js', {
                scope: './'
            });
            if (registration.installing) {
                console.log('Service worker installing');
            } else if (registration.waiting) {
                console.log('Service worker installed');
            } else if (registration.active) {
                console.log('Service worker active');
            }
        } catch (error) {
            console.error(`Registration failed with ${error}`);
        }
    }
}

// Llamar a la función cuando se carga la página
registerServiceWorker();

// Elementos del DOM
const shoppingForm = document.getElementById('shopping-form');
const itemInput = document.getElementById('item-input');
const shoppingList = document.getElementById('shopping-list');

// Escuchar cambios en tiempo real
onSnapshot(shoppingListRef, (snapshot) => {
    snapshot.docChanges().forEach(change => {
        const doc = change.doc;
        const item = doc.data();
        const itemId = doc.id;

        if (change.type === 'added') {
            addItemToDOM(itemId, item);
        } else if (change.type === 'modified') {
            updateItemInDOM(itemId, item);
        } else if (change.type === 'removed') {
            removeItemFromDOM(itemId);
        }
    });
});

// Agregar nuevo item
shoppingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = itemInput.value.trim();
    
    if (text) {
        try {
            await addDoc(shoppingListRef, {
                text,
                completed: false,
                createdAt: serverTimestamp()
            });
            itemInput.value = '';
        } catch (error) {
            console.error("Error adding document: ", error);
        }
    }
});

// Funciones para manipular el DOM
function addItemToDOM(id, item) {
    const li = document.createElement('li');
    li.id = id;
    li.className = `shopping-item ${item.completed ? 'completed' : ''}`;
    
    li.innerHTML = `
        <input type="checkbox" ${item.completed ? 'checked' : ''}>
        <span>${item.text}</span>
        <button class="delete-btn">Eliminar</button>
    `;

    // Evento para marcar como completado
    const checkbox = li.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', async () => {
        try {
            await updateDoc(doc(db, 'shopping-list', id), {
                completed: checkbox.checked
            });
        } catch (error) {
            console.error("Error updating document: ", error);
        }
    });

    // Evento para eliminar
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', async () => {
        try {
            await deleteDoc(doc(db, 'shopping-list', id));
        } catch (error) {
            console.error("Error removing document: ", error);
        }
    });

    shoppingList.appendChild(li);
}

function updateItemInDOM(id, item) {
    const li = document.getElementById(id);
    if (li) {
        li.className = `shopping-item ${item.completed ? 'completed' : ''}`;
        li.querySelector('input[type="checkbox"]').checked = item.completed;
    }
}

function removeItemFromDOM(id) {
    const li = document.getElementById(id);
    if (li) {
        li.remove();
    }
}