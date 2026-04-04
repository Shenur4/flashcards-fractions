/* -----------------------------------
   OUTILS FRACTIONS
----------------------------------- */

function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b !== 0) {
        let t = b;
        b = a % b;
        a = t;
    }
    return a || 1;
}

function simplify(frac) {
    if (frac.den === 0) return frac;
    const g = gcd(frac.num, frac.den);
    return { num: frac.num / g, den: frac.den / g };
}

function addFrac(a, b) {
    return simplify({
        num: a.num * b.den + b.num * a.den,
        den: a.den * b.den
    });
}

function subFrac(a, b) {
    return simplify({
        num: a.num * b.den - b.num * a.den,
        den: a.den * b.den
    });
}

function mulFrac(a, b) {
    return simplify({
        num: a.num * b.num,
        den: a.den * b.den
    });
}

function divFrac(a, b) {
    return simplify({
        num: a.num * b.den,
        den: a.den * b.num
    });
}

function fracToLatex(frac) {
    frac = simplify(frac);
    if (frac.den === 1) return frac.num.toString();
    return "\\(\\frac{" + frac.num + "}{" + frac.den + "}\\)";
}

function parseFractionInput(str) {
    str = str.replace(/\s+/g, "");
    if (str.includes("/")) {
        const parts = str.split("/");
        const num = parseInt(parts[0], 10);
        const den = parseInt(parts[1], 10);
        if (isNaN(num) || isNaN(den) || den === 0) return null;
        return simplify({ num, den });
    } else {
        const num = parseFloat(str);
        if (isNaN(num)) return null;
        return simplify({ num, den: 1 });
    }
}

/* -----------------------------------
   MODE AUTO / MANUEL
----------------------------------- */

let mode = "auto";       // "auto" ou "manual"
let difficulty = 1;      // utilisé en mode manuel
let level = 1;           // utilisé en mode auto (1 à 5)
let streak = 0;
let mistakes = 0;

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

function generateRandomFraction(currentLevel) {
    let max = currentLevel === 1 ? 10 :
              currentLevel === 2 ? 20 :
              currentLevel === 3 ? 50 :
              currentLevel === 4 ? 100 : 200;

    let den = randomInt(2, max);
    let num = randomInt(1, den - 1);

    return simplify({ num, den });
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/* -----------------------------------
   TYPES D’EXERCICES SELON NIVEAU
----------------------------------- */

function generateSmartExercise() {
    const currentLevel = (mode === "auto") ? level : difficulty;

    let typePool = [];

    if (currentLevel === 1) {
        typePool = ["add_same", "sub_same", "simplify"];
    }
    if (currentLevel === 2) {
        typePool = ["add_diff", "sub_diff", "mul", "simplify", "compare"];
    }
    if (currentLevel === 3) {
        typePool = ["add_diff", "sub_diff", "mul", "div", "complex"];
    }
    if (currentLevel === 4) {
        typePool = ["add_diff", "sub_diff", "mul", "div", "complex", "decimal", "fraction_of"];
    }
    if (currentLevel === 5) {
        typePool = ["complex", "super_complex", "compare3", "decimal", "fraction_of"];
    }

    const type = typePool[randomInt(0, typePool.length - 1)];

    let a, b, c, res, text, expl;

    /* --- NIVEAU 1 & 2 --- */
    if (type === "add_same") {
        a = generateRandomFraction(currentLevel);
        b = { num: randomInt(1, a.den - 1), den: a.den };
        res = addFrac(a, b);
        text = fracToLatex(a) + " + " + fracToLatex(b);
        expl = "Même dénominateur : on additionne les numérateurs.";
        return { text, answerFrac: res, explanation: expl };
    }

    if (type === "sub_same") {
        a = generateRandomFraction(currentLevel);
        b = { num: randomInt(1, a.num), den: a.den };
        res = subFrac(a, b);
        text = fracToLatex(a) + " - " + fracToLatex(b);
        expl = "Même dénominateur : on soustrait les numérateurs.";
        return { text, answerFrac: res, explanation: expl };
    }

    if (type === "add_diff") {
        a = generateRandomFraction(currentLevel);
        b = generateRandomFraction(currentLevel);
        res = addFrac(a, b);
        text = fracToLatex(a) + " + " + fracToLatex(b);
        expl = "On met au même dénominateur puis on additionne.";
        return { text, answerFrac: res, explanation: expl };
    }

    if (type === "sub_diff") {
        a = generateRandomFraction(currentLevel);
        b = generateRandomFraction(currentLevel);
        res = subFrac(a, b);
        text = fracToLatex(a) + " - " + fracToLatex(b);
        expl = "On met au même dénominateur puis on soustrait.";
        return { text, answerFrac: res, explanation: expl };
    }

    if (type === "mul") {
        a = generateRandomFraction(currentLevel);
        b = generateRandomFraction(currentLevel);
        res = mulFrac(a, b);
        text = fracToLatex(a) + " × " + fracToLatex(b);
        expl = "On multiplie numérateurs et dénominateurs.";
        return { text, answerFrac: res, explanation: expl };
    }

    if (type === "div") {
        a = generateRandomFraction(currentLevel);
        b = generateRandomFraction(currentLevel);
        res = divFrac(a, b);
        text = fracToLatex(a) + " ÷ " + fracToLatex(b);
        expl = "On multiplie par l'inverse.";
        return { text, answerFrac: res, explanation: expl };
    }

    if (type === "simplify") {
        a = generateRandomFraction(currentLevel);
        let k = randomInt(2, 6);
        let unsimplified = { num: a.num * k, den: a.den * k };
        res = simplify(unsimplified);
        text = "Simplifie : " + fracToLatex(unsimplified);
        expl = "On divise numérateur et dénominateur par le même nombre.";
        return { text, answerFrac: res, explanation: expl };
    }

    if (type === "compare") {
        a = generateRandomFraction(currentLevel);
        b = generateRandomFraction(currentLevel);
        res = (a.num * b.den > b.num * a.den) ? a : b;
        text = "Quelle fraction est la plus grande ?<br>" +
               fracToLatex(a) + " ou " + fracToLatex(b);
        expl = "On compare les produits croisés.";
        return { text, answerFrac: res, explanation: expl };
    }

    /* --- NIVEAU 3+ : COMPLEXES --- */
    if (type === "complex") {
        a = generateRandomFraction(currentLevel);
        b = generateRandomFraction(currentLevel);
        c = generateRandomFraction(currentLevel);
        let sum = addFrac(a, b);
        res = subFrac(sum, c);
        text = fracToLatex(a) + " + " + fracToLatex(b) + " - " + fracToLatex(c);
        expl = "On effectue l'addition puis la soustraction.";
        return { text, answerFrac: res, explanation: expl };
    }

    if (type === "decimal") {
        a = generateRandomFraction(currentLevel);
        res = { num: a.num, den: a.den };
        text = "Convertis en décimal : " + fracToLatex(a);
        expl = "On effectue la division numérateur ÷ dénominateur.";
        return { text, answerFrac: res, explanation: expl };
    }

    if (type === "fraction_of") {
        a = generateRandomFraction(currentLevel);
        let n = randomInt(5, 50);
        res = mulFrac(a, { num: n, den: 1 });
        text = fracToLatex(a) + " de " + n;
        expl = "On multiplie le nombre par la fraction.";
        return { text, answerFrac: res, explanation: expl };
    }

    if (type === "compare3") {
        a = generateRandomFraction(currentLevel);
        b = generateRandomFraction(currentLevel);
        c = generateRandomFraction(currentLevel);
        let best = [a, b, c].sort((x, y) => x.num * y.den - y.num * x.den)[2];
        text = "Quelle est la plus grande ?<br>" +
               fracToLatex(a) + ", " + fracToLatex(b) + ", " + fracToLatex(c);
        expl = "On compare les produits croisés.";
        return { text, answerFrac: best, explanation: expl };
    }

    if (type === "super_complex") {
        a = generateRandomFraction(currentLevel);
        b = generateRandomFraction(currentLevel);
        c = generateRandomFraction(currentLevel);
        let inside = addFrac(b, c);
        res = mulFrac(a, inside);
        text = fracToLatex(a) + " × (" + fracToLatex(b) + " + " + fracToLatex(c) + ")";
        expl = "On calcule d'abord l'expression entre parenthèses.";
        return { text, answerFrac: res, explanation: expl };
    }

    return generateSmartExercise();
}

/* -----------------------------------
   DOM HELPERS
----------------------------------- */

function $(id) {
    return document.getElementById(id);
}

function showSection(sectionId) {
    const sections = ["exercise-section", "quiz-section", "challenge-section"];
    sections.forEach(id => $(id).classList.add("hidden"));
    $(sectionId).classList.remove("hidden");
}

/* -----------------------------------
   MODE EXERCICES
----------------------------------- */

let currentExercise = null;

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
    const parsed = parseFractionInput(input);
    if (!parsed) {
        $("exercise-feedback").innerHTML = "<span class='wrong'>Réponse invalide.</span>";
        return;
    }

    const correct = simplify(currentExercise.answerFrac);
    const user = simplify(parsed);

    const isCorrect =
        correct.num === user.num && correct.den === user.den;

    adjustLevel(isCorrect);

    if (isCorrect) {
        $("exercise-feedback").innerHTML = "<span class='correct'>Bravo !</span>";
    } else {
        $("exercise-feedback").innerHTML =
            "<span class='wrong'>Incorrect.</span><br>" +
            "Ta réponse : " + fracToLatex(user) + "<br>" +
            "Bonne réponse : " + fracToLatex(correct);
    }

    $("exercise-explanation").innerHTML = currentExercise.explanation;
    MathJax.typeset();
}

/* -----------------------------------
   QUIZ
----------------------------------- */

let quizQuestions = [];
let quizIndex = 0;
let quizScore = 0;

function startQuiz() {
    quizQuestions = [];
    for (let i = 0; i < 10; i++) {
        quizQuestions.push(generateSmartExercise());
    }
    quizIndex = 0;
    quizScore = 0;
    $("quiz-score").innerText = "Score : 0 / 10";
    $("quiz-feedback").innerHTML = "";
    $("quiz-answer").value = "";
    showQuizQuestion();
}

function showQuizQuestion() {
    const q = quizQuestions[quizIndex];
    $("quiz-question").innerHTML = "Question " + (quizIndex + 1) + " :<br>" + q.text;
    $("quiz-progress").innerText = "Question " + (quizIndex + 1) + " / 10";
    $("quiz-answer").value = "";
    $("quiz-feedback").innerHTML = "";
    MathJax.typeset();
}

function checkQuizAnswer() {
    const q = quizQuestions[quizIndex];
    const input = $("quiz-answer").value;
    const parsed = parseFractionInput(input);
    if (!parsed) {
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
            "<span class='wrong'>Incorrect.</span><br>" +
            "Ta réponse : " + fracToLatex(user) + "<br>" +
            "Bonne réponse : " + fracToLatex(correct);
    }

    $("quiz-score").innerText = "Score : " + quizScore + " / 10";
    MathJax.typeset();
}

function nextQuizQuestion() {
    if (quizIndex < 9) {
        quizIndex++;
        showQuizQuestion();
    } else {
        $("quiz-question").innerHTML =
            "Quiz terminé !<br>Score final : " + quizScore + " / 10";
        $("quiz-feedback").innerHTML = "";
        $("quiz-progress").innerText = "Terminé";
        MathJax.typeset();
    }
}

/* -----------------------------------
   CHALLENGE
----------------------------------- */

let challengeLives = 3;
let challengeScore = 0;
let challengeQuestion = null;

function renderLives() {
    let hearts = "";
    for (let i = 0; i < challengeLives; i++) {
        hearts += "<span class='life'>❤</span>";
    }
    $("challenge-lives").innerHTML = hearts;
}

function startChallenge() {
    challengeLives = 3;
    challengeScore = 0;
    $("challenge-score").innerText = "Score : 0";
    $("challenge-feedback").innerHTML = "";
    $("challenge-answer").value = "";
    renderLives();
    newChallengeQuestion();
}

function newChallengeQuestion() {
    if (challengeLives <= 0) {
        $("challenge-question").innerHTML =
            "Challenge terminé !<br>Score final : " + challengeScore;
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

function checkChallengeAnswer() {
    if (!challengeQuestion || challengeLives <= 0) return;

    const input = $("challenge-answer").value;
    const parsed = parseFractionInput(input);
    if (!parsed) {
        $("challenge-feedback").innerHTML = "<span class='wrong'>Réponse invalide.</span>";
        return;
    }

    const correct = simplify(challengeQuestion.answerFrac);
    const user = simplify(parsed);

    if (correct.num === user.num && correct.den === user.den) {
        challengeScore++;
        $("challenge-score").innerText = "Score : " + challengeScore;
        $("challenge-feedback").innerHTML = "<span class='correct'>Correct !</span>";
    } else {
        challengeLives--;
        renderLives();
        $("challenge-feedback").innerHTML =
            "<span class='wrong'>Incorrect.</span><br>" +
            "Ta réponse : " + fracToLatex(user) + "<br>" +
            "Bonne réponse : " + fracToLatex(correct);
    }

    MathJax.typeset();
}

/* -----------------------------------
   INIT + BOUTONS
----------------------------------- */

document.addEventListener("DOMContentLoaded", () => {

    // Navigation
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

    // Mode auto / manuel
$("mode-auto").addEventListener("click", () => {
    mode = "auto";
    $("manual-levels").classList.add("hidden");
});

$("mode-manual").addEventListener("click", () => {
    mode = "manual";
    $("manual-levels").classList.remove("hidden");
});

document.querySelectorAll(".level-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        difficulty = parseInt(btn.dataset.level);
    });
});

// Exercices
$("exercise-new").addEventListener("click", newExercise);
$("exercise-check").addEventListener("click", checkExerciseAnswer);

// Quiz
$("quiz-start").addEventListener("click", startQuiz);
$("quiz-check").addEventListener("click", checkQuizAnswer);
$("quiz-next").addEventListener("click", nextQuizQuestion);

// Challenge
$("challenge-start").addEventListener("click", startChallenge);
$("challenge-check").addEventListener("click", checkChallengeAnswer);
$("challenge-next").addEventListener("click", newChallengeQuestion);

// Section par défaut
showSection("exercise-section");
newExercise();
});