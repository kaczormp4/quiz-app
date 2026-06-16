EXTRA_QUIZ_CATEGORIES = [
    {
        "slug": "javascript",
        "name": "JavaScript",
        "description": "Pytania z JavaScript: event loop, closures, hoisting, promises, typy, scope i działanie języka.",
        "questions": [
            {
                "question": "Czym jest closure w JavaScript?",
                "difficulty": "medium",
                "points": 2,
                "answers": [
                    {
                        "text": "Funkcją, która pamięta scope, w którym została utworzona",
                        "is_correct": True,
                    },
                    {
                        "text": "Mechanizmem do zamykania okna przeglądarki",
                        "is_correct": False,
                    },
                    {
                        "text": "Sposobem na usuwanie zmiennych z pamięci",
                        "is_correct": False,
                    },
                    {
                        "text": "Specjalnym typem danych podobnym do boolean",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>Closure</h3>
                    <p>
                      <strong>Closure</strong> powstaje, gdy funkcja zachowuje dostęp do zmiennych
                      ze scope'u, w którym została utworzona, nawet po zakończeniu wykonania tego scope'u.
                    </p>
                    <pre><code>function createCounter() {
  let count = 0;

  return function increment() {
    count += 1;
    return count;
  };
}</code></pre>
                """,
            },
            {
                "question": "Co zostanie wykonane jako pierwsze: Promise.then czy setTimeout z opóźnieniem 0?",
                "difficulty": "medium",
                "points": 2,
                "answers": [
                    {
                        "text": "Promise.then",
                        "is_correct": True,
                    },
                    {
                        "text": "setTimeout",
                        "is_correct": False,
                    },
                    {
                        "text": "Oba wykonają się równocześnie",
                        "is_correct": False,
                    },
                    {
                        "text": "Kolejność jest losowa",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>Microtasks vs macrotasks</h3>
                    <p>
                      Callback z <code>Promise.then</code> trafia do kolejki microtasks,
                      a <code>setTimeout</code> do kolejki macrotasks. Microtasks są wykonywane
                      przed kolejną macrotaską.
                    </p>
                    <pre><code>setTimeout(() =&gt; console.log("timeout"), 0);
Promise.resolve().then(() =&gt; console.log("promise"));</code></pre>
                """,
            },
            {
                "question": "Co oznacza hoisting w JavaScript?",
                "difficulty": "easy",
                "points": 1,
                "answers": [
                    {
                        "text": "Przeniesienie deklaracji do góry scope'u na etapie interpretacji",
                        "is_correct": True,
                    },
                    {
                        "text": "Automatyczne sortowanie funkcji w pliku",
                        "is_correct": False,
                    },
                    {
                        "text": "Usuwanie nieużywanych importów",
                        "is_correct": False,
                    },
                    {
                        "text": "Mechanizm cache'owania zmiennych",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>Hoisting</h3>
                    <p>
                      <strong>Hoisting</strong> oznacza, że deklaracje są traktowane tak,
                      jakby były dostępne od początku scope'u. Różne typy deklaracji zachowują się inaczej:
                      <code>function</code> jest dostępna wcześniej, a <code>let</code> i <code>const</code>
                      są w temporal dead zone.
                    </p>
                """,
            },
            {
                "question": "Jaka jest różnica między == i === w JavaScript?",
                "difficulty": "easy",
                "points": 1,
                "answers": [
                    {
                        "text": "== wykonuje coercion typów, === porównuje bez konwersji typów",
                        "is_correct": True,
                    },
                    {
                        "text": "=== wykonuje coercion typów, == nie",
                        "is_correct": False,
                    },
                    {
                        "text": "Nie ma żadnej różnicy",
                        "is_correct": False,
                    },
                    {
                        "text": "== działa tylko dla stringów",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>== vs ===</h3>
                    <p>
                      Operator <code>==</code> wykonuje konwersję typów przed porównaniem,
                      natomiast <code>===</code> sprawdza zarówno wartość, jak i typ.
                    </p>
                    <pre><code>0 == false // true
0 === false // false</code></pre>
                """,
            },
            {
                "question": "Czym jest event loop?",
                "difficulty": "medium",
                "points": 2,
                "answers": [
                    {
                        "text": "Mechanizmem koordynującym call stack, task queue i microtask queue",
                        "is_correct": True,
                    },
                    {
                        "text": "Pętlą for używaną tylko do event listenerów",
                        "is_correct": False,
                    },
                    {
                        "text": "API służącym tylko do obsługi kliknięć",
                        "is_correct": False,
                    },
                    {
                        "text": "Mechanizmem CSS do animacji",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>Event loop</h3>
                    <p>
                      <strong>Event loop</strong> odpowiada za wykonywanie kodu synchronicznego,
                      obsługę callbacków asynchronicznych, microtasks i macrotasks. Dzięki temu JS może
                      obsługiwać operacje asynchroniczne mimo jednowątkowego call stacka.
                    </p>
                """,
            },
            {
                "question": "Co zwraca typeof null?",
                "difficulty": "easy",
                "points": 1,
                "answers": [
                    {
                        "text": "\"object\"",
                        "is_correct": True,
                    },
                    {
                        "text": "\"null\"",
                        "is_correct": False,
                    },
                    {
                        "text": "\"undefined\"",
                        "is_correct": False,
                    },
                    {
                        "text": "\"boolean\"",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>typeof null</h3>
                    <p>
                      <code>typeof null</code> zwraca <strong>"object"</strong>. Jest to historyczny błąd
                      języka JavaScript, który został zachowany dla kompatybilności wstecznej.
                    </p>
                    <pre><code>typeof null // "object"</code></pre>
                """,
            },
            {
                "question": "Czym różni się let od var?",
                "difficulty": "medium",
                "points": 2,
                "answers": [
                    {
                        "text": "let ma block scope, a var function scope",
                        "is_correct": True,
                    },
                    {
                        "text": "var ma block scope, a let function scope",
                        "is_correct": False,
                    },
                    {
                        "text": "let działa tylko w klasach",
                        "is_correct": False,
                    },
                    {
                        "text": "var jest typem danych",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>let vs var</h3>
                    <p>
                      <code>let</code> ma <strong>block scope</strong>, czyli jest ograniczony do bloku
                      <code>{}</code>. <code>var</code> ma <strong>function scope</strong> i jest hoistowany
                      w inny sposób.
                    </p>
                """,
            },
            {
                "question": "Co robi metoda Array.prototype.map?",
                "difficulty": "easy",
                "points": 1,
                "answers": [
                    {
                        "text": "Tworzy nową tablicę przez przekształcenie każdego elementu",
                        "is_correct": True,
                    },
                    {
                        "text": "Mutuje oryginalną tablicę i usuwa elementy",
                        "is_correct": False,
                    },
                    {
                        "text": "Zwraca tylko pierwszy element tablicy",
                        "is_correct": False,
                    },
                    {
                        "text": "Sortuje tablicę rosnąco",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>Array.map</h3>
                    <p>
                      <code>map</code> zwraca nową tablicę, w której każdy element jest wynikiem
                      funkcji przekazanej do <code>map</code>.
                    </p>
                    <pre><code>const doubled = [1, 2, 3].map(value =&gt; value * 2);</code></pre>
                """,
            },
            {
                "question": "Co robi Promise.all?",
                "difficulty": "medium",
                "points": 2,
                "answers": [
                    {
                        "text": "Czeka aż wszystkie promisy zakończą się sukcesem albo odrzuca się przy pierwszym błędzie",
                        "is_correct": True,
                    },
                    {
                        "text": "Zawsze zwraca pierwszy zakończony promise",
                        "is_correct": False,
                    },
                    {
                        "text": "Ignoruje błędy i zwraca tylko sukcesy",
                        "is_correct": False,
                    },
                    {
                        "text": "Wykonuje promisy synchronicznie jeden po drugim",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>Promise.all</h3>
                    <p>
                      <code>Promise.all</code> przyjmuje listę promisów i zwraca promise, który rozwiązuje się,
                      gdy wszystkie promisy zakończą się sukcesem. Jeśli jeden promise zostanie odrzucony,
                      całe <code>Promise.all</code> zostaje odrzucone.
                    </p>
                """,
            },
            {
                "question": "Czym jest optional chaining?",
                "difficulty": "easy",
                "points": 1,
                "answers": [
                    {
                        "text": "Składnią pozwalającą bezpiecznie odczytać zagnieżdżoną właściwość",
                        "is_correct": True,
                    },
                    {
                        "text": "Sposobem na tworzenie prywatnych zmiennych",
                        "is_correct": False,
                    },
                    {
                        "text": "Metodą sortowania tablic",
                        "is_correct": False,
                    },
                    {
                        "text": "Operatorem do konwersji stringa na number",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>Optional chaining</h3>
                    <p>
                      Optional chaining <code>?.</code> pozwala bezpiecznie odczytywać właściwości,
                      które mogą nie istnieć, bez rzucania błędu.
                    </p>
                    <pre><code>const city = user.address?.city;</code></pre>
                """,
            },
        ],
    },
    {
        "slug": "algorithms-data-structures",
        "name": "Algorytmy i Struktury Danych",
        "description": "Pytania z Big O, tablic, map, setów, sortowania, wyszukiwania i struktur danych.",
        "questions": [
            {
                "question": "Jaka jest złożoność czasowa wyszukiwania elementu w tablicy niesortowanej?",
                "difficulty": "easy",
                "points": 1,
                "answers": [
                    {
                        "text": "O(n)",
                        "is_correct": True,
                    },
                    {
                        "text": "O(1)",
                        "is_correct": False,
                    },
                    {
                        "text": "O(log n)",
                        "is_correct": False,
                    },
                    {
                        "text": "O(n log n)",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>Wyszukiwanie liniowe</h3>
                    <p>
                      W niesortowanej tablicy w najgorszym przypadku trzeba sprawdzić każdy element,
                      dlatego złożoność czasowa wynosi <strong>O(n)</strong>.
                    </p>
                """,
            },
            {
                "question": "Jaka jest średnia złożoność odczytu wartości z HashMap po kluczu?",
                "difficulty": "easy",
                "points": 1,
                "answers": [
                    {
                        "text": "O(1)",
                        "is_correct": True,
                    },
                    {
                        "text": "O(n)",
                        "is_correct": False,
                    },
                    {
                        "text": "O(log n)",
                        "is_correct": False,
                    },
                    {
                        "text": "O(n²)",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>HashMap</h3>
                    <p>
                      Średnio dostęp do wartości po kluczu w HashMap ma złożoność <strong>O(1)</strong>.
                      W najgorszym przypadku, przy wielu kolizjach, może się pogorszyć.
                    </p>
                """,
            },
            {
                "question": "Czym jest binary search?",
                "difficulty": "medium",
                "points": 2,
                "answers": [
                    {
                        "text": "Algorytmem wyszukiwania w posortowanej kolekcji przez dzielenie zakresu na pół",
                        "is_correct": True,
                    },
                    {
                        "text": "Algorytmem sortowania bąbelkowego",
                        "is_correct": False,
                    },
                    {
                        "text": "Algorytmem działającym tylko na stringach",
                        "is_correct": False,
                    },
                    {
                        "text": "Strukturą danych podobną do stosu",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>Binary search</h3>
                    <p>
                      Binary search działa na posortowanych danych. W każdym kroku odrzuca połowę
                      pozostałego zakresu, dlatego jego złożoność wynosi <strong>O(log n)</strong>.
                    </p>
                """,
            },
            {
                "question": "Jaka struktura danych działa według zasady LIFO?",
                "difficulty": "easy",
                "points": 1,
                "answers": [
                    {
                        "text": "Stack",
                        "is_correct": True,
                    },
                    {
                        "text": "Queue",
                        "is_correct": False,
                    },
                    {
                        "text": "HashMap",
                        "is_correct": False,
                    },
                    {
                        "text": "Graph",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>Stack</h3>
                    <p>
                      <strong>LIFO</strong> oznacza Last In, First Out. Ostatni dodany element
                      jest zdejmowany jako pierwszy. Tak działa stos.
                    </p>
                """,
            },
            {
                "question": "Jaka struktura danych działa według zasady FIFO?",
                "difficulty": "easy",
                "points": 1,
                "answers": [
                    {
                        "text": "Queue",
                        "is_correct": True,
                    },
                    {
                        "text": "Stack",
                        "is_correct": False,
                    },
                    {
                        "text": "Set",
                        "is_correct": False,
                    },
                    {
                        "text": "Tree",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>Queue</h3>
                    <p>
                      <strong>FIFO</strong> oznacza First In, First Out. Pierwszy dodany element
                      jest zdejmowany jako pierwszy. Tak działa kolejka.
                    </p>
                """,
            },
            {
                "question": "Do czego służy Set?",
                "difficulty": "easy",
                "points": 1,
                "answers": [
                    {
                        "text": "Do przechowywania unikalnych wartości",
                        "is_correct": True,
                    },
                    {
                        "text": "Do przechowywania tylko liczb parzystych",
                        "is_correct": False,
                    },
                    {
                        "text": "Do sortowania danych",
                        "is_correct": False,
                    },
                    {
                        "text": "Do wykonywania zapytań SQL",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>Set</h3>
                    <p>
                      <strong>Set</strong> przechowuje unikalne wartości. W JavaScript może być używany
                      np. do usuwania duplikatów z tablicy.
                    </p>
                    <pre><code>const unique = [...new Set([1, 1, 2, 3])];</code></pre>
                """,
            },
            {
                "question": "Jaka jest typowa złożoność sortowania merge sort?",
                "difficulty": "medium",
                "points": 2,
                "answers": [
                    {
                        "text": "O(n log n)",
                        "is_correct": True,
                    },
                    {
                        "text": "O(n)",
                        "is_correct": False,
                    },
                    {
                        "text": "O(log n)",
                        "is_correct": False,
                    },
                    {
                        "text": "O(n²)",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>Merge sort</h3>
                    <p>
                      Merge sort dzieli dane na mniejsze części, sortuje je rekurencyjnie,
                      a następnie scala. Typowa złożoność czasowa to <strong>O(n log n)</strong>.
                    </p>
                """,
            },
            {
                "question": "Co oznacza O(n²)?",
                "difficulty": "easy",
                "points": 1,
                "answers": [
                    {
                        "text": "Czas rośnie kwadratowo względem rozmiaru danych",
                        "is_correct": True,
                    },
                    {
                        "text": "Czas jest zawsze stały",
                        "is_correct": False,
                    },
                    {
                        "text": "Czas rośnie logarytmicznie",
                        "is_correct": False,
                    },
                    {
                        "text": "Algorytm nie używa pamięci",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>O(n²)</h3>
                    <p>
                      Złożoność <strong>O(n²)</strong> oznacza, że liczba operacji rośnie kwadratowo.
                      Często pojawia się przy zagnieżdżonych pętlach.
                    </p>
                    <pre><code>for (const a of items) {
  for (const b of items) {
    // O(n²)
  }
}</code></pre>
                """,
            },
            {
                "question": "Czym jest rekurencja?",
                "difficulty": "medium",
                "points": 2,
                "answers": [
                    {
                        "text": "Techniką, w której funkcja wywołuje samą siebie",
                        "is_correct": True,
                    },
                    {
                        "text": "Techniką usuwania elementów z tablicy",
                        "is_correct": False,
                    },
                    {
                        "text": "Rodzajem zapytania HTTP",
                        "is_correct": False,
                    },
                    {
                        "text": "Typem danych w SQL",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>Rekurencja</h3>
                    <p>
                      Rekurencja polega na tym, że funkcja wywołuje samą siebie.
                      Każda poprawna rekurencja powinna mieć warunek zakończenia.
                    </p>
                    <pre><code>function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}</code></pre>
                """,
            },
            {
                "question": "Kiedy warto użyć Map zamiast zwykłego obiektu?",
                "difficulty": "medium",
                "points": 2,
                "answers": [
                    {
                        "text": "Gdy potrzebujemy dowolnych typów jako kluczy i wygodnego API do iteracji",
                        "is_correct": True,
                    },
                    {
                        "text": "Gdy chcemy pisać CSS w JavaScript",
                        "is_correct": False,
                    },
                    {
                        "text": "Gdy dane muszą być zawsze posortowane alfabetycznie",
                        "is_correct": False,
                    },
                    {
                        "text": "Gdy chcemy zablokować możliwość dodawania nowych wartości",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>Map</h3>
                    <p>
                      <strong>Map</strong> ma wygodne API do przechowywania par klucz-wartość,
                      zachowuje kolejność dodawania i pozwala używać dowolnych wartości jako kluczy.
                    </p>
                    <pre><code>const map = new Map();
map.set(user.id, user);</code></pre>
                """,
            },
        ],
    },
]
