"""add ai_feedback column to challenges

Revision ID: 6bcd24e7b29b
Revises: 8ec8a33c7c34
Create Date: 2025-09-19 02:27:45.591327
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '6bcd24e7b29b'
down_revision: Union[str, Sequence[str], None] = '8ec8a33c7c34'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('challenges', 'ai_feedback')


