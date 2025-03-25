document.getElementById("submitForm").addEventListener("submit", async function (event) {
    event.preventDefault(); // Stop page reload

    const name = document.getElementById("name").value;
    const rollno = document.getElementById("rollno").value;
    const city = document.getElementById("city").value;
    const info = document.getElementById("info").value;

    const apiKey = "YOUR_API_KEY_HERE"; // Replace with your actual API Key

    try {
        const response = await fetch("http://localhost:3000/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": apiKey // ✅ Sending API Key
            },
            body: JSON.stringify({ name, rollno, city, info })
        });

        const data = await response.json();
        alert(data.message); // Show success or error message
    } catch (error) {
        console.error("❌ Error:", error);
    }
});
