document.addEventListener("DOMContentLoaded", () => {
    const activitiesContainer = document.getElementById("activities");
    const activityForm = document.getElementById("activityForm");
    const topicInput = document.getElementById("topic");
    const studyTimeInput = document.getElementById("study_time");
    const dateInput = document.getElementById("date");
    const clearHistoryButton = document.getElementById("clear-history");

    //BACKEND - RENDER
    const backendURL = process.env.API_URL || "https://study-app-sk4w.onrender.com";

    function loadActivities() {
        fetch(`${backendURL}/activities`)
            .then(response => response.json())
            .then(data => {
                activitiesContainer.innerHTML = "";
                let totalMinutes = 0;
    
                data.forEach(activity => {
                    createActivity(activity);
                    totalMinutes += parseInt(activity.study_time);
                });
    
                document.getElementById("total-time").textContent = `Celkový čas štúdia: ${totalMinutes} minút`;
            })
            .catch(error => console.error("Error loading activities:", error));
    }
    

    function createActivity(activity) {
        const activityItem = document.createElement("li");
        activityItem.innerHTML = `
            <strong>${activity.topic}</strong> - ${activity.study_time} min 
            <br><strong>${new Date(activity.date).toLocaleString()}</strong>
            <button class="delete" onclick="deleteActivity(${activity.id})">X</button>
        `;
        activitiesContainer.appendChild(activityItem);
    }

    activityForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const topic = topicInput.value.trim();
        const study_time = studyTimeInput.value;
        const date = dateInput.value;

        if (topic && study_time && date) {
            fetch(`${backendURL}/activities`, {
                method: "POST",
                body: JSON.stringify({ topic, study_time, date }),
                headers: { "Content-Type": "application/json" }
            })
            .then(response => response.json())
            .then(() => {
                loadActivities();
                topicInput.value = "";
                studyTimeInput.value = "";
                dateInput.value = "";
            })
            .catch(error => console.error("Error adding activity:", error));
        }
    });

    window.deleteActivity = (id) => {
        fetch(`${backendURL}/activities/${id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        })
        .then(() => loadActivities())
        .catch(error => console.error("Error deleting activity:", error));
    };

    clearHistoryButton.addEventListener("click", () => {
        if (confirm("Naozaj chcete vymazať všetku históriu?")) {
            clearHistoryButton.disabled = true;
            clearHistoryButton.textContent = "Vymazávam...";

            fetch(`${backendURL}/activities`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" }
            })
            .then(() => loadActivities())
            .finally(() => {
                clearHistoryButton.disabled = false;
                clearHistoryButton.textContent = "Vymazať Históriu";
            });
        }
    });

    function showToast(message) {
        const toast = document.createElement("div");
        toast.textContent = message;
        toast.className = "toast";
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    loadActivities();

    const recommendButton = document.getElementById("recommend-btn");
    const output = document.getElementById("recommendation-output");

    recommendButton.addEventListener("click", () => {
        fetch(`${backendURL}/activities`)
            .then(res => res.json())
            .then(data => {
                return fetch(`${backendURL}/recommend`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ activities: data })
                });
            })
            .then(res => res.json())
            .then(result => {
                output.innerText = result.recommendation || result.error || "Neočakávaná odpoveď.";
            })
            .catch(error => {
                console.error("Chyba pri volaní AI odporúčania:", error);
                output.innerText = "Chyba pri načítaní odporúčania.";
            });
    });

});
