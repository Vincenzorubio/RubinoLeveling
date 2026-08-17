const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { getMessaging } = require("firebase-admin/messaging");
const { getFirestore } = require("firebase-admin/firestore");
const { initializeApp } = require("firebase-admin/app");

initializeApp();

exports.sendNewTaskNotification = onDocumentCreated("tasks/{taskId}", async (event) => {
  const snapshot = event.data;
  if (!snapshot) {
    return;
  }

  const taskData = snapshot.data();
  const addedBy = taskData.addedBy || "Qualcuno";
  const taskTitle = taskData.title || "nuova faccenda";

  console.log(`New task added by ${addedBy}: ${taskTitle}`);

  const db = getFirestore();
  const tokensSnapshot = await db.collection("fcm_tokens").get();

  if (tokensSnapshot.empty) {
    console.log("Nessun token FCM trovato. Nessuna notifica inviata.");
    return;
  }

  const tokens = [];
  tokensSnapshot.forEach((doc) => {
    const data = doc.data();
    // Non inviare la notifica a chi ha appena creato la faccenda (opzionale)
    // Se vuoi testare da solo, commenta l'if e usa solo: tokens.push(data.token);
    if (data.user !== addedBy && data.token) {
      tokens.push(data.token);
    }
  });

  if (tokens.length === 0) {
    console.log("Nessun destinatario valido a cui inviare (forse è registrato solo il creatore della task).");
    return;
  }

  const message = {
    notification: {
      title: `Nuova faccenda da ${addedBy}!`,
      body: `"${taskTitle}" è stata aggiunta alla lista.`,
    },
    tokens: tokens,
  };

  try {
    const response = await getMessaging().sendEachForMulticast(message);
    console.log(`${response.successCount} messaggi inviati con successo.`);
    if (response.failureCount > 0) {
      console.log(`Ci sono stati ${response.failureCount} errori di invio.`);
    }
  } catch (error) {
    console.error("Errore durante l'invio delle notifiche push:", error);
  }
});
