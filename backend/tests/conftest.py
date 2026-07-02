"""Shared pytest fixtures for the backend test suite.

Requires a real Postgres instance reachable at TEST_DATABASE_URL (defaults to
postgresql://postgres:postgres@localhost:5432/futsal_test) because the schema
relies on Postgres-only features (btree_gist extension + a GIST exclusion
constraint on reservations) — sqlite is not viable here.
"""

import os
import sys
from pathlib import Path

# Make the backend package importable when pytest is invoked from repo root.
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/futsal_test"
)
# Point the app's own engine (database.py reads DATABASE_URL via config.py) at
# the test database too, so anything triggered by the app itself (e.g. the
# startup event in main.py) operates against the test DB, not a dev/prod one.
#
# This is set unconditionally (not via setdefault) so an ambient DATABASE_URL
# already present in the shell/CI environment can never leak through and
# cause tests to run against a dev/prod database.
os.environ["DATABASE_URL"] = TEST_DATABASE_URL

if "test" not in TEST_DATABASE_URL.lower():
    raise RuntimeError(
        "Refusing to run tests: TEST_DATABASE_URL does not look like a test "
        f"database (must contain 'test'): {TEST_DATABASE_URL!r}. This guard "
        "exists because the test suite runs create_all/drop_all against this "
        "database, which would destroy data in a dev/prod database."
    )

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import event, text  # noqa: E402
from sqlalchemy.orm import sessionmaker  # noqa: E402

import models  # noqa: E402,F401  (must be imported before create_all so tables register on Base.metadata)
from auth import get_current_user  # noqa: E402
from database import Base, engine, get_db  # noqa: E402
from main import app  # noqa: E402


@pytest.fixture(scope="session", autouse=True)
def _setup_test_database():
    with engine.begin() as connection:
        connection.execute(text("CREATE EXTENSION IF NOT EXISTS btree_gist"))
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session():
    """Function-scoped session bound to a single connection + transaction.

    Everything the test (and the app, via the overridden get_db dependency)
    does runs inside one outer transaction that's rolled back at teardown,
    so tests don't leak data into each other. Because route handlers call
    db.commit() directly, we restart a SAVEPOINT after every commit so the
    outer transaction stays open for the rollback to undo.
    """
    connection = engine.connect()
    outer_transaction = connection.begin()

    TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=connection)
    session = TestSessionLocal()

    session.begin_nested()

    @event.listens_for(session, "after_transaction_end")
    def _restart_savepoint(sess, trans):
        if trans.nested and not trans._parent.nested:
            sess.begin_nested()

    yield session

    session.close()
    outer_transaction.rollback()
    connection.close()


@pytest.fixture()
def client(db_session):
    def _get_db_override():
        yield db_session

    app.dependency_overrides[get_db] = _get_db_override
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.pop(get_db, None)


@pytest.fixture()
def override_current_user(client):
    """Bypass JWT auth in tests: call override_current_user(user) to make
    every request in this test authenticate as that user."""

    def _override(user):
        app.dependency_overrides[get_current_user] = lambda: user

    yield _override
    app.dependency_overrides.pop(get_current_user, None)
