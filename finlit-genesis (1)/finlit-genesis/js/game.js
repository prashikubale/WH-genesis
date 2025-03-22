function submitBudget() {
    const rent = parseInt(document.getElementById('rent').value) || 0;
    const food = parseInt(document.getElementById('food').value) || 0;
    const savings = parseInt(document.getElementById('savings').value) || 0;
  
    // Rule-based feedback
    let feedback = "";
    let points = 0;
  
    if (rent > 800) {
      feedback += "⚠️ Rent is too high! Aim for ≤40% of income. ";
    } else {
      points += 20;
    }
  
    if (savings < 200) {
      feedback += "💡 Save at least 10% of your income! ";
    } else {
      points += 30;
    }
  
    if (feedback === "") {
      feedback = "✅ Great budget! Keep improving!";
      points += 50;
    }
  
    document.getElementById('feedback').innerText = feedback;
  
    // Save score to Firestore
    if (firebase.auth().currentUser) {
      firebase.firestore().collection('scores').add({
        userId: firebase.auth().currentUser.uid,
        points: points,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      });
    }
  }