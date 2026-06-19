import asyncio
import os
import sys
from pathlib import Path

# Make backend/app importable when running: python scripts/clear_quiz_data.py
BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from sqlalchemy import text

from app.core.database import AsyncSessionLocal


CONFIRM_VALUE = "YES_DELETE_QUIZZES"

TABLES = [
    "pending_answers",
    "pending_questions",
    "answers",
    "questions",
    "categories",
]


async def get_count(db, table_name: str) -> int:
    result = await db.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
    return int(result.scalar_one())


async def main() -> None:
    confirm = os.getenv("CONFIRM_DELETE_QUIZZES")

    if confirm != CONFIRM_VALUE:
        print("Refusing to delete quiz data.")
        print(f"Set CONFIRM_DELETE_QUIZZES={CONFIRM_VALUE} to continue.")
        sys.exit(1)

    async with AsyncSessionLocal() as db:
        print("Before cleanup:")

        for table in TABLES:
            count = await get_count(db, table)
            print(f"- {table}: {count}")

        print("")
        print("Deleting quiz data including categories...")

        await db.execute(
            text(
                """
                TRUNCATE TABLE
                    pending_answers,
                    pending_questions,
                    answers,
                    questions,
                    categories
                RESTART IDENTITY CASCADE
                """
            )
        )

        await db.commit()

        print("")
        print("After cleanup:")

        for table in TABLES:
            count = await get_count(db, table)
            print(f"- {table}: {count}")

        print("")
        print("Quiz data and categories cleanup completed.")


if __name__ == "__main__":
    asyncio.run(main())
