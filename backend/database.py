import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# PostgreSQL connection string: username:password@host:port/database_name
# If running locally without docker-compose, this might need to point to localhost instead of "db".
# We use an environment variable with a default fallback for local dev.
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", "postgresql://cityflow_user:cityflow_password@localhost:5432/cityflow_db"
)

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
