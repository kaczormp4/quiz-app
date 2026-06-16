import asyncio

from sqlalchemy import select

from app.core.database import AsyncSessionLocal
from app.quizzes.models import Answer, Category, Question
from app.seed.data import QUIZ_CATEGORIES


async def seed_categories() -> None:
    async with AsyncSessionLocal() as db:
        for category_data in QUIZ_CATEGORIES:
            category_result = await db.execute(
                select(Category).where(Category.slug == category_data["slug"])
            )
            category = category_result.scalar_one_or_none()

            if category is None:
                category = Category(
                    slug=category_data["slug"],
                    name=category_data["name"],
                    description=category_data["description"],
                )
                db.add(category)
                await db.flush()

                print(f"Added category: {category.name}")
            else:
                category.name = category_data["name"]
                category.description = category_data["description"]

                print(f"Updated category: {category.name}")

            for question_data in category_data["questions"]:
                existing_question_result = await db.execute(
                    select(Question).where(
                        Question.category_id == category.id,
                        Question.question == question_data["question"],
                    )
                )
                existing_question = existing_question_result.scalar_one_or_none()

                if existing_question is not None:
                    print(f"Skipped existing question: {existing_question.question}")
                    continue

                question = Question(
                    category_id=category.id,
                    question=question_data["question"],
                    difficulty=question_data["difficulty"],
                    points=question_data["points"],
                    explanation_html=question_data["explanation_html"],
                )

                db.add(question)
                await db.flush()

                for position, answer_data in enumerate(question_data["answers"], start=1):
                    answer = Answer(
                        question_id=question.id,
                        text=answer_data["text"],
                        is_correct=answer_data["is_correct"],
                        position=position,
                    )
                    db.add(answer)

                print(f"Added question: {question.question}")

        await db.commit()
        print("Seed completed")


async def main() -> None:
    await seed_categories()


if __name__ == "__main__":
    asyncio.run(main())
