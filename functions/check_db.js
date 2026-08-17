const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");

initializeApp({ projectId: "rubinoleveling" });
const db = getFirestore();

async function checkTokens() {
  const snapshot = await db.collection("fcm_tokens").get();
  console.log("Tokens in DB:");
  snapshot.forEach(doc => {
    console.log(doc.id, "=>", doc.data().user, doc.data().token.substring(0, 10) + "...");
  });
}
checkTokens();
