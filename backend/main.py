# Em: backend/main.py (Completo com Formatação Corrigida)

from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr
from sqlalchemy import create_engine, Column, Integer, String, ForeignKey, Table, Boolean, func, desc
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.ext.declarative import declarative_base
from typing import List, Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone

# --- Configuração de Segurança ---
SECRET_KEY = "sua-chave-secreta-muito-segura-aqui"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# --- Configuração do Banco de Dados ---
DATABASE_URL = "postgresql://gamedev:supersecret@localhost/gamedev_db"
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- Tabela de Associação ---
game_genre_association = Table('game_genre_association', Base.metadata,
    Column('game_id', Integer, ForeignKey('games.id'), primary_key=True),
    Column('genre_id', Integer, ForeignKey('genres.id'), primary_key=True)
)

# --- Modelos da Tabela (SQLAlchemy) ---

class DBUser(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

class DBEngine(Base):
    __tablename__ = "engines"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    games = relationship("DBGame", back_populates="engine")

class DBGenre(Base):
    __tablename__ = "genres"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    games = relationship("DBGame", secondary=game_genre_association, back_populates="genres")

class DBGame(Base):
    __tablename__ = "games"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    release_year = Column(Integer)
    engine_id = Column(Integer, ForeignKey("engines.id"), nullable=True)
    engine = relationship("DBEngine", back_populates="games")
    genres = relationship("DBGenre", secondary=game_genre_association, back_populates="games")

Base.metadata.create_all(bind=engine)

# --- Modelos da API (Pydantic) ---
class UserBase(BaseModel):
    email: EmailStr
class UserCreate(UserBase):
    password: str
class User(UserBase):
    id: int
    is_active: bool
    class Config:
        from_attributes = True
class Token(BaseModel):
    access_token: str
    token_type: str
class TokenData(BaseModel):
    email: Optional[str] = None
class EngineBase(BaseModel):
    name: str
class Engine(EngineBase):
    id: int
    class Config:
        from_attributes = True
class GenreBase(BaseModel):
    name: str
class Genre(GenreBase):
    id: int
    class Config:
        from_attributes = True
class GameBase(BaseModel):
    name: str
    release_year: int
class GameCreate(GameBase):
    engine_id: Optional[int] = None
    genre_ids: List[int] = []
class GameUpdate(BaseModel):
    name: str
    release_year: int
    engine_id: Optional[int] = None
    genre_ids: List[int] = []
class Game(GameBase):
    id: int
    engine: Optional[Engine] = None
    genres: List[Genre] = []
    class Config:
        from_attributes = True

class MetricsCounts(BaseModel):
    games: int

class MostPopularGenre(BaseModel):
    genre: Optional[Genre] = None
    game_count: int

app = FastAPI()

# --- Configuração do CORS ---
origins = ["http://localhost:3000"]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# --- Dependência DB ---
# CORRIGIDO: Formatação correta com indentação
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Funções de Segurança ---
def verify_password(plain_password, hashed_password): return pwd_context.verify(plain_password, hashed_password)
def get_password_hash(password): return pwd_context.hash(password)
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
def get_user(db: Session, email: str): return db.query(DBUser).filter(DBUser.email == email).first()
async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Could not validate credentials", headers={"WWW-Authenticate": "Bearer"})
    try: payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]); email: str = payload.get("sub");
    except JWTError: raise credentials_exception
    if email is None: raise credentials_exception
    token_data = TokenData(email=email); user = get_user(db, email=token_data.email)
    if user is None: raise credentials_exception
    return user

# --- Rotas de Autenticação ---
@app.post("/register", response_model=User)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = get_user(db, email=user.email);
    if db_user: raise HTTPException(status_code=400, detail="Email already registered")
    hashed_password = get_password_hash(user.password)
    db_user = DBUser(email=user.email, hashed_password=hashed_password)
    db.add(db_user); db.commit(); db.refresh(db_user); return db_user
@app.post("/login", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user(db, email=form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password", headers={"WWW-Authenticate": "Bearer"})
    access_token = create_access_token(data={"sub": user.email}, expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    return {"access_token": access_token, "token_type": "bearer"}
@app.get("/users/me/", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)): return current_user

# --- Rotas CRUD ---
@app.post("/genres", response_model=Genre, status_code=status.HTTP_201_CREATED)
def create_genre(genre: GenreBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_genre = db.query(DBGenre).filter(DBGenre.name == genre.name).first();
    if db_genre: raise HTTPException(status_code=400, detail="Gênero já existe")
    db_genre = DBGenre(**genre.dict()); db.add(db_genre); db.commit(); db.refresh(db_genre); return db_genre
@app.get("/genres", response_model=List[Genre])
def list_genres(db: Session = Depends(get_db)): return db.query(DBGenre).all()
@app.post("/engines", response_model=Engine, status_code=status.HTTP_201_CREATED)
def create_engine(engine: EngineBase, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
     db_engine = db.query(DBEngine).filter(DBEngine.name == engine.name).first()
     if db_engine: raise HTTPException(status_code=400, detail="Engine já existe")
     db_engine = DBEngine(**engine.dict()); db.add(db_engine); db.commit(); db.refresh(db_engine); return db_engine
@app.get("/engines", response_model=List[Engine])
def list_engines(db: Session = Depends(get_db)): return db.query(DBEngine).all()
@app.post("/games", response_model=Game, status_code=status.HTTP_201_CREATED)
def create_game(game: GameCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    genres = db.query(DBGenre).filter(DBGenre.id.in_(game.genre_ids)).all()
    if len(genres) != len(game.genre_ids): raise HTTPException(status_code=400, detail="Um ou mais IDs de gênero são inválidos")
    game_data = game.dict(exclude={'genre_ids'}); db_game = DBGame(**game_data); db_game.genres = genres
    db.add(db_game); db.commit(); db.refresh(db_game); return db_game
@app.get("/games", response_model=List[Game])
def list_games(db: Session = Depends(get_db)): return db.query(DBGame).all()
@app.get("/games/{game_id}", response_model=Game)
def get_game(game_id: int, db: Session = Depends(get_db)):
    db_game = db.query(DBGame).filter(DBGame.id == game_id).first()
    if db_game is None: raise HTTPException(status_code=404, detail="Game not found")
    return db_game
@app.put("/games/{game_id}", response_model=Game)
def update_game(game_id: int, game_update: GameUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_game = db.query(DBGame).filter(DBGame.id == game_id).first()
    if db_game is None: raise HTTPException(status_code=404, detail="Game not found")
    db_game.name = game_update.name; db_game.release_year = game_update.release_year; db_game.engine_id = game_update.engine_id
    new_genres = db.query(DBGenre).filter(DBGenre.id.in_(game_update.genre_ids)).all()
    if len(new_genres) != len(game_update.genre_ids): raise HTTPException(status_code=400, detail="Um ou mais IDs de gênero fornecidos para atualização são inválidos")
    db_game.genres = new_genres
    db.commit(); db.refresh(db_game); return db_game
@app.delete("/games/{game_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_game(game_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db_game = db.query(DBGame).filter(DBGame.id == game_id).first()
    if db_game is None: raise HTTPException(status_code=404, detail="Game not found")
    db.delete(db_game); db.commit(); return {"ok": True}

# --- Rotas de Métricas ---
@app.get("/metrics/counts", response_model=MetricsCounts)
def get_metrics_counts(db: Session = Depends(get_db)):
    game_count = db.query(func.count(DBGame.id)).scalar()
    return MetricsCounts(games=game_count or 0)
@app.get("/metrics/most_popular_genre", response_model=MostPopularGenre)
def get_most_popular_genre(db: Session = Depends(get_db)):
    result = db.query(DBGenre, func.count(game_genre_association.c.game_id).label('game_count')).join(game_genre_association, DBGenre.id == game_genre_association.c.genre_id).group_by(DBGenre.id).order_by(desc('game_count')).first()
    if result:
        genre_obj, count = result
        pydantic_genre = Genre.from_orm(genre_obj) if genre_obj else None # Corrigido from_orm
        return MostPopularGenre(genre=pydantic_genre, game_count=count)
    else: return MostPopularGenre(genre=None, game_count=0)