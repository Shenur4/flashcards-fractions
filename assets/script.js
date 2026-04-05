/* -----------------------------------
   OUTILS FRACTIONS
   Fonctions de base pour manipuler
   les fractions : simplification,
   addition, soustraction, etc.
----------------------------------- */

// PGCD — utilisé pour simplifier les fractions
function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b !== 0) {
        const t = b;
        b = a % b;
        a = t;
    }
    return a || 1;
}

// Simplifie une fraction (ex : 6/8 → 3/4)
function simplify(frac) {
    if (frac.den === 0) return frac;
    const g = gcd(frac.num, frac.den);
    return { num: frac.num / g, den: frac.den / g };
}

// Addition
function addFrac(a, b) {
    return simplify({
        num: a.num * b.den + b.num * a.den,
        den: a.den * b.den
    });
}

// Soustraction
function subFrac(a, b) {
    return simplify({
        num: a.num * b.den - b.num * a.den,
        den: a.den * b.den
    });
}

// Multiplication
function mulFrac(a, b) {
    return simplify({
        num: a.num * b.num,
        den: a.den * b.den
    });
}

// Division
function divFrac(a, b) {
    return simplify({
        num: a.num * b.den,
        den: a.den * b.num
    });
}

// Convertit une fraction en LaTeX pour MathJax
function fracToLatex(frac) {
    frac = simplify(frac);
    return frac.den === 1
        ? frac.num.toString()
        : `\\(\\frac{${frac.num}}{${frac.den}}\\)`;
}

/* Analyse une entrée utilisateur :
   - "3/4" → fraction
   - "0.75" ou "0,75" → décimal
*/
function parseFractionInput(str) {
    str = str.replace(/\s+/g, "");

    if (str.includes("/")) {
        const [numStr, denStr] = str.split("/");
        const num = parseInt(numStr, 10);
        const den = parseInt(denStr, 10);
        if (isNaN(num) || isNaN(den) || den === 0) return null;
        return simplify({ num, den });
    }

    const num = parseFloat(str.replace(",", "."));
    return isNaN(num) ? null : num;
}

/* -----------------------------------
   MODE AUTO / MANUEL
----------------------------------- */

let mode = "auto";       // auto = progression intelligente
let difficulty = 1;      // niveau manuel
let level = 1;           // niveau auto (1 → 5)
let streak = 0;          // bonnes réponses consécutives
let mistakes = 0;        // erreurs consécutives

/* Ajuste automatiquement le niveau en mode AUTO */
function adjustLevel(correct) {
    if (mode !== "auto") return;

    if (correct) {
        streak++;
        if (streak >= 3 && level < 5) {
            level++;
            streak = 0;
        }
    } else {
        mistakes++;
        streak = 0;
        if (mistakes >= 2 && level > 1) {
            level--;
            mistakes = 0;
        }
    }
}

/* -----------------------------------
   GÉNÉRATION D’EXERCICES PAR NIVEAU
----------------------------------- */

// Génère une fraction adaptée au niveau
function generateRandomFraction(currentLevel) {
    const max = [0, 10, 20, 50, 100, 200][currentLevel] || 20;
    const den = randomInt(2, max);
    const num = randomInt(1, den - 1);
    return simplify({ num, den });
}

// Petit utilitaire
function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* -----------------------------------
   TYPES D’EXERCICES SELON NIVEAU
----------------------------------- */

function generateSmartExercise() {
    const currentLevel = (mode === "auto") ? level : difficulty;

    // Pool d’exercices par niveau
    const pools = {
        1: ["add_same", "sub_same", "simplify"],
        2: ["add_diff", "sub_diff", "mul", "simplify", "compare"],
        3: ["add_diff", "sub_diff", "mul", "div", "complex"],
        4: ["add_diff", "sub_diff", "mul", "div", "complex", "decimal", "fraction_of"],
        5: ["complex", "super_complex", "compare3", "decimal", "fraction_of"]
    };

    const typePool = pools[currentLevel] || pools[1];
    const type = typePool[randomInt(0, typePool.length - 1)];

    let a, b, c, res;

    /* --- EXERCICES CLASSIQUES --- */

    if (type === "add_same") {
        a = generateRandomFraction(currentLevel);
        b = { num: randomInt(1, a.den - 1), den: a.den };
        res = addFrac(a, b);
        return {
            text: `${fracToLatex(a)} + ${fracToLatex(b)}`,
            answerFrac: res,
            explanation: "Même dénominateur : on additionne les numérateurs."
        };
    }

    if (type === "sub_same") {
        a = generateRandomFraction(currentLevel);
        b = { num: randomInt(1, a.num), den: a.den };
        res = subFrac(a, b);
        return {
            text: `${fracToLatex(a)} - ${fracToLatex(b)}`,
            answerFrac: res,
            explanation: "Même dénominateur : on soustrait les numérateurs."
        };
    }

    if (type === "add_diff") {
        a = generateRandomFraction(currentLevel);
        b = generateRandomFraction(currentLevel);
        res = addFrac(a, b);
        return {
            text: `${fracToLatex(a)} + ${fracToLatex(b)}`,
            answerFrac: res,
            explanation: "On met au même dénominateur puis on additionne."
        };
    }

    if (type === "sub_diff") {
        a = generateRandomFraction(currentLevel);
        b = generateRandomFraction(currentLevel);
        res = subFrac(a, b);
        return {
            text: `${fracToLatex(a)} - ${fracToLatex(b)}`,
            answerFrac: res,
            explanation: "On met au même dénominateur puis on soustrait."
        };
    }

    if (type === "mul") {
        a = generateRandomFraction(currentLevel);
        b = generateRandomFraction(currentLevel);
        res = mulFrac(a, b);
        return {
            text: `${fracToLatex(a)} × ${fracToLatex(b)}`,
            answerFrac: res,
            explanation: "On multiplie numérateurs et dénominateurs."
        };
    }

    if (type === "div") {
        a = generateRandomFraction(currentLevel);
        b = generateRandomFraction(currentLevel);
        res = divFrac(a, b);
        return {
            text: `${fracToLatex(a)} ÷ ${fracToLatex(b)}`,
            answerFrac: res,
            explanation: "On multiplie par l'inverse."
        };
    }

    if (type === "simplify") {
        a = generateRandomFraction(currentLevel);
        const k = randomInt(2, 6);
        const unsimplified = { num: a.num * k, den: a.den * k };
        res = simplify(unsimplified);
        return {
            text: `Simplifie : ${fracToLatex(unsimplified)}`,
            answerFrac: res,
            explanation: "On divise numérateur et dénominateur par le même nombre."
        };
    }

    if (type === "compare") {
        a = generateRandomFraction(currentLevel);
        b = generateRandomFraction(currentLevel);
        res = (a.num * b.den > b.num * a.den) ? a : b;
        return {
            text: `Quelle fraction est la plus grande ?<br>${fracToLatex(a)} ou ${fracToLatex(b)}`,
            answerFrac: res,
            explanation: "On compare les produits croisés."
        };
    }

    /* --- EXERCICES AVANCÉS --- */

    if (type === "complex") {
        a = generateRandomFraction(currentLevel);
        b = generateRandomFraction(currentLevel);
        c = generateRandomFraction(currentLevel);
        res = subFrac(addFrac(a, b), c);
        return {
            text: `${fracToLatex(a)} + ${fracToLatex(b)} - ${fracToLatex(c)}`,
            answerFrac: res,
            explanation: "On effectue l'addition puis la soustraction."
        };
    }

    /* --- CONVERSION DÉCIMALE --- */

    if (type === "decimal") {
        a = generateRandomFraction(currentLevel);
        res = a.num / a.den;
        return {
            text: `Convertis en décimal : ${fracToLatex(a)}`,
            answerDecimal: res,
            explanation: "On effectue la division numérateur ÷ dénominateur."
        };
    }

    if (type === "fraction_of") {
        a = generateRandomFraction(currentLevel);
        const n = randomInt(5, 50);
        res = mulFrac(a, { num: n, den: 1 });
        return {
            text: `${fracToLatex(a)} de ${n}`,
            answerFrac: res,
            explanation: "On multiplie le nombre par la fraction."
        };
    }

    if (type === "compare3") {
        a = generateRandomFraction(currentLevel);
        b = generateRandomFraction(currentLevel);
        c = generateRandomFraction(currentLevel);
        const best = [a, b, c].sort((x, y) => x.num * y.den - y.num * x.den)[2];
        return {
            text: `Quelle est la plus grande ?<br>${fracToLatex(a)}, ${fracToLatex(b)}, ${fracToLatex(c)}`,
            answerFrac: best,
            explanation: "On compare les produits croisés."
        };
    }

    if (type === "super_complex") {
        a = generateRandomFraction(currentLevel);
        b = generateRandomFraction(currentLevel);
        c = generateRandomFraction(currentLevel);
        res = mulFrac(a, addFrac(b, c));
        return {
            text: `${fracToLatex(a)} × (${fracToLatex(b)} + ${fracToLatex(c)})`,
            answerFrac: res,
            explanation: "On calcule d'abord l'expression entre parenthèses."
        };
    }

    // Sécurité : ne devrait jamais arriver
    return generateSmartExercise();
}
/* -----------------------------------
   MODE EXERCICES
   Gère un exercice unique avec correction
----------------------------------- */

let currentExercise = null;

// Génère un nouvel exercice et réinitialise l'affichage
function newExercise() {
    currentExercise = generateSmartExercise();
    $("exercise-question").innerHTML = currentExercise.text;
    $("exercise-answer").value = "";
    $("exercise-feedback").innerHTML = "";
    $("exercise-explanation").innerHTML = "";
    MathJax.typeset();
}

function checkExerciseAnswer() {
    const input = $("exercise-answer").value;

    /* --- CAS DÉCIMAL --- */
    if (currentExercise.answerDecimal !== undefined) {
        const user = parseFloat(input.replace(",", "."));
        const correct = currentExercise.answerDecimal;

        if (Math.abs(user - correct) < 0.0001) {
            $("exercise-feedback").innerHTML = "<span class='correct'>Bravo !</span>";
            adjustLevel(true);
        } else {
            $("exercise-feedback").innerHTML =
                `<span class='wrong'>Incorrect.</span><br>
                 Ta réponse : ${user}<br>
                 Bonne réponse : ${correct.toFixed(6)}`;
            adjustLevel(false);
        }

        $("exercise-explanation").innerHTML = currentExercise.explanation;
        return;
    }

    /* --- CAS FRACTION --- */
    const parsed = parseFractionInput(input);
    if (!parsed || typeof parsed === "number") {
        $("exercise-feedback").innerHTML = "<span class='wrong'>Réponse invalide.</span>";
        return;
    }

    const correct = simplify(currentExercise.answerFrac);
    const user = simplify(parsed);
    const isCorrect = correct.num === user.num && correct.den === user.den;

    adjustLevel(isCorrect);

    $("exercise-feedback").innerHTML = isCorrect
        ? "<span class='correct'>Bravo !</span>"
        : `<span class='wrong'>Incorrect.</span><br>
           Ta réponse : ${fracToLatex(user)}<br>
           Bonne réponse : ${fracToLatex(correct)}`;

    $("exercise-explanation").innerHTML = currentExercise.explanation;
    MathJax.typeset();
}

/* -----------------------------------
   QUIZ (10 questions)
----------------------------------- */

let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;

// Initialise un quiz complet
function startQuiz() {
    quizQuestions = Array.from({ length: 10 }, () => generateSmartExercise());
    quizIndex = 0;
    quizScore = 0;

    $("quiz-score").innerText = "Score : 0 / 10";
    $("quiz-feedback").innerHTML = "";
    $("quiz-answer").value = "";

    showQuizQuestion();
}

// Affiche la question en cours
function showQuizQuestion() {
    const q = quizQuestions[quizIndex];

    $("quiz-question").innerHTML = `Question ${quizIndex + 1} :<br>${q.text}`;
    $("quiz-progress").innerText = `Question ${quizIndex + 1} / 10`;
    $("quiz-answer").value = "";
    $("quiz-feedback").innerHTML = "";

    MathJax.typeset();
}

// Vérifie la réponse du quiz
function checkQuizAnswer() {
    const q = quizQuestions[quizIndex];
    const input = $("quiz-answer").value;

    /* --- CAS DÉCIMAL --- */
    if (q.answerDecimal !== undefined) {
        const user = parseFloat(input.replace(",", "."));
        const correct = q.answerDecimal;

        if (Math.abs(user - correct) < 0.0001) {
            quizScore++;
            $("quiz-feedback").innerHTML = "<span class='correct'>Correct !</span>";
        } else {
            $("quiz-feedback").innerHTML =
                `<span class='wrong'>Incorrect.</span><br>
                 Ta réponse : ${user}<br>
                 Bonne réponse : ${correct.toFixed(6)}`;
        }

        $("quiz-score").innerText = `Score : ${quizScore} / 10`;
        return;
    }

    /* --- CAS FRACTION --- */
    const parsed = parseFractionInput(input);
    if (!parsed || typeof parsed === "number") {
        $("quiz-feedback").innerHTML = "<span class='wrong'>Réponse invalide.</span>";
        return;
    }

    const correct = simplify(q.answerFrac);
    const user = simplify(parsed);

    if (correct.num === user.num && correct.den === user.den) {
        quizScore++;
        $("quiz-feedback").innerHTML = "<span class='correct'>Correct !</span>";
    } else {
        $("quiz-feedback").innerHTML =
            `<span class='wrong'>Incorrect.</span><br>
             Ta réponse : ${fracToLatex(user)}<br>
             Bonne réponse : ${fracToLatex(correct)}`;
    }

    $("quiz-score").innerText = `Score : ${quizScore} / 10`;
    MathJax.typeset();
}

// Passe à la question suivante
function nextQuizQuestion() {
    if (quizIndex < 9) {
        quizIndex++;
        showQuizQuestion();
    } else {
        $("quiz-question").innerHTML =
            `Quiz terminé !<br>Score final : ${quizScore} / 10`;
        $("quiz-feedback").innerHTML = "";
        $("quiz-progress").innerText = "Terminé";
        MathJax.typeset();
    }
}

/* -----------------------------------
   CHALLENGE (vies + score illimité)
----------------------------------- */

let challengeLives = 3;
let challengeScore = 0;
let challengeQuestion = null;

// Affiche les cœurs
function renderLives() {
    $("challenge-lives").innerHTML =
        Array.from({ length: challengeLives }, () => "<span class='life'>❤</span>").join("");
}

// Démarre un challenge
function startChallenge() {
    challengeLives = 3;
    challengeScore = 0;

    $("challenge-score").innerText = "Score : 0";
    $("challenge-feedback").innerHTML = "";
    $("challenge-answer").value = "";

    renderLives();
    newChallengeQuestion();
}

// Nouvelle question tant qu'il reste des vies
function newChallengeQuestion() {
    if (challengeLives <= 0) {
        $("challenge-question").innerHTML =
            `Challenge terminé !<br>Score final : ${challengeScore}`;
        $("challenge-feedback").innerHTML = "";
        MathJax.typeset();
        return;
    }

    challengeQuestion = generateSmartExercise();
    $("challenge-question").innerHTML = challengeQuestion.text;
    $("challenge-answer").value = "";
    $("challenge-feedback").innerHTML = "";

    MathJax.typeset();
}

// Vérifie la réponse du challenge
function checkChallengeAnswer() {
    if (!challengeQuestion || challengeLives <= 0) return;

    const input = $("challenge-answer").value;

    /* --- CAS DÉCIMAL --- */
    if (challengeQuestion.answerDecimal !== undefined) {
        const user = parseFloat(input.replace(",", "."));
        const correct = challengeQuestion.answerDecimal;

        if (Math.abs(user - correct) < 0.0001) {
            challengeScore++;
            $("challenge-score").innerText = `Score : ${challengeScore}`;
            $("challenge-feedback").innerHTML = "<span class='correct'>Correct !</span>";
        } else {
            challengeLives--;
            renderLives();
            $("challenge-feedback").innerHTML =
                `<span class='wrong'>Incorrect.</span><br>
                 Ta réponse : ${user}<br>
                 Bonne réponse : ${correct.toFixed(6)}`;
        }

        MathJax.typeset();
        return;
    }

    /* --- CAS FRACTION --- */
    const parsed = parseFractionInput(input);
    if (!parsed || typeof parsed === "number") {
        $("challenge-feedback").innerHTML = "<span class='wrong'>Réponse invalide.</span>";
        return;
    }

    const correct = simplify(challengeQuestion.answerFrac);
    const user = simplify(parsed);

    if (correct.num === user.num && correct.den === user.den) {
        challengeScore++;
        $("challenge-score").innerText = `Score : ${challengeScore}`;
        $("challenge-feedback").innerHTML = "<span class='correct'>Correct !</span>";
    } else {
        challengeLives--;
        renderLives();
        $("challenge-feedback").innerHTML =
            `<span class='wrong'>Incorrect.</span><br>
             Ta réponse : ${fracToLatex(user)}<br>
             Bonne réponse : ${fracToLatex(correct)}`;
    }

    MathJax.typeset();
}
/* -----------------------------------
   OUTIL DOM
   Petit raccourci pour document.getElementById
----------------------------------- */
function $(id) {
    return document.getElementById(id);
}

/* -----------------------------------
   AFFICHAGE DES SECTIONS
   Permet de basculer entre :
   - Exercices
   - Quiz
   - Challenge
----------------------------------- */
function showSection(sectionId) {
    const sections = ["exercise-section", "quiz-section", "challenge-section"];

    sections.forEach(id => {
        $(id).classList.add("hidden");
    });

    $(sectionId).classList.remove("hidden");
}

/* -----------------------------------
   INITIALISATION & ÉCOUTEURS
----------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    /* ------------------------------
       NAVIGATION PRINCIPALE
    ------------------------------ */

    $("btn-mode-exercise").addEventListener("click", () => {
        showSection("exercise-section");
        newExercise();
    });

    $("btn-mode-quiz").addEventListener("click", () => {
        showSection("quiz-section");
        startQuiz();
    });

    $("btn-mode-challenge").addEventListener("click", () => {
        showSection("challenge-section");
        startChallenge();
    });

    /* ------------------------------
       MODE AUTO / MANUEL
    ------------------------------ */

    $("mode-auto").addEventListener("click", () => {
        mode = "auto";
        $("manual-levels").classList.add("hidden");
    });

    $("mode-manual").addEventListener("click", () => {
        mode = "manual";
        $("manual-levels").classList.remove("hidden");
    });

    /* ------------------------------
       BOUTONS DE NIVEAU MANUEL
       (avec mise en évidence visuelle)
    ------------------------------ */

    document.querySelectorAll(".level-btn").forEach(btn => {
        btn.addEventListener("click", () => {

            // 1. Mise à jour du niveau manuel
            difficulty = parseInt(btn.dataset.level);

            // 2. Mise en évidence du bouton sélectionné
            document.querySelectorAll(".level-btn")
                .forEach(b => b.classList.remove("active-level"));

            btn.classList.add("active-level");

            // 3. Générer un nouvel exercice immédiatement
            if (mode === "manual") {
                newExercise();
            }
        });
    });

    /* ------------------------------
       MODE EXERCICES
    ------------------------------ */

    $("exercise-new").addEventListener("click", newExercise);
    $("exercise-check").addEventListener("click", checkExerciseAnswer);

    /* ------------------------------
       MODE QUIZ
    ------------------------------ */

    $("quiz-start").addEventListener("click", startQuiz);
    $("quiz-check").addEventListener("click", checkQuizAnswer);
    $("quiz-next").addEventListener("click", nextQuizQuestion);

    /* ------------------------------
       MODE CHALLENGE
    ------------------------------ */

    $("challenge-start").addEventListener("click", startChallenge);
    $("challenge-check").addEventListener("click", checkChallengeAnswer);
    $("challenge-next").addEventListener("click", newChallengeQuestion);

    /* ------------------------------
       SECTION PAR DÉFAUT
    ------------------------------ */

    showSection("exercise-section");
    newExercise();
});
