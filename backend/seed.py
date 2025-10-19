# Em: backend/seed.py

from main import SessionLocal, DBGame, DBEngine, DBGenre
from sqlalchemy.orm import Session

# --- Nossas Listas-Base ---

PREDEFINED_GENRES = [
    "Action", "Adventure", "RPG", "Strategy", "Simulation",
    "Puzzle", "Platformer", "Shooter (FPS/TPS)", "Fighting",
    "Horror", "Survival", "Indie", "MMORPG", "Sandbox",
    "Roguelike", "Metroidvania" # Adicionados
]

PREDEFINED_ENGINES = [
    "Unreal Engine", "Unity", "Godot", "Source Engine", "REDengine",
    "CryEngine", "GameMaker", "RPG Maker", "Ren'Py", "Fox Engine",
    "Não Especificado" # Adicionar explicitamente
]

# Função para popular o banco
def seed_database():
    db: Session = SessionLocal()
    
    try:
        print("Iniciando o povoamento do banco de dados...")

        # 1. Povoar Gêneros
        count_genres = 0
        for genre_name in PREDEFINED_GENRES:
            exists = db.query(DBGenre).filter(DBGenre.name == genre_name).first()
            if not exists:
                new_genre = DBGenre(name=genre_name)
                db.add(new_genre)
                count_genres += 1
        db.commit() # Commit após adicionar todos os gêneros
        print(f"- {count_genres} novos gêneros adicionados.")

        # 2. Povoar Engines
        count_engines = 0
        for engine_name in PREDEFINED_ENGINES:
            exists = db.query(DBEngine).filter(DBEngine.name == engine_name).first()
            if not exists:
                new_engine = DBEngine(name=engine_name)
                db.add(new_engine)
                count_engines += 1
        db.commit() # Commit após adicionar todas as engines
        print(f"- {count_engines} novas engines adicionadas.")

        # 3. (Opcional) Adicionar alguns jogos de exemplo se o banco estiver vazio
        game_count = db.query(DBGame).count()
        if game_count == 0:
            print("- Adicionando jogos de exemplo...")
            # Pega IDs dos gêneros e engines que acabamos de (garantir que) existem
            action_genre = db.query(DBGenre).filter(DBGenre.name == "Action").first()
            adventure_genre = db.query(DBGenre).filter(DBGenre.name == "Adventure").first()
            rpg_genre = db.query(DBGenre).filter(DBGenre.name == "RPG").first()
            indie_genre = db.query(DBGenre).filter(DBGenre.name == "Indie").first()
            platformer_genre = db.query(DBGenre).filter(DBGenre.name == "Platformer").first()
            metroidvania_genre = db.query(DBGenre).filter(DBGenre.name == "Metroidvania").first()

            unity_engine = db.query(DBEngine).filter(DBEngine.name == "Unity").first()
            godot_engine = db.query(DBEngine).filter(DBEngine.name == "Godot").first()
            no_engine = db.query(DBEngine).filter(DBEngine.name == "Não Especificado").first()

            example_games = [
                DBGame(name="Hollow Knight", release_year=2017, engine_id=unity_engine.id if unity_engine else None, genres=[g for g in [action_genre, adventure_genre, indie_genre, metroidvania_genre] if g]),
                DBGame(name="Celeste", release_year=2018, engine_id=no_engine.id if no_engine else None, genres=[g for g in [adventure_genre, indie_genre, platformer_genre] if g]),
                DBGame(name="The Witcher 3", release_year=2015, engine_id=db.query(DBEngine).filter(DBEngine.name == "REDengine").first().id if db.query(DBEngine).filter(DBEngine.name == "REDengine").first() else None, genres=[g for g in [action_genre, adventure_genre, rpg_genre] if g]),
            ]
            db.add_all(example_games)
            db.commit()
            print(f"- {len(example_games)} jogos de exemplo adicionados.")


        print("Povoamento concluído com sucesso!")

    except Exception as e:
        print(f"Ocorreu um erro durante o povoamento: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()