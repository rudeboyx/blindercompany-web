(function() {
   emailjs.init({
     publicKey: "CevPnugNMu1HpuE9N",
   });
})();
let stockData = [];
const suggestions = [
    "Hace frío 🥶 ? Climaticemos tu hogar",
    "Necesito cotizar un proyecto",
    "Quiero agendar una visita técnica",
    "Soporte técnico",
    "Hablar con un asesor"
];
let currentSuggestionIndex = 0;
const chatSuggestion = document.querySelector(".chat-suggestion");

function updateSuggestion() {
    chatSuggestion.textContent = suggestions[currentSuggestionIndex];
    chatSuggestion.classList.add("visible");
    currentSuggestionIndex = (currentSuggestionIndex + 1) % suggestions.length;
}

let schedulingStep = 0; // 0: initial, 1: name, 2: requirement, 3: address, 4: day, 5: phone, 6: email, 7: confirmation
let appointmentData = {};

function handleChatInput(query) {
    switch (schedulingStep) {
        case 0:
            if (query.toLowerCase().includes("agendar cita")) {
                addMessage("bot", "¡Claro! Para agendar una cita, necesito algunos datos. ¿Cuál es tu nombre?");
                schedulingStep = 1;
            } else {
                addMessage("bot", "Lo siento, no entendí. ¿Puedes ser más específico?");
            }
            break;
        case 1:
            appointmentData.name = query;
            addMessage("bot", `Gracias, ${appointmentData.name}. ¿Cuál es el requerimiento o servicio que necesitas? (ej. Instalación de 2 Split 12.000 BTU)` );
            schedulingStep = 2;
            break;
        case 2:
            appointmentData.requirement = query;
            addMessage("bot", "¿En qué dirección sería la visita técnica?");
            schedulingStep = 3;
            break;
        case 3:
            appointmentData.address = query;
            addMessage("bot", "¿Qué día te gustaría agendar la visita? (ej. Lunes, Martes, etc.)");
            schedulingStep = 4;
            break;
        case 4:
            appointmentData.day = query;
            addMessage("bot", "Casi listo. ¿Cuál es tu número de teléfono de contacto?");
            schedulingStep = 5;
            break;
        case 5:
            appointmentData.phone = query;
            addMessage("bot", "Y finalmente, ¿cuál es tu correo electrónico?");
            schedulingStep = 6;
            break;
        case 6:
            appointmentData.email = query;
            addMessage("bot", "¡Excelente! Hemos recopilado toda la información:\n\n" +
                               `Nombre: ${appointmentData.name}\n` +
                               `Requerimiento: ${appointmentData.requirement}\n` +
                               `Dirección: ${appointmentData.address}\n` +
                               `Día: ${appointmentData.day}\n` +
                               `Teléfono: ${appointmentData.phone}\n` +
                               `Correo: ${appointmentData.email}\n\n` +
                               "¿Confirmas que deseas agendar esta cita? (Sí/No)");
            schedulingStep = 7; // Confirmation step
            break;
        case 7:
            if (query.toLowerCase() === "sí" || query.toLowerCase() === "si") {
                addMessage("bot", "¡Cita agendada con éxito! Recibirás un correo de confirmación pronto.");
                sendAppointmentEmail(appointmentData);
                schedulingStep = 0; // Reset scheduling
            } else {
                addMessage("bot", "Entendido. Si necesitas agendar más tarde, solo dímelo.");
                schedulingStep = 0; // Reset scheduling
            }
            break;
    }
}

function sendAppointmentEmail(data) {
    const templateParams = {
        user_name: data.name,
        appointment_day: data.day,
        appointment_requirement: data.requirement,
        appointment_address: data.address,
        appointment_phone: data.phone,
        appointment_email: data.email,
        to_email: data.email, // For client confirmation
        blinder_email: "blinderspa@gmail.com" // For Blinder Company notification
    };

            console.log("Attempting to send email to client with params:", templateParams);

            emailjs.send("service_vdy9bl5", "template_gjdask", templateParams)
        .then(function(response) {
            console.log("SUCCESS! Email to client", response.status, response.text);
        }, function(error) {
            console.log("FAILED... Email to client", error);
        });

            // Send notification to Blinder Company
            console.log("Attempting to send email to Blinder Company with params:", templateParams);
            emailjs.send("service_vdy9bl5", "template_blinder_notification", templateParams)
        .then(function(response) {
            console.log("SUCCESS! Email to Blinder Company", response.status, response.text);
        }, function(error) {
            console.log("FAILED... Email to Blinder Company", error);
        });
}

const chatWindow = document.querySelector(".chat-window");
const openChatBtn = document.getElementById("openChatBtn");
const chatInput = document.getElementById("chatInput");
const chatBody = document.querySelector(".chat-body");

function toggleChat() {
    chatWindow.style.display = chatWindow.style.display === "flex" ? "none" : "flex";
    if (chatWindow.style.display === "flex") {
        openChatBtn.classList.remove("vibrate");
        chatSuggestion.classList.remove("visible");
    } else {
        chatSuggestion.classList.add("visible");
    }
}

function addMessage(sender, text) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("chat-message", sender);
    messageDiv.textContent = text;
    chatBody.appendChild(messageDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

chatInput.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        const query = chatInput.value;
        addMessage("user", query);
        chatInput.value = "";
        handleChatInput(query);
    }
});

openChatBtn.addEventListener("click", toggleChat);


    setInterval(updateSuggestion, 5000);
    updateSuggestion();

    document.getElementById("openChatBtn").addEventListener("click", toggleChat);

