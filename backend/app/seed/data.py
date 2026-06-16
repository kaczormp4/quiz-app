GENERAL_IT_CATEGORY = {
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
}