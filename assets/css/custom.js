document.addEventListener('DOMContentLoaded', function() {
    "use strict";

    console.log("Custom JS: Pasiruošęs darbui");

    const contactForm = document.getElementById('manoKontaktųForma');
    const resultsContainer = document.getElementById('formosRezultatai');
    const resultsContent = document.getElementById('rezultatuTurinioVieta');
    const successPopup = document.getElementById('sekmesPranesimas');

    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault(); // Sustabdome persikrovimą
            console.log("Custom JS: Mygtukas paspaustas");

            try {
                // 1. Surenkame duomenis (su saugikliais, jei elemento nerastų)
                const vardas = document.getElementById('vardas')?.value || "Nėra";
                const pavarde = document.getElementById('pavarde')?.value || "Nėra";
                const email = document.getElementById('email')?.value || "Nėra";
                const telefonas = document.getElementById('telefonas')?.value || "Nėra";
                const adresas = document.getElementById('adresas')?.value || "Nėra";
                
                // Paimame vertinimus
                // Jei neranda elemento, priskiriame 0, kad kodas nelūžtų
                const elQ1 = document.getElementById('klausimas1');
                const elQ2 = document.getElementById('klausimas2');
                const elQ3 = document.getElementById('klausimas3');

                if (!elQ1 || !elQ2 || !elQ3) {
                    console.error("KLAIDA: Nerasti klausimų laukeliai (ID: klausimas1, klausimas2, klausimas3). Patikrinkite HTML.");
                    alert("Klaida: HTML formoje trūksta klausimų laukelių su tinkamais ID.");
                    return;
                }

                const q1 = Number(elQ1.value);
                const q2 = Number(elQ2.value);
                const q3 = Number(elQ3.value);

                console.log("Vertinimai:", q1, q2, q3);

                // 2. Apskaičiuojame vidurkį
                const vidurkis = (q1 + q2 + q3) / 3;
                const suapvalintasVidurkis = vidurkis.toFixed(1);

                const formDataObject = {
                    Vardas: vardas,
                    Pavardė: pavarde,
                    El_pastas: email,
                    Vertinimai: { D: q1, P: q2, A: q3 },
                    Vidurkis: suapvalintasVidurkis
                };

                console.log("Objektas:", formDataObject);

                // 3. Atvaizduojame rezultatus
                const outputHTML = `
                    <ul class="list-group">
                        <li class="list-group-item"><strong>Vardas:</strong> ${formDataObject.Vardas}</li>
                        <li class="list-group-item"><strong>Pavardė:</strong> ${formDataObject.Pavardė}</li>
                        <li class="list-group-item"><strong>El. paštas:</strong> ${formDataObject.El_pastas}</li>
                        
                        <li class="list-group-item list-group-item-secondary"><strong>Vertinimai:</strong></li>
                        <li class="list-group-item">Dizainas: ${q1}</li>
                        <li class="list-group-item">Patogumas: ${q2}</li>
                        <li class="list-group-item">Aptarnavimas: ${q3}</li>
                        
                        <li class="list-group-item list-group-item-success fs-5 text-center">
                            <strong>${formDataObject.Vardas} ${formDataObject.Pavardė}: ${formDataObject.Vidurkis}</strong>
                        </li>
                    </ul>
                `;

                if (resultsContent && resultsContainer) {
                    resultsContent.innerHTML = outputHTML;
                    resultsContainer.style.display = 'block';
                    resultsContainer.scrollIntoView({ behavior: 'smooth' });
                }

                // 4. Parodome "Pop-up"
                if (successPopup) {
                    console.log("Rodomas popup");
                    successPopup.style.display = 'block'; 
                    setTimeout(function() {
                        successPopup.style.display = 'none';
                    }, 4000);
                } else {
                    console.warn("ĮSPĖJIMAS: Nerastas elementas id='sekmesPranesimas' HTML faile.");
                }

            } catch (error) {
                console.error("JavaScript klaida:", error);
            }
        });
    } else {
        console.error("KLAIDA: Nerasta forma su id='manoKontaktųForma'");
    }
});