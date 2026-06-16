import asyncio

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.quizzes.models import Answer, Category, Question
from app.seed.data import GENERAL_IT_CATEGORY


async def seed_general_it_category() -> None:
    async with AsyncSessionLocal() as db:
        existing_category_result = await db.execute(
            select(Category).where(Category.slug == GENERAL_IT_CATEGORY["slug"])
        )
        existing_category = existing_category_result.scalar_one_or_none()

        if existing_category is not None:
            print("Seed skipped: category already exists")
            return

        category = Category(
            slug=GENERAL_IT_CATEGORY["slug"],
            name=GENERAL_IT_CATEGORY["name"],
            description=GENERAL_IT_CATEGORY["description"],
        )

        db.add(category)
        await db.flush()

        for question_position, question_data in enumerate(
            GENERAL_IT_CATEGORY["questions"],
            start=1,
        ):
            question = Question(
                category_id=category.id,
                question=question_data["question"],
                difficulty=question_data["difficulty"],
                points=question_data["points"],
                explanation_html=question_data["explanation_html"],
            )

            db.add(question)
            await db.flush()

            for answer_position, answer_data in enumerate(
                question_data["answers"],
                start=1,
            ):
                answer = Answer(
                    question_id=question.id,
                    text=answer_data["text"],
                    is_correct=answer_data["is_correct"],
                    position=answer_position,
                )

                db.add(answer)

            print(f"Added question {question_position}: {question.question}")

        await db.commit()

        print("Seed completed")


async def main() -> None:
    await seed_general_it_category()


if __name__ == "__main__":
    asyncio.run(main())