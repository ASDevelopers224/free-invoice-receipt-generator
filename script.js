import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  addDoc,     // 👈 yeh add karo
  collection, // 👈 yeh bhi add karo
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyAuu70xrZlnHW_6c2mgEy6hsU3Qr42iPbQ",
    authDomain: "invoice-e9118.firebaseapp.com",
    projectId: "invoice-e9118",
    storageBucket: "invoice-e9118.firebasestorage.app",
    messagingSenderId: "894646092614",
    appId: "1:894646092614:web:a59b44598cce96b39e5b47",
    measurementId: "G-4CYJGZ0ERJ"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// script.js

// Save invoice function
async function saveInvoice() {
  const from = document.getElementById("from").value;
  const email = document.getElementById("email").value;
  const phonenumber = document.getElementById("number").value;
  const customerName = document.getElementById("customer-name").value;
  const customerAddress = document.getElementById("customer-address").value;
  const invoiceNumber = document.getElementById("invoice-number").value;
  const invoiceDate = document.getElementById("invoice-date").value;
  const subtotal = document.getElementById("subtotal").innerText;
  const totalAmount = document.getElementById("total-amount").innerText;

  const items = Array.from(document.querySelectorAll("#items-body tr")).map(row => ({
    desc: row.querySelector(".item-desc").value,
    price: row.querySelector(".item-price").value,
    qty: row.querySelector(".item-qty").value,
    total: row.querySelector(".item-total").innerText
  })).filter(item => item.desc && item.price && item.qty);

  if (!from || !email || !customerName || !customerAddress || items.length === 0) {
    alert("Please fill all required fields and add at least one item before saving.");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("You must be logged in to save.");
    return;
  }

  try {
    await addDoc(collection(db, "invoices"), {
      userId: user.uid,
      invoiceNumber,
      invoiceDate,
      from,
      email,
      phonenumber,
      customerName,
      customerAddress,
      items,
      subtotal,
      totalAmount,
      createdAt: serverTimestamp()
    });
    alert("Invoice saved successfully!");
  } catch (error) {
    console.error("Error saving invoice:", error);
    alert("Failed to save invoice. Please try again.");
  }
}

// 👇 is line se ye function HTML se access ho jayega
window.saveInvoice = saveInvoice;


// Handle Login
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            console.log('Attempting login for:', email);
            await signInWithEmailAndPassword(auth, email, password);
            console.log('Login successful, redirecting to dashboard...');
            window.location.href = 'dashboard.html';
        } catch (error) {
            console.error('Login error:', error.code, error.message);
            alert(`Login failed: ${error.message}`);
        }
    });
}

// Handle Signup
if (document.getElementById('signup-form')) {
    document.getElementById('signup-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const companyName = document.getElementById('company-name').value;
        const ownerName = document.getElementById('owner-name').value;
        const companyAddress = document.getElementById('company-address').value;
        const ownerPhone = document.getElementById('owner-phone').value;

        try {
            console.log('Attempting signup for:', email);
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log('User created with UID:', user.uid);

            await setDoc(doc(db, 'users', user.uid), {
                companyName,
                ownerName,
                companyAddress,
                ownerPhone,
                email,
                createdAt: serverTimestamp()
            });
            console.log('User data saved to Firestore');
            alert('Signup successful! Please login.');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Signup error:', error.code, error.message);
            alert(`Signup failed: ${error.message}`);
        }
    });
}

// Handle Dashboard
if (document.getElementById('dashboard')) {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            console.log('No user logged in, redirecting to login...');
            window.location.href = 'index.html';
        } else {
            console.log('User logged in:', user.uid);
            getDoc(doc(db, 'users', user.uid)).then((docSnap) => {
                if (docSnap.exists()) {
                    console.log('User data:', docSnap.data());
                    const contentArea = document.getElementById('content-area');
                    contentArea.innerHTML = `
                        <h2>Welcome, ${docSnap.data().ownerName}!</h2>
                        <p>Company: ${docSnap.data().companyName}</p>
                        <p>Address: ${docSnap.data().companyAddress}</p>
                        <p>Phone: ${docSnap.data().ownerPhone}</p>
                    `;
                } else {
                    console.log('No user data found in Firestore');
                }
            }).catch((error) => {
                console.error('Error fetching user data:', error);
            });
        }
    });

    document.getElementById('logout').addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await signOut(auth);
            console.log('User logged out, redirecting to login...');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Logout error:', error);
        }
    });

    document.getElementById('create-invoice').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('content-area').innerHTML = `
            <h2>Create Invoice</h2>
            <form id="invoice-form">
                <input type="text" placeholder="Client Name" required>
                <input type="number" placeholder="Invoice Amount" required>
                <button type="submit" class="btn">Generate Invoice</button>
            </form>
        `;
    });

    document.getElementById('create-receipt').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('content-area').innerHTML = `
            <h2>Create Receipt</h2>
            <form id="receipt-form">
                <input type="text" placeholder="Client Name" required>
                <input type="number" placeholder="Receipt Amount" required>
                <button type="submit" class="btn">Generate Receipt</button>
            </form>
        `;
    });
}