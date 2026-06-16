QUIZ_CATEGORIES = [
    {
        "slug": "general-it",
        "name": "Wiedza ogólnoinformatyczna",
        "description": "Podstawowe pytania z HTTP, REST, bezpieczeństwa i architektury aplikacji.",
        "questions": [
            {
                "question": "Która metoda HTTP jest najczęściej używana do pobierania danych?",
                "difficulty": "easy",
                "points": 1,
                "answers": [
                    {"text": "GET", "is_correct": True},
                    {"text": "POST", "is_correct": False},
                    {"text": "PATCH", "is_correct": False},
                    {"text": "DELETE", "is_correct": False},
                ],
                "explanation_html": """
                    <h3>Poprawna odpowiedź: GET</h3>
                    <p>
                      Metoda <strong>GET</strong> służy głównie do pobierania danych z serwera.
                      W dobrze zaprojektowanym API nie powinna zmieniać stanu danych.
                    </p>
                    <pre><code>GET /api/users/123</code></pre>
                """,
            },
            {
                "question": "Co oznacza status HTTP 401?",
                "difficulty": "easy",
                "points": 1,
                "answers": [
                    {"text": "Brak poprawnego uwierzytelnienia", "is_correct": True},
                    {"text": "Zasób nie istnieje", "is_correct": False},
                    {"text": "Błąd walidacji danych", "is_correct": False},
                    {"text": "Błąd serwera", "is_correct": False},
                ],
                "explanation_html": """
                    <h3>Poprawna odpowiedź: 401 Unauthorized</h3>
                    <p>
                      Status <strong>401</strong> oznacza, że użytkownik nie jest poprawnie
                      uwierzytelniony. Najczęściej brakuje tokena, token wygasł albo jest niepoprawny.
                    </p>
                    <p>
                      Dla porównania <strong>403 Forbidden</strong> oznacza, że użytkownik
                      może być zalogowany, ale nie ma uprawnień do danego zasobu.
                    </p>
                """,
            },
            {
                "question": "Czym różni się authentication od authorization?",
                "difficulty": "medium",
                "points": 2,
                "answers": [
                    {
                        "text": "Authentication sprawdza kim jesteś, authorization sprawdza co możesz zrobić",
                        "is_correct": True,
                    },
                    {
                        "text": "Authentication dotyczy frontendu, authorization dotyczy tylko backendu",
                        "is_correct": False,
                    },
                    {
                        "text": "To są dokładnie te same pojęcia",
                        "is_correct": False,
                    },
                    {
                        "text": "Authorization zawsze dzieje się przed authentication",
                        "is_correct": False,
                    },
                ],
                "explanation_html": """
                    <h3>Authentication vs Authorization</h3>
                    <p>
                      <strong>Authentication</strong> odpowiada na pytanie: kim jesteś?
                      Przykład: logowanie za pomocą emaila i hasła.
                    </p>
                    <p>
                      <strong>Authorization</strong> odpowiada na pytanie: do czego masz dostęp?
                      Przykład: użytkownik admin może usunąć wpis, a zwykły użytkownik nie.
                    </p>
                """,
            },
        ],
    },
    {
        "slug": "react",
        "name": "React",
        "description": "Pytania z Reacta, hooków, renderowania, state managementu i architektury komponentów.",
        "questions": [
            {
                "question": "Do czego służy hook useMemo?",
                "difficulty": "medium",
                "points": 2,
                "answers": [
                    {"text": "Do memoizacji wartości pomiędzy renderami", "is_correct": True},
                    {"text": "Do wykonywania efektów ubocznych po renderze", "is_correct": False},
                    {"text": "Do tworzenia globalnego store'a", "is_correct": False},
                    {"text": "Do obsługi błędów w komponencie", "is_correct": False},
                ],
                "explanation_html": """
                    <h3>useMemo</h3>
                    <p>
                      <strong>useMemo</strong> memoizuje wynik obliczenia i przelicza go tylko wtedy,
                      gdy zmienią się zależności. Nie powinno się go używać wszędzie, tylko tam,
                      gdzie koszt obliczenia albo referencyjna stabilność mają realne znaczenie.
                    </p>
                    <pre><code>const filtered = useMemo(() => filterItems(items), [items]);</code></pre>
                """,
            },
            {
                "question": "Kiedy komponent Reacta renderuje się ponownie?",
                "difficulty": "medium",
                "points": 2,
                "answers": [
                    {"text": "Gdy zmieni się jego state, props albo parent się zrenderuje", "is_correct": True},
                    {"text": "Tylko wtedy, gdy zmieni się URL", "is_correct": False},
                    {"text": "Tylko po ręcznym wywołaniu forceRender", "is_correct": False},
                    {"text": "Wyłącznie po zmianie localStorage", "is_correct": False},
                ],
                "explanation_html": """
                    <h3>Renderowanie Reacta</h3>
                    <p>
                      Komponent renderuje się ponownie, gdy zmieni się jego <strong>state</strong>,
                      gdy otrzyma nowe <strong>props</strong> albo gdy jego rodzic zostanie ponownie
                      wyrenderowany. React może potem zoptymalizować aktualizację DOM przez reconciler.
                    </p>
                """,
            },
            {
                "question": "Po co używać key podczas renderowania listy?",
                "difficulty": "easy",
                "points": 1,
                "answers": [
                    {"text": "Żeby React mógł stabilnie identyfikować elementy listy", "is_correct": True},
                    {"text": "Żeby dodać CSS class do elementu", "is_correct": False},
                    {"text": "Żeby automatycznie posortować listę", "is_correct": False},
                    {"text": "Żeby ukryć element przed renderowaniem", "is_correct": False},
                ],
                "explanation_html": """
                    <h3>Key w React</h3>
                    <p>
                      <strong>key</strong> pomaga Reactowi rozpoznać, który element listy został dodany,
                      usunięty albo zmieniony. Najlepszym kluczem jest stabilne ID z danych.
                    </p>
                    <pre><code>{items.map(item => &lt;Card key={item.id} item={item} /&gt;)}</code></pre>
                """,
            },
        ],
    },
    {
        "slug": "typescript",
        "name": "TypeScript",
        "description": "Typowanie aplikacji frontendowych, union types, generics i dobre praktyki.",
        "questions": [
            {
                "question": "Czym jest union type w TypeScript?",
                "difficulty": "easy",
                "points": 1,
                "answers": [
                    {"text": "Typem, który może przyjąć jedną z kilku dopuszczalnych wartości", "is_correct": True},
                    {"text": "Typem, który zawsze jest stringiem", "is_correct": False},
                    {"text": "Typem służącym wyłącznie do klas", "is_correct": False},
                    {"text": "Mechanizmem do importowania modułów", "is_correct": False},
                ],
                "explanation_html": """
                    <h3>Union type</h3>
                    <p>
                      Union type pozwala opisać wartość, która może mieć jeden z kilku typów.
                    </p>
                    <pre><code>type Status = "idle" | "loading" | "success" | "error";</code></pre>
                """,
            },
            {
                "question": "Do czego służy generic w TypeScript?",
                "difficulty": "medium",
                "points": 2,
                "answers": [
                    {"text": "Do pisania typów i funkcji wielokrotnego użytku z zachowaniem informacji o typie", "is_correct": True},
                    {"text": "Do wyłączania type-checkingu", "is_correct": False},
                    {"text": "Do kompilowania CSS", "is_correct": False},
                    {"text": "Do tworzenia zmiennych środowiskowych", "is_correct": False},
                ],
                "explanation_html": """
                    <h3>Generics</h3>
                    <p>
                      Generic pozwala stworzyć funkcję, komponent albo typ, który działa na różnych
                      typach danych, ale dalej zachowuje bezpieczeństwo typów.
                    </p>
                    <pre><code>function identity&lt;T&gt;(value: T): T {
  return value;
}</code></pre>
                """,
            },
        ],
    },
    {
        "slug": "http-rest",
        "name": "HTTP i REST",
        "description": "Metody HTTP, status codes, idempotencja, nagłówki i projektowanie endpointów.",
        "questions": [
            {
                "question": "Które metody HTTP są idempotentne?",
                "difficulty": "medium",
                "points": 2,
                "answers": [
                    {"text": "GET, PUT, DELETE", "is_correct": True},
                    {"text": "Tylko POST", "is_correct": False},
                    {"text": "POST i PATCH zawsze", "is_correct": False},
                    {"text": "Żadna metoda HTTP nie jest idempotentna", "is_correct": False},
                ],
                "explanation_html": """
                    <h3>Idempotencja</h3>
                    <p>
                      Operacja jest idempotentna, jeśli wielokrotne wykonanie daje ten sam efekt
                      po stronie serwera jak jedno wykonanie. Typowo idempotentne są
                      <strong>GET</strong>, <strong>PUT</strong> i <strong>DELETE</strong>.
                    </p>
                """,
            },
            {
                "question": "Do czego służy nagłówek Content-Type?",
                "difficulty": "easy",
                "points": 1,
                "answers": [
                    {"text": "Informuje serwer lub klienta o formacie wysyłanego body", "is_correct": True},
                    {"text": "Informuje o statusie HTTP", "is_correct": False},
                    {"text": "Zawsze przechowuje token JWT", "is_correct": False},
                    {"text": "Służy tylko do cache'owania obrazków", "is_correct": False},
                ],
                "explanation_html": """
                    <h3>Content-Type</h3>
                    <p>
                      <strong>Content-Type</strong> mówi, w jakim formacie wysyłane jest body requestu
                      albo response'u, np. <code>application/json</code>.
                    </p>
                    <pre><code>Content-Type: application/json</code></pre>
                """,
            },
        ],
    },
]
